import express from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
