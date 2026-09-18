import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import cookieParser from 'cookie-parser';
import wishlistRoutes from '../routes/wishlist.routes';
import authRoutes from '../routes/auth.routes';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Wishlist } from '../models/Wishlist';
import { errorHandler } from '../common/errorHandler';

jest.setTimeout(60000);

let mongoServer: MongoMemoryServer;
let token: string;
let productId: string;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use(errorHandler);

const request = supertest(app);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create a user
  const user = await User.create({
    name: 'Wishlist Tester',
    email: 'wishlist@example.com',
    password: 'password123',
    role: 'customer',
    isEmailVerified: true,
  });

  // Create a product
  const product = await Product.create({
    name: 'Luxury Velvet Armchair',
    slug: 'luxury-velvet-armchair',
    description: 'High quality armchair',
    basePrice: 350,
    category: 'Furniture',
    stock: 10,
    vendor: user._id,
    images: ['https://example.com/chair.jpg'],
  });
  productId = product._id.toString();

  // Login to get token
  const res = await request
    .post('/api/auth/login')
    .send({ email: 'wishlist@example.com', password: 'password123' });
  
  token = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Wishlist API Endpoints', () => {
  it('GET /api/wishlist - should return empty wishlist initially', async () => {
    const res = await request
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('POST /api/wishlist/toggle - should add product to wishlist', async () => {
    const res = await request
      .post('/api/wishlist/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.action).toBe('added');
    expect(res.body.data.length).toBe(1);
  });

  it('GET /api/wishlist - should return populated wishlist products', async () => {
    const res = await request
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Luxury Velvet Armchair');
  });

  it('POST /api/wishlist/toggle - should remove product from wishlist when toggled again', async () => {
    const res = await request
      .post('/api/wishlist/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.action).toBe('removed');
    expect(res.body.data.length).toBe(0);
  });
});
