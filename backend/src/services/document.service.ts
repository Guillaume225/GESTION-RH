import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { Prisma } from '@prisma/client';
import path from 'path';
import { config } from '../config';

export class DocumentService {
  async getDocuments(params: {
    page?: number;
    limit?: number;
    employeeId?: string;
    type?: string;
    isTemplate?: boolean;
  }) {
    const { page = 1, limit = 20, employeeId, type, isTemplate } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {};
    if (employeeId) where.employeeId = employeeId;
    if (type) where.type = type;
    if (isTemplate !== undefined) where.isTemplate = isTemplate;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDocumentById(id: string) {
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
    if (!doc) throw new AppError('Document non trouvé', 404);
    return doc;
  }

  async createDocument(data: {
    name: string;
    type: string;
    category?: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    employeeId?: string;
    isTemplate?: boolean;
    uploadedBy?: string;
  }) {
    return prisma.document.create({ data });
  }

  async deleteDocument(id: string) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new AppError('Document non trouvé', 404);
    await prisma.document.delete({ where: { id } });
    return doc;
  }

  getUploadPath(): string {
    return path.resolve(config.upload.dir);
  }
}

export const documentService = new DocumentService();
