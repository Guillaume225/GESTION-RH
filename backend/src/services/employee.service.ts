import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class EmployeeService {
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    status?: string;
  }) {
    const { page = 1, limit = 20, search, departmentId, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { employeeNumber: { contains: search } },
      ];
    }

    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          position: true,
          department: true,
          manager: { select: { id: true, firstName: true, lastName: true } },
          user: { select: { email: true, role: true } },
        },
        orderBy: { lastName: 'asc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        position: true,
        department: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        subordinates: { select: { id: true, firstName: true, lastName: true, position: true } },
        user: { select: { email: true, role: true } },
        documents: true,
        leaveBalances: true,
        positionHistory: { orderBy: { startDate: 'desc' } },
      },
    });

    if (!employee) throw new AppError('Employé non trouvé', 404);
    return employee;
  }

  async create(data: Prisma.EmployeeCreateInput) {
    return prisma.employee.create({
      data,
      include: { position: true, department: true },
    });
  }

  async update(id: string, data: Prisma.EmployeeUpdateInput) {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new AppError('Employé non trouvé', 404);

    return prisma.employee.update({
      where: { id },
      data,
      include: { position: true, department: true },
    });
  }

  async delete(id: string) {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new AppError('Employé non trouvé', 404);

    return prisma.employee.update({
      where: { id },
      data: { status: 'TERMINATED', endDate: new Date() },
    });
  }

  async getOrgChart() {
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        managerId: true,
        position: { select: { title: true } },
        department: { select: { name: true } },
      },
    });

    return employees;
  }

  async getDepartments() {
    return prisma.department.findMany({
      include: {
        _count: { select: { employees: true } },
        children: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPositions(departmentId?: string) {
    return prisma.position.findMany({
      where: departmentId ? { departmentId } : {},
      include: {
        department: true,
        _count: { select: { employees: true } },
      },
      orderBy: { title: 'asc' },
    });
  }
}

export const employeeService = new EmployeeService();
