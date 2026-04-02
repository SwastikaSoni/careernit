import { Router } from 'express';
import {
    getAllInterviews,
    getInterviewById,
    createInterview,
    updateInterview,
    updateRound,
    addRound,
    deleteInterview,
} from '../controllers/interviewController';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '../types';

const router = Router();

// All authenticated users (students filtered server-side)
router.get('/', authenticate, getAllInterviews);
router.get('/:id', authenticate, getInterviewById);

// Officer only
router.post('/', authenticate, authorize(Role.PLACEMENT_OFFICER), createInterview);
router.put('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), updateInterview);
router.put('/:id/rounds/:roundIndex', authenticate, authorize(Role.PLACEMENT_OFFICER), updateRound);
router.post('/:id/rounds', authenticate, authorize(Role.PLACEMENT_OFFICER), addRound);
router.delete('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), deleteInterview);

export default router;
