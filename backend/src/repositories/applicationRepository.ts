import { query, isPostgresAvailable, memoryDb } from '../config/database';
import { Application, ApplicationStatus } from '../types';

export class ApplicationRepository {
  public static async findById(id: string): Promise<Application | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT a.*, j.title as job_title, c.name as company_name, u.full_name as applicant_name, u.email as applicant_email
           FROM applications a
           JOIN jobs j ON a.job_id = j.id
           JOIN companies c ON j.company_id = c.id
           JOIN users u ON a.user_id = u.id
           WHERE a.id = $1 LIMIT 1`,
          [id]
        );
        return res.rows[0] || null;
      } catch (_) {}
    }
    const app = memoryDb.applications.find((a) => a.id === id);
    if (!app) return null;
    const job = memoryDb.jobs.find((j) => j.id === app.job_id);
    const company = job ? memoryDb.companies.find((c) => c.id === job.company_id) : undefined;
    const user = memoryDb.users.find((u) => u.id === app.user_id);
    return {
      ...app,
      job_title: job?.title || 'Unknown Job',
      company_name: company?.name || 'Unknown Company',
      applicant_name: user?.full_name || app.applicant_name,
      applicant_email: user?.email || app.applicant_email,
    };
  }

  public static async findByUserId(userId: string): Promise<Application[]> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT a.*, j.title as job_title, c.name as company_name
           FROM applications a
           JOIN jobs j ON a.job_id = j.id
           JOIN companies c ON j.company_id = c.id
           WHERE a.user_id = $1
           ORDER BY a.created_at DESC`,
          [userId]
        );
        return res.rows;
      } catch (_) {}
    }
    return memoryDb.applications
      .filter((a) => a.user_id === userId)
      .map((a) => {
        const job = memoryDb.jobs.find((j) => j.id === a.job_id);
        const company = job ? memoryDb.companies.find((c) => c.id === job.company_id) : undefined;
        return {
          ...a,
          job_title: job?.title || 'Unknown Job',
          company_name: company?.name || 'Unknown Company',
        };
      });
  }

  public static async findByEmployerId(employerId: string): Promise<Application[]> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT a.*, j.title as job_title, c.name as company_name, u.full_name as applicant_name, u.email as applicant_email
           FROM applications a
           JOIN jobs j ON a.job_id = j.id
           JOIN companies c ON j.company_id = c.id
           JOIN users u ON a.user_id = u.id
           WHERE j.created_by = $1
           ORDER BY a.created_at DESC`,
          [employerId]
        );
        return res.rows;
      } catch (_) {}
    }
    const employerJobs = new Set(memoryDb.jobs.filter((j) => j.created_by === employerId).map((j) => j.id));
    return memoryDb.applications
      .filter((a) => employerJobs.has(a.job_id))
      .map((a) => {
        const job = memoryDb.jobs.find((j) => j.id === a.job_id);
        const company = job ? memoryDb.companies.find((c) => c.id === job.company_id) : undefined;
        const user = memoryDb.users.find((u) => u.id === a.user_id);
        return {
          ...a,
          job_title: job?.title || 'Unknown Job',
          company_name: company?.name || 'Unknown Company',
          applicant_name: user?.full_name || a.applicant_name,
          applicant_email: user?.email || a.applicant_email,
        };
      });
  }

  public static async findByJobAndUser(jobId: string, userId: string): Promise<Application | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT * FROM applications WHERE job_id = $1 AND user_id = $2 LIMIT 1', [jobId, userId]);
        return res.rows[0] || null;
      } catch (_) {}
    }
    return memoryDb.applications.find((a) => a.job_id === jobId && a.user_id === userId) || null;
  }

  public static async create(app: Application): Promise<Application> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `INSERT INTO applications (id, job_id, user_id, applicant_name, applicant_email, resume_url, cover_letter, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [app.id, app.job_id, app.user_id, app.applicant_name, app.applicant_email, app.resume_url, app.cover_letter, app.status, app.created_at, app.updated_at]
        );
        return res.rows[0];
      } catch (_) {}
    }
    memoryDb.applications.unshift(app);
    return app;
  }

  public static async updateStatus(id: string, status: ApplicationStatus): Promise<Application | null> {
    const now = new Date().toISOString();
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `UPDATE applications SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *`,
          [status, now, id]
        );
        return res.rows[0] || null;
      } catch (_) {}
    }
    const idx = memoryDb.applications.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    memoryDb.applications[idx] = {
      ...memoryDb.applications[idx],
      status,
      updated_at: now,
    };
    return memoryDb.applications[idx];
  }

  public static async count(): Promise<number> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT COUNT(*) as count FROM applications');
        return parseInt(res.rows[0].count, 10);
      } catch (_) {}
    }
    return memoryDb.applications.length;
  }
}
