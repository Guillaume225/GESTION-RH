import type { Response, NextFunction } from 'express';
import type { RecruitmentService } from '@application/services/recruitment.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';

export class RecruitmentController {
  constructor(private recruitmentService: RecruitmentService) {}

  // --- Job Offers ---
  getJobOffers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.recruitmentService.getJobOffers(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getJobOfferById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const offer = await this.recruitmentService.getJobOfferById(req.params.id);
      res.json({ success: true, data: offer });
    } catch (err) {
      next(err);
    }
  };

  createJobOffer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const offer = await this.recruitmentService.createJobOffer(req.body);
      res.status(201).json({ success: true, data: offer });
    } catch (err) {
      next(err);
    }
  };

  publishJobOffer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const offer = await this.recruitmentService.publishJobOffer(req.params.id);
      res.json({ success: true, data: offer });
    } catch (err) {
      next(err);
    }
  };

  closeJobOffer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const offer = await this.recruitmentService.closeJobOffer(req.params.id);
      res.json({ success: true, data: offer });
    } catch (err) {
      next(err);
    }
  };

  // --- Candidates ---
  getCandidates = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.recruitmentService.getCandidates(req.params.offerId, req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  createCandidate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const candidate = await this.recruitmentService.createCandidate(req.body);
      res.status(201).json({ success: true, data: candidate });
    } catch (err) {
      next(err);
    }
  };

  updateCandidateStage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const candidate = await this.recruitmentService.updateCandidateStage(req.params.id, req.body.stage);
      res.json({ success: true, data: candidate });
    } catch (err) {
      next(err);
    }
  };

  // --- Pipeline ---
  getPipelineStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.recruitmentService.getPipelineStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  };
}
