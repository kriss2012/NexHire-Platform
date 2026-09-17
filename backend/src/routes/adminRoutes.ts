import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', AdminController.getUsers);
router.get('/stats', AdminController.getSystemStats);

export default router;
