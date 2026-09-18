import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cookieParser from 'cookie-parser';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Cart } from '../models/Cart';
import { Coupon } from '../models/Coupon';
import authRoutes from '../routes/auth.routes';
import productRoutes from '../routes/product.routes';
import cartRoutes from '../routes/cart.routes';
import { errorHandler } from '../common/errorHandler';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use(errorHandler);

let mongoServer: MongoMemoryServer;
let customerToken: string;
let vendorId: mongoose.Types.ObjectId;
let productId: string;
let variantId: string;
let couponCode = 'SAVE10';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Setup customer
  const customer = await User.create({
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer',
  });
  const customerLogin = await request(app).post('/api/auth/login').send({ email: 'customer@test.com', password: 'password123' });
  customerToken = customerLogin.body.accessToken;

  // Setup vendor
  const vendor = await User.create({
    name: 'Test Vendor',
    email: 'vendor@test.com',
    password: 'password123',
    role: 'vendor',
  });
  vendorId = vendor._id as mongoose.Types.ObjectId;

  // Setup product
  const product = await Product.create({
    name: 'Cart Test Product',
    slug: 'cart-test',
    description: 'A product for testing cart',
    category: 'TestCategory',
    basePrice: 100,
    vendor: vendorId,
    variants: [
      {
        sku: 'TEST-CART-1',
        stock: 5,
        priceAdjustment: 0,
      },
    ],
  });
  productId = product._id.toString();
  variantId = product.variants[0]._id.toString();

  // Setup coupon
  await Coupon.create({
    code: couponCode,
    type: 'percentage',
    discountValue: 10,
    minOrderValue: 50,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
    isActive: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Cart.deleteMany({});
});

describe('Cart and Checkout API', () => {
  it('should add an item to the cart', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId,
        variantId,
        quantity: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it('should apply a valid coupon', async () => {
    // Add item first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, quantity: 1 });

    const res = await request(app)
      .post('/api/cart/coupon')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: couponCode });

    expect(res.status).toBe(200);
    expect(res.body.appliedCoupon).toBeDefined();
  });

  it('should calculate checkout totals correctly', async () => {
    // Add item
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, quantity: 2 }); // 2 * $100 = $200

    // Apply coupon (10% off)
    await request(app)
      .post('/api/cart/coupon')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: couponCode });

    const res = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.subtotal).toBe(200);
    expect(res.body.discount).toBe(20); // 10% of 200
    // Tax = (200 - 20) * 0.10 = 18
    expect(res.body.tax).toBe(18);
    // Shipping = free over 100
    expect(res.body.shipping).toBe(0);
    // Total = 180 + 18 = 198
    expect(res.body.total).toBe(198);
  });

  it('should reject checkout if stock is insufficient', async () => {
    // Add 10 items (only 5 in stock)
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, variantId, quantity: 10 });

    const res = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Insufficient stock');
  });
});
