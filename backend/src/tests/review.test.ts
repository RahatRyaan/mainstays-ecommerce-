import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { SubOrder } from '../models/SubOrder';
import productRoutes from '../routes/product.routes';
import authRoutes from '../routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

describe('Review & Search Integration', () => {
  let customerToken: string;
  let vendorToken: string;
  let customerId: string;
  let vendorId: string;
  let productId: string;
  let subOrderId: string;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Setup Users
    const customer = await User.create({
      name: 'Review Customer',
      email: 'review.customer@example.com',
      password: 'password123',
      role: 'customer',
    });
    customerId = customer._id.toString();
    const custLogin = await request(app).post('/api/auth/login').send({ email: 'review.customer@example.com', password: 'password123' });
    customerToken = custLogin.body.accessToken;

    const vendor = await User.create({
      name: 'Review Vendor',
      email: 'review.vendor@example.com',
      password: 'password123',
      role: 'vendor',
    });
    vendorId = vendor._id.toString();
    const vendorLogin = await request(app).post('/api/auth/login').send({ email: 'review.vendor@example.com', password: 'password123' });
    vendorToken = vendorLogin.body.accessToken;

    // Setup Product
    const product = await Product.create({
      name: 'Searchable Laptop',
      slug: 'searchable-laptop',
      description: 'A very fast and expensive searchable laptop',
      category: 'Electronics',
      tags: ['laptop', 'fast'],
      basePrice: 2000,
      vendor: vendorId,
    });
    productId = product._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('Search & Filtering', () => {
    it('should find product by text search', async () => {
      const res = await request(app)
        .get('/api/products?q=Searchable Laptop')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
      expect(res.body.data.products[0]._id.toString()).toBe(productId);
    });

    it('should filter by minPrice', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=1999')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
    });

    it('should filter out by minPrice', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=3000')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(0);
    });
  });

  describe('Verified Purchase Reviews', () => {
    it('should reject review if no delivered order exists', async () => {
      const res = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          comment: 'Great product!',
        })
        .expect(403);

      expect(res.body.message).toContain('must have a delivered order');
    });

    it('should allow review after order is delivered', async () => {
      // Create a delivered order
      const mockVariantId = new mongoose.Types.ObjectId();
      const order = await Order.create({
        user: customerId,
        items: [
          {
            product: productId,
            variant: mockVariantId, // mock variant
            quantity: 1,
            price: 2000,
          }
        ],
        shippingAddress: '123 Main St, City, State, 12345, Country',
        subtotal: 2000,
        tax: 0,
        shipping: 0,
        totalAmount: 2000,
        paymentStatus: 'paid',
        paymentIntentId: 'pi_test_123',
      });

      const subOrder = await SubOrder.create({
        parentOrder: order._id,
        vendor: vendorId,
        items: [
          {
            product: productId,
            variantId: mockVariantId,
            quantity: 1,
            price: 2000,
          }
        ],
        subTotal: 2000,
        status: 'delivered', // explicitly marked delivered
      });

      subOrderId = subOrder._id.toString();

      // Now leave a review
      const res = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 4,
          comment: 'Good product!',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(4);
    });

    it('should prevent duplicate reviews from same user', async () => {
      const res = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 3,
          comment: 'Wait I want to change it.',
        })
        .expect(400);

      expect(res.body.message).toContain('already reviewed');
    });

    it('should update product averageRating and reviewCount', async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);
      
      // Since one 4-star review was left
      expect(res.body.averageRating).toBe(4);
      expect(res.body.reviewCount).toBe(1);
    });
  });
});
