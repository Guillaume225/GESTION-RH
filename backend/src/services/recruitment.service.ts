import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class RecruitmentService {
  // === Job Offers ===
  async getJobOffers(params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.JobOfferWhereInput = {};
    if (status) where.status = status;

    const [offers, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        skip,
        take: limit,
        include: {
          position: true,
          _count: { select: { candidates: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobOffer.count({ where }),
    ]);

    return {
      data: offers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getJobOfferById(id: string) {
    const offer = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        position: true,
        candidates: { orderBy: { createdAt: 'desc' } },
        interviews: { include: { candidate: true }, orderBy: { scheduledAt: 'asc' } },
      },
    });
    if (!offer) throw new AppError('Offre non trouvée', 404);
    return offer;
  }

  async createJobOffer(data: Prisma.JobOfferCreateInput) {
    return prisma.jobOffer.create({ data });
  }

  async updateJobOffer(id: string, data: Prisma.JobOfferUpdateInput) {
    return prisma.jobOffer.update({ where: { id }, data });
  }

  async publishJobOffer(id: string) {
    return prisma.jobOffer.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  // === Candidates ===
  async getCandidates(jobOfferId: string) {
    return prisma.candidate.findMany({
      where: { jobOfferId },
      include: { interviews: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCandidate(data: Prisma.CandidateCreateInput) {
    return prisma.candidate.create({ data });
  }

  async updateCandidateStage(id: string, stage: string) {
    return prisma.candidate.update({
      where: { id },
      data: { stage },
    });
  }

  // === Interviews ===
  async scheduleInterview(data: Prisma.InterviewCreateInput) {
    return prisma.interview.create({ data });
  }

  async updateInterview(id: string, data: Prisma.InterviewUpdateInput) {
    return prisma.interview.update({ where: { id }, data });
  }

  // === Pipeline stats ===
  async getPipelineStats(jobOfferId: string) {
    const stages = Object.values(CandidateStage);
    const stats = await Promise.all(
      stages.map(async (stage) => ({
        stage,
        count: await prisma.candidate.count({ where: { jobOfferId, stage } }),
      }))
    );
    return stats;
  }
}

export const recruitmentService = new RecruitmentService();
