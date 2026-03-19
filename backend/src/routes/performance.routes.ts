import { Router } from 'express';
import { performanceController } from '../controllers/performance.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/evaluations', (req, res, next) => performanceController.getEvaluations(req, res, next));
router.get('/evaluations/:id', (req, res, next) => performanceController.getEvaluationById(req, res, next));
router.post('/evaluations', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'), (req, res, next) => performanceController.createEvaluation(req, res, next));
router.put('/evaluations/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'), (req, res, next) => performanceController.updateEvaluation(req, res, next));
router.put('/evaluations/:id/complete', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'), (req, res, next) => performanceController.completeEvaluation(req, res, next));

router.get('/objectives/:employeeId?', (req, res, next) => performanceController.getObjectives(req, res, next));
router.post('/objectives', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'), (req, res, next) => performanceController.createObjective(req, res, next));
router.put('/objectives/:id', (req, res, next) => performanceController.updateObjective(req, res, next));

export default router;
