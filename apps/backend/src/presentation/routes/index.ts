import { Router } from 'express';
import type { AuthService } from '@application/services/auth.service.js';
import type { EmployeeService } from '@application/services/employee.service.js';
import type { LeaveService } from '@application/services/leave.service.js';
import type { PayrollService } from '@application/services/payroll.service.js';
import type { RecruitmentService } from '@application/services/recruitment.service.js';
import type { PerformanceService } from '@application/services/performance.service.js';
import type { TrainingService } from '@application/services/training.service.js';
import type { DocumentService } from '@application/services/document.service.js';
import type { TimeTrackingService } from '@application/services/time-tracking.service.js';
import type { ReportingService } from '@application/services/reporting.service.js';

import { AuthController } from '../controllers/auth.controller.js';
import { EmployeeController } from '../controllers/employee.controller.js';
import { LeaveController } from '../controllers/leave.controller.js';
import { PayrollController } from '../controllers/payroll.controller.js';
import { RecruitmentController } from '../controllers/recruitment.controller.js';
import { PerformanceController } from '../controllers/performance.controller.js';
import { TrainingController } from '../controllers/training.controller.js';
import { DocumentController } from '../controllers/document.controller.js';
import { TimeTrackingController } from '../controllers/time-tracking.controller.js';
import { ReportingController } from '../controllers/reporting.controller.js';

import { createAuthRoutes } from './auth.routes.js';
import { createEmployeeRoutes } from './employee.routes.js';
import { createLeaveRoutes } from './leave.routes.js';
import { createPayrollRoutes } from './payroll.routes.js';
import { createRecruitmentRoutes } from './recruitment.routes.js';
import { createPerformanceRoutes } from './performance.routes.js';
import { createTrainingRoutes } from './training.routes.js';
import { createDocumentRoutes } from './document.routes.js';
import { createTimeTrackingRoutes } from './time-tracking.routes.js';
import { createReportingRoutes } from './reporting.routes.js';

interface Services {
  authService: AuthService;
  employeeService: EmployeeService;
  leaveService: LeaveService;
  payrollService: PayrollService;
  recruitmentService: RecruitmentService;
  performanceService: PerformanceService;
  trainingService: TrainingService;
  documentService: DocumentService;
  timeTrackingService: TimeTrackingService;
  reportingService: ReportingService;
}

export function createApiRouter(services: Services): Router {
  const router = Router();

  const authController = new AuthController(services.authService);
  const employeeController = new EmployeeController(services.employeeService);
  const leaveController = new LeaveController(services.leaveService);
  const payrollController = new PayrollController(services.payrollService);
  const recruitmentController = new RecruitmentController(services.recruitmentService);
  const performanceController = new PerformanceController(services.performanceService);
  const trainingController = new TrainingController(services.trainingService);
  const documentController = new DocumentController(services.documentService);
  const timeTrackingController = new TimeTrackingController(services.timeTrackingService);
  const reportingController = new ReportingController(services.reportingService);

  router.use('/auth', createAuthRoutes(authController, services.authService));
  router.use('/employees', createEmployeeRoutes(employeeController, services.authService));
  router.use('/leaves', createLeaveRoutes(leaveController, services.authService));
  router.use('/payroll', createPayrollRoutes(payrollController, services.authService));
  router.use('/recruitment', createRecruitmentRoutes(recruitmentController, services.authService));
  router.use('/performance', createPerformanceRoutes(performanceController, services.authService));
  router.use('/trainings', createTrainingRoutes(trainingController, services.authService));
  router.use('/documents', createDocumentRoutes(documentController, services.authService));
  router.use('/time-tracking', createTimeTrackingRoutes(timeTrackingController, services.authService));
  router.use('/reports', createReportingRoutes(reportingController, services.authService));

  return router;
}
