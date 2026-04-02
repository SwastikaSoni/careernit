import { Router } from 'express';
import {
    getAllApplications,
    updateApplicationStatus,
    withdrawApplication,
} from '../controllers/applicationController';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '../types';

const router = Router();

// Officer: list all applications
router.get('/', authenticate, authorize(Role.PLACEMENT_OFFICER), getAllApplications);

// Officer: update application status
router.put('/:id/status', authenticate, authorize(Role.PLACEMENT_OFFICER), updateApplicationStatus);

// Student: withdraw application
router.put('/:id/withdraw', authenticate, authorize(Role.STUDENT), withdrawApplication);

export default router;
