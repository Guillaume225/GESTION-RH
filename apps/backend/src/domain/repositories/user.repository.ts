import type { User } from '../entities/user.entity.js';

/**
 * Port: User repository interface.
 * Implemented by infrastructure layer.
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  updateRefreshToken(id: string, token: string | null): Promise<void>;
}
