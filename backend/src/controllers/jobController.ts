import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/jobService';

export class JobController {
  public static async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, type, is_remote, location, company_id, status, page, limit } = req.query as any;
      const result = await JobService.getJobs({
        q,
        type,
        is_remote,
        location,
        company_id,
        status,
        page,
        limit,
      });

      res.setHeader('X-Cache', result.cached ? 'HIT' : 'MISS');
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await JobService.getJobById(req.params.id);
      res.status(200).json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await JobService.createJob(req.body, req.user!);
      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await JobService.updateJob(req.params.id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await JobService.deleteJob(req.params.id, req.user!);
      res.status(200).json({
        success: true,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
