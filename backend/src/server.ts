import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { seedDatabase } from './db/seed';
import { checkDatabaseConnection, getPool } from './config/database';
import { checkRedisConnection, getRedisClient } from './config/redis';

async function bootstrap() {
  // Check backing services and auto-seed
  const dbHealth = await checkDatabaseConnection();
  const redisHealth = await checkRedisConnection();

  logger.info('Backing services connection status:', {
    database: dbHealth.status,
    databaseLatencyMs: dbHealth.latencyMs,
    redis: redisHealth.status,
    redisLatencyMs: redisHealth.latencyMs,
  });

  // Seed default demo data
  await seedDatabase();

  const server = app.listen(config.port, config.host, () => {
    logger.info(`NexHire Backend API listening on http://${config.host}:${config.port}`, {
      environment: config.env,
      nodeVersion: process.version,
      pid: process.pid,
    });
  });

  // Graceful Shutdown on termination signals
  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Initiating graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed.');

      try {
        const pool = getPool();
        await pool.end();
        logger.info('Database pool closed.');
      } catch (err: any) {
        logger.error('Error closing database pool', { error: err.message });
      }

      try {
        const redis = getRedisClient();
        if (redis) {
          await redis.quit();
          logger.info('Redis client disconnected.');
        }
      } catch (err: any) {
        logger.error('Error closing Redis client', { error: err.message });
      }

      logger.info('Graceful shutdown completed successfully. Exiting.');
      process.exit(0);
    });

    // Force exit if not finished within 10 seconds
    setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error', { error: err.message, stack: err.stack });
  process.exit(1);
});
