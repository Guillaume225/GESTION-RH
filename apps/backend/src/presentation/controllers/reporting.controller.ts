import type { Response, NextFunction } from 'express';
import type { ReportingService } from '@application/services/reporting.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';

export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.reportingService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  };

  getDepartmentDistribution = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportingService.getDepartmentDistribution();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getTurnoverRate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const data = await this.reportingService.getTurnoverRate(year);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getAbsenteeismRate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const data = await this.reportingService.getAbsenteeismRate(year);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getPayrollSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);
      const data = await this.reportingService.getPayrollSummary(month, year);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getAgePyramid = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportingService.getAgePyramid();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
