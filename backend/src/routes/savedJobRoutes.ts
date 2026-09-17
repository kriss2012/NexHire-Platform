import { Router } from 'express';
import { SavedJobController } from '../controllers/savedJobController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, SavedJobController.getSavedJobs);

export default router;
