import { z } from 'zod';

export const createJobSchema = z.object({
  company_id: z.string().min(1, 'Company ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.array(z.string()).default([]),
  location: z.string().min(2, 'Location is required'),
  is_remote: z.boolean().default(false),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']).default('FULL_TIME'),
  salary_min: z.number().positive().optional(),
  salary_max: z.number().positive().optional(),
  salary_currency: z.string().default('USD'),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED']).default('ACTIVE'),
});

export const updateJobSchema = createJobSchema.partial();

export const jobQuerySchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  is_remote: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
  location: z.string().optional(),
  company_id: z.string().optional(),
  status: z.string().optional(),
  page: z.preprocess((val) => (val ? parseInt(String(val), 10) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => (val ? parseInt(String(val), 10) : 10), z.number().int().min(1).max(50).default(10)),
});
