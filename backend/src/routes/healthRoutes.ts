import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();

// Standard Health endpoints
router.get('/health', HealthController.getApiHealth);
router.get('/api/health', HealthController.getApiHealth);
router.get('/api/v1/health', HealthController.getApiHealth);

// Kubernetes Probes
router.get('/ready', HealthController.getReadiness);
router.get('/live', HealthController.getLiveness);

export default router;
