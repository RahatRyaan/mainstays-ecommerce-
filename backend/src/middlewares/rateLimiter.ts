import rateLimit from 'express-rate-limit';

// Global Rate Limiter: max 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth Rate Limiter: max 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
