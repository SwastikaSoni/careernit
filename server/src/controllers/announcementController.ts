import { Response, NextFunction } from 'express';
import Announcement from '../models/Announcement';
import User from '../models/User';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';

// GET /api/announcements
export const getAllAnnouncements = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { priority, search } = req.query;
        let filter: any = {};

        if (priority) filter.priority = priority;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
            ];
        }

        // Students see only announcements targeted to them (or with empty targets = all)
        if (req.user?.role === 'student') {
            const user = await User.findById(req.user._id).select('department batch');
            const deptFilter = user?.department
                ? { $or: [{ targetDepartments: { $exists: false } }, { targetDepartments: { $size: 0 } }, { targetDepartments: null }, { targetDepartments: user.department }] }
                : { $or: [{ targetDepartments: { $exists: false } }, { targetDepartments: { $size: 0 } }, { targetDepartments: null }] };
            const batchFilter = user?.batch
                ? { $or: [{ targetBatches: { $exists: false } }, { targetBatches: { $size: 0 } }, { targetBatches: null }, { targetBatches: user.batch }] }
                : { $or: [{ targetBatches: { $exists: false } }, { targetBatches: { $size: 0 } }, { targetBatches: null }] };
            const roleFilter = { $or: [{ targetRoles: { $exists: false } }, { targetRoles: { $size: 0 } }, { targetRoles: null }, { targetRoles: 'student' }] };

            filter = {
                $and: [
                    filter,
                    deptFilter,
                    batchFilter,
                    roleFilter,
                ],
            };
        }

        const announcements = await Announcement.find(filter)
            .populate('createdBy', 'name')
            .populate('targetDepartments', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, announcements });
    } catch (error) {
        next(error);
    }
};

// GET /api/announcements/:id
export const getAnnouncementById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('targetDepartments', 'name');

        if (!announcement) throw createError(404, 'Announcement not found');
        res.json({ success: true, announcement });
    } catch (error) {
        next(error);
    }
};

// POST /api/announcements
export const createAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const announcement = await Announcement.create({
            ...req.body,
            createdBy: req.user?._id,
        });

        const populated = await Announcement.findById(announcement._id)
            .populate('createdBy', 'name')
            .populate('targetDepartments', 'name');

        // Socket.IO emit will be added here
        try {
            const { getIO } = require('../services/socketService');
            const io = getIO();
            if (io) {
                io.emit('new_announcement', populated);
            }
        } catch (_) { /* socket not initialized yet, ignore */ }

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            announcement: populated,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/announcements/:id
export const updateAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) throw createError(404, 'Announcement not found');

        const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
            .populate('createdBy', 'name')
            .populate('targetDepartments', 'name');

        res.json({
            success: true,
            message: 'Announcement updated successfully',
            announcement: updated,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/announcements/:id
export const deleteAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) throw createError(404, 'Announcement not found');

        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
        next(error);
    }
};
