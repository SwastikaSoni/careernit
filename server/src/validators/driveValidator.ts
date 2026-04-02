import { z } from 'zod';

export const createDriveSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(200),
    company: z.string().min(1, 'Company is required'),
    description: z.string().max(5000).optional(),
    location: z.string().max(200).optional(),
    driveDate: z.string().optional(),
    lastDateToApply: z.string().min(1, 'Last date to apply is required'),
    packageLPA: z.number().min(0).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
    jobType: z.enum(['full_time', 'internship', 'both']).optional(),
    eligibility: z.object({
        departments: z.array(z.string()).optional(),
        minCGPA: z.number().min(0).max(10).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
        maxBacklogs: z.number().min(0).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
        minTenthPercentage: z.number().min(0).max(100).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
        minTwelfthPercentage: z.number().min(0).max(100).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
        batch: z.number().optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
    }).optional(),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
});

export const updateDriveSchema = z.object({
    title: z.string().min(2).max(200).optional(),
    company: z.string().optional(),
    description: z.string().max(5000).optional(),
    location: z.string().max(200).optional(),
    driveDate: z.string().optional(),
    lastDateToApply: z.string().optional(),
    packageLPA: z.number().min(0).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
    jobType: z.enum(['full_time', 'internship', 'both']).optional(),
    eligibility: z.object({
        departments: z.array(z.string()).optional(),
        minCGPA: z.number().min(0).max(10).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
        maxBacklogs: z.number().min(0).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
        minTenthPercentage: z.number().min(0).max(100).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
        minTwelfthPercentage: z.number().min(0).max(100).optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
        batch: z.number().optional().or(z.string().transform((v) => (v === '' ? undefined : Number(v)))),
    }).optional(),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
});
