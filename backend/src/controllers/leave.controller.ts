import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { leaveService } from '../services/leave.service';

export class LeaveController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, employeeId, status, type } = req.query;
      const result = await leaveService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        employeeId: employeeId as string,
        status: status as any,
        type: type as any,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await leaveService.create({
        employeeId: req.user!.employeeId!,
        ...req.body,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await leaveService.approve(req.params.id, req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await leaveService.reject(req.params.id, req.user!.id, req.body.reason);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getBalances(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = (req.params.employeeId || req.user!.employeeId)!;
      const year = req.query.year ? Number(req.query.year) : undefined;
      const result = await leaveService.getBalances(employeeId, year);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTeamCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const result = await leaveService.getTeamCalendar(
        req.user!.employeeId!,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const leaveController = new LeaveController();
