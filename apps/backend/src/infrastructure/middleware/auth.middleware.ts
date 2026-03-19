import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../../application/services/auth.service.js';
import { AppError } from '../errors/app-error.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

/**
 * Creates authentication middleware with injected AuthService.
 */
export function createAuthMiddleware(authService: AuthService) {
  return function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(new AppError('Token d\'authentification requis', 401));
    }

    try {
      const token = header.slice(7);
      const payload = authService.verifyToken(token);
      req.userId = payload.userId;
      req.userEmail = payload.email;
      req.userRole = payload.role;
      next();
    } catch {
      next(new AppError('Token invalide ou expiré', 401));
    }
  };
}

/**
 * Creates authorization middleware for role-based access control.
 */
export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(new AppError('Accès non autorisé', 403));
    }
    next();
  };
}
