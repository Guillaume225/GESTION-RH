import type { Response, NextFunction } from 'express';
import type { DocumentService } from '@application/services/document.service.js';
import type { AuthRequest } from '@infrastructure/middleware/auth.middleware.js';

export class DocumentController {
  constructor(private documentService: DocumentService) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.documentService.getAll(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const document = await this.documentService.getById(req.params.id);
      res.json({ success: true, data: document });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      const data = {
        ...req.body,
        filePath: file?.path,
        fileSize: file?.size,
        mimeType: file?.mimetype,
      };
      const document = await this.documentService.create(data);
      res.status(201).json({ success: true, data: document });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.documentService.delete(req.params.id);
      res.json({ success: true, message: 'Document supprimé avec succès' });
    } catch (err) {
      next(err);
    }
  };
}
