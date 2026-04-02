import { Router } from 'express';
import { register, login, logout, getMe, changePassword, createOfficer } from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { registerSchema, loginSchema, changePasswordSchema, createOfficerSchema } from '../validators/authValidator';
import { Role } from '../types';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/create-officer', authenticate, authorize(Role.ADMIN), validate(createOfficerSchema), createOfficer);

export default router;