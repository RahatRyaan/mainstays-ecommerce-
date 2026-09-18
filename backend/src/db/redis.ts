import { createClient } from 'redis';
import logger from '../common/logger';

function resolveRedisUrl(): string {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  // Auto-construct Upstash connection string from Upstash REST URL + Token
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    const cleanHost = upstashUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `rediss://default:${upstashToken}@${cleanHost}:6379`;
  }

  return 'redis://localhost:6379';
}

const redisUrl = resolveRedisUrl();
const redisClient = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 8000,
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

redisClient.on('error', (err) => logger.warn('Redis Client Warning/Error:', err.message || err));
redisClient.on('connect', () => logger.info('Redis In-Memory Cache Connected successfully'));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch (err: any) {
      logger.warn(`Redis connection failed (${err.message}). Continuing with in-memory fallback.`);
    }
  }
};

export default redisClient;
