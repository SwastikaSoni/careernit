import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { register, login, logout, getMe, changePassword, createOfficer, forgotPassword, verifyOtp, resetPassword } from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from '../validators/authValidator';
import { Role } from '../types';

const router = Router();

// Multer config for officer avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/create-officer', authenticate, authorize(Role.ADMIN), avatarUpload.single('avatar'), createOfficer);

// Password reset (public)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;