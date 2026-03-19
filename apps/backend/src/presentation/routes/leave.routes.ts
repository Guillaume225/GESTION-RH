import { Router } from 'express';
import type { LeaveController } from '../controllers/leave.controller.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware, authorize } from '@infrastructure/middleware/auth.middleware.js';
import { validate } from '@infrastructure/middleware/validation.middleware.js';
import { createLeaveSchema, reviewLeaveSchema } from '@application/dtos/leave.dto.js';

export function createLeaveRoutes(controller: LeaveController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.use(authenticate);

  router.get('/', controller.findAll);
  router.get('/calendar', controller.getTeamCalendar);
  router.get('/:id', controller.findById);
  router.post('/', validate(createLeaveSchema), controller.create);
  router.put('/:id/review', authorize('SUPER_ADMIN', 'HR_MANAGER', 'MANAGER'), validate(reviewLeaveSchema), controller.review);
  router.get('/balances/:employeeId', controller.getBalances);

  return router;
}
