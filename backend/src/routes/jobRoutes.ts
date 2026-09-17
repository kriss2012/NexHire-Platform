import { Router } from 'express';
import { JobController } from '../controllers/jobController';
import { ApplicationController } from '../controllers/applicationController';
import { SavedJobController } from '../controllers/savedJobController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateBody, validateQuery } from '../middleware/validation';
import { createJobSchema, updateJobSchema, jobQuerySchema } from '../validators/jobValidator';
import { applyJobSchema } from '../validators/applicationValidator';

const router = Router();

// Public / Cached Endpoints
router.get('/', validateQuery(jobQuerySchema), JobController.getJobs);
router.get('/:id', JobController.getJobById);

// Protected Management Endpoints
router.post('/', authenticate, authorize('EMPLOYER', 'ADMIN'), validateBody(createJobSchema), JobController.createJob);
router.put('/:id', authenticate, authorize('EMPLOYER', 'ADMIN'), validateBody(updateJobSchema), JobController.updateJob);
router.delete('/:id', authenticate, authorize('EMPLOYER', 'ADMIN'), JobController.deleteJob);

// Application & Bookmark Sub-routes
router.post('/:id/apply', authenticate, validateBody(applyJobSchema), ApplicationController.apply);
router.post('/:id/save', authenticate, SavedJobController.saveJob);
router.delete('/:id/save', authenticate, SavedJobController.unsaveJob);

export default router;
