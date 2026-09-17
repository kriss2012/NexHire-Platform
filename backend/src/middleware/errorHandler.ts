import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err instanceof AppError ? err.statusCode : (err.status || 500);
  const message = err.message || 'Internal Server Error';

  logger.error('Request error', {
    method: req.method,
    path: req.originalUrl || req.path,
    statusCode,
    error: message,
    stack: config.isProduction ? undefined : err.stack,
    details: err.details,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      details: err.details || null,
      timestamp: new Date().toISOString(),
    },
  });
}
