import { Router } from 'express';
import type { TrainingController } from '../controllers/training.controller.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware, authorize } from '@infrastructure/middleware/auth.middleware.js';

export function createTrainingRoutes(controller: TrainingController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.use(authenticate);

  router.get('/', controller.getAll);
  router.post('/', authorize('SUPER_ADMIN', 'HR_MANAGER'), controller.create);
  router.put('/:id', authorize('SUPER_ADMIN', 'HR_MANAGER'), controller.update);
  router.post('/:id/enroll', controller.enroll);
  router.put('/enrollments/:enrollmentId/complete', authorize('SUPER_ADMIN', 'HR_MANAGER'), controller.completeEnrollment);

  return router;
}
