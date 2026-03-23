import type { Response, NextFunction } from 'express';
import type { TimeTrackingService } from '@application/services/time-tracking.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';
import { AppError } from '@infrastructure/errors/app-error.js';

export class TimeTrackingController {
  constructor(private timeTrackingService: TimeTrackingService) {}

  getEntries = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.timeTrackingService.getEntries(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  clockIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new AppError('Non authentifié', 401);
      const entry = await this.timeTrackingService.clockIn(req.body.employeeId);
      res.status(201).json({ success: true, data: entry });
    } catch (err) {
      next(err);
    }
  };

  clockOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const entry = await this.timeTrackingService.clockOut(req.params.id);
      res.json({ success: true, data: entry });
    } catch (err) {
      next(err);
    }
  };

  getWeeklySummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const summary = await this.timeTrackingService.getWeeklySummary(
        req.params.employeeId,
      );
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  };
}
