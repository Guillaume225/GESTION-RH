import { Router } from 'express';
import { recruitmentController } from '../controllers/recruitment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/offers', (req, res, next) => recruitmentController.getJobOffers(req, res, next));
router.get('/offers/:id', (req, res, next) => recruitmentController.getJobOfferById(req, res, next));
router.post('/offers', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => recruitmentController.createJobOffer(req, res, next));
router.put('/offers/:id', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => recruitmentController.updateJobOffer(req, res, next));
router.put('/offers/:id/publish', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => recruitmentController.publishJobOffer(req, res, next));

router.get('/offers/:jobOfferId/candidates', (req, res, next) => recruitmentController.getCandidates(req, res, next));
router.post('/candidates', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => recruitmentController.createCandidate(req, res, next));
router.put('/candidates/:id/stage', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), (req, res, next) => recruitmentController.updateCandidateStage(req, res, next));

router.post('/interviews', authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER'), (req, res, next) => recruitmentController.scheduleInterview(req, res, next));

router.get('/offers/:jobOfferId/pipeline', (req, res, next) => recruitmentController.getPipelineStats(req, res, next));

export default router;
