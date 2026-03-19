import type { PrismaClient } from '@prisma/client';

export class ReportingService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardStats() {
    const [totalEmployees, activeEmployees, pendingLeaves, openPositions, upcomingTrainings] =
      await Promise.all([
        this.prisma.employee.count(),
        this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
        this.prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
        this.prisma.jobOffer.count({ where: { status: 'PUBLISHED' } }),
        this.prisma.training.count({ where: { status: 'PLANNED' } }),
      ]);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentHires = await this.prisma.employee.count({
      where: { hireDate: { gte: threeMonthsAgo } },
    });

    return { totalEmployees, activeEmployees, pendingLeaves, openPositions, upcomingTrainings, recentHires };
  }

  async getDepartmentDistribution() {
    const departments = await this.prisma.department.findMany({
      include: { _count: { select: { employees: true } } },
    });
    const total = departments.reduce((sum, d) => sum + d._count.employees, 0);
    return departments.map((d) => ({
      name: d.name,
      count: d._count.employees,
      percentage: total > 0 ? Math.round((d._count.employees / total) * 100) : 0,
    }));
  }

  async getTurnoverRate() {
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const departed = await this.prisma.employee.count({
      where: { status: 'TERMINATED', endDate: { gte: startOfYear } },
    });
    const total = await this.prisma.employee.count();
    return { rate: total > 0 ? (departed / total) * 100 : 0, departed, total, year };
  }

  async getAbsenteeismRate() {
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const totalDaysOff = await this.prisma.leaveRequest.aggregate({
      where: { status: 'APPROVED', startDate: { gte: startOfYear } },
      _sum: { days: true },
    });
    const totalEmployees = await this.prisma.employee.count({ where: { status: 'ACTIVE' } });
    const workDaysInYear = 230;
    const totalWorkDays = totalEmployees * workDaysInYear;
    const daysOff = totalDaysOff._sum.days ?? 0;
    return { rate: totalWorkDays > 0 ? (daysOff / totalWorkDays) * 100 : 0, daysOff, totalWorkDays };
  }

  async getPayrollSummary(month?: number, year?: number) {
    const currentYear = year ?? new Date().getFullYear();
    const where: Record<string, unknown> = { year: currentYear };
    if (month) where.month = month;

    const result = await this.prisma.payslip.aggregate({
      where: where as never,
      _sum: { grossSalary: true, netSalary: true, totalDeductions: true, totalCharges: true },
      _count: true,
    });
    return {
      totalGross: result._sum.grossSalary ?? 0,
      totalNet: result._sum.netSalary ?? 0,
      totalDeductions: result._sum.totalDeductions ?? 0,
      totalCharges: result._sum.totalCharges ?? 0,
      count: result._count,
    };
  }

  async getAgePyramid() {
    const employees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE', dateOfBirth: { not: null } },
      select: { dateOfBirth: true },
    });

    const ranges = ['< 25', '25-34', '35-44', '45-54', '55+'];
    const counts = new Map(ranges.map((r) => [r, 0]));
    const now = new Date();

    for (const emp of employees) {
      if (!emp.dateOfBirth) continue;
      const age = Math.floor((now.getTime() - emp.dateOfBirth.getTime()) / 31_557_600_000);
      if (age < 25) counts.set('< 25', (counts.get('< 25') ?? 0) + 1);
      else if (age < 35) counts.set('25-34', (counts.get('25-34') ?? 0) + 1);
      else if (age < 45) counts.set('35-44', (counts.get('35-44') ?? 0) + 1);
      else if (age < 55) counts.set('45-54', (counts.get('45-54') ?? 0) + 1);
      else counts.set('55+', (counts.get('55+') ?? 0) + 1);
    }

    return ranges.map((range) => ({ range, count: counts.get(range) ?? 0 }));
  }
}
