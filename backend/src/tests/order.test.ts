import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cookieParser from 'cookie-parser';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Cart } from '../models/Cart';
import { Order } from '../models/Order';
import { SubOrder } from '../models/SubOrder';
import { Payout } from '../models/Payout';
import authRoutes from '../routes/auth.routes';
import productRoutes from '../routes/product.routes';
import cartRoutes from '../routes/cart.routes';
import orderRoutes from '../routes/order.routes';
import { errorHandler } from '../common/errorHandler';
import bodyParser from 'body-parser';

const app = express();
// Note: Webhook must be mounted before full express.json() if we wanted raw, but this setup works since orderRoutes defines it locally
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use(errorHandler);

let mongoServer: MongoMemoryServer;
let customerToken: string;
let vendor1Token: string;
let vendor2Token: string;
let customerId: mongoose.Types.ObjectId;
let vendor1Id: mongoose.Types.ObjectId;
let vendor2Id: mongoose.Types.ObjectId;
let v1ProductId: string;
let v1VariantId: string;
let v2ProductId: string;
let v2VariantId: string;
let currentPaymentIntentId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Customer
  const customer = await User.create({
    name: 'Customer',
    email: 'cust@test.com',
    password: 'password123',
    role: 'customer',
  });
  customerId = customer._id as mongoose.Types.ObjectId;
  const custLogin = await request(app).post('/api/auth/login').send({ email: 'cust@test.com', password: 'password123' });
  customerToken = custLogin.body.accessToken;

  // Vendor 1
  const vendor1 = await User.create({
    name: 'Vendor 1',
    email: 'v1@test.com',
    password: 'password123',
    role: 'vendor',
  });
  vendor1Id = vendor1._id as mongoose.Types.ObjectId;
  const v1Login = await request(app).post('/api/auth/login').send({ email: 'v1@test.com', password: 'password123' });
  vendor1Token = v1Login.body.accessToken;

  // Vendor 2
  const vendor2 = await User.create({
    name: 'Vendor 2',
    email: 'v2@test.com',
    password: 'password123',
    role: 'vendor',
  });
  vendor2Id = vendor2._id as mongoose.Types.ObjectId;
  const v2Login = await request(app).post('/api/auth/login').send({ email: 'v2@test.com', password: 'password123' });
  vendor2Token = v2Login.body.accessToken;

  // Product 1
  const p1 = await Product.create({
    name: 'P1',
    slug: 'p1',
    description: 'D1',
    category: 'C',
    basePrice: 50,
    vendor: vendor1Id,
    variants: [{ sku: 'V1-1', stock: 10, priceAdjustment: 0 }],
  });
  v1ProductId = p1._id.toString();
  v1VariantId = p1.variants[0]._id.toString();

  // Product 2
  const p2 = await Product.create({
    name: 'P2',
    slug: 'p2',
    description: 'D2',
    category: 'C',
    basePrice: 75,
    vendor: vendor2Id,
    variants: [{ sku: 'V2-1', stock: 10, priceAdjustment: 0 }],
  });
  v2ProductId = p2._id.toString();
  v2VariantId = p2.variants[0]._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Orders & Payment API', () => {
  it('should create a multi-vendor order from cart and split into suborders', async () => {
    // Add V1 product
    await request(app).post('/api/cart/items').set('Authorization', `Bearer ${customerToken}`).send({
      productId: v1ProductId, variantId: v1VariantId, quantity: 2
    });
    // Add V2 product
    await request(app).post('/api/cart/items').set('Authorization', `Bearer ${customerToken}`).send({
      productId: v2ProductId, variantId: v2VariantId, quantity: 1
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shippingAddress: '123 Test St' });

    expect(res.status).toBe(200);
    expect(res.body.order).toBeDefined();
    expect(res.body.clientSecret).toBeDefined();

    currentPaymentIntentId = res.body.order.paymentIntentId;

    // Check parent order
    const parent = await Order.findById(res.body.order._id);
    expect(parent!.paymentStatus).toBe('pending');
    expect(parent!.totalAmount).toBe(192.5); // (100 + 75) + 0 discount + 17.5 tax + 0 shipping

    // Check suborders
    const subOrders = await SubOrder.find({ parentOrder: parent!._id });
    expect(subOrders.length).toBe(2);
    expect(subOrders.some(so => so.vendor.toString() === vendor1Id.toString())).toBe(true);
    expect(subOrders.some(so => so.vendor.toString() === vendor2Id.toString())).toBe(true);
  });

  it('should idempotently handle payment success webhook', async () => {
    const payload = JSON.stringify({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: currentPaymentIntentId,
        }
      }
    });

    // Fire webhook first time
    const res1 = await request(app)
      .post('/api/orders/webhook')
      .set('stripe-signature', 'test-sig')
      .set('Content-Type', 'application/json') // Because we set bodyParser.text
      .send(payload);
    
    expect(res1.status).toBe(200);

    const orderAfter1 = await Order.findOne({ paymentIntentId: currentPaymentIntentId });
    expect(orderAfter1!.paymentStatus).toBe('paid');

    const subOrders = await SubOrder.find({ parentOrder: orderAfter1!._id });
    expect(subOrders[0].status).toBe('processing');

    // Fire webhook second time
    const res2 = await request(app)
      .post('/api/orders/webhook')
      .set('stripe-signature', 'test-sig')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res2.status).toBe(200);

    // Ensure cart was emptied
    const cart = await Cart.findOne({ user: customerId });
    expect(cart!.items.length).toBe(0);

    // Stock deduction should have occurred exactly once. P1 started with 10, bought 2 -> 8
    const p1 = await Product.findById(v1ProductId);
    expect(p1!.variants[0].stock).toBe(8);
  });

  it('should allow vendor to update suborder status and create payout on delivery', async () => {
    // Get vendor 1 suborder
    const v1OrdersRes = await request(app)
      .get('/api/orders/vendor-orders')
      .set('Authorization', `Bearer ${vendor1Token}`);
    
    expect(v1OrdersRes.status).toBe(200);
    const subOrderId = v1OrdersRes.body[0]._id;

    // Update processing -> shipped
    const resShip = await request(app)
      .put(`/api/orders/sub-orders/${subOrderId}/status`)
      .set('Authorization', `Bearer ${vendor1Token}`)
      .send({ status: 'shipped' });
    expect(resShip.status).toBe(200);
    expect(resShip.body.status).toBe('shipped');

    // Update shipped -> delivered
    const resDeliver = await request(app)
      .put(`/api/orders/sub-orders/${subOrderId}/status`)
      .set('Authorization', `Bearer ${vendor1Token}`)
      .send({ status: 'delivered' });
    expect(resDeliver.status).toBe(200);
    expect(resDeliver.body.status).toBe('delivered');

    // Check that a Payout was created
    const payout = await Payout.findOne({ subOrder: subOrderId });
    expect(payout).not.toBeNull();
    expect(payout!.vendor.toString()).toBe(vendor1Id.toString());
    expect(payout!.amount).toBe(90); // subtotal is 100, 90% is 90
  });

  it('should prevent invalid state transitions', async () => {
    const v2OrdersRes = await request(app)
      .get('/api/orders/vendor-orders')
      .set('Authorization', `Bearer ${vendor2Token}`);
    const subOrderId = v2OrdersRes.body[0]._id;

    // It's processing right now. Vendor tries to jump directly to delivered
    const res = await request(app)
      .put(`/api/orders/sub-orders/${subOrderId}/status`)
      .set('Authorization', `Bearer ${vendor2Token}`)
      .send({ status: 'delivered' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid status transition');
  });

  it('should prevent vendor from updating another vendors suborder', async () => {
    const v1OrdersRes = await request(app)
      .get('/api/orders/vendor-orders')
      .set('Authorization', `Bearer ${vendor1Token}`);
    const subOrderIdV1 = v1OrdersRes.body[0]._id;

    const res = await request(app)
      .put(`/api/orders/sub-orders/${subOrderIdV1}/status`)
      .set('Authorization', `Bearer ${vendor2Token}`) // Vendor 2 trying
      .send({ status: 'shipped' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('SubOrder not found or unauthorized');
  });
});
