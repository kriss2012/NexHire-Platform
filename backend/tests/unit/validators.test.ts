import { registerSchema, loginSchema } from '../../src/validators/authValidator';
import { createJobSchema } from '../../src/validators/jobValidator';
import { applyJobSchema } from '../../src/validators/applicationValidator';

describe('Zod Input Validation Unit Tests', () => {
  describe('Auth Validators', () => {
    it('should accept valid registration inputs', () => {
      const valid = {
        email: 'dev@company.com',
        password: 'ValidPassword123',
        full_name: 'Dev Engineer',
        role: 'EMPLOYER',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject short passwords less than 8 chars', () => {
      const invalid = {
        email: 'dev@company.com',
        password: 'short',
        full_name: 'Dev Engineer',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email formatting', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'ValidPassword123',
        full_name: 'Dev Engineer',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Job Validators', () => {
    it('should accept a complete job payload', () => {
      const validJob = {
        company_id: 'cmp-001',
        title: 'Senior DevOps Architect',
        description: 'Lead the architecture of global Kubernetes infrastructure and GitOps pipelines.',
        requirements: ['Kubernetes', 'Terraform', 'AWS'],
        location: 'Remote',
        is_remote: true,
        type: 'FULL_TIME',
        salary_min: 150000,
        salary_max: 180000,
      };
      const result = createJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });

    it('should reject a job missing company_id or title', () => {
      const invalid = {
        description: 'Short',
      };
      const result = createJobSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Application Validators', () => {
    it('should accept valid job application details', () => {
      const valid = {
        applicant_name: 'Alex Developer',
        applicant_email: 'alex@dev.io',
        resume_url: 'https://cdn.example.com/resumes/alex.pdf',
        cover_letter: 'Looking forward to interviewing.',
      };
      const result = applyJobSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
