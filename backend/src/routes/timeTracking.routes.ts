import { Router } from 'express';
import { timeTrackingController } from '../controllers/timeTracking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => timeTrackingController.getEntries(req, res, next));
router.post('/clock-in', (req, res, next) => timeTrackingController.clockIn(req, res, next));
router.post('/clock-out', (req, res, next) => timeTrackingController.clockOut(req, res, next));
router.get('/weekly/:employeeId?', (req, res, next) => timeTrackingController.getWeeklySummary(req, res, next));

export default router;
