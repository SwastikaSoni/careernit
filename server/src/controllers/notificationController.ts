import { Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';

// GET /api/notifications
// Retrieves notifications for the logged-in user
export const getMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const notifications = await Notification.find({ user: req.user?._id })
            .sort({ createdAt: -1 })
            .limit(50); // Fetch top 50 recent notifications

        const unreadCount = await Notification.countDocuments({ user: req.user?._id, isRead: false });

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        next(error);
    }
};

// PUT /api/notifications/:id/read
// Mark a specific notification as read
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, user: req.user?._id });
        if (!notification) {
            throw createError(404, 'Notification not found');
        }

        notification.isRead = true;
        await notification.save();

        res.json({ success: true, message: 'Notification marked as read', notification });
    } catch (error) {
        next(error);
    }
};

// PUT /api/notifications/read-all
// Mark all notifications for the user as read
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        await Notification.updateMany({ user: req.user?._id, isRead: false }, { isRead: true });

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};
