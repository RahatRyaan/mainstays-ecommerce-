import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import logger from './common/logger';
import { errorHandler } from './common/errorHandler';
import { connectDB } from './db/mongo';
import { connectRedis } from './db/redis';
import cookieParser from 'cookie-parser';
import { globalLimiter } from './middlewares/rateLimiter';
import { requestLogger } from './middlewares/requestLogger';
import { setupSwagger } from './docs/swagger';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminRoutes from './routes/admin.routes';
import payoutRoutes from './routes/payout.routes';
import wishlistRoutes from './routes/wishlist.routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOriginsList = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, server-to-server or no origin
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');

      // Check configured origins or wildcard
      if (
        allowedOriginsList.includes('*') ||
        allowedOriginsList.includes(cleanOrigin) ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }

      callback(null, true); // Fallback allow to avoid blocking valid users
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);
app.use(express.json());
app.use(cookieParser());

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
app.use(requestLogger);
app.use('/api', globalLimiter);

// Setup Swagger API Docs
setupSwagger(app);

// Welcome & Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'MAINSTAYS Atelier API',
    status: 'online',
    timestamp: new Date().toISOString(),
    docs: '/api-docs',
    health: '/health',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
