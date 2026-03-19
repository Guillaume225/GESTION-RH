import { PrismaClient } from '@prisma/client';
import { AppError } from '../../infrastructure/errors/app-error.js';

export class RecruitmentService {
  constructor(private prisma: PrismaClient) {}

  // ─── Job Offers ──────────────────────────────────
  async getJobOffers(status?: string, page = 1, limit = 20) {
    const where = status ? { status: status as never } : {};
    const [data, total] = await Promise.all([
      this.prisma.jobOffer.findMany({
        where,
        include: { department: { select: { name: true } }, _count: { select: { candidates: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.jobOffer.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createJobOffer(data: { title: string; description: string; departmentId?: string; contractType?: string; location?: string; salaryMin?: number; salaryMax?: number }) {
    return this.prisma.jobOffer.create({ data: data as never });
  }

  async updateJobOffer(id: string, data: Record<string, unknown>) {
    return this.prisma.jobOffer.update({ where: { id }, data: data as never });
  }

  async publishJobOffer(id: string) {
    return this.prisma.jobOffer.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
  }

  async closeJobOffer(id: string) {
    return this.prisma.jobOffer.update({ where: { id }, data: { status: 'CLOSED', closedAt: new Date() } });
  }

  // ─── Candidates ──────────────────────────────────
  async getCandidates(jobOfferId: string, stage?: string) {
    const where: Record<string, unknown> = { jobOfferId };
    if (stage) where.stage = stage;
    return this.prisma.candidate.findMany({
      where: where as never,
      include: { interviews: true },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async createCandidate(data: { firstName: string; lastName: string; email: string; phone?: string; jobOfferId: string; resumeUrl?: string; notes?: string }) {
    return this.prisma.candidate.create({ data: data as never });
  }

  async updateCandidateStage(id: string, stage: string) {
    return this.prisma.candidate.update({ where: { id }, data: { stage: stage as never } });
  }

  // ─── Interviews ──────────────────────────────────
  async scheduleInterview(data: { candidateId: string; date: string; type: string; interviewerId?: string }) {
    return this.prisma.interview.create({ data: { ...data, date: new Date(data.date) } });
  }

  async getPipelineStats(jobOfferId: string) {
    const stages = await this.prisma.candidate.groupBy({
      by: ['stage'],
      where: { jobOfferId },
      _count: true,
    });
    return stages.map((s) => ({ stage: s.stage, count: s._count }));
  }
}
