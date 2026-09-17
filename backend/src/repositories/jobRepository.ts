import { query, isPostgresAvailable, memoryDb } from '../config/database';
import { Job } from '../types';

export interface JobFilterOptions {
  q?: string;
  type?: string;
  is_remote?: boolean;
  location?: string;
  status?: string;
  company_id?: string;
  page?: number;
  limit?: number;
}

export class JobRepository {
  public static async findById(id: string): Promise<Job | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT j.*, c.name as company_name, c.logo_url as company_logo
           FROM jobs j
           JOIN companies c ON j.company_id = c.id
           WHERE j.id = $1 LIMIT 1`,
          [id]
        );
        return res.rows[0] || null;
      } catch (_) {}
    }
    const job = memoryDb.jobs.find((j) => j.id === id);
    if (!job) return null;
    const company = memoryDb.companies.find((c) => c.id === job.company_id);
    return {
      ...job,
      company_name: company?.name || 'Unknown Company',
      company_logo: company?.logo_url,
    };
  }

  public static async findAll(options: JobFilterOptions = {}): Promise<{ jobs: Job[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const offset = (page - 1) * limit;

    if (isPostgresAvailable()) {
      try {
        let whereClauses: string[] = [];
        let params: any[] = [];
        let pIdx = 1;

        if (options.status) {
          whereClauses.push(`j.status = $${pIdx++}`);
          params.push(options.status);
        } else {
          whereClauses.push(`j.status = 'ACTIVE'`);
        }

        if (options.type) {
          whereClauses.push(`j.type = $${pIdx++}`);
          params.push(options.type);
        }

        if (options.is_remote !== undefined) {
          whereClauses.push(`j.is_remote = $${pIdx++}`);
          params.push(options.is_remote);
        }

        if (options.company_id) {
          whereClauses.push(`j.company_id = $${pIdx++}`);
          params.push(options.company_id);
        }

        if (options.location) {
          whereClauses.push(`j.location ILIKE $${pIdx++}`);
          params.push(`%${options.location}%`);
        }

        if (options.q) {
          whereClauses.push(`(j.title ILIKE $${pIdx} OR j.description ILIKE $${pIdx} OR c.name ILIKE $${pIdx})`);
          params.push(`%${options.q}%`);
          pIdx++;
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const countRes = await query(
          `SELECT COUNT(*) as total FROM jobs j JOIN companies c ON j.company_id = c.id ${whereSql}`,
          params
        );
        const total = parseInt(countRes.rows[0].total, 10);

        const dataRes = await query(
          `SELECT j.*, c.name as company_name, c.logo_url as company_logo
           FROM jobs j
           JOIN companies c ON j.company_id = c.id
           ${whereSql}
           ORDER BY j.created_at DESC
           LIMIT $${pIdx++} OFFSET $${pIdx++}`,
          [...params, limit, offset]
        );

        return { jobs: dataRes.rows, total };
      } catch (_) {}
    }

    // Memory DB filter
    let results = memoryDb.jobs.map((job) => {
      const company = memoryDb.companies.find((c) => c.id === job.company_id);
      return {
        ...job,
        company_name: company?.name || 'CloudScale Systems',
        company_logo: company?.logo_url,
      };
    });

    if (options.status) {
      results = results.filter((j) => j.status === options.status);
    } else {
      results = results.filter((j) => j.status === 'ACTIVE');
    }

    if (options.type) {
      results = results.filter((j) => j.type === options.type);
    }

    if (options.is_remote !== undefined) {
      results = results.filter((j) => j.is_remote === options.is_remote);
    }

    if (options.company_id) {
      results = results.filter((j) => j.company_id === options.company_id);
    }

    if (options.location) {
      const loc = options.location.toLowerCase();
      results = results.filter((j) => j.location.toLowerCase().includes(loc));
    }

    if (options.q) {
      const queryStr = options.q.toLowerCase();
      results = results.filter(
        (j) =>
          j.title.toLowerCase().includes(queryStr) ||
          j.description.toLowerCase().includes(queryStr) ||
          (j.company_name && j.company_name.toLowerCase().includes(queryStr))
      );
    }

    const total = results.length;
    const paginated = results.slice(offset, offset + limit);

    return { jobs: paginated, total };
  }

  public static async create(job: Job): Promise<Job> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `INSERT INTO jobs (id, company_id, title, description, requirements, location, is_remote, type, salary_min, salary_max, salary_currency, status, created_by, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING *`,
          [job.id, job.company_id, job.title, job.description, JSON.stringify(job.requirements), job.location, job.is_remote, job.type, job.salary_min, job.salary_max, job.salary_currency, job.status, job.created_by, job.created_at, job.updated_at]
        );
        return res.rows[0];
      } catch (_) {}
    }
    memoryDb.jobs.unshift(job);
    return job;
  }

  public static async update(id: string, updates: Partial<Job>): Promise<Job | null> {
    if (isPostgresAvailable()) {
      try {
        const current = await this.findById(id);
        if (!current) return null;
        const merged = { ...current, ...updates, updated_at: new Date().toISOString() };
        const res = await query(
          `UPDATE jobs
           SET title = $1, description = $2, requirements = $3, location = $4, is_remote = $5, type = $6, salary_min = $7, salary_max = $8, status = $9, updated_at = $10
           WHERE id = $11
           RETURNING *`,
          [merged.title, merged.description, JSON.stringify(merged.requirements), merged.location, merged.is_remote, merged.type, merged.salary_min, merged.salary_max, merged.status, merged.updated_at, id]
        );
        return res.rows[0];
      } catch (_) {}
    }
    const idx = memoryDb.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    memoryDb.jobs[idx] = {
      ...memoryDb.jobs[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return memoryDb.jobs[idx];
  }

  public static async delete(id: string): Promise<boolean> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('DELETE FROM jobs WHERE id = $1', [id]);
        return (res.rowCount ?? 0) > 0;
      } catch (_) {}
    }
    const initialLen = memoryDb.jobs.length;
    memoryDb.jobs = memoryDb.jobs.filter((j) => j.id !== id);
    return memoryDb.jobs.length < initialLen;
  }

  public static async count(): Promise<number> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT COUNT(*) as count FROM jobs');
        return parseInt(res.rows[0].count, 10);
      } catch (_) {}
    }
    return memoryDb.jobs.length;
  }
}
