import { Router } from 'express';
import {
    getAllMockTests,
    getMockTestById,
    createMockTest,
    updateMockTest,
    deleteMockTest,
    startAttempt,
    submitAttempt,
    getAttemptResult,
    getMyAttempts,
} from '../controllers/mockTestController';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '../types';

const router = Router();

// Student attempt routes (must come before /:id to avoid conflicts)
router.get('/my-attempts', authenticate, authorize(Role.STUDENT), getMyAttempts);
router.get('/attempts/:attemptId', authenticate, getAttemptResult);

// All authenticated users can read
router.get('/', authenticate, getAllMockTests);
router.get('/:id', authenticate, getMockTestById);

// Officer only — CRUD
router.post('/', authenticate, authorize(Role.PLACEMENT_OFFICER), createMockTest);
router.put('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), updateMockTest);
router.delete('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), deleteMockTest);

// Student only — take tests
router.post('/:id/start', authenticate, authorize(Role.STUDENT), startAttempt);
router.put('/:id/submit', authenticate, authorize(Role.STUDENT), submitAttempt);

export default router;
