import { Router } from 'express';
import { CompanyController } from '../controllers/companyController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validateBody } from '../middleware/validation';
import { createCompanySchema, updateCompanySchema } from '../validators/applicationValidator';

const router = Router();

router.get('/', CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getCompanyById);
router.post('/', authenticate, authorize('EMPLOYER', 'ADMIN'), validateBody(createCompanySchema), CompanyController.createCompany);
router.put('/:id', authenticate, authorize('EMPLOYER', 'ADMIN'), validateBody(updateCompanySchema), CompanyController.updateCompany);

export default router;
