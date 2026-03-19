import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import leaveRoutes from './leave.routes';
import payrollRoutes from './payroll.routes';
import recruitmentRoutes from './recruitment.routes';
import performanceRoutes from './performance.routes';
import trainingRoutes from './training.routes';
import documentRoutes from './document.routes';
import timeTrackingRoutes from './timeTracking.routes';
import reportingRoutes from './reporting.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/leaves', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/performance', performanceRoutes);
router.use('/trainings', trainingRoutes);
router.use('/documents', documentRoutes);
router.use('/time-tracking', timeTrackingRoutes);
router.use('/reports', reportingRoutes);

export default router;
