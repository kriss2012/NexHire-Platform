import { Router } from 'express';
import authRoutes from './authRoutes';
import jobRoutes from './jobRoutes';
import applicationRoutes from './applicationRoutes';
import companyRoutes from './companyRoutes';
import savedJobRoutes from './savedJobRoutes';
import adminRoutes from './adminRoutes';

import { HealthController } from '../controllers/healthController';

const router = Router();

router.get('/health', HealthController.getApiHealth);
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/companies', companyRoutes);
router.use('/saved-jobs', savedJobRoutes);
router.use('/admin', adminRoutes);

export default router;
