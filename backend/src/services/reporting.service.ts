import prisma from '../lib/prisma';


export class ReportingService {
  async getDashboardStats() {
    const [
      totalEmployees,
      activeEmployees,
      departments,
      pendingLeaves,
      openPositions,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.department.count(),
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.jobOffer.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      departments,
      pendingLeaves,
      openPositions,
    };
  }

  async getTurnoverRate(year: number) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    const [departed, avgCount] = await Promise.all([
      prisma.employee.count({
        where: {
          endDate: { gte: startOfYear, lte: endOfYear },
          status: 'TERMINATED',
        },
      }),
      prisma.employee.count({
        where: {
          hireDate: { lte: endOfYear },
          OR: [
            { endDate: null },
            { endDate: { gte: startOfYear } },
          ],
        },
      }),
    ]);

    return avgCount > 0 ? (departed / avgCount) * 100 : 0;
  }

  async getAbsenteeismRate(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const activeEmployees = await prisma.employee.count({
      where: { status: 'ACTIVE' },
    });

    const totalLeaveDays = await prisma.leaveRequest.aggregate({
      _sum: { totalDays: true },
      where: {
        status: 'APPROVED',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    const workingDays = activeEmployees * 22; // approximation
    return workingDays > 0 ? ((totalLeaveDays._sum.totalDays || 0) / workingDays) * 100 : 0;
  }

  async getPayrollSummary(year: number, month: number) {
    const payslips = await prisma.payslip.aggregate({
      _sum: { grossSalary: true, netSalary: true, totalDeductions: true },
      _count: true,
      where: { year, month },
    });

    return {
      totalGross: payslips._sum.grossSalary || 0,
      totalNet: payslips._sum.netSalary || 0,
      totalDeductions: payslips._sum.totalDeductions || 0,
      employeeCount: payslips._count,
    };
  }

  async getAgePyramid() {
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE', dateOfBirth: { not: null } },
      select: { dateOfBirth: true, gender: true },
    });

    const ranges = [
      { label: '< 25', min: 0, max: 25 },
      { label: '25-34', min: 25, max: 35 },
      { label: '35-44', min: 35, max: 45 },
      { label: '45-54', min: 45, max: 55 },
      { label: '55+', min: 55, max: 200 },
    ];

    const now = new Date();

    return ranges.map((range) => {
      const inRange = employees.filter((e) => {
        if (!e.dateOfBirth) return false;
        const age = Math.floor((now.getTime() - e.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= range.min && age < range.max;
      });

      return {
        range: range.label,
        male: inRange.filter((e) => e.gender === 'M').length,
        female: inRange.filter((e) => e.gender === 'F').length,
        total: inRange.length,
      };
    });
  }

  async getDepartmentDistribution() {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { employees: true } } },
    });

    return departments.map((d) => ({
      name: d.name,
      count: d._count.employees,
    }));
  }
}

export const reportingService = new ReportingService();
