import { createClient } from 'redis';
import logger from '../common/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Connected'));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient;
