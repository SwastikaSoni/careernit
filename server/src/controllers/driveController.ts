import { Response, NextFunction } from 'express';
import Drive from '../models/Drive';
import Application from '../models/Application';
import User from '../models/User';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';

// Helper: check if student is eligible for a drive
const checkEligibility = (student: any, drive: any): { eligible: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    const elig = drive.eligibility || {};

    if (student.verificationStatus !== 'verified') {
        reasons.push('Profile not verified');
    }

    if (elig.departments && elig.departments.length > 0) {
        const deptIds = elig.departments.map((d: any) => d._id?.toString() || d.toString());
        if (!student.department || !deptIds.includes(student.department._id?.toString() || student.department.toString())) {
            reasons.push('Department not eligible');
        }
    }

    if (elig.minCGPA != null && (student.cgpa == null || student.cgpa < elig.minCGPA)) {
        reasons.push(`Min CGPA required: ${elig.minCGPA}`);
    }

    if (elig.maxBacklogs != null && (student.activeBacklogs == null || student.activeBacklogs > elig.maxBacklogs)) {
        reasons.push(`Max backlogs allowed: ${elig.maxBacklogs}`);
    }

    if (elig.minTenthPercentage != null && (student.tenthPercentage == null || student.tenthPercentage < elig.minTenthPercentage)) {
        reasons.push(`Min 10th %: ${elig.minTenthPercentage}`);
    }

    if (elig.minTwelfthPercentage != null && (student.twelfthPercentage == null || student.twelfthPercentage < elig.minTwelfthPercentage)) {
        reasons.push(`Min 12th %: ${elig.minTwelfthPercentage}`);
    }

    if (elig.batch != null && student.batch !== elig.batch) {
        reasons.push(`Batch ${elig.batch} only`);
    }

    return { eligible: reasons.length === 0, reasons };
};

// GET /api/drives
export const getAllDrives = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { search, status, company } = req.query;
        const filter: any = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }
        if (status) filter.status = status;
        if (company) filter.company = company;

        const drives = await Drive.find(filter)
            .populate('company', 'name industry logo location')
            .populate('eligibility.departments', 'name code')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        // If student, compute eligibility for each drive
        if (req.user?.role === 'student') {
            const student = await User.findById(req.user._id).populate('department');
            const applications = await Application.find({ student: req.user._id });
            const appliedDriveIds = new Set(applications.map((a) => a.drive.toString()));

            const drivesWithEligibility = drives.map((drive) => {
                const driveObj = drive.toObject();
                const { eligible, reasons } = checkEligibility(student, driveObj);
                return {
                    ...driveObj,
                    isEligible: eligible,
                    eligibilityReasons: reasons,
                    hasApplied: appliedDriveIds.has(drive._id.toString()),
                    applicationStatus: applications.find((a) => a.drive.toString() === drive._id.toString())?.status,
                };
            });

            res.json({ success: true, drives: drivesWithEligibility });
            return;
        }

        // For officers/admin, add applicant count
        const drivesWithCounts = await Promise.all(
            drives.map(async (drive) => {
                const applicantCount = await Application.countDocuments({ drive: drive._id });
                return { ...drive.toObject(), applicantCount };
            })
        );

        res.json({ success: true, drives: drivesWithCounts });
    } catch (error) {
        next(error);
    }
};

// GET /api/drives/:id
export const getDriveById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const drive = await Drive.findById(req.params.id)
            .populate('company', 'name industry logo location website')
            .populate('eligibility.departments', 'name code')
            .populate('createdBy', 'name');
        if (!drive) throw createError(404, 'Drive not found');

        const applicantCount = await Application.countDocuments({ drive: drive._id });
        const driveObj: any = { ...drive.toObject(), applicantCount };

        if (req.user?.role === 'student') {
            const student = await User.findById(req.user._id).populate('department');
            const { eligible, reasons } = checkEligibility(student, driveObj);
            const application = await Application.findOne({ drive: drive._id, student: req.user._id });
            driveObj.isEligible = eligible;
            driveObj.eligibilityReasons = reasons;
            driveObj.hasApplied = !!application;
            driveObj.applicationStatus = application?.status;
        }

        res.json({ success: true, drive: driveObj });
    } catch (error) {
        next(error);
    }
};

