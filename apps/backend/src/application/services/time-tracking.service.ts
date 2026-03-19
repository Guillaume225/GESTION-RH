import { PrismaClient } from '@prisma/client';
import { AppError } from '../../infrastructure/errors/app-error.js';

export class TimeTrackingService {
  constructor(private prisma: PrismaClient) {}

  async getEntries(employeeId: string, startDate?: Date, endDate?: Date) {
    const where: Record<string, unknown> = { employeeId };
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    }
    return this.prisma.timeEntry.findMany({
      where: where as never,
      orderBy: { date: 'desc' },
      take: 50,
    });
  }

  async clockIn(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.timeEntry.findFirst({
      where: { employeeId, date: today, clockOut: null },
    });
    if (existing) throw new AppError('Vous êtes déjà pointé', 400);

    return this.prisma.timeEntry.create({
      data: { employeeId, date: today, clockIn: new Date() },
    });
  }

  async clockOut(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await this.prisma.timeEntry.findFirst({
      where: { employeeId, date: today, clockOut: null },
    });
    if (!entry) throw new AppError('Aucun pointage en cours', 400);

    const clockOut = new Date();
    const hoursWorked = (clockOut.getTime() - entry.clockIn.getTime()) / 3_600_000;
    const overtime = Math.max(0, hoursWorked - 7);

    return this.prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        clockOut,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        overtime: Math.round(overtime * 100) / 100,
      },
    });
  }

  async getWeeklySummary(employeeId: string) {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const entries = await this.prisma.timeEntry.findMany({
      where: { employeeId, date: { gte: monday, lte: sunday } },
    });

    const totalHours = entries.reduce((sum, e) => sum + (e.hoursWorked ?? 0), 0);
    const totalOvertime = entries.reduce((sum, e) => sum + (e.overtime ?? 0), 0);

    return { totalHours, overtime: totalOvertime, entries: entries.length, weekStart: monday, weekEnd: sunday };
  }
}
