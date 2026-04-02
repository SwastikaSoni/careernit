import { Router } from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { authenticate, authorize } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/departmentValidator';
import { Role } from '../types';

const router = Router();

router.get('/', authenticate, getAllDepartments);
router.get('/:id', authenticate, getDepartmentById);
router.post('/', authenticate, authorize(Role.ADMIN), validate(createDepartmentSchema), createDepartment);
router.put('/:id', authenticate, authorize(Role.ADMIN), validate(updateDepartmentSchema), updateDepartment);
router.delete('/:id', authenticate, authorize(Role.ADMIN), deleteDepartment);

export default router;