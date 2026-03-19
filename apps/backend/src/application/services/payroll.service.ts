import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../infrastructure/errors/app-error.js';

/**
 * Payroll service - handles payslip generation with French social deductions.
 */
export class PayrollService {
  constructor(private prisma: PrismaClient) {}

  async getPayslips(employeeId?: string, page = 1, limit = 20) {
    const where = employeeId ? { employeeId } : {};
    const [data, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where,
        include: { employee: { select: { firstName: true, lastName: true, employeeId: true } }, items: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payslip.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPayslipById(id: string) {
    const payslip = await this.prisma.payslip.findUnique({
      where: { id },
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true } }, items: true },
    });
    if (!payslip) throw new AppError('Bulletin de paie non trouvé', 404);
    return payslip;
  }

  async generatePayslip(employeeId: string, month: number, year: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new AppError('Employé non trouvé', 404);
    if (!employee.salary) throw new AppError('Pas de salaire renseigné', 400);

    const existing = await this.prisma.payslip.findUnique({
      where: { employeeId_month_year: { employeeId, month, year } },
    });
    if (existing) throw new AppError('Un bulletin existe déjà pour cette période', 409);

    const monthlySalary = employee.salary / 12;

    // French social deductions
    const deductions = [
      { label: 'Sécurité sociale (maladie)', rate: 0.0069, base: monthlySalary },
      { label: 'Retraite complémentaire', rate: 0.0386, base: monthlySalary },
      { label: 'CSG déductible', rate: 0.068, base: monthlySalary * 0.9825 },
      { label: 'CSG/CRDS non déductible', rate: 0.029, base: monthlySalary * 0.9825 },
      { label: 'Chômage', rate: 0.024, base: monthlySalary },
    ];

    const totalDeductions = deductions.reduce((sum, d) => sum + d.base * d.rate, 0);
    const netSalary = monthlySalary - totalDeductions;

    const period = `${String(month).padStart(2, '0')}/${year}`;

    return this.prisma.payslip.create({
      data: {
        employeeId,
        period,
        month,
        year,
        grossSalary: Math.round(monthlySalary * 100) / 100,
        netSalary: Math.round(netSalary * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        totalCharges: Math.round(monthlySalary * 0.45 * 100) / 100,
        status: 'DRAFT',
        items: {
          create: [
            { label: 'Salaire de base', type: 'EARNING', amount: Math.round(monthlySalary * 100) / 100 },
            ...deductions.map((d) => ({
              label: d.label,
              type: 'DEDUCTION' as const,
              base: Math.round(d.base * 100) / 100,
              rate: d.rate,
              amount: Math.round(d.base * d.rate * 100) / 100,
            })),
          ],
        },
      },
      include: { items: true },
    });
  }

  async validatePayslip(id: string) {
    const payslip = await this.prisma.payslip.findUnique({ where: { id } });
    if (!payslip) throw new AppError('Bulletin de paie non trouvé', 404);
    return this.prisma.payslip.update({ where: { id }, data: { status: 'VALIDATED' } });
  }

  async generateBulkPayslips(month: number, year: number) {
    const employees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE', salary: { not: null } },
    });
    const results = [];
    for (const emp of employees) {
      try {
        const payslip = await this.generatePayslip(emp.id, month, year);
        results.push({ employeeId: emp.employeeId, status: 'success', payslipId: payslip.id });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        results.push({ employeeId: emp.employeeId, status: 'error', error: message });
      }
    }
    return results;
  }
}
