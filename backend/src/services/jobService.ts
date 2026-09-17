import { JobRepository, JobFilterOptions } from '../repositories/jobRepository';
import { CompanyRepository } from '../repositories/companyRepository';
import { CacheService } from './cacheService';
import { Job, SafeUser } from '../types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

export class JobService {
  private static readonly CACHE_PREFIX = 'jobs:';
  private static readonly CACHE_TTL = 300; // 5 minutes

  public static async getJobs(options: JobFilterOptions = {}): Promise<{ jobs: Job[]; total: number; page: number; limit: number; cached: boolean }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const cacheKey = `${this.CACHE_PREFIX}list:${JSON.stringify(options)}`;

    // Try Redis Cache
    const cached = await CacheService.get<{ jobs: Job[]; total: number }>(cacheKey);
    if (cached) {
      return { ...cached, page, limit, cached: true };
    }

    // Cache Miss: Query Database
    const result = await JobRepository.findAll(options);

    // Save to Cache
    await CacheService.set(cacheKey, result, this.CACHE_TTL);

    return { ...result, page, limit, cached: false };
  }

  public static async getJobById(id: string): Promise<Job> {
    const cacheKey = `${this.CACHE_PREFIX}detail:${id}`;
    const cached = await CacheService.get<Job>(cacheKey);
    if (cached) {
      return cached;
    }

    const job = await JobRepository.findById(id);
    if (!job) {
      throw new NotFoundError(`Job with ID ${id} not found`);
    }

    await CacheService.set(cacheKey, job, this.CACHE_TTL);
    return job;
  }

  public static async createJob(data: Omit<Job, 'id' | 'created_at' | 'updated_at'>, user: { userId: string; role: string }): Promise<Job> {
    // Verify company exists
    const company = await CompanyRepository.findById(data.company_id);
    if (!company) {
      throw new BadRequestError(`Company with ID ${data.company_id} does not exist`);
    }

    // Verify ownership or ADMIN
    if (user.role !== 'ADMIN' && company.owner_id !== user.userId) {
      throw new ForbiddenError('You can only post jobs for companies you own');
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const created = await JobRepository.create({
      ...data,
      id: jobId,
      created_by: user.userId,
      created_at: now,
      updated_at: now,
    });

    // Invalidate jobs cache
    await CacheService.invalidatePattern(this.CACHE_PREFIX);

    return created;
  }

  public static async updateJob(id: string, updates: Partial<Job>, user: { userId: string; role: string }): Promise<Job> {
    const existing = await JobRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Job with ID ${id} not found`);
    }

    if (user.role !== 'ADMIN' && existing.created_by !== user.userId) {
      throw new ForbiddenError('You can only update your own job listings');
    }

    const updated = await JobRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError(`Job with ID ${id} not found`);
    }

    // Invalidate cache
    await CacheService.invalidatePattern(this.CACHE_PREFIX);

    return updated;
  }

  public static async deleteJob(id: string, user: { userId: string; role: string }): Promise<void> {
    const existing = await JobRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Job with ID ${id} not found`);
    }

    if (user.role !== 'ADMIN' && existing.created_by !== user.userId) {
      throw new ForbiddenError('You can only delete your own job listings');
    }

    await JobRepository.delete(id);

    // Invalidate cache
    await CacheService.invalidatePattern(this.CACHE_PREFIX);
  }
}
