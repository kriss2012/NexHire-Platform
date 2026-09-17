import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;
let isRedisConnected = false;

// Fallback in-memory cache store
const memoryCache = new Map<string, { val: string; expiresAt: number }>();

export function getRedisClient(): Redis | null {
  if (config.isTest) {
    return null; // Always use fast in-memory cache during test runs
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(config.redis.url, {
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
          if (times > 3) return null; // stop retrying quickly in dev
          return Math.min(times * 200, 1000);
        },
        lazyConnect: true,
      });

      redisClient.on('connect', () => {
        isRedisConnected = true;
        logger.info('Redis connected successfully');
      });

      redisClient.on('error', (err) => {
        isRedisConnected = false;
        logger.warn('Redis connection issue, falling back to local memory cache', { error: err.message });
      });
    } catch (err: any) {
      isRedisConnected = false;
      logger.warn('Redis initialization error', { error: err.message });
    }
  }

  return redisClient;
}

export async function checkRedisConnection(): Promise<{ status: 'healthy' | 'degraded'; latencyMs: number }> {
  const start = Date.now();
  const client = getRedisClient();
  if (!client) {
    return { status: 'degraded', latencyMs: 0 };
  }

  try {
    if (client.status !== 'ready') {
      await client.connect();
    }
    await client.ping();
    isRedisConnected = true;
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err: any) {
    isRedisConnected = false;
    return { status: 'degraded', latencyMs: Date.now() - start };
  }
}

export function isRedisAvailable(): boolean {
  return isRedisConnected;
}

export const memoryCacheStore = memoryCache;
