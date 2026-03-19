import { Router } from 'express';
import type { TimeTrackingController } from '../controllers/time-tracking.controller.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware } from '@infrastructure/middleware/auth.middleware.js';

export function createTimeTrackingRoutes(controller: TimeTrackingController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.use(authenticate);

  router.get('/', controller.getEntries);
  router.post('/clock-in', controller.clockIn);
  router.put('/:id/clock-out', controller.clockOut);
  router.get('/summary/:employeeId', controller.getWeeklySummary);

  return router;
}
