import type { BaseEntity } from './base.entity.js';

export interface Employee extends BaseEntity {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  avatarUrl: string | null;
  hireDate: Date;
  endDate: Date | null;
  contractType: string;
  status: string;
  salary: number | null;
  departmentId: string | null;
  positionId: string | null;
  managerId: string | null;
  userId: string | null;
}

export interface EmployeeFilter {
  search?: string;
  departmentId?: string;
  status?: string;
  contractType?: string;
}
