import type { Response, NextFunction } from 'express';
import type { LeaveService } from '@application/services/leave.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';
import { AppError } from '@infrastructure/errors/app-error.js';

export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  findAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.leaveService.findAll(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const leave = await this.leaveService.findById(req.params.id);
      res.json({ success: true, data: leave });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Non authentifié', 401);
      const leave = await this.leaveService.create(req.user.userId, req.body);
      res.status(201).json({ success: true, data: leave });
    } catch (err) {
      next(err);
    }
  };

  review = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Non authentifié', 401);
      const leave = await this.leaveService.review(req.params.id, req.user.userId, req.body);
      res.json({ success: true, data: leave });
    } catch (err) {
      next(err);
    }
  };

  getBalances = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const balances = await this.leaveService.getBalances(req.params.employeeId);
      res.json({ success: true, data: balances });
    } catch (err) {
      next(err);
    }
  };

  getTeamCalendar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const calendar = await this.leaveService.getTeamCalendar(req.query as any);
      res.json({ success: true, data: calendar });
    } catch (err) {
      next(err);
    }
  };
}
