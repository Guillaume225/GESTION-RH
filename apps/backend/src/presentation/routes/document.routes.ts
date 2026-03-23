import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import type { DocumentController } from '../controllers/document.controller.js';
import type { AuthService } from '@application/services/auth.service.js';
import { createAuthMiddleware } from '@infrastructure/middleware/auth.middleware.js';
import { config } from '@infrastructure/config/index.js';

const storage = multer.diskStorage({
  destination: config.upload.dir,
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
});

export function createDocumentRoutes(controller: DocumentController, authService: AuthService): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(authService);

  router.use(authenticate);

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', upload.single('file'), controller.create);
  router.delete('/:id', controller.delete);

  return router;
}
