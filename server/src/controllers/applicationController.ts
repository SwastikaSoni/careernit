import { Response, NextFunction } from 'express';
import Application from '../models/Application';
import Drive from '../models/Drive';
import User from '../models/User';
import Notification from '../models/Notification';
import { AuthRequest, Role } from '../types';
import { createError } from '../middlewares/errorHandler';
import { emitToUser } from '../services/socketService';

const notifyUser = async (
    userId: string,
    data: { title: string; message: string; type?: string; link?: string }
) => {
    try {
        const notification = await Notification.create({
            user: userId,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            link: data.link,
        });
        emitToUser(userId, 'new_notification', notification);
    } catch (err) {
        console.error(`[Notification] FAILED for ${userId}:`, err);
    }
};

// GET /api/applications — Officer: list all applications with filters
export const getAllApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { drive, status, search } = req.query;
        const filter: any = {};

        if (drive) filter.drive = drive;
        if (status) filter.status = status;

        let applications = await Application.find(filter)
            .populate({
                path: 'drive',
                select: 'title company status lastDateToApply packageLPA jobType',
                populate: { path: 'company', select: 'name industry logo' },
            })
            .populate('student', 'name email rollNumber department cgpa phone batch activeBacklogs tenthPercentage twelfthPercentage resume')
            .sort({ appliedAt: -1 });

        // Populate student department
        await User.populate(applications.map((a) => a.student), { path: 'department', select: 'name code' });

        // Client-side search by student name/rollNumber
        if (search) {
            const s = (search as string).toLowerCase();
            applications = applications.filter((a: any) =>
                a.student?.name?.toLowerCase().includes(s) ||
                a.student?.rollNumber?.toLowerCase().includes(s) ||
                a.student?.email?.toLowerCase().includes(s)
            );
        }

        // Compute counts
        const counts = {
            total: applications.length,
            applied: applications.filter((a) => a.status === 'applied').length,
            shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
            rejected: applications.filter((a) => a.status === 'rejected').length,
            selected: applications.filter((a) => a.status === 'selected').length,
        };

        res.json({ success: true, applications, counts });
    } catch (error) {
        next(error);
    }
};

// PUT /api/applications/:id/status — Officer: update application status
export const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.body;
        if (!status || !['applied', 'shortlisted', 'rejected', 'selected'].includes(status)) {
            throw createError(400, 'Invalid status. Must be one of: applied, shortlisted, rejected, selected');
        }

        const application = await Application.findById(req.params.id);
        if (!application) throw createError(404, 'Application not found');

        application.status = status;
        await application.save();

        const updated = await Application.findById(application._id)
            .populate({
                path: 'drive',
                select: 'title company status',
                populate: { path: 'company', select: 'name industry logo' },
            })
            .populate('student', 'name email rollNumber department cgpa phone batch');

        if (updated?.student) {
            await User.populate(updated.student, { path: 'department', select: 'name code' });
        }

        // Real-time notification to the student
        if (updated?.student && updated.drive) {
            const driveDoc = updated.drive as any;
            const companyName = driveDoc.company?.name || driveDoc.title;
            await notifyUser(updated.student._id.toString(), {
                title: `Application ${updated.status}`,
                message: `Your application for ${companyName} is now ${updated.status}.`,
                type: updated.status === 'rejected' ? 'error' : updated.status === 'selected' ? 'success' : 'info',
                link: '/dashboard/my-applications'
            });
        }

        res.json({
            success: true,
            message: `Application ${status} successfully`,
            application: updated,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/applications/:id/withdraw — Student: withdraw own application
export const withdrawApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) throw createError(404, 'Application not found');

        // Verify ownership
        if (application.student.toString() !== req.user?._id) {
            throw createError(403, 'You can only withdraw your own applications');
        }

        // Can only withdraw if status is 'applied'
        if (application.status !== 'applied') {
            throw createError(400, `Cannot withdraw application with status "${application.status}". Only applications with "applied" status can be withdrawn.`);
        }

        await Application.findByIdAndDelete(application._id);

        res.json({ success: true, message: 'Application withdrawn successfully' });
    } catch (error) {
        next(error);
    }
};
