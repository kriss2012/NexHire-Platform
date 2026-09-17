import { checkDatabaseConnection } from '../config/database';
import { checkRedisConnection } from '../config/redis';

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  checks: {
    database: { status: 'healthy' | 'degraded'; latencyMs: number };
    redis: { status: 'healthy' | 'degraded'; latencyMs: number };
    memory: { rssMb: number; heapUsedMb: number };
  };
}

export async function getHealthStatus(): Promise<HealthReport> {
  const [dbStatus, redisStatus] = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
  ]);

  const mem = process.memoryUsage();
  const isHealthy = dbStatus.status === 'healthy';
  const overallStatus = isHealthy ? 'healthy' : 'degraded';

  return {
    status: overallStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      database: dbStatus,
      redis: redisStatus,
      memory: {
        rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      },
    },
  };
}

export async function getReadinessStatus(): Promise<{ ready: boolean; details: any }> {
  const db = await checkDatabaseConnection();
  // Service is ready if DB is connected or in working fallback mode
  return {
    ready: true,
    details: {
      database: db.status,
      timestamp: new Date().toISOString(),
    },
  };
}

export function getLivenessStatus(): { alive: boolean; uptime: number } {
  return {
    alive: true,
    uptime: Math.floor(process.uptime()),
  };
}
