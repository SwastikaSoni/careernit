import { Response, NextFunction } from 'express';
import Interview from '../models/Interview';
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

// GET /api/interviews
export const getAllInterviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { drive, status } = req.query;
        const filter: any = {};

        // Students only see their own interviews
        if (req.user?.role === 'student') {
            filter.student = req.user._id;
        }

        if (drive) filter.drive = drive;
        if (status) filter.status = status;

        const interviews = await Interview.find(filter)
            .populate({
                path: 'drive',
                select: 'title company packageLPA jobType',
                populate: { path: 'company', select: 'name industry logo' },
            })
            .populate('student', 'name email rollNumber department cgpa phone')
            .populate('scheduledBy', 'name')
            .sort({ createdAt: -1 });

        // Populate student department
        await User.populate(
            interviews.map((i) => i.student).filter(Boolean),
            { path: 'department', select: 'name code' }
        );

        res.json({ success: true, interviews });
    } catch (error) {
        next(error);
    }
};

// GET /api/interviews/:id
export const getInterviewById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate({
                path: 'drive',
                select: 'title company packageLPA jobType location',
                populate: { path: 'company', select: 'name industry logo location' },
            })
            .populate('student', 'name email rollNumber department cgpa phone batch')
            .populate('scheduledBy', 'name');

        if (!interview) throw createError(404, 'Interview not found');

        // Students can only view their own
        if (req.user?.role === 'student' && interview.student._id?.toString() !== req.user._id) {
            throw createError(403, 'Access denied');
        }

        await User.populate(interview.student, { path: 'department', select: 'name code' });

        res.json({ success: true, interview });
    } catch (error) {
        next(error);
    }
};

