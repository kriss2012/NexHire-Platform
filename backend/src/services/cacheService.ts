import { getRedisClient, isRedisAvailable, memoryCacheStore } from '../config/redis';
import { cacheHitsTotal, cacheMissesTotal } from '../utils/metrics';
import { logger } from '../utils/logger';

export class CacheService {
  /**
   * Retrieve parsed cached data by key
   */
  public static async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();

    if (client && isRedisAvailable()) {
      try {
        const raw = await client.get(key);
        if (raw) {
          cacheHitsTotal.inc({ cache_key: key.split(':')[0] });
          return JSON.parse(raw) as T;
        }
      } catch (err: any) {
        logger.warn(`Redis get error for key ${key}: ${err.message}`);
      }
    }

    // Check memory cache fallback
    const entry = memoryCacheStore.get(key);
    if (entry) {
      if (Date.now() < entry.expiresAt) {
        cacheHitsTotal.inc({ cache_key: key.split(':')[0] });
        return JSON.parse(entry.val) as T;
      }
      memoryCacheStore.delete(key);
    }

    cacheMissesTotal.inc({ cache_key: key.split(':')[0] });
    return null;
  }

  /**
   * Set cache with TTL in seconds
   */
  public static async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    const client = getRedisClient();

    if (client && isRedisAvailable()) {
      try {
        await client.setex(key, ttlSeconds, serialized);
        return;
      } catch (err: any) {
        logger.warn(`Redis set error for key ${key}: ${err.message}`);
      }
    }

    // Set in memory cache fallback
    memoryCacheStore.set(key, {
      val: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete a single key
   */
  public static async del(key: string): Promise<void> {
    const client = getRedisClient();
    if (client && isRedisAvailable()) {
      try {
        await client.del(key);
      } catch (err: any) {
        logger.warn(`Redis del error for key ${key}: ${err.message}`);
      }
    }
    memoryCacheStore.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix/pattern (e.g. "jobs:*")
   */
  public static async invalidatePattern(prefix: string): Promise<void> {
    const client = getRedisClient();
    if (client && isRedisAvailable()) {
      try {
        const keys = await client.keys(`${prefix}*`);
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } catch (err: any) {
        logger.warn(`Redis invalidatePattern error for prefix ${prefix}: ${err.message}`);
      }
    }

    // Clear matching memory keys
    for (const key of memoryCacheStore.keys()) {
      if (key.startsWith(prefix)) {
        memoryCacheStore.delete(key);
      }
    }
  }
}
