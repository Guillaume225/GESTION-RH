import type { BaseEntity } from './base.entity.js';

export interface User extends BaseEntity {
  email: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'HR_MANAGER' | 'MANAGER' | 'EMPLOYEE';
  isActive: boolean;
  lastLogin: Date | null;
  refreshToken: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
}
