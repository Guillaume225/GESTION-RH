import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { recruitmentService } from '../services/recruitment.service';

export class RecruitmentController {
  async getJobOffers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = req.query;
      const result = await recruitmentService.getJobOffers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as any,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getJobOfferById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.getJobOfferById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createJobOffer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.createJobOffer(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateJobOffer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.updateJobOffer(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async publishJobOffer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.publishJobOffer(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCandidates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.getCandidates(req.params.jobOfferId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createCandidate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.createCandidate(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateCandidateStage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.updateCandidateStage(req.params.id, req.body.stage);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async scheduleInterview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.scheduleInterview(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPipelineStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.getPipelineStats(req.params.jobOfferId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const recruitmentController = new RecruitmentController();
