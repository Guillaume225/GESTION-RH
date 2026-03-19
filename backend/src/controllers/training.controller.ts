import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { trainingService } from '../services/training.service';

export class TrainingController {
  async getTrainings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = req.query;
      const result = await trainingService.getTrainings({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as string,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTrainingById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await trainingService.getTrainingById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createTraining(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await trainingService.createTraining(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateTraining(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await trainingService.updateTraining(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async enrollEmployee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await trainingService.enrollEmployee(req.params.id, req.body.employeeId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async completeEnrollment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { employeeId, feedback, rating } = req.body;
      const result = await trainingService.completeEnrollment(req.params.id, employeeId, feedback, rating);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const trainingController = new TrainingController();
