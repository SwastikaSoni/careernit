import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  rollNumber: z.string().min(1).max(20).optional(),
  batch: z.number().min(2020).max(2035).optional(),
  department: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().max(500).optional(),
  tenthPercentage: z.number().min(0).max(100).optional(),
  twelfthPercentage: z.number().min(0).max(100).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  activeBacklogs: z.number().min(0).optional(),
  skills: z.array(z.string()).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
});

export const verifyStudentSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  remarks: z.string().max(500).optional(),
});