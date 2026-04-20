import { Router } from 'express';
import { register, login, logout, getMe, changePassword, createOfficer, forgotPassword, verifyOtp, resetPassword } from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { registerSchema, loginSchema, changePasswordSchema, createOfficerSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from '../validators/authValidator';
import { Role } from '../types';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/create-officer', authenticate, authorize(Role.ADMIN), validate(createOfficerSchema), createOfficer);

// Password reset (public)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;