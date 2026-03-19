import { Router } from 'express';
import { payrollController } from '../controllers/payroll.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'));

router.get('/', (req, res, next) => payrollController.getPayslips(req, res, next));
router.get('/:id', (req, res, next) => payrollController.getPayslipById(req, res, next));
router.post('/generate', (req, res, next) => payrollController.generatePayslip(req, res, next));
router.post('/generate-bulk', (req, res, next) => payrollController.generateBulkPayslips(req, res, next));
router.put('/:id/validate', (req, res, next) => payrollController.validatePayslip(req, res, next));

export default router;
