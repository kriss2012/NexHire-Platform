import fs from 'fs';
import path from 'path';
import { getPool } from '../config/database';
import { logger } from '../utils/logger';

export async function runMigrations(): Promise<void> {
  const pool = getPool();
  try {
    const migrationFile = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    logger.info('Executing database migrations...');
    await pool.query(sql);
    logger.info('Migrations executed successfully!');
  } catch (error: any) {
    logger.error('Migration failed or PostgreSQL offline', { error: error.message });
    // In local dev/test without running Postgres container, continue gracefully
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
