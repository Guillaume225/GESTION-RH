import type { LeaveRequest, LeaveBalance } from '../entities/leave.entity.js';
import type { PaginationOptions, PaginatedResult } from '../entities/base.entity.js';

/**
 * Port: Leave repository interface.
 */
export interface ILeaveRepository {
  findAll(pagination: PaginationOptions, employeeId?: string): Promise<PaginatedResult<LeaveRequest>>;
  findById(id: string): Promise<LeaveRequest | null>;
  create(data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest>;
  update(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest>;
  getBalances(employeeId: string, year: number): Promise<LeaveBalance[]>;
  updateBalance(employeeId: string, type: string, year: number, change: { used?: number; pending?: number }): Promise<void>;
  getTeamCalendar(managerEmployeeId: string, startDate: Date, endDate: Date): Promise<LeaveRequest[]>;
}
