import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10).toUpperCase(),
  description: z.string().max(500).optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10).toUpperCase().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});