import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { JobRepository } from '../repositories/jobRepository';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { getHealthStatus } from '../health/healthCheck';

export class AdminController {
  public static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserRepository.findAll();
      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSystemStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [userCount, jobCount, applicationCount, health] = await Promise.all([
        UserRepository.count(),
        JobRepository.count(),
        ApplicationRepository.count(),
        getHealthStatus(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalUsers: userCount,
            totalJobs: jobCount,
            totalApplications: applicationCount,
            uptimeSeconds: health.uptimeSeconds,
            databaseStatus: health.checks.database.status,
            databaseLatencyMs: health.checks.database.latencyMs,
            redisStatus: health.checks.redis.status,
            redisLatencyMs: health.checks.redis.latencyMs,
            memoryRssMb: health.checks.memory.rssMb,
            memoryHeapMb: health.checks.memory.heapUsedMb,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
