import { Router } from 'express';
import { leaveController } from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => leaveController.findAll(req, res, next));
router.post('/', (req, res, next) => leaveController.create(req, res, next));
router.get('/balances/:employeeId?', (req, res, next) => leaveController.getBalances(req, res, next));
router.get('/team-calendar', (req, res, next) => leaveController.getTeamCalendar(req, res, next));
router.put('/:id/approve', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'), (req, res, next) => leaveController.approve(req, res, next));
router.put('/:id/reject', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'), (req, res, next) => leaveController.reject(req, res, next));

export default router;
