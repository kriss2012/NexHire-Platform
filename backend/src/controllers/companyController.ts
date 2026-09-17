import { Request, Response, NextFunction } from 'express';
import { CompanyService } from '../services/companyService';

export class CompanyController {
  public static async getCompanyById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAllCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companies = await CompanyService.getAll();
      res.status(200).json({
        success: true,
        data: { companies },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.create(req.body, req.user!.userId);
      res.status(201).json({
        success: true,
        message: 'Company profile created',
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const company = await CompanyService.update(req.params.id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Company profile updated',
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  }
}
