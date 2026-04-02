import { Router } from 'express';
import {
    getAllDrives,
    getDriveById,
    createDrive,
    updateDrive,
    deleteDrive,
    applyToDrive,
    getDriveApplicants,
    getMyApplications,
} from '../controllers/driveController';
import { authenticate, authorize } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { createDriveSchema, updateDriveSchema } from '../validators/driveValidator';
import { Role } from '../types';

const router = Router();

// Student: my applications (must be before /:id to avoid conflict)
router.get('/my-applications', authenticate, authorize(Role.STUDENT), getMyApplications);

// Common
router.get('/', authenticate, getAllDrives);
router.get('/:id', authenticate, getDriveById);

// Officer only
router.post('/', authenticate, authorize(Role.PLACEMENT_OFFICER), validate(createDriveSchema), createDrive);
router.put('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), validate(updateDriveSchema), updateDrive);
router.delete('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), deleteDrive);

// Student apply
router.post('/:id/apply', authenticate, authorize(Role.STUDENT), applyToDrive);

// Officer: get applicants
router.get('/:id/applicants', authenticate, authorize(Role.PLACEMENT_OFFICER), getDriveApplicants);

export default router;
