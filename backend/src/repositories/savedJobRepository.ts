import { query, isPostgresAvailable, memoryDb } from '../config/database';
import { SavedJob } from '../types';
import { JobRepository } from './jobRepository';

export class SavedJobRepository {
  public static async findByUserId(userId: string): Promise<SavedJob[]> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT sj.*, j.title as job_title, j.location, j.type, j.salary_min, j.salary_max, c.name as company_name, c.logo_url as company_logo
           FROM saved_jobs sj
           JOIN jobs j ON sj.job_id = j.id
           JOIN companies c ON j.company_id = c.id
           WHERE sj.user_id = $1
           ORDER BY sj.created_at DESC`,
          [userId]
        );
        return res.rows;
      } catch (_) {}
    }
    const saved = memoryDb.saved_jobs.filter((s) => s.user_id === userId);
    const populated = await Promise.all(
      saved.map(async (s) => ({
        ...s,
        job: (await JobRepository.findById(s.job_id)) || undefined,
      }))
    );
    return populated;
  }

  public static async save(saved: SavedJob): Promise<SavedJob> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `INSERT INTO saved_jobs (id, user_id, job_id, created_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, job_id) DO NOTHING
           RETURNING *`,
          [saved.id, saved.user_id, saved.job_id, saved.created_at]
        );
        return res.rows[0] || saved;
      } catch (_) {}
    }
    const exists = memoryDb.saved_jobs.some((s) => s.user_id === saved.user_id && s.job_id === saved.job_id);
    if (!exists) {
      memoryDb.saved_jobs.push(saved);
    }
    return saved;
  }

  public static async delete(userId: string, jobId: string): Promise<boolean> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
        return (res.rowCount ?? 0) > 0;
      } catch (_) {}
    }
    const initialLen = memoryDb.saved_jobs.length;
    memoryDb.saved_jobs = memoryDb.saved_jobs.filter((s) => !(s.user_id === userId && s.job_id === jobId));
    return memoryDb.saved_jobs.length < initialLen;
  }
}
