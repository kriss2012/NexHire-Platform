import { query, isPostgresAvailable, memoryDb } from '../config/database';
import { Company } from '../types';

export class CompanyRepository {
  public static async findById(id: string): Promise<Company | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT * FROM companies WHERE id = $1 LIMIT 1', [id]);
        return res.rows[0] || null;
      } catch (_) {}
    }
    return memoryDb.companies.find((c) => c.id === id) || null;
  }

  public static async findByOwnerId(ownerId: string): Promise<Company | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT * FROM companies WHERE owner_id = $1 LIMIT 1', [ownerId]);
        return res.rows[0] || null;
      } catch (_) {}
    }
    return memoryDb.companies.find((c) => c.owner_id === ownerId) || null;
  }

  public static async create(company: Company): Promise<Company> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `INSERT INTO companies (id, name, description, website, location, logo_url, owner_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [company.id, company.name, company.description, company.website, company.location, company.logo_url, company.owner_id, company.created_at, company.updated_at]
        );
        return res.rows[0];
      } catch (_) {}
    }
    memoryDb.companies.push(company);
    return company;
  }

  public static async update(id: string, updates: Partial<Company>): Promise<Company | null> {
    if (isPostgresAvailable()) {
      try {
        const current = await this.findById(id);
        if (!current) return null;
        const merged = { ...current, ...updates, updated_at: new Date().toISOString() };
        const res = await query(
          `UPDATE companies
           SET name = $1, description = $2, website = $3, location = $4, logo_url = $5, updated_at = $6
           WHERE id = $7
           RETURNING *`,
          [merged.name, merged.description, merged.website, merged.location, merged.logo_url, merged.updated_at, id]
        );
        return res.rows[0];
      } catch (_) {}
    }
    const idx = memoryDb.companies.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    memoryDb.companies[idx] = {
      ...memoryDb.companies[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return memoryDb.companies[idx];
  }

  public static async findAll(): Promise<Company[]> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT * FROM companies ORDER BY name ASC');
        return res.rows;
      } catch (_) {}
    }
    return [...memoryDb.companies];
  }
}
