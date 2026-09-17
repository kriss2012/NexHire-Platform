import { Pool, QueryResult } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

let pool: Pool | null = null;
let isPgConnected = false;

// In-Memory Data Store for local/test fallback if Postgres is not running
export interface InMemoryDb {
  users: any[];
  companies: any[];
  jobs: any[];
  applications: any[];
  saved_jobs: any[];
}

export const memoryDb: InMemoryDb = {
  users: [],
  companies: [],
  jobs: [],
  applications: [],
  saved_jobs: [],
};

export function getPool(): Pool {
  if (!pool) {
    const isCloudDb =
      config.isProduction ||
      config.database.url.includes('neon.tech') ||
      config.database.url.includes('supabase.co') ||
      config.database.url.includes('render.com') ||
      config.database.url.includes('sslmode=require');

    pool = new Pool({
      connectionString: config.database.url,
      max: 10, // Safe connection limit for free tier database quotas
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: isCloudDb && !config.database.url.includes('localhost') ? { rejectUnauthorized: false } : undefined,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected PostgreSQL pool error', { error: err.message });
      isPgConnected = false;
    });
  }
  return pool;
}

export async function checkDatabaseConnection(): Promise<{ status: 'healthy' | 'degraded'; latencyMs: number }> {
  const start = Date.now();
  try {
    const p = getPool();
    await p.query('SELECT 1');
    isPgConnected = true;
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err: any) {
    isPgConnected = false;
    // Degraded mode: fallback to memory DB for development/testing
    return { status: 'degraded', latencyMs: Date.now() - start };
  }
}

export function isPostgresAvailable(): boolean {
  return isPgConnected;
}

export async function query(text: string, params?: any[]): Promise<QueryResult<any>> {
  const p = getPool();
  return p.query(text, params);
}