// POST /api/interviews
export const createInterview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { application: applicationId, rounds } = req.body;

        const application = await Application.findById(applicationId).populate('drive');
        if (!application) throw createError(404, 'Application not found');

        // Check if interview already exists for this application
        const existing = await Interview.findOne({ application: applicationId });
        if (existing) throw createError(400, 'Interview already scheduled for this application');

        // Number the rounds
        const numberedRounds = (rounds || []).map((r: any, i: number) => ({
            ...r,
            roundNumber: i + 1,
            result: r.result || 'pending',
        }));

        const interview = await Interview.create({
            drive: application.drive._id || application.drive,
            application: application._id,
            student: application.student,
            scheduledBy: req.user?._id,
            rounds: numberedRounds,
            status: req.body.status || 'scheduled',
        });

        const populated = await Interview.findById(interview._id)
            .populate({
                path: 'drive',
                select: 'title company packageLPA jobType',
                populate: { path: 'company', select: 'name industry logo' },
            })
            .populate('student', 'name email rollNumber department cgpa phone')
            .populate('scheduledBy', 'name');

        if (populated?.student) {
            await User.populate(populated.student, { path: 'department', select: 'name code' });
        }

        // Update application status to shortlisted if still applied
        if (application.status === 'applied') {
            application.status = 'shortlisted';
            await application.save();
        }

        // Real-time notification to the student
        if (populated?.student) {
            const driveDoc = populated?.drive as any;
            await notifyUser(populated.student._id.toString(), {
                title: 'Interview Scheduled',
                message: `An interview for ${driveDoc?.company?.name || driveDoc?.title} has been scheduled.`,
                type: 'info',
                link: '/dashboard/interviews'
            });
        }

        // Notify other admins/officers
        const adminsAndOfficers = await User.find({
            role: { $in: [Role.ADMIN, Role.PLACEMENT_OFFICER] },
            _id: { $ne: req.user?._id }
        });
        const creatorName = req.user?.name || 'An officer';
        const driveDocNotify = populated?.drive as any;
        const studentDoc = populated?.student as any;
        for (const ad of adminsAndOfficers) {
            await notifyUser(ad._id.toString(), {
                title: 'Interview Scheduled',
                message: `${creatorName} scheduled an interview for ${studentDoc?.name || 'a student'} — ${driveDocNotify?.company?.name || driveDocNotify?.title || 'a drive'}.`,
                type: 'info',
                link: '/dashboard/interviews'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Interview scheduled successfully',
            interview: populated,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/interviews/:id
export const updateInterview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) throw createError(404, 'Interview not found');

        const { status, rounds } = req.body;
        if (status) interview.status = status;
        if (rounds) {
            interview.rounds = rounds.map((r: any, i: number) => ({
                ...r,
                roundNumber: r.roundNumber || i + 1,
                result: r.result || 'pending',
            }));
        }

        await interview.save();

        const populated = await Interview.findById(interview._id)
            .populate({
                path: 'drive',
                select: 'title company packageLPA jobType',
                populate: { path: 'company', select: 'name industry logo' },
            })
            .populate('student', 'name email rollNumber department cgpa phone')
            .populate('scheduledBy', 'name');

        if (populated?.student) {
            await User.populate(populated.student, { path: 'department', select: 'name code' });
        }

        res.json({
            success: true,
            message: 'Interview updated successfully',
            interview: populated,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/interviews/:id/rounds/:roundIndex
export const updateRound = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) throw createError(404, 'Interview not found');

        const roundIndex = parseInt(req.params.roundIndex as string, 10);
        if (isNaN(roundIndex) || roundIndex < 0 || roundIndex >= interview.rounds.length) {
            throw createError(400, 'Invalid round index');
        }

        const { result, feedback, scheduledDate, venue, interviewerName } = req.body;
        const round = interview.rounds[roundIndex];

        if (result) round.result = result;
        if (feedback !== undefined) round.feedback = feedback;
        if (scheduledDate !== undefined) round.scheduledDate = scheduledDate;
        if (venue !== undefined) round.venue = venue;
        if (interviewerName !== undefined) round.interviewerName = interviewerName;

        await interview.save();

        const populated = await Interview.findById(interview._id)
            .populate({
                path: 'drive',
                select: 'title company packageLPA jobType',
                populate: { path: 'company', select: 'name industry logo' },
            })
            .populate('student', 'name email rollNumber department cgpa phone')
            .populate('scheduledBy', 'name');

        if (populated?.student) {
            await User.populate(populated.student, { path: 'department', select: 'name code' });
        }

        res.json({
            success: true,
            message: `Round ${roundIndex + 1} updated successfully`,
            interview: populated,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/interviews/:id/rounds — Add a new round to an existing interview
export const addRound = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) throw createError(404, 'Interview not found');

        // Validate: last round must have passed before adding next
        if (interview.rounds.length > 0) {
            const lastRound = interview.rounds[interview.rounds.length - 1];
            if (lastRound.result !== 'passed') {
                throw createError(400, `Cannot add next round — Round ${lastRound.roundNumber} result is still "${lastRound.result}". Mark it as "passed" first.`);
            }
        }

        const newRound = {
            roundNumber: interview.rounds.length + 1,
            roundType: req.body.roundType || 'technical',
            scheduledDate: req.body.scheduledDate,
            venue: req.body.venue,
            interviewerName: req.body.interviewerName,
            result: 'pending' as const,
            feedback: '',
        };

        interview.rounds.push(newRound);
        if (interview.status !== 'in_progress') interview.status = 'in_progress';
        await interview.save();

        const populated = await Interview.findById(interview._id)
            .populate({
                path: 'drive',
                select: 'title company packageLPA jobType',
                populate: { path: 'company', select: 'name industry logo' },
            })
            .populate('student', 'name email rollNumber department cgpa phone')
            .populate('scheduledBy', 'name');

        if (populated?.student) {
            await User.populate(populated.student, { path: 'department', select: 'name code' });
        }

        res.status(201).json({
            success: true,
            message: `Round ${newRound.roundNumber} added successfully`,
            interview: populated,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/interviews/:id
export const deleteInterview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) throw createError(404, 'Interview not found');

        await Interview.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Interview deleted successfully' });
    } catch (error) {
        next(error);
    }
};
