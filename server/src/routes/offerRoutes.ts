import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { Role } from '../types';
import { getMyOffers, getAllOffers, createOffer, respondToOffer, revokeOffer } from '../controllers/offerController';

const router = express.Router();

// Middleware: all routes require authentication
router.use(authenticate);

// Student routes
router.get('/my-offers', authorize(Role.STUDENT), getMyOffers);
router.patch('/:id/respond', authorize(Role.STUDENT), respondToOffer);

// Admin / Officer routes
router.get('/', authorize(Role.ADMIN, Role.PLACEMENT_OFFICER), getAllOffers);
router.post('/', authorize(Role.ADMIN, Role.PLACEMENT_OFFICER), createOffer);
router.patch('/:id/revoke', authorize(Role.ADMIN, Role.PLACEMENT_OFFICER), revokeOffer);

export default router;
