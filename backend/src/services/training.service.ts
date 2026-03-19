import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class TrainingService {
  async getTrainings(params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TrainingWhereInput = {};
    if (status) where.status = status;

    const [trainings, total] = await Promise.all([
      prisma.training.findMany({
        where,
        skip,
        take: limit,
        include: { _count: { select: { enrollments: true } } },
        orderBy: { startDate: 'desc' },
      }),
      prisma.training.count({ where }),
    ]);

    return {
      data: trainings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getTrainingById(id: string) {
    const training = await prisma.training.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { employee: { select: { firstName: true, lastName: true } } },
        },
      },
    });
    if (!training) throw new AppError('Formation non trouvée', 404);
    return training;
  }

  async createTraining(data: Prisma.TrainingCreateInput) {
    return prisma.training.create({ data });
  }

  async updateTraining(id: string, data: Prisma.TrainingUpdateInput) {
    return prisma.training.update({ where: { id }, data });
  }

  async enrollEmployee(trainingId: string, employeeId: string) {
    const training = await prisma.training.findUnique({ where: { id: trainingId } });
    if (!training) throw new AppError('Formation non trouvée', 404);

    if (training.maxParticipants) {
      const enrolledCount = await prisma.trainingEnrollment.count({ where: { trainingId } });
      if (enrolledCount >= training.maxParticipants) {
        throw new AppError('Formation complète', 400);
      }
    }

    return prisma.trainingEnrollment.create({
      data: { trainingId, employeeId },
    });
  }

  async completeEnrollment(trainingId: string, employeeId: string, feedback?: string, rating?: number) {
    return prisma.trainingEnrollment.update({
      where: { trainingId_employeeId: { trainingId, employeeId } },
      data: { status: 'COMPLETED', completedAt: new Date(), feedback, rating },
    });
  }
}

export const trainingService = new TrainingService();
