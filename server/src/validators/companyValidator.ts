import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  industry: z.string().min(2, 'Industry is required').max(100),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
  location: z.string().min(2, 'Location is required').max(200),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(20).optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  industry: z.string().min(2).max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
  location: z.string().min(2).max(200).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});