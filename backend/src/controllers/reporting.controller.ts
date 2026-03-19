import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { reportingService } from '../services/reporting.service';

export class ReportingController {
  async getDashboardStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await reportingService.getDashboardStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTurnoverRate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      const result = await reportingService.getTurnoverRate(year);
      res.json({ year, rate: result });
    } catch (error) {
      next(error);
    }
  }

  async getAbsenteeismRate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const result = await reportingService.getAbsenteeismRate(year, month);
      res.json({ year, month, rate: result });
    } catch (error) {
      next(error);
    }
  }

  async getPayrollSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const result = await reportingService.getPayrollSummary(year, month);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAgePyramid(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await reportingService.getAgePyramid();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentDistribution(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await reportingService.getDepartmentDistribution();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const reportingController = new ReportingController();
