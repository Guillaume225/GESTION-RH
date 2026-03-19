import type { IEmployeeRepository } from '../../domain/repositories/employee.repository.js';
import type { CreateEmployeeDto, UpdateEmployeeDto, EmployeeFilterDto } from '../dtos/employee.dto.js';
import { AppError } from '../../infrastructure/errors/app-error.js';

export class EmployeeService {
  constructor(private employeeRepo: IEmployeeRepository) {}

  async findAll(filter: EmployeeFilterDto) {
    return this.employeeRepo.findAll(
      { page: filter.page, limit: filter.limit, sortBy: filter.sortBy, sortOrder: filter.sortOrder },
      { search: filter.search, departmentId: filter.departmentId, status: filter.status, contractType: filter.contractType },
    );
  }

  async findById(id: string) {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) throw new AppError('Employé non trouvé', 404);
    return employee;
  }

  async findByUserId(userId: string) {
    return this.employeeRepo.findByUserId(userId);
  }

  async create(dto: CreateEmployeeDto) {
    const count = await this.employeeRepo.count();
    const employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;

    return this.employeeRepo.create({
      employeeId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone ?? null,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      gender: dto.gender ?? null,
      nationality: dto.nationality ?? null,
      address: dto.address ?? null,
      city: dto.city ?? null,
      zipCode: dto.zipCode ?? null,
      avatarUrl: null,
      hireDate: new Date(dto.hireDate),
      endDate: null,
      contractType: dto.contractType,
      status: 'ACTIVE',
      salary: dto.salary ?? null,
      departmentId: dto.departmentId ?? null,
      positionId: dto.positionId ?? null,
      managerId: dto.managerId ?? null,
      userId: null,
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const existing = await this.employeeRepo.findById(id);
    if (!existing) throw new AppError('Employé non trouvé', 404);
    return this.employeeRepo.update(id, dto as never);
  }

  async delete(id: string) {
    const existing = await this.employeeRepo.findById(id);
    if (!existing) throw new AppError('Employé non trouvé', 404);
    await this.employeeRepo.softDelete(id);
  }

  async getOrgChart() {
    return this.employeeRepo.getOrgChart();
  }
}
