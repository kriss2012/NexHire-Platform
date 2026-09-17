import { query, isPostgresAvailable, memoryDb } from '../config/database';
import { User, SafeUser } from '../types';

export class UserRepository {
  public static async findByEmail(email: string): Promise<User | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
        return res.rows[0] || null;
      } catch (_) {}
    }
    return memoryDb.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public static async findById(id: string): Promise<SafeUser | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT id, email, full_name, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1', [id]);
        return res.rows[0] || null;
      } catch (_) {}
    }
    const u = memoryDb.users.find((x) => x.id === id);
    if (!u) return null;
    const { password_hash, ...safe } = u;
    return safe;
  }

  public static async create(user: User): Promise<SafeUser> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, email, full_name, role, created_at, updated_at`,
          [user.id, user.email, user.password_hash, user.full_name, user.role, user.created_at, user.updated_at]
        );
        return res.rows[0];
      } catch (_) {}
    }
    memoryDb.users.push(user);
    const { password_hash, ...safe } = user;
    return safe;
  }

  public static async findAll(): Promise<SafeUser[]> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT id, email, full_name, role, created_at, updated_at FROM users ORDER BY created_at DESC');
        return res.rows;
      } catch (_) {}
    }
    return memoryDb.users.map(({ password_hash, ...safe }) => safe);
  }

  public static async count(): Promise<number> {
    if (isPostgresAvailable()) {
      try {
        const res = await query('SELECT COUNT(*) as count FROM users');
        return parseInt(res.rows[0].count, 10);
      } catch (_) {}
    }
    return memoryDb.users.length;
  }
}
