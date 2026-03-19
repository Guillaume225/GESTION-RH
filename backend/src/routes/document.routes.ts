import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { documentController } from '../controllers/document.controller';
import { authenticate, authorize } from '../middleware/auth';
import { config } from '../config';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
});

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => documentController.getDocuments(req, res, next));
router.get('/:id', (req, res, next) => documentController.getDocumentById(req, res, next));
router.post('/', upload.single('file'), (req, res, next) => documentController.uploadDocument(req, res, next));
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => documentController.deleteDocument(req, res, next));

export default router;
