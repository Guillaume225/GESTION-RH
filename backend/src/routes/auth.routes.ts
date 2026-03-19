import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/register', authenticate, (req, res, next) => authController.register(req, res, next));
router.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));
router.put('/change-password', authenticate, (req, res, next) => authController.changePassword(req, res, next));

export default router;
