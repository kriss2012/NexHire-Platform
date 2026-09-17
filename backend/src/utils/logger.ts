import winston from 'winston';
import { config } from '../config/env';

const SENSITIVE_KEYS = new Set(['password', 'token', 'authorization', 'secret', 'key', 'jwt', 'cookie']);

function maskSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(maskSensitiveData);

  const masked: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      masked[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      masked[key] = maskSensitiveData(val);
    } else {
      masked[key] = val;
    }
  }
  return masked;
}

const customJsonFormat = winston.format.printf(({ level, message, timestamp, service = 'backend', ...metadata }) => {
  const sanitizedMeta = maskSensitiveData(metadata);
  return JSON.stringify({
    timestamp,
    level,
    service,
    message,
    ...sanitizedMeta,
  });
});

export const logger = winston.createLogger({
  level: config.logLevel,
  defaultMeta: { service: 'backend' },
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    customJsonFormat
  ),
  transports: [
    new winston.transports.Console({
      silent: config.isTest,
    }),
  ],
});
