import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../infrastructure/errors/app-error.js';

export class TrainingService {
  constructor(private prisma: PrismaClient) {}

  async getAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.training.findMany({
        include: { _count: { select: { enrollments: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.training.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: { title: string; description?: string; provider?: string; type?: string; duration?: number; maxParticipants?: number; startDate?: string; cost?: number }) {
    return this.prisma.training.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
      } as never,
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.prisma.training.update({ where: { id }, data: data as never });
  }

  async enroll(trainingId: string, employeeId: string) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!training) throw new AppError('Formation non trouvée', 404);
    if (training.maxParticipants && training._count.enrollments >= training.maxParticipants) {
      throw new AppError('Formation complète', 400);
    }

    return this.prisma.trainingEnrollment.create({
      data: { trainingId, employeeId },
    });
  }

  async completeEnrollment(trainingId: string, employeeId: string, feedback?: string, rating?: number) {
    return this.prisma.trainingEnrollment.update({
      where: { trainingId_employeeId: { trainingId, employeeId } },
      data: { status: 'COMPLETED', completedAt: new Date(), feedback, rating },
    });
  }
}
