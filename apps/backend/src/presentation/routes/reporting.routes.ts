import { Router } from 'express';
import type { ReportingController } from '../controllers/reporting.controller.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware, authorize } from '@infrastructure/middleware/auth.middleware.js';

export function createReportingRoutes(controller: ReportingController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.use(authenticate);
  router.use(authorize('SUPER_ADMIN', 'HR_MANAGER'));

  router.get('/dashboard', controller.getDashboardStats);
  router.get('/departments', controller.getDepartmentDistribution);
  router.get('/turnover', controller.getTurnoverRate);
  router.get('/absenteeism', controller.getAbsenteeismRate);
  router.get('/payroll-summary', controller.getPayrollSummary);
  router.get('/age-pyramid', controller.getAgePyramid);

  return router;
}
