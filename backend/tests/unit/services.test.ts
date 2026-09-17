import { ApplicationService } from '../../src/services/applicationService';
import { CompanyService } from '../../src/services/companyService';
import { JobService } from '../../src/services/jobService';
import { CacheService } from '../../src/services/cacheService';
import { seedDatabase } from '../../src/db/seed';

describe('Application, Company & Job Services Unit Tests', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  describe('ApplicationService', () => {
    it('should throw NotFoundError if applying to non-existent job', async () => {
      await expect(
        ApplicationService.applyForJob('job-nonexistent', 'usr-test', {
          applicant_name: 'Test',
          applicant_email: 'test@test.com',
          resume_url: 'https://test.com/resume.pdf',
        })
      ).rejects.toThrow();
    });

    it('should get applications for candidate and employer roles', async () => {
      const candidateApps = await ApplicationService.getApplicationsForUser('usr-candidate-001', 'USER');
      expect(Array.isArray(candidateApps)).toBe(true);

      const employerApps = await ApplicationService.getApplicationsForUser('usr-employer-001', 'EMPLOYER');
      expect(Array.isArray(employerApps)).toBe(true);
    });

    it('should throw NotFoundError if retrieving invalid application ID', async () => {
      await expect(
        ApplicationService.getApplicationById('app-invalid-999', { userId: 'usr-admin-001', role: 'ADMIN' })
      ).rejects.toThrow();
    });

    it('should throw NotFoundError if updating invalid application ID', async () => {
      await expect(
        ApplicationService.updateStatus('app-invalid-999', 'REVIEWED', { userId: 'usr-admin-001', role: 'ADMIN' })
      ).rejects.toThrow();
    });
  });

  describe('CompanyService', () => {
    it('should retrieve list of all companies', async () => {
      const companies = await CompanyService.getAll();
      expect(companies.length).toBeGreaterThan(0);
    });

    it('should retrieve company by ID', async () => {
      const company = await CompanyService.getById('cmp-001');
      expect(company.id).toBe('cmp-001');
    });

    it('should throw NotFoundError for non-existent company', async () => {
      await expect(CompanyService.getById('cmp-nonexistent')).rejects.toThrow();
    });

    it('should throw NotFoundError when updating non-existent company', async () => {
      await expect(
        CompanyService.update('cmp-nonexistent', { name: 'New' }, { userId: 'usr-admin-001', role: 'ADMIN' })
      ).rejects.toThrow();
    });
  });

  describe('JobService', () => {
    it('should retrieve active jobs with filter pagination', async () => {
      const result = await JobService.getJobs({ page: 1, limit: 5 });
      expect(result.jobs.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should retrieve job by ID', async () => {
      const job = await JobService.getJobById('job-001');
      expect(job.id).toBe('job-001');
    });

    it('should throw NotFoundError for non-existent job ID', async () => {
      await expect(JobService.getJobById('job-nonexistent')).rejects.toThrow();
    });

    it('should throw NotFoundError when updating non-existent job', async () => {
      await expect(
        JobService.updateJob('job-nonexistent', { title: 'Ghost' }, { userId: 'usr-admin-001', role: 'ADMIN' })
      ).rejects.toThrow();
    });

    it('should throw NotFoundError when deleting non-existent job', async () => {
      await expect(
        JobService.deleteJob('job-nonexistent', { userId: 'usr-admin-001', role: 'ADMIN' })
      ).rejects.toThrow();
    });
  });

  describe('CacheService', () => {
    it('should set and get values from cache', async () => {
      await CacheService.set('test_key', { hello: 'world' }, 60);
      const val = await CacheService.get<{ hello: string }>('test_key');
      expect(val?.hello).toBe('world');
    });

    it('should delete keys from cache', async () => {
      await CacheService.del('test_key');
      const val = await CacheService.get('test_key');
      expect(val).toBeNull();
    });

    it('should invalidate patterns from cache', async () => {
      await CacheService.set('job:1', { a: 1 });
      await CacheService.set('job:2', { a: 2 });
      await CacheService.invalidatePattern('job:');
      const val = await CacheService.get('job:1');
      expect(val).toBeNull();
    });
  });
});
