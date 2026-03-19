import type { Response, NextFunction } from 'express';
import type { TrainingService } from '@application/services/training.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';

export class TrainingController {
  constructor(private trainingService: TrainingService) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.trainingService.getAll(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const training = await this.trainingService.create(req.body);
      res.status(201).json({ success: true, data: training });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const training = await this.trainingService.update(req.params.id, req.body);
      res.json({ success: true, data: training });
    } catch (err) {
      next(err);
    }
  };

  enroll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const enrollment = await this.trainingService.enroll(req.params.id, req.body.employeeId);
      res.status(201).json({ success: true, data: enrollment });
    } catch (err) {
      next(err);
    }
  };

  completeEnrollment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const enrollment = await this.trainingService.completeEnrollment(req.params.enrollmentId, req.body);
      res.json({ success: true, data: enrollment });
    } catch (err) {
      next(err);
    }
  };
}
