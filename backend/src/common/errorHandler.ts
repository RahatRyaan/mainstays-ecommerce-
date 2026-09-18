import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource ID format: ${err.value}`;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate entry: A resource with that ${field} already exists.`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((e: any) => e.message);
    message = errors.join(', ') || 'Validation failed';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
