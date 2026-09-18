import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/auth.routes';
import { User } from '../models/User';
import { errorHandler } from '../common/errorHandler';

jest.setTimeout(60000); // Allow time for mongodb binary download

let mongoServer: MongoMemoryServer;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

const request = supertest(app);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

describe('Auth API', () => {
  it('should register a new customer user', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('name', 'Test User');
    expect(res.body.user).toHaveProperty('role', 'customer');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should not register user with existing email', async () => {
    await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request.post('/api/auth/register').send({
      name: 'Another User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already in use');
  });

  it('should login an existing user', async () => {
    await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject invalid credentials during login', async () => {
    await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });

  it('should validate inputs using Zod', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'T', // Too short
      email: 'invalidemail',
      password: '123', // Too short
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should enforce RBAC on protected routes', async () => {
    const registerRes = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer',
    });

    const token = registerRes.body.accessToken;

    const resMe = await request.get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(resMe.status).toBe(200);
    expect(resMe.body.user).toHaveProperty('role', 'customer');

    const resAdmin = await request.get('/api/auth/admin-only').set('Authorization', `Bearer ${token}`);
    expect(resAdmin.status).toBe(403);
    expect(resAdmin.body.message).toBe('Access denied: insufficient permissions');
  });
  
  it('should refresh the auth token', async () => {
    const registerRes = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    
    // Extract the refreshToken cookie from Set-Cookie header
    const cookies = registerRes.headers['set-cookie'];
    const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
    
    const res = await request.post('/api/auth/refresh')
      .set('Cookie', refreshTokenCookie);
      
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
  
  it('should reject refresh token if missing', async () => {
    const res = await request.post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});