// POST /api/drives
export const createDrive = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const drive = await Drive.create({
            ...req.body,
            createdBy: req.user?._id,
        });

        const populated = await Drive.findById(drive._id)
            .populate('company', 'name industry logo location')
            .populate('eligibility.departments', 'name code')
            .populate('createdBy', 'name');

        // Real-time notification
        try {
            const { emitToAll } = require('../services/socketService');
            emitToAll('drive_created', populated);
        } catch (_) { /* socket not initialized */ }

        res.status(201).json({
            success: true,
            message: 'Drive created successfully',
            drive: populated,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/drives/:id
export const updateDrive = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const drive = await Drive.findById(req.params.id);
        if (!drive) throw createError(404, 'Drive not found');

        const updated = await Drive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('company', 'name industry logo location')
            .populate('eligibility.departments', 'name code')
            .populate('createdBy', 'name');

        res.json({
            success: true,
            message: 'Drive updated successfully',
            drive: updated,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/drives/:id
export const deleteDrive = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const drive = await Drive.findById(req.params.id);
        if (!drive) throw createError(404, 'Drive not found');

        await Application.deleteMany({ drive: drive._id });
        await Drive.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Drive deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// POST /api/drives/:id/apply
export const applyToDrive = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const drive = await Drive.findById(req.params.id)
            .populate('eligibility.departments', 'name code')
            .populate('company', 'name');
        if (!drive) throw createError(404, 'Drive not found');

        // Check deadline
        if (new Date() > new Date(drive.lastDateToApply)) {
            throw createError(400, 'Application deadline has passed');
        }

        // Check status
        if (drive.status === 'cancelled' || drive.status === 'completed') {
            throw createError(400, 'This drive is no longer accepting applications');
        }

        // Check already applied
        const existing = await Application.findOne({ drive: drive._id, student: req.user?._id });
        if (existing) throw createError(400, 'You have already applied to this drive');

        // Check eligibility
        const student = await User.findById(req.user?._id).populate('department');
        if (!student) throw createError(404, 'Student not found');

        const { eligible, reasons } = checkEligibility(student, drive.toObject());
        if (!eligible) {
            throw createError(400, `Not eligible: ${reasons.join(', ')}`);
        }

        const application = await Application.create({
            drive: drive._id,
            student: req.user?._id,
        });

        // Real-time notification to officers
        try {
            const { emitToRole } = require('../services/socketService');
            const driveDoc = drive as any;
            emitToRole('placement_officer', 'application_status_changed', {
                status: 'New Application',
                companyName: driveDoc.company?.name || driveDoc.title,
                studentName: student.name
            });
        } catch (_) { /* socket not initialized */ }

        res.status(201).json({
            success: true,
            message: 'Applied successfully',
            application,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/drives/:id/applicants
export const getDriveApplicants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const drive = await Drive.findById(req.params.id);
        if (!drive) throw createError(404, 'Drive not found');

        const applicants = await Application.find({ drive: drive._id })
            .populate('student', 'name email rollNumber department cgpa phone batch')
            .sort({ appliedAt: -1 });

        // Populate student department
        await User.populate(applicants.map((a) => a.student), { path: 'department', select: 'name code' });

        res.json({ success: true, applicants });
    } catch (error) {
        next(error);
    }
};

// GET /api/drives/my-applications
export const getMyApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const applications = await Application.find({ student: req.user?._id })
            .populate({
                path: 'drive',
                populate: [
                    { path: 'company', select: 'name industry logo' },
                ],
            })
            .sort({ appliedAt: -1 });

        res.json({ success: true, applications });
    } catch (error) {
        next(error);
    }
};
