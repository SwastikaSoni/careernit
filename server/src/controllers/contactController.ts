import { Request, Response, NextFunction } from 'express';
import { sendContactEmail } from '../services/emailService';
import { createError } from '../middlewares/errorHandler';

// POST /api/contact
export const sendContactMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    await sendContactEmail(name, email, subject, message);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
    });
  } catch (error) {
    next(createError(500, 'Failed to send message. Please try again later.'));
  }
};

// GET /api/contact/info
export const getContactInfo = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
  res.status(200).json({
    success: true,
    contactInfo: {
      email: process.env.OTP_EMAIL || process.env.SMTP_USER || 'admin@nitw.ac.in',
      phone: process.env.ADMIN_PHONE || '+91-870-246-2020',
      address: 'Training & Placement Cell, NIT Warangal, Telangana 506004, India',
      officeHours: 'Mon - Fri, 9:00 AM - 5:00 PM IST',
    },
  });
};
