import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { documentService } from '../services/document.service';

export class DocumentController {
  async getDocuments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, employeeId, type, isTemplate } = req.query;
      const result = await documentService.getDocuments({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        employeeId: employeeId as string,
        type: type as string,
        isTemplate: isTemplate === 'true' ? true : isTemplate === 'false' ? false : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDocumentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await documentService.getDocumentById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async uploadDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier fourni' });
      }

      const result = await documentService.createDocument({
        name: req.body.name || req.file.originalname,
        type: req.body.type || 'OTHER',
        category: req.body.category,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        employeeId: req.body.employeeId,
        isTemplate: req.body.isTemplate === 'true',
        uploadedBy: req.user!.id,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await documentService.deleteDocument(req.params.id);
      res.json({ message: 'Document supprimé' });
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
