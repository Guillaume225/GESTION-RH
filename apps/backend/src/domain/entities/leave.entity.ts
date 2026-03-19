import type { BaseEntity } from './base.entity.js';

export interface LeaveRequest extends BaseEntity {
  employeeId: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNote: string | null;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  type: string;
  year: number;
  total: number;
  used: number;
  pending: number;
}
