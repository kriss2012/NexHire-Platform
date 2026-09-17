import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root or workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000').split(','),
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_min_32_characters_long_12345',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://jobboard_user:jobboard_secure_password_dev_only@localhost:5432/jobboard_db',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'jobboard_user',
    password: process.env.POSTGRES_PASSWORD || 'jobboard_secure_password_dev_only',
    database: process.env.POSTGRES_DB || 'jobboard_db',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS || '300', 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
