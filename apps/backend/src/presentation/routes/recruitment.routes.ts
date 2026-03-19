import { Router } from 'express';
import type { RecruitmentController } from '../controllers/recruitment.controller.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware, authorize } from '@infrastructure/middleware/auth.middleware.js';

export function createRecruitmentRoutes(controller: RecruitmentController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.use(authenticate);
  router.use(authorize('SUPER_ADMIN', 'HR_MANAGER', 'MANAGER'));

  router.get('/offers', controller.getJobOffers);
  router.get('/offers/:id', controller.getJobOfferById);
  router.post('/offers', controller.createJobOffer);
  router.put('/offers/:id/publish', controller.publishJobOffer);
  router.put('/offers/:id/close', controller.closeJobOffer);

  router.get('/offers/:offerId/candidates', controller.getCandidates);
  router.post('/candidates', controller.createCandidate);
  router.put('/candidates/:id/stage', controller.updateCandidateStage);

  router.get('/pipeline/stats', controller.getPipelineStats);

  return router;
}
