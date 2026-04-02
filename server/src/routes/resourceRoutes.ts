import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
    getAllResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
} from '../controllers/resourceController';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '../types';

const router = Router();

// Multer config for resource PDF uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/resources'));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});

// All authenticated users can read
router.get('/', authenticate, getAllResources);
router.get('/:id', authenticate, getResourceById);

// Officer only — with optional file upload
router.post('/', authenticate, authorize(Role.PLACEMENT_OFFICER), upload.single('file'), createResource);
router.put('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), upload.single('file'), updateResource);
router.delete('/:id', authenticate, authorize(Role.PLACEMENT_OFFICER), deleteResource);

export default router;
