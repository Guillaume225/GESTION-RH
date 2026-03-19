import type { Response, NextFunction } from 'express';
import type { AuthService } from '@application/services/auth.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';
import { AppError } from '@infrastructure/errors/app-error.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new AppError('Refresh token requis', 400);
      const result = await this.authService.refreshTokens(refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Non authentifié', 401);
      await this.authService.changePassword(req.user.userId, req.body);
      res.json({ success: true, message: 'Mot de passe modifié avec succès' });
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError('Non authentifié', 401);
      const profile = await this.authService.getProfile(req.user.userId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };
}
