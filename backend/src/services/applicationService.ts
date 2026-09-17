import { ApplicationRepository } from '../repositories/applicationRepository';
import { JobRepository } from '../repositories/jobRepository';
import { Application, ApplicationStatus } from '../types';
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from '../utils/errors';

export class ApplicationService {
  public static async applyForJob(
    jobId: string,
    userId: string,
    details: { applicant_name: string; applicant_email: string; resume_url: string; cover_letter?: string }
  ): Promise<Application> {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError(`Job with ID ${jobId} not found`);
    }

    if (job.status !== 'ACTIVE') {
      throw new BadRequestError('This job listing is no longer accepting applications');
    }

    const existing = await ApplicationRepository.findByJobAndUser(jobId, userId);
    if (existing) {
      throw new ConflictError('You have already applied for this position');
    }

    const id = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    return ApplicationRepository.create({
      id,
      job_id: jobId,
      user_id: userId,
      applicant_name: details.applicant_name,
      applicant_email: details.applicant_email,
      resume_url: details.resume_url,
      cover_letter: details.cover_letter,
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    });
  }

  public static async getApplicationsForUser(userId: string, role: string): Promise<Application[]> {
    if (role === 'EMPLOYER') {
      return ApplicationRepository.findByEmployerId(userId);
    }
    return ApplicationRepository.findByUserId(userId);
  }

  public static async getApplicationById(id: string, user: { userId: string; role: string }): Promise<Application> {
    const app = await ApplicationRepository.findById(id);
    if (!app) {
      throw new NotFoundError(`Application with ID ${id} not found`);
    }

    if (user.role !== 'ADMIN' && app.user_id !== user.userId) {
      const job = await JobRepository.findById(app.job_id);
      if (!job || job.created_by !== user.userId) {
        throw new ForbiddenError('You are not authorized to view this application');
      }
    }

    return app;
  }

  public static async updateStatus(id: string, status: ApplicationStatus, user: { userId: string; role: string }): Promise<Application> {
    const app = await ApplicationRepository.findById(id);
    if (!app) {
      throw new NotFoundError(`Application with ID ${id} not found`);
    }

    // Only Admin or Job Creator (Employer) can change status
    if (user.role !== 'ADMIN') {
      const job = await JobRepository.findById(app.job_id);
      if (!job || job.created_by !== user.userId) {
        throw new ForbiddenError('Only the hiring employer or an administrator can update application status');
      }
    }

    const updated = await ApplicationRepository.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundError(`Application with ID ${id} not found`);
    }

    return updated;
  }
}
