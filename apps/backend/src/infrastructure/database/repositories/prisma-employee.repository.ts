import type { PrismaClient, Prisma } from '@prisma/client';
import type { IEmployeeRepository } from '../../../domain/repositories/employee.repository.js';
import type { Employee, EmployeeFilter } from '../../../domain/entities/employee.entity.js';
import type { PaginationOptions, PaginatedResult } from '../../../domain/entities/base.entity.js';

export class PrismaEmployeeRepository implements IEmployeeRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(pagination: PaginationOptions, filter?: EmployeeFilter): Promise<PaginatedResult<Employee>> {
    const where: Prisma.EmployeeWhereInput = {};

    if (filter?.search) {
      where.OR = [
        { firstName: { contains: filter.search } },
        { lastName: { contains: filter.search } },
        { email: { contains: filter.search } },
        { employeeId: { contains: filter.search } },
      ];
    }
    if (filter?.departmentId) where.departmentId = filter.departmentId;
    if (filter?.status) where.status = filter.status as never;
    if (filter?.contractType) where.contractType = filter.contractType as never;

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          position: { select: { id: true, title: true } },
          manager: { select: { id: true, firstName: true, lastName: true } },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: pagination.sortBy ? { [pagination.sortBy]: pagination.sortOrder ?? 'asc' } : { lastName: 'asc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: data as unknown as Employee[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findById(id: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        leaveBalances: true,
        positionHistory: { include: { position: true }, orderBy: { startDate: 'desc' } },
      },
    }) as unknown as Employee | null;
  }

  async findByUserId(userId: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({ where: { userId } }) as unknown as Employee | null;
  }

  async create(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    return this.prisma.employee.create({ data: data as never }) as unknown as Employee;
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    return this.prisma.employee.update({ where: { id }, data: data as never }) as unknown as Employee;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.employee.update({
      where: { id },
      data: { status: 'TERMINATED', endDate: new Date() },
    });
  }

  async count(filter?: EmployeeFilter): Promise<number> {
    const where: Prisma.EmployeeWhereInput = {};
    if (filter?.status) where.status = filter.status as never;
    return this.prisma.employee.count({ where });
  }

  async getOrgChart(): Promise<Employee[]> {
    return this.prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      include: {
        department: { select: { name: true } },
        position: { select: { title: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ department: { name: 'asc' } }, { lastName: 'asc' }],
    }) as unknown as Employee[];
  }
}
