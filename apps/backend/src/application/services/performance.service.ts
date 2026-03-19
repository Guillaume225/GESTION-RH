import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../infrastructure/errors/app-error.js';

export class PerformanceService {
  constructor(private prisma: PrismaClient) {}

  async getEvaluations(employeeId?: string, page = 1, limit = 20) {
    const where = employeeId ? { employeeId } : {};
    const [data, total] = await Promise.all([
      this.prisma.evaluation.findMany({
        where,
        include: {
          employee: { select: { firstName: true, lastName: true } },
          evaluator: { select: { firstName: true, lastName: true } },
          objectives: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.evaluation.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createEvaluation(data: { employeeId: string; evaluatorId: string; type: string; period: string }) {
    return this.prisma.evaluation.create({ data: data as never, include: { objectives: true } });
  }

  async completeEvaluation(id: string, overallRating: number, comments?: string) {
    const evaluation = await this.prisma.evaluation.findUnique({ where: { id } });
    if (!evaluation) throw new AppError('Évaluation non trouvée', 404);

    return this.prisma.evaluation.update({
      where: { id },
      data: { status: 'COMPLETED', overallRating, comments, completedAt: new Date() },
    });
  }

  async createObjective(data: { employeeId: string; evaluationId?: string; title: string; description?: string; weight?: number; dueDate?: string }) {
    return this.prisma.objective.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      } as never,
    });
  }

  async updateObjective(id: string, data: { rating?: number; comment?: string; currentValue?: number }) {
    return this.prisma.objective.update({ where: { id }, data: data as never });
  }
}
