import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class TimeTrackingService {
  async getEntries(params: {
    page?: number;
    limit?: number;
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }) {
    const { page = 1, limit = 20, employeeId, startDate, endDate, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TimeEntryWhereInput = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [entries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: { firstName: true, lastName: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.timeEntry.count({ where }),
    ]);

    return {
      data: entries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async clockIn(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.timeEntry.findFirst({
      where: {
        employeeId,
        date: { gte: today },
        clockOut: null,
      },
    });

    if (existing) throw new AppError('Vous êtes déjà pointé', 400);

    return prisma.timeEntry.create({
      data: {
        employeeId,
        date: today,
        clockIn: new Date(),
      },
    });
  }

  async clockOut(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await prisma.timeEntry.findFirst({
      where: {
        employeeId,
        date: { gte: today },
        clockOut: null,
      },
    });

    if (!entry) throw new AppError('Aucun pointage en cours', 400);

    const clockOut = new Date();
    const totalMs = clockOut.getTime() - entry.clockIn.getTime();
    const totalHours = totalMs / (1000 * 60 * 60) - entry.breakMinutes / 60;
    const overtime = Math.max(0, totalHours - 8);

    return prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        clockOut,
        totalHours: Math.round(totalHours * 100) / 100,
        overtime: Math.round(overtime * 100) / 100,
      },
    });
  }

  async getWeeklySummary(employeeId: string, weekStart: Date) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const entries = await prisma.timeEntry.findMany({
      where: {
        employeeId,
        date: { gte: weekStart, lt: weekEnd },
      },
      orderBy: { date: 'asc' },
    });

    const totalHours = entries.reduce((sum, e) => sum + (e.totalHours || 0), 0);
    const totalOvertime = entries.reduce((sum, e) => sum + (e.overtime || 0), 0);

    return { entries, totalHours, totalOvertime, daysWorked: entries.length };
  }
}

export const timeTrackingService = new TimeTrackingService();
