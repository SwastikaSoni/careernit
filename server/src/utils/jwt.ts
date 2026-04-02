import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { IUserPayload } from '../types';

export const generateToken = (user: IUserPayload): string => {
  return jwt.sign(
    { _id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearTokenCookie = (res: Response): void => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
};

export const verifyToken = (token: string): IUserPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as IUserPayload;
};