import { PrismaClient, Prisma } from '@prisma/client';
import type { ILeaveRepository } from '../../../domain/repositories/leave.repository.js';
import type { LeaveRequest, LeaveBalance } from '../../../domain/entities/leave.entity.js';
import type { PaginationOptions, PaginatedResult } from '../../../domain/entities/base.entity.js';

export class PrismaLeaveRepository implements ILeaveRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(pagination: PaginationOptions, employeeId?: string): Promise<PaginatedResult<LeaveRequest>> {
    const where: Prisma.LeaveRequestWhereInput = {};
    if (employeeId) where.employeeId = employeeId;

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return {
      data: data as unknown as LeaveRequest[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findById(id: string): Promise<LeaveRequest | null> {
    return this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: { select: { firstName: true, lastName: true } } },
    }) as unknown as LeaveRequest | null;
  }

  async create(data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
    return this.prisma.leaveRequest.create({ data: data as never }) as unknown as LeaveRequest;
  }

  async update(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    return this.prisma.leaveRequest.update({ where: { id }, data: data as never }) as unknown as LeaveRequest;
  }

  async getBalances(employeeId: string, year: number): Promise<LeaveBalance[]> {
    return this.prisma.leaveBalance.findMany({
      where: { employeeId, year },
    }) as unknown as LeaveBalance[];
  }

  async updateBalance(employeeId: string, type: string, year: number, change: { used?: number; pending?: number }): Promise<void> {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_type_year: { employeeId, type: type as never, year } },
    });

    if (balance) {
      await this.prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: { increment: change.used ?? 0 },
          pending: { increment: change.pending ?? 0 },
        },
      });
    }
  }

  async getTeamCalendar(managerEmployeeId: string, startDate: Date, endDate: Date): Promise<LeaveRequest[]> {
    return this.prisma.leaveRequest.findMany({
      where: {
        employee: { managerId: managerEmployeeId },
        status: { in: ['APPROVED', 'PENDING'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    }) as unknown as LeaveRequest[];
  }
}
