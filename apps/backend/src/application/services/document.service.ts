import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../infrastructure/errors/app-error.js';

export class DocumentService {
  constructor(private prisma: PrismaClient) {}

  async getAll(employeeId?: string, type?: string, search?: string, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (type) where.type = type;
    if (search) where.name = { contains: search };

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where: where as never,
        include: { employee: { select: { firstName: true, lastName: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where: where as never }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    if (!doc) throw new AppError('Document non trouvé', 404);
    return doc;
  }

  async create(data: { name: string; type: string; filePath: string; fileSize?: number; mimeType?: string; employeeId: string; expiresAt?: string }) {
    return this.prisma.document.create({
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      } as never,
    });
  }

  async delete(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new AppError('Document non trouvé', 404);
    await this.prisma.document.delete({ where: { id } });
  }
}
