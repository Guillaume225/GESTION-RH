import { Router } from 'express';
import type { PayrollController } from '../controllers/payroll.controller.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware, authorize } from '@infrastructure/middleware/auth.middleware.js';

export function createPayrollRoutes(controller: PayrollController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.use(authenticate);

  router.get('/', controller.getPayslips);
  router.get('/:id', controller.getPayslipById);
  router.post('/', authorize('SUPER_ADMIN', 'HR_MANAGER'), controller.generatePayslip);
  router.put('/:id/validate', authorize('SUPER_ADMIN', 'HR_MANAGER'), controller.validatePayslip);
  router.post('/bulk', authorize('SUPER_ADMIN', 'HR_MANAGER'), controller.generateBulk);

  return router;
}
