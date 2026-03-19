import { Router } from 'express';
import type { AuthController } from '../controllers/auth.controller.js';
import { validate } from '@infrastructure/middleware/validation.middleware.js';
import { authLimiter } from '@infrastructure/middleware/rate-limiter.middleware.js';
import { loginSchema, registerSchema, changePasswordSchema } from '@application/dtos/auth.dto.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware } from '@infrastructure/middleware/auth.middleware.js';

export function createAuthRoutes(controller: AuthController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.post('/login', authLimiter, validate(loginSchema), controller.login);
  router.post('/register', authLimiter, validate(registerSchema), controller.register);
  router.post('/refresh-token', authLimiter, controller.refreshToken);
  router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);
  router.get('/profile', authenticate, controller.getProfile);

  return router;
}
