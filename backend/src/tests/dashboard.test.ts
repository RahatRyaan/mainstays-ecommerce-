import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { SubOrder } from '../models/SubOrder';
import { Payout } from '../models/Payout';
import { generateAccessToken } from '../services/auth.service';
import dashboardRoutes from '../routes/dashboard.routes';
import { errorHandler } from '../common/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/dashboards', dashboardRoutes);
app.use(errorHandler);

import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Dashboard & Stats API', () => {
  let adminToken: string;
  let vendor1Token: string;
  let vendor2Token: string;
  let vendor1Id: string;
  let vendor2Id: string;
  let adminId: string;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Order.deleteMany({});
    await SubOrder.deleteMany({});
    await Payout.deleteMany({});
    await Product.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    adminId = admin._id.toString();
    adminToken = generateAccessToken(admin as any);

    // Create Vendor 1
    const vendor1 = await User.create({
      name: 'Vendor 1',
      email: 'vendor1@test.com',
      password: 'password123',
      role: 'vendor',
    });
    vendor1Id = vendor1._id.toString();
    vendor1Token = generateAccessToken(vendor1 as any);

    // Create Vendor 2
    const vendor2 = await User.create({
      name: 'Vendor 2',
      email: 'vendor2@test.com',
      password: 'password123',
      role: 'vendor',
    });
    vendor2Id = vendor2._id.toString();
    vendor2Token = generateAccessToken(vendor2 as any);

    // Mock Data
    const customerId = new mongoose.Types.ObjectId();
    const product1Id = new mongoose.Types.ObjectId();
    const mockVariantId = new mongoose.Types.ObjectId();

    // Order 1 (Total: 1000)
    const order1 = await Order.create({
      user: customerId,
      items: [{ product: product1Id, variant: mockVariantId, quantity: 1, price: 1000 }],
      shippingAddress: '123 Test',
      subtotal: 1000,
      tax: 0,
      shipping: 0,
      totalAmount: 1000,
      paymentStatus: 'paid',
      paymentIntentId: 'pi_1',
    });

    // SubOrder 1 for Vendor 1 (Delivered, Subtotal: 1000)
    await SubOrder.create({
      parentOrder: order1._id,
      vendor: vendor1Id,
      items: [{ product: product1Id, variantId: mockVariantId, quantity: 1, price: 1000 }],
      subTotal: 1000,
      status: 'delivered',
    });

    // Payout for Vendor 1 (Pending, Amount: 900)
    await Payout.create({
      vendor: vendor1Id,
      subOrder: order1._id, // use dummy id
      amount: 900,
      status: 'pending',
    });

    // Order 2 (Total: 2000)
    const order2 = await Order.create({
      user: customerId,
      items: [{ product: product1Id, variant: mockVariantId, quantity: 2, price: 1000 }],
      shippingAddress: '123 Test',
      subtotal: 2000,
      tax: 0,
      shipping: 0,
      totalAmount: 2000,
      paymentStatus: 'paid',
      paymentIntentId: 'pi_2',
    });

    // SubOrder 2 for Vendor 1 (Pending, Subtotal: 2000)
    await SubOrder.create({
      parentOrder: order2._id,
      vendor: vendor1Id,
      items: [{ product: product1Id, variantId: mockVariantId, quantity: 2, price: 1000 }],
      subTotal: 2000,
      status: 'pending',
    });

    // Order 3 (Total: 500)
    const order3 = await Order.create({
      user: customerId,
      items: [{ product: product1Id, variant: mockVariantId, quantity: 1, price: 500 }],
      shippingAddress: '123 Test',
      subtotal: 500,
      tax: 0,
      shipping: 0,
      totalAmount: 500,
      paymentStatus: 'paid',
      paymentIntentId: 'pi_3',
    });

    // SubOrder 3 for Vendor 2 (Delivered, Subtotal: 500)
    await SubOrder.create({
      parentOrder: order3._id,
      vendor: vendor2Id,
      items: [{ product: product1Id, variantId: mockVariantId, quantity: 1, price: 500 }],
      subTotal: 500,
      status: 'delivered',
    });
  });

  describe('GET /api/dashboards/vendor', () => {
    it('should calculate vendor 1 stats correctly', async () => {
      const res = await request(app)
        .get('/api/dashboards/vendor')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .expect(200);

      expect(res.body.totalSales).toBe(1000); // 1 delivered suborder of 1000
      expect(res.body.activeOrdersCount).toBe(1); // 1 pending suborder
      expect(res.body.pendingPayouts).toBe(900);
    });

    it('should calculate vendor 2 stats correctly', async () => {
      const res = await request(app)
        .get('/api/dashboards/vendor')
        .set('Authorization', `Bearer ${vendor2Token}`)
        .expect(200);

      expect(res.body.totalSales).toBe(500); // 1 delivered suborder of 500
      expect(res.body.activeOrdersCount).toBe(0); // 0 pending
      expect(res.body.pendingPayouts).toBe(0); // 0 payouts
    });

    it('should forbid admin from accessing vendor stats (or at least return 0 if admin ID has no sales, but role should be vendor)', async () => {
      await request(app)
        .get('/api/dashboards/vendor')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });
  });

  describe('GET /api/dashboards/admin', () => {
    it('should calculate global platform stats correctly', async () => {
      const res = await request(app)
        .get('/api/dashboards/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Order1: 1000 + Order2: 2000 + Order3: 500 = 3500
      expect(res.body.totalPlatformVolume).toBe(3500);
      expect(res.body.totalActiveVendors).toBe(2);
      expect(res.body.platformFeeCollected).toBe(175); // 5% of 3500
    });

    it('should forbid vendor from accessing admin stats', async () => {
      await request(app)
        .get('/api/dashboards/admin')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .expect(403);
    });
  });
});
