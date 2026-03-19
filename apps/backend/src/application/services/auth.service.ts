import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { LoginDto, RegisterDto, ChangePasswordDto } from '../dtos/auth.dto.js';
import { AppError } from '../../infrastructure/errors/app-error.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  constructor(
    private userRepo: IUserRepository,
    private jwtSecret: string,
    private jwtExpiresIn: string,
    private jwtRefreshSecret: string,
    private jwtRefreshExpiresIn: string,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, { expiresIn: this.jwtRefreshExpiresIn });

    await this.userRepo.update(user.id, { lastLogin: new Date() } as never);
    await this.userRepo.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, isActive: user.isActive },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepo.create({
      email: dto.email,
      passwordHash,
      role: dto.role ?? 'EMPLOYEE',
      isActive: true,
      lastLogin: null,
      refreshToken: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async refreshTokens(token: string) {
    try {
      const payload = jwt.verify(token, this.jwtRefreshSecret) as TokenPayload;
      const user = await this.userRepo.findById(payload.userId);
      if (!user || user.refreshToken !== token) {
        throw new AppError('Token invalide', 401);
      }

      const newPayload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = jwt.sign(newPayload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
      const refreshToken = jwt.sign(newPayload, this.jwtRefreshSecret, { expiresIn: this.jwtRefreshExpiresIn });

      await this.userRepo.updateRefreshToken(user.id, refreshToken);
      return { accessToken, refreshToken };
    } catch {
      throw new AppError('Token invalide ou expiré', 401);
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('Utilisateur non trouvé', 404);

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Mot de passe actuel incorrect', 400);

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.update(userId, { passwordHash } as never);
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('Utilisateur non trouvé', 404);
    return { id: user.id, email: user.email, role: user.role, isActive: user.isActive };
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.jwtSecret) as TokenPayload;
  }
}
