import { Request, Response } from 'express';
import { getHealthStatus, getReadinessStatus, getLivenessStatus } from '../health/healthCheck';

export class HealthController {
  public static async getApiHealth(req: Request, res: Response): Promise<void> {
    const health = await getHealthStatus();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json({
      status: health.status === 'unhealthy' ? 'error' : 'ok',
      service: 'NexHire API',
      timestamp: new Date().toISOString(),
      uptimeSeconds: health.uptimeSeconds,
      version: health.version,
      checks: health.checks,
    });
  }

  public static async getHealth(req: Request, res: Response): Promise<void> {
    const health = await getHealthStatus();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(health);
  }

  public static async getReadiness(req: Request, res: Response): Promise<void> {
    const readiness = await getReadinessStatus();
    const statusCode = readiness.ready ? 200 : 503;
    res.status(statusCode).json(readiness);
  }

  public static getLiveness(req: Request, res: Response): void {
    const liveness = getLivenessStatus();
    res.status(200).json(liveness);
  }
}
