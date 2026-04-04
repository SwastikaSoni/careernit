import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
import Offer from '../models/Offer';
import Application from '../models/Application';
import Drive from '../models/Drive';
import User from '../models/User';
import Notification from '../models/Notification';
import { emitToUser } from '../services/socketService';
import { createError } from '../middlewares/errorHandler';

/**
 * Helper: create a notification in DB and push via socket.
 * Uses the Notification model directly instead of the socketService helper
 * to avoid any dynamic-require issues.
 */
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
        console.log(`[Notification] Sent to ${userId}: ${data.title}`);
    } catch (err) {
        console.error(`[Notification] FAILED for ${userId}:`, err);
    }
};

// Get offers for the logged in student
export const getMyOffers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const studentId = req.user?._id;
        const offers = await Offer.find({ student: studentId })
            .populate('company', 'name website logo')
            .populate('drive', 'title role packageLPA jobType')
            .sort({ createdAt: -1 });

        res.json({ success: true, offers });
    } catch (err) {
        next(err);
    }
};

// Get all offers (for Admin and Officer)
export const getAllOffers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const offers = await Offer.find()
            .populate('student', 'name email rollNumber department isActive')
            .populate('company', 'name website')
            .populate('drive', 'title packageLPA')
            .sort({ createdAt: -1 });

        res.json({ success: true, offers });
    } catch (err) {
        next(err);
    }
};

// Create a new offer
export const createOffer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { studentId, driveId, ctc, offerLetterUrl } = req.body;

        const drive = await Drive.findById(driveId).populate('company', 'name');
        if (!drive) throw createError(404, 'Drive not found');

        const application = await Application.findOne({ student: studentId, drive: driveId });
        if (!application) throw createError(400, 'Student has not applied to this drive');

        // Create the offer
        const offer = await Offer.create({
            student: studentId,
            drive: driveId,
            company: drive.company,
            ctc: ctc || drive.packageLPA,
            offerLetterUrl,
            status: 'pending'
        });

        // Update application status to offered (or selected)
        application.status = 'selected';
        await application.save();

        // Notify the student about the new offer
        const companyName = (drive.company as any)?.name || 'a company';
        await notifyUser(studentId, {
            title: 'New Offer Received!',
            message: `You have received a placement offer from ${companyName} for ${ctc || drive.packageLPA} LPA. Please respond.`,
            type: 'success',
            link: '/dashboard/offers'
        });

        // Notify all other admins/officers (except the creator)
        const adminsAndOfficers = await User.find({
            role: { $in: [Role.ADMIN, Role.PLACEMENT_OFFICER] },
            _id: { $ne: req.user?._id }
        });
        const creatorName = req.user?.name || 'An officer';
        for (const ad of adminsAndOfficers) {
            await notifyUser(ad._id.toString(), {
                title: 'New Offer Created',
                message: `${creatorName} created an offer for ${companyName} drive (${ctc || drive.packageLPA} LPA).`,
                type: 'info',
                link: '/dashboard/offers'
            });
        }

        res.status(201).json({ success: true, offer, message: 'Offer created successfully' });
    } catch (err) {
        next(err);
    }
};

// Student accepts/rejects offer
export const respondToOffer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, rejectedReason } = req.body; // 'accepted' or 'rejected'
        const studentId = req.user?._id;

        if (!['accepted', 'rejected'].includes(status)) {
            throw createError(400, 'Invalid status');
        }

        const offer = await Offer.findOne({ _id: id, student: studentId })
            .populate('company', 'name')
            .populate('drive', 'title');
        if (!offer) throw createError(404, 'Offer not found');

        if (offer.status !== 'pending') {
            throw createError(400, 'You have already responded to this offer');
        }

        offer.status = status;
        offer.respondedAt = new Date();
        if (status === 'rejected' && rejectedReason) {
            offer.rejectedReason = rejectedReason;
        }

        await offer.save();

        // Notify all admins and officers about the student's response
        const adminsAndOfficers = await User.find({
            role: { $in: [Role.ADMIN, Role.PLACEMENT_OFFICER] }
        });

        const studentName = req.user?.name || 'A student';
        const companyName = (offer.company as any)?.name || 'a company';
        const driveName = (offer.drive as any)?.title || '';

        console.log(`[Offer Response] ${studentName} ${status} offer from ${companyName}. Notifying ${adminsAndOfficers.length} admin/officers.`);

        if (status === 'rejected') {
            const title = `⚠️ Offer Rejected by ${studentName}`;
            const message = `${studentName} has rejected the offer from ${companyName}${driveName ? ` (${driveName})` : ''}. ${rejectedReason ? 'Reason: ' + rejectedReason : 'No reason provided.'}`;

            for (const ad of adminsAndOfficers) {
                await notifyUser(ad._id.toString(), {
                    title,
                    message,
                    type: 'warning',
                    link: '/dashboard/offers'
                });
            }
        } else if (status === 'accepted') {
            const title = `✅ Offer Accepted by ${studentName}`;
            const message = `${studentName} has accepted the offer from ${companyName}${driveName ? ` (${driveName})` : ''}.`;

            for (const ad of adminsAndOfficers) {
                await notifyUser(ad._id.toString(), {
                    title,
                    message,
                    type: 'success',
                    link: '/dashboard/offers'
                });
            }
        }

        res.json({ success: true, offer, message: `Offer ${status} successfully` });
    } catch (err) {
        next(err);
    }
};

// Admin revokes an offer
export const revokeOffer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const offer = await Offer.findById(id)
            .populate('student', 'name')
            .populate('company', 'name')
            .populate('drive', 'title');
        if (!offer) throw createError(404, 'Offer not found');

        offer.status = 'revoked';
        await offer.save();

        // Notify the student
        const companyName = (offer.company as any)?.name || 'a company';
        await notifyUser(offer.student._id.toString(), {
            title: 'Offer Revoked',
            message: `Your offer from ${companyName} has been revoked by the administration.`,
            type: 'error',
            link: '/dashboard/offers'
        });

        res.json({ success: true, message: 'Offer revoked successfully', offer });
    } catch (err) {
        next(err);
    }
};
