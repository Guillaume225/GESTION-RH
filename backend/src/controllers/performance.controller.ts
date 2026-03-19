import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { performanceService } from '../services/performance.service';

export class PerformanceController {
  async getEvaluations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, employeeId, status } = req.query;
      const result = await performanceService.getEvaluations({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        employeeId: employeeId as string,
        status: status as any,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getEvaluationById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.getEvaluationById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createEvaluation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.createEvaluation(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateEvaluation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.updateEvaluation(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async completeEvaluation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.completeEvaluation(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getObjectives(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = req.params.employeeId || req.user!.employeeId!;
      const result = await performanceService.getObjectives(employeeId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createObjective(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.createObjective(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateObjective(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.updateObjective(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const performanceController = new PerformanceController();
