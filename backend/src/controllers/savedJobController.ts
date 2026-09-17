import { Request, Response, NextFunction } from 'express';
import { SavedJobRepository } from '../repositories/savedJobRepository';

export class SavedJobController {
  public static async saveJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const saved = await SavedJobRepository.save({
        id: `save-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: req.user!.userId,
        job_id: req.params.id,
        created_at: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Job saved to bookmarks',
        data: { saved },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async unsaveJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await SavedJobRepository.delete(req.user!.userId, req.params.id);
      res.status(200).json({
        success: true,
        message: 'Job removed from bookmarks',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSavedJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const savedJobs = await SavedJobRepository.findByUserId(req.user!.userId);
      res.status(200).json({
        success: true,
        data: { savedJobs },
      });
    } catch (error) {
      next(error);
    }
  }
}
