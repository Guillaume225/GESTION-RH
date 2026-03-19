import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { timeTrackingService } from '../services/timeTracking.service';

export class TimeTrackingController {
  async getEntries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, employeeId, startDate, endDate, status } = req.query;
      const result = await timeTrackingService.getEntries({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        employeeId: (employeeId as string) || req.user!.employeeId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        status: status as string,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async clockIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await timeTrackingService.clockIn(req.user!.employeeId!);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async clockOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await timeTrackingService.clockOut(req.user!.employeeId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getWeeklySummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const weekStart = new Date(req.query.weekStart as string);
      const employeeId = (req.params.employeeId || req.user!.employeeId)!;
      const result = await timeTrackingService.getWeeklySummary(employeeId, weekStart);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const timeTrackingController = new TimeTrackingController();
