import { Router } from 'express';
import { MetricsController } from '../controllers/metricsController';

const router = Router();

router.get('/metrics', MetricsController.getMetrics);

export default router;
