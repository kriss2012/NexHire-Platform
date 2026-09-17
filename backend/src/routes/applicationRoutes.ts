import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { updateApplicationStatusSchema } from '../validators/applicationValidator';

const router = Router();

router.get('/', authenticate, ApplicationController.getApplications);
router.get('/:id', authenticate, ApplicationController.getApplicationById);
router.patch('/:id/status', authenticate, validateBody(updateApplicationStatusSchema), ApplicationController.updateStatus);

export default router;
