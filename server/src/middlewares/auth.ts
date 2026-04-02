import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { createError } from './errorHandler';

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw createError(401, 'Not authenticated. Please login.');
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(createError(401, 'Invalid or expired token. Please login again.'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError(401, 'Not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'You do not have permission to perform this action.'));
    }

    next();
  };
};