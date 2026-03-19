import { Router } from 'express';
import type { PerformanceController } from '../controllers/performance.controller.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware, authorize } from '@infrastructure/middleware/auth.middleware.js';

export function createPerformanceRoutes(controller: PerformanceController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.use(authenticate);

  router.get('/evaluations', controller.getEvaluations);
  router.post('/evaluations', authorize('SUPER_ADMIN', 'HR_MANAGER', 'MANAGER'), controller.createEvaluation);
  router.put('/evaluations/:id/complete', authorize('SUPER_ADMIN', 'HR_MANAGER', 'MANAGER'), controller.completeEvaluation);

  router.post('/objectives', authorize('SUPER_ADMIN', 'HR_MANAGER', 'MANAGER'), controller.createObjective);
  router.put('/objectives/:id', controller.updateObjective);

  return router;
}
