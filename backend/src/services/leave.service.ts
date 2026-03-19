import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class LeaveService {
  async findAll(params: {
    page?: number;
    limit?: number;
    employeeId?: string;
    status?: string;
    type?: string;
  }) {
    const { page = 1, limit = 20, employeeId, status, type } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.LeaveRequestWhereInput = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, department: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return {
      data: requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: {
    employeeId: string;
    type: string;
    startDate: Date;
    endDate: Date;
    reason?: string;
  }) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const totalDays = this.calculateBusinessDays(start, end);

    // Vérifier le solde
    const year = start.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_type_year: {
          employeeId: data.employeeId,
          type: data.type,
          year,
        },
      },
    });

    if (balance && balance.remaining < totalDays) {
      throw new AppError(`Solde insuffisant. Restant: ${balance.remaining} jours`, 400);
    }

    const request = await prisma.leaveRequest.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        startDate: start,
        endDate: end,
        totalDays,
        reason: data.reason,
      },
    });

    // Mettre à jour le solde (pending)
    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          pending: balance.pending + totalDays,
          remaining: balance.remaining - totalDays,
        },
      });
    }

    return request;
  }

  async approve(id: string, approvedBy: string) {
    const request = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!request) throw new AppError('Demande non trouvée', 404);
    if (request.status !== 'PENDING' && request.status !== 'APPROVED_MANAGER') {
      throw new AppError('Cette demande ne peut pas être approuvée', 400);
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    // Mettre à jour solde: pending -> used
    const year = request.startDate.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_type_year: {
          employeeId: request.employeeId,
          type: request.type,
          year,
        },
      },
    });

    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          pending: Math.max(0, balance.pending - request.totalDays),
          used: balance.used + request.totalDays,
        },
      });
    }

    return updated;
  }

  async reject(id: string, rejectedBy: string, reason?: string) {
    const request = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!request) throw new AppError('Demande non trouvée', 404);

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // Restaurer le solde
    const year = request.startDate.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_type_year: {
          employeeId: request.employeeId,
          type: request.type,
          year,
        },
      },
    });

    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          pending: Math.max(0, balance.pending - request.totalDays),
          remaining: balance.remaining + request.totalDays,
        },
      });
    }

    return updated;
  }

  async getBalances(employeeId: string, year?: number) {
    return prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: year || new Date().getFullYear(),
      },
    });
  }

  async getTeamCalendar(managerId: string, startDate: Date, endDate: Date) {
    const subordinates = await prisma.employee.findMany({
      where: { managerId },
      select: { id: true },
    });

    const ids = [managerId, ...subordinates.map((s) => s.id)];

    return prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: ids },
        status: { in: ['APPROVED', 'APPROVED_MANAGER'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
      },
    });
  }

  private calculateBusinessDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}

export const leaveService = new LeaveService();
