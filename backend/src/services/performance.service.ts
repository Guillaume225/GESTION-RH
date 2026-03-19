import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { Prisma } from '@prisma/client';

export class PerformanceService {
  async getEvaluations(params: {
    page?: number;
    limit?: number;
    employeeId?: string;
    status?: string;
  }) {
    const { page = 1, limit = 20, employeeId, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.EvaluationWhereInput = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: { firstName: true, lastName: true } },
          evaluator: { select: { firstName: true, lastName: true } },
          objectives: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.evaluation.count({ where }),
    ]);

    return {
      data: evaluations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getEvaluationById(id: string) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        employee: { select: { firstName: true, lastName: true, position: true, department: true } },
        evaluator: { select: { firstName: true, lastName: true } },
        objectives: true,
      },
    });
    if (!evaluation) throw new AppError('Évaluation non trouvée', 404);
    return evaluation;
  }

  async createEvaluation(data: {
    employeeId: string;
    evaluatorId: string;
    type: string;
    period: string;
  }) {
    return prisma.evaluation.create({
      data: {
        employeeId: data.employeeId,
        evaluatorId: data.evaluatorId,
        type: data.type,
        period: data.period,
      },
    });
  }

  async updateEvaluation(id: string, data: Prisma.EvaluationUpdateInput) {
    return prisma.evaluation.update({ where: { id }, data });
  }

  async completeEvaluation(id: string) {
    return prisma.evaluation.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  // === Objectives ===
  async getObjectives(employeeId: string) {
    return prisma.objective.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createObjective(data: Prisma.ObjectiveCreateInput) {
    return prisma.objective.create({ data });
  }

  async updateObjective(id: string, data: Prisma.ObjectiveUpdateInput) {
    return prisma.objective.update({ where: { id }, data });
  }
}

export const performanceService = new PerformanceService();
