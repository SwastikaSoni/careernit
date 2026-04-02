import { Router } from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController';
import { authenticate, authorize } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { createCompanySchema, updateCompanySchema } from '../validators/companyValidator';
import { Role } from '../types';

const router = Router();

router.get('/', authenticate, getAllCompanies);
router.get('/:id', authenticate, getCompanyById);
router.post('/', authenticate, authorize(Role.PLACEMENT_OFFICER), validate(createCompanySchema), createCompany);
router.put('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), validate(updateCompanySchema), updateCompany);
router.delete('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), deleteCompany);

export default router;