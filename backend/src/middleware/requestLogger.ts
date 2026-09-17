import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { httpRequestsTotal, httpRequestDurationMicroseconds, httpActiveRequests } from '../utils/metrics';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  httpActiveRequests.inc();

  // Clean route path for metrics normalization (e.g. avoid high cardinality on dynamic IDs)
  const getNormalizedPath = (originalUrl: string): string => {
    return originalUrl
      .split('?')[0]
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
      .replace(/\/(job|usr|cmp|app|save)-[a-zA-Z0-9_-]+/gi, '/:id');
  };

  res.on('finish', () => {
    httpActiveRequests.dec();
    const durationMs = Date.now() - start;
    const durationSeconds = durationMs / 1000;
    const path = getNormalizedPath(req.originalUrl || req.path);

    // Record Prometheus metrics
    httpRequestsTotal.inc({
      method: req.method,
      path,
      status: String(res.statusCode),
    });

    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        path,
        status: String(res.statusCode),
      },
      durationSeconds
    );

    // Skip logging noisy health and metrics polling at info level
    if (path === '/health' || path === '/ready' || path === '/live' || path === '/metrics') {
      return;
    }

    logger.info('HTTP Request Handled', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}
