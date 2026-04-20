import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, Role } from '../types';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/jwt';
import { createError } from '../middlewares/errorHandler';
import { sendOTPEmail } from '../services/emailService';

// POST /api/auth/register (Student only)
export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    // Domain restriction for students
    if (!email.toLowerCase().endsWith('@student.nitw.ac.in')) {
      throw createError(400, 'Students must register with a @student.nitw.ac.in email address.');
    }

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

    // Domain restriction for students on login
    if (user.role === Role.STUDENT && !email.toLowerCase().endsWith('@student.nitw.ac.in')) {
      throw createError(403, 'Access denied. Students must use their @student.nitw.ac.in account.');
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

    const officerData: any = {
      name,
      email,
      password,
      phone,
      role: Role.PLACEMENT_OFFICER,
      ...(department && { department }),
    };

    // If avatar file was uploaded via multer
    if (req.file) {
      officerData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const officer = await User.create(officerData);

    res.status(201).json({
      success: true,
      message: 'Placement Officer account created successfully.',
      user: {
        _id: officer._id,
        name: officer.name,
        email: officer.email,
        role: officer.role,
        avatar: officer.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists
      res.status(200).json({
        success: true,
        message: 'If that email is registered, a verification code has been sent.',
      });
      return;
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'If that email is registered, a verification code has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      throw createError(400, 'Invalid or expired OTP.');
    }

    // Check expiry
    if (new Date() > user.resetOtpExpiry) {
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save();
      throw createError(400, 'OTP has expired. Please request a new one.');
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      throw createError(400, 'Invalid OTP.');
    }

    // Clear OTP fields
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    // Generate short-lived reset token (15 min)
    const resetToken = jwt.sign(
      { _id: user._id.toString(), purpose: 'password-reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;

    let decoded: any;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'secret');
    } catch {
      throw createError(400, 'Invalid or expired reset token. Please start over.');
    }

    if (decoded.purpose !== 'password-reset') {
      throw createError(400, 'Invalid reset token.');
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      throw createError(404, 'User not found.');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in.',
    });
  } catch (error) {
    next(error);
  }
};