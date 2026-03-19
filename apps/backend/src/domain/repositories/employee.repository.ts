import type { Employee, EmployeeFilter } from '../entities/employee.entity.js';
import type { PaginationOptions, PaginatedResult } from '../entities/base.entity.js';

/**
 * Port: Employee repository interface.
 */
export interface IEmployeeRepository {
  findAll(pagination: PaginationOptions, filter?: EmployeeFilter): Promise<PaginatedResult<Employee>>;
  findById(id: string): Promise<Employee | null>;
  findByUserId(userId: string): Promise<Employee | null>;
  create(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee>;
  update(id: string, data: Partial<Employee>): Promise<Employee>;
  softDelete(id: string): Promise<void>;
  count(filter?: EmployeeFilter): Promise<number>;
  getOrgChart(): Promise<Employee[]>;
}
