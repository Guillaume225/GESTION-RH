import { Router } from 'express';
import type { EmployeeController } from '../controllers/employee.controller.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware, authorize } from '@infrastructure/middleware/auth.middleware.js';
import { validate } from '@infrastructure/middleware/validation.middleware.js';
import { createEmployeeSchema, updateEmployeeSchema, employeeFilterSchema } from '@application/dtos/employee.dto.js';

export function createEmployeeRoutes(controller: EmployeeController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.use(authenticate);

  router.get('/', validate(employeeFilterSchema, 'query'), controller.findAll);
  router.get('/me', controller.findMyProfile);
  router.get('/org-chart', controller.getOrgChart);
  router.get('/:id', controller.findById);
  router.post('/', authorize('SUPER_ADMIN', 'HR_MANAGER'), validate(createEmployeeSchema), controller.create);
  router.put('/:id', authorize('SUPER_ADMIN', 'HR_MANAGER'), validate(updateEmployeeSchema), controller.update);
  router.delete('/:id', authorize('SUPER_ADMIN'), controller.delete);

  return router;
}
