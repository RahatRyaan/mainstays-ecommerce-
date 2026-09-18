import mongoose from 'mongoose';
import logger from '../common/logger';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(uri);
    logger.info('MongoDB Connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
