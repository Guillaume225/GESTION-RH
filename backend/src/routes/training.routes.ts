import { Router } from 'express';
import { trainingController } from '../controllers/training.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => trainingController.getTrainings(req, res, next));
router.get('/:id', (req, res, next) => trainingController.getTrainingById(req, res, next));
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => trainingController.createTraining(req, res, next));
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => trainingController.updateTraining(req, res, next));
router.post('/:id/enroll', (req, res, next) => trainingController.enrollEmployee(req, res, next));
router.put('/:id/complete', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => trainingController.completeEnrollment(req, res, next));

export default router;
