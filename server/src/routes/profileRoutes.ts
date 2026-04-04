import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  getAllStudents,
  getStudentById,
  verifyStudent,
  blockStudent,
} from '../controllers/profileController';
import { authenticate, authorize } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { updateProfileSchema, verifyStudentSchema } from '../validators/profileValidator';
import { Role } from '../types';

const router = Router();

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/resumes'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Student profile routes
router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, validate(updateProfileSchema), updateMyProfile);
router.post('/resume', authenticate, authorize(Role.STUDENT), upload.single('resume'), uploadResume);

// Admin routes
router.get('/students', authenticate, authorize(Role.ADMIN, Role.PLACEMENT_OFFICER), getAllStudents);
router.get('/students/:id', authenticate, authorize(Role.ADMIN, Role.PLACEMENT_OFFICER), getStudentById);
router.put('/students/:id/verify', authenticate, authorize(Role.ADMIN), validate(verifyStudentSchema), verifyStudent);
router.put('/students/:id/block', authenticate, authorize(Role.ADMIN), blockStudent);

export default router;