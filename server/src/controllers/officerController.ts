import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest, Role } from '../types';
import { createError } from '../middlewares/errorHandler';

// GET /api/officers
export const getAllOfficers = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const officers = await User.find({ role: Role.PLACEMENT_OFFICER })
      .select('-password')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, officers });
  } catch (error) {
    next(error);
  }
};

// PUT /api/officers/:id/toggle
export const toggleOfficerStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const officer = await User.findById(req.params.id);
    if (!officer || officer.role !== Role.PLACEMENT_OFFICER) {
      throw createError(404, 'Officer not found');
    }

    officer.isActive = !officer.isActive;
    await officer.save();

    res.json({
      success: true,
      message: `Officer ${officer.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/officers/:id
export const deleteOfficer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const officer = await User.findById(req.params.id);
    if (!officer || officer.role !== Role.PLACEMENT_OFFICER) {
      throw createError(404, 'Officer not found');
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Officer deleted successfully' });
  } catch (error) {
    next(error);
  }
};