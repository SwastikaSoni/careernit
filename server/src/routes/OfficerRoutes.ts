import { Router } from 'express';
import { getAllOfficers, toggleOfficerStatus, deleteOfficer } from '../controllers/officerController';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '../types';

const router = Router();

router.get('/', authenticate, authorize(Role.ADMIN), getAllOfficers);
router.put('/:id/toggle', authenticate, authorize(Role.ADMIN), toggleOfficerStatus);
router.delete('/:id', authenticate, authorize(Role.ADMIN), deleteOfficer);

export default router;