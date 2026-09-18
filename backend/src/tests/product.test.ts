import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cookieParser from 'cookie-parser';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { InventoryLog } from '../models/InventoryLog';
import { InventoryService } from '../services/inventory.service';
import authRoutes from '../routes/auth.routes';
import productRoutes from '../routes/product.routes';
import { errorHandler } from '../common/errorHandler';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use(errorHandler);

let mongoServer: MongoMemoryServer;
let vendorToken: string;
let adminToken: string;
let customerToken: string;
let vendorId: mongoose.Types.ObjectId;
let productId: string;
let variantId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Setup users
  const vendor = await User.create({
    name: 'Test Vendor',
    email: 'vendor@test.com',
    password: 'password123',
    role: 'vendor',
  });
  vendorId = vendor._id as mongoose.Types.ObjectId;
  const vendorLogin = await request(app).post('/api/auth/login').send({ email: 'vendor@test.com', password: 'password123' });
  vendorToken = vendorLogin.body.accessToken;

  const admin = await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
  });
  const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'password123' });
  adminToken = adminLogin.body.accessToken;

  const customer = await User.create({
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer',
  });
  const customerLogin = await request(app).post('/api/auth/login').send({ email: 'customer@test.com', password: 'password123' });
  customerToken = customerLogin.body.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
  await InventoryLog.deleteMany({});
});

describe('Product and Inventory API', () => {
  it('should allow vendor to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        name: 'Test Product',
        description: 'A product for testing',
        category: 'TestCategory',
        basePrice: 100,
        variants: [
          {
            sku: 'TEST-SKU-1',
            stock: 10,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Product');
    productId = res.body._id;
    variantId = res.body.variants[0]._id;
  });

  it('should not allow customer to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Test Product 2',
        description: 'A product for testing',
        category: 'TestCategory',
        basePrice: 100,
        variants: [{ sku: 'TEST-SKU-2' }],
      });

    expect(res.status).toBe(403);
  });

  it('should prevent negative stock deductions', async () => {
    // Create a product first
    const product = await Product.create({
      name: 'Stock Test Product',
      slug: 'stock-test',
      description: 'Test',
      vendor: vendorId,
      category: 'Cat',
      basePrice: 50,
      variants: [{ sku: 'SKU-STOCK', stock: 5 }],
    });
    const vId = product.variants[0]._id;

    // Deduct stock via service
    await expect(
      InventoryService.adjustStock(
        product._id.toString(),
        (vId as any).toString(),
        -10,
        'Test deduction',
        vendorId.toString()
      )
    ).rejects.toThrow('Insufficient stock');
  });

  it('should log inventory changes correctly', async () => {
    const product = await Product.create({
      name: 'Log Test Product',
      slug: 'log-test',
      description: 'Test',
      vendor: vendorId,
      category: 'Cat',
      basePrice: 50,
      variants: [{ sku: 'SKU-LOG', stock: 20 }],
    });
    const vId = product.variants[0]._id as mongoose.Types.ObjectId;

    await InventoryService.adjustStock(
      product._id.toString(),
      vId.toString(),
      -5,
      'Order #1',
      vendorId.toString()
    );

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct!.variants[0].stock).toBe(15);

    const logs = await InventoryLog.find({ product: product._id });
    expect(logs.length).toBe(1);
    expect(logs[0].type).toBe('deduction');
    expect(logs[0].quantity).toBe(-5);
  });

  it('should allow vendor to adjust inventory via API', async () => {
    const product = await Product.create({
      name: 'API Log Test Product',
      slug: 'api-log-test',
      description: 'Test',
      vendor: vendorId,
      category: 'Cat',
      basePrice: 50,
      variants: [{ sku: 'SKU-API-LOG', stock: 10 }],
    });
    const vId = product.variants[0]._id;

    const res = await request(app)
      .post(`/api/products/${product._id}/inventory`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        variantId: vId,
        quantity: 10,
        reason: 'Restock',
      });

    expect(res.status).toBe(200);
    
    const logs = await InventoryLog.find({ product: product._id });
    expect(logs.length).toBe(1);
    expect(logs[0].type).toBe('restock');
  });

  it('should isolate vendors from modifying each others products', async () => {
    // Create product by original vendor
    const product = await Product.create({
      name: 'Vendor A Product',
      slug: 'vendor-a',
      description: 'Test',
      vendor: vendorId,
      category: 'Cat',
      basePrice: 50,
      variants: [{ sku: 'VEND-A', stock: 10 }],
    });

    // Create a new vendor
    const vendor2 = await User.create({
      name: 'Vendor B',
      email: 'vendorb@test.com',
      password: 'password123',
      role: 'vendor',
    });
    const vendor2Login = await request(app).post('/api/auth/login').send({ email: 'vendorb@test.com', password: 'password123' });
    const vendor2Token = vendor2Login.body.accessToken;

    // Vendor B tries to update Vendor A's product
    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${vendor2Token}`)
      .send({ basePrice: 100 });

    expect(res.status).toBe(403);
  });
});
