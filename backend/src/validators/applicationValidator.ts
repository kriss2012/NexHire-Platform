import { z } from 'zod';

export const applyJobSchema = z.object({
  applicant_name: z.string().min(2, 'Name is required'),
  applicant_email: z.string().email('Valid email is required'),
  resume_url: z.string().url('Resume must be a valid URL').or(z.string().min(5)),
  cover_letter: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'INTERVIEWING', 'REJECTED', 'ACCEPTED']),
});

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name is required').max(150),
  description: z.string().min(5, 'Description is required'),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  logo_url: z.string().url().optional().or(z.literal('')),
});

export const updateCompanySchema = createCompanySchema.partial();
