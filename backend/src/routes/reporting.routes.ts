import { Router } from 'express';
import { reportingController } from '../controllers/reporting.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'));

router.get('/dashboard', (req, res, next) => reportingController.getDashboardStats(req, res, next));
router.get('/turnover', (req, res, next) => reportingController.getTurnoverRate(req, res, next));
router.get('/absenteeism', (req, res, next) => reportingController.getAbsenteeismRate(req, res, next));
router.get('/payroll-summary', (req, res, next) => reportingController.getPayrollSummary(req, res, next));
router.get('/age-pyramid', (req, res, next) => reportingController.getAgePyramid(req, res, next));
router.get('/department-distribution', (req, res, next) => reportingController.getDepartmentDistribution(req, res, next));

export default router;
