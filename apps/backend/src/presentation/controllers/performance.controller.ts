import type { Response, NextFunction } from 'express';
import type { PerformanceService } from '@application/services/performance.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';

export class PerformanceController {
  constructor(private performanceService: PerformanceService) {}

  getEvaluations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.performanceService.getEvaluations(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  createEvaluation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const evaluation = await this.performanceService.createEvaluation(req.body);
      res.status(201).json({ success: true, data: evaluation });
    } catch (err) {
      next(err);
    }
  };

  completeEvaluation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const evaluation = await this.performanceService.completeEvaluation(req.params.id, req.body);
      res.json({ success: true, data: evaluation });
    } catch (err) {
      next(err);
    }
  };

  createObjective = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const objective = await this.performanceService.createObjective(req.body);
      res.status(201).json({ success: true, data: objective });
    } catch (err) {
      next(err);
    }
  };

  updateObjective = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const objective = await this.performanceService.updateObjective(req.params.id, req.body);
      res.json({ success: true, data: objective });
    } catch (err) {
      next(err);
    }
  };
}
