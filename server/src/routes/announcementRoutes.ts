import { Router } from 'express';
import {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from '../controllers/announcementController';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '../types';

const router = Router();

// All authenticated users can read
router.get('/', authenticate, getAllAnnouncements);
router.get('/:id', authenticate, getAnnouncementById);

// Officer only
router.post('/', authenticate, authorize(Role.PLACEMENT_OFFICER), createAnnouncement);
router.put('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), updateAnnouncement);
router.delete('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), deleteAnnouncement);

export default router;
