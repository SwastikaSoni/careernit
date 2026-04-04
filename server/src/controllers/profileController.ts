import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest, Role } from '../types';
import { createError } from '../middlewares/errorHandler';

// GET /api/profile/me
export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id)
      .select('-password')
      .populate('department', 'name code')
      .populate('placedCompany', 'name');

    if (!user) throw createError(404, 'User not found');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile/me
export const updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) throw createError(404, 'User not found');

    const allowedFields = [
      'name', 'phone', 'rollNumber', 'batch', 'department', 'dateOfBirth',
      'gender', 'address', 'tenthPercentage', 'twelfthPercentage', 'cgpa',
      'activeBacklogs', 'skills', 'linkedinUrl', 'githubUrl',
    ];

    const updates: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // If student edits key academic fields after being verified, reset to pending
    if (user.role === Role.STUDENT && user.verificationStatus === 'verified') {
      const reVerifyFields = ['tenthPercentage', 'twelfthPercentage', 'cgpa', 'activeBacklogs', 'rollNumber', 'batch', 'department'];
      const needsReVerify = reVerifyFields.some((f) => updates[f] !== undefined && updates[f] !== (user as any)[f]);

      if (needsReVerify) {
        updates.verificationStatus = 'pending';
        updates.verificationRemarks = '';
      }
    }

    // If student is rejected and resubmits, set back to pending
    if (user.role === Role.STUDENT && user.verificationStatus === 'rejected') {
      updates.verificationStatus = 'pending';
      updates.verificationRemarks = '';
    }

    const updated = await User.findByIdAndUpdate(req.user?._id, updates, { new: true, runValidators: true })
      .select('-password')
      .populate('department', 'name code');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/profile/resume (handled separately with multer)
export const uploadResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) throw createError(400, 'No file uploaded');

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { resume: `/uploads/resumes/${req.file.filename}` },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: user?.resume,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/profile/students (Admin - all students)
export const getAllStudents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, department, batch, search } = req.query;

    const filter: any = { role: Role.STUDENT };

    if (status) filter.verificationStatus = status;
    if (department) filter.department = department;
    if (batch) filter.batch = Number(batch);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(filter)
      .select('-password')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, students });
  } catch (error) {
    next(error);
  }
};

// GET /api/profile/students/:id (Admin - single student detail)
export const getStudentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name code')
      .populate('placedCompany', 'name');

    if (!student || student.role !== Role.STUDENT) {
      throw createError(404, 'Student not found');
    }

    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile/students/:id/verify (Admin)
export const verifyStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, remarks } = req.body;

    const student = await User.findById(req.params.id);
    if (!student || student.role !== Role.STUDENT) {
      throw createError(404, 'Student not found');
    }

    student.verificationStatus = status;
    student.verificationRemarks = remarks || '';
    await student.save();

    res.json({
      success: true,
      message: `Student ${status === 'verified' ? 'verified' : 'rejected'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile/students/:id/block (Admin)
export const blockStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isActive } = req.body;

    const student = await User.findById(req.params.id);
    if (!student || student.role !== Role.STUDENT) {
      throw createError(404, 'Student not found');
    }

    student.isActive = isActive;
    await student.save();

    res.json({
      success: true,
      message: `Student account has been ${isActive ? 'unblocked' : 'blocked'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};