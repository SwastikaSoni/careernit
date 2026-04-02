import { Router } from 'express';
import {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
} from '../controllers/questionController';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '../types';

const router = Router();

// All authenticated users can read
router.get('/', authenticate, getAllQuestions);
router.get('/:id', authenticate, getQuestionById);

// Officer only
router.post('/', authenticate, authorize(Role.PLACEMENT_OFFICER), createQuestion);
router.put('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), updateQuestion);
router.delete('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), deleteQuestion);

export default router;
