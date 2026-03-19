import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => employeeController.findAll(req, res, next));
router.get('/orgchart', (req, res, next) => employeeController.getOrgChart(req, res, next));
router.get('/departments', (req, res, next) => employeeController.getDepartments(req, res, next));
router.get('/positions', (req, res, next) => employeeController.getPositions(req, res, next));
router.get('/:id', (req, res, next) => employeeController.findById(req, res, next));
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => employeeController.create(req, res, next));
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => employeeController.update(req, res, next));
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), (req, res, next) => employeeController.delete(req, res, next));

export default router;
