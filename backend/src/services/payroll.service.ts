import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { Prisma } from '@prisma/client';

export class PayrollService {
  async getPayslips(params: {
    page?: number;
    limit?: number;
    employeeId?: string;
    year?: number;
    month?: number;
    status?: string;
  }) {
    const { page = 1, limit = 20, employeeId, year, month, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PayslipWhereInput = {};
    if (employeeId) where.employeeId = employeeId;
    if (year) where.year = year;
    if (month) where.month = month;
    if (status) where.status = status;

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: { firstName: true, lastName: true, employeeNumber: true } },
          items: true,
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      prisma.payslip.count({ where }),
    ]);

    return {
      data: payslips,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPayslipById(id: string) {
    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeNumber: true, position: true, department: true },
        },
        items: true,
      },
    });

    if (!payslip) throw new AppError('Fiche de paie non trouvée', 404);
    return payslip;
  }

  async generatePayslip(employeeId: string, year: number, month: number) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new AppError('Employé non trouvé', 404);

    const existing = await prisma.payslip.findUnique({
      where: { employeeId_year_month: { employeeId, year, month } },
    });
    if (existing) throw new AppError('La fiche de paie existe déjà pour cette période', 409);

    const baseSalary = employee.baseSalary || 0;
    const monthlyBase = baseSalary / 12;

    // Calcul simplifié des cotisations
    const items = [
      { label: 'Salaire de base', type: 'EARNING', amount: monthlyBase },
      { label: 'Sécurité sociale (salarié)', type: 'DEDUCTION', rate: 0.0715, base: monthlyBase, amount: -(monthlyBase * 0.0715) },
      { label: 'Retraite complémentaire', type: 'DEDUCTION', rate: 0.0407, base: monthlyBase, amount: -(monthlyBase * 0.0407) },
      { label: 'Assurance chômage', type: 'DEDUCTION', rate: 0.024, base: monthlyBase, amount: -(monthlyBase * 0.024) },
      { label: 'CSG/CRDS', type: 'DEDUCTION', rate: 0.0975, base: monthlyBase * 0.9825, amount: -(monthlyBase * 0.9825 * 0.0975) },
    ];

    const totalBonuses = items.filter(i => i.type === 'EARNING' && i.label !== 'Salaire de base').reduce((sum, i) => sum + i.amount, 0);
    const totalDeductions = Math.abs(items.filter(i => i.type === 'DEDUCTION').reduce((sum, i) => sum + i.amount, 0));
    const grossSalary = monthlyBase + totalBonuses;
    const netSalary = grossSalary - totalDeductions;

    return prisma.payslip.create({
      data: {
        employeeId,
        period: `${year}-${String(month).padStart(2, '0')}`,
        year,
        month,
        baseSalary: monthlyBase,
        grossSalary,
        netSalary,
        totalDeductions,
        totalBonuses,
        items: {
          create: items.map(item => ({
            label: item.label,
            type: item.type,
            rate: item.rate,
            base: item.base,
            amount: item.amount,
          })),
        },
      },
      include: { items: true },
    });
  }

  async validatePayslip(id: string) {
    return prisma.payslip.update({
      where: { id },
      data: { status: 'VALIDATED' },
    });
  }

  async generateBulkPayslips(year: number, month: number) {
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
    });

    const results = [];
    for (const emp of employees) {
      try {
        const payslip = await this.generatePayslip(emp.id, year, month);
        results.push({ employeeId: emp.id, status: 'success', payslipId: payslip.id });
      } catch (error) {
        results.push({ employeeId: emp.id, status: 'error', message: (error as Error).message });
      }
    }

    return results;
  }
}

export const payrollService = new PayrollService();
