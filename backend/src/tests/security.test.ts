import request from 'supertest';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { globalLimiter, authLimiter } from '../middlewares/rateLimiter';

const app = express();
app.use(express.json());

// Workaround for express-mongo-sanitize TypeError on req.query
app.use((req, res, next) => {
  if (req.query) {
    const query = { ...req.query };
    Object.defineProperty(req, 'query', {
      value: query,
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  next();
});

app.use(mongoSanitize());

// Dummy endpoints for testing
app.post('/api/auth/login', authLimiter, (req, res) => {
  res.status(200).json({ message: 'Success' });
});

app.post('/api/data', globalLimiter, (req, res) => {
  // Echo the body so we can test sanitization
  res.status(200).json({ body: req.body });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

describe('Security Middlewares', () => {
  it('should sanitize NoSQL injection payloads in req.body', async () => {
    const res = await request(app)
      .post('/api/data')
      .send({
        email: { $gt: '' },
        password: 'password123'
      });
    
    // express-mongo-sanitize removes keys starting with $ by default
    // so { $gt: '' } becomes {}
    expect(res.body.body.email).toEqual({});
    expect(res.body.body.password).toBe('password123');
  });

  it('should rate limit auth endpoints after 10 requests', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/auth/login').expect(200);
    }
    
    // The 11th request should be rate limited
    const res = await request(app).post('/api/auth/login');
    expect(res.status).toBe(429);
    expect(res.body.message).toBe('Too many authentication attempts, please try again after 15 minutes.');
  });
});
