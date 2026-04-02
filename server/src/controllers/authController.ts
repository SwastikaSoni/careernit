import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest, Role } from '../types';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/jwt';
import { createError } from '../middlewares/errorHandler';

// POST /api/auth/register (Student only)
export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(400, 'Email already registered.');
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: Role.STUDENT,
      verificationStatus: 'pending',
      placementStatus: 'unplaced',
    });

    const token = generateToken({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please complete your profile for verification.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw createError(401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw createError(403, 'Your account has been deactivated. Contact admin.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw createError(401, 'Invalid email or password.');
    }

    const token = generateToken({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        verificationStatus: user.verificationStatus,
        placementStatus: user.placementStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
export const logout = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    clearTokenCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id)
      .select('-password')
      .populate('department', 'name code');

    if (!user) {
      throw createError(404, 'User not found.');
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/change-password
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) {
      throw createError(404, 'User not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw createError(400, 'Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/create-officer (Admin only)
export const createOfficer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(400, 'Email already registered.');
    }

    const officer = await User.create({
      name,
      email,
      password,
      phone,
      role: Role.PLACEMENT_OFFICER,
      ...(department && { department }),
    });

    res.status(201).json({
      success: true,
      message: 'Placement Officer account created successfully.',
      user: {
        _id: officer._id,
        name: officer.name,
        email: officer.email,
        role: officer.role,
      },
    });
  } catch (error) {
    next(error);
  }
};