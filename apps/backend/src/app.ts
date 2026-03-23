import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from '@infrastructure/config/index.js';
import { globalLimiter } from '@infrastructure/middleware/rate-limiter.middleware.js';
import { errorHandler } from '@infrastructure/middleware/error-handler.middleware.js';
import { prisma } from '@infrastructure/database/prisma-client.js';
import { createApiRouter } from '@presentation/routes/index.js';

// Repositories
import { PrismaUserRepository } from '@infrastructure/database/repositories/prisma-user.repository.js';
import { PrismaEmployeeRepository } from '@infrastructure/database/repositories/prisma-employee.repository.js';
import { PrismaLeaveRepository } from '@infrastructure/database/repositories/prisma-leave.repository.js';

// Services
import { AuthService } from '@application/services/auth.service.js';
import { EmployeeService } from '@application/services/employee.service.js';
import { LeaveService } from '@application/services/leave.service.js';
import { PayrollService } from '@application/services/payroll.service.js';
import { RecruitmentService } from '@application/services/recruitment.service.js';
import { PerformanceService } from '@application/services/performance.service.js';
import { TrainingService } from '@application/services/training.service.js';
import { DocumentService } from '@application/services/document.service.js';
import { TimeTrackingService } from '@application/services/time-tracking.service.js';
import { ReportingService } from '@application/services/reporting.service.js';

export function createApp() {
  const app = express();

  // --- Global middleware ---
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined'));
  app.use(globalLimiter);

  // --- Dependency Injection (composition root) ---
  const userRepository = new PrismaUserRepository(prisma);
  const employeeRepository = new PrismaEmployeeRepository(prisma);
  const leaveRepository = new PrismaLeaveRepository(prisma);

  const authService = new AuthService(
    userRepository,
    config.jwt.secret,
    config.jwt.expiresIn,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn,
  );
  const employeeService = new EmployeeService(employeeRepository);
  const leaveService = new LeaveService(leaveRepository);
  const payrollService = new PayrollService(prisma);
  const recruitmentService = new RecruitmentService(prisma);
  const performanceService = new PerformanceService(prisma);
  const trainingService = new TrainingService(prisma);
  const documentService = new DocumentService(prisma);
  const timeTrackingService = new TimeTrackingService(prisma);
  const reportingService = new ReportingService(prisma);

  // --- API Routes (versioned) ---
  const apiRouter = createApiRouter({
    authService,
    employeeService,
    leaveService,
    payrollService,
    recruitmentService,
    performanceService,
    trainingService,
    documentService,
    timeTrackingService,
    reportingService,
  });

  app.use('/api/v1', apiRouter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Global error handler ---
  app.use(errorHandler);

  return app;
}
