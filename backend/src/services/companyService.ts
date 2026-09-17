import { CompanyRepository } from '../repositories/companyRepository';
import { Company } from '../types';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class CompanyService {
  public static async getById(id: string): Promise<Company> {
    const comp = await CompanyRepository.findById(id);
    if (!comp) {
      throw new NotFoundError(`Company with ID ${id} not found`);
    }
    return comp;
  }

  public static async getAll(): Promise<Company[]> {
    return CompanyRepository.findAll();
  }

  public static async create(data: Omit<Company, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Company> {
    const id = `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    return CompanyRepository.create({
      ...data,
      id,
      owner_id: userId,
      created_at: now,
      updated_at: now,
    });
  }

  public static async update(id: string, updates: Partial<Company>, user: { userId: string; role: string }): Promise<Company> {
    const existing = await CompanyRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Company with ID ${id} not found`);
    }

    if (user.role !== 'ADMIN' && existing.owner_id !== user.userId) {
      throw new ForbiddenError('You can only update companies you own');
    }

    const updated = await CompanyRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError(`Company with ID ${id} not found`);
    }

    return updated;
  }
}
