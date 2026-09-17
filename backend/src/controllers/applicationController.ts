import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/applicationService';

export class ApplicationController {
  public static async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await ApplicationService.applyForJob(
        req.params.id,
        req.user!.userId,
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const applications = await ApplicationService.getApplicationsForUser(
        req.user!.userId,
        req.user!.role
      );
      res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getApplicationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await ApplicationService.getApplicationById(
        req.params.id,
        req.user!
      );
      res.status(200).json({
        success: true,
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await ApplicationService.updateStatus(
        req.params.id,
        req.body.status,
        req.user!
      );
      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }
}
