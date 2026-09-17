import express, { Express } from 'express';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { NotFoundError } from './utils/errors';
import apiRouter from './routes';
import healthRouter from './routes/healthRoutes';
import metricsRouter from './routes/metricsRoutes';

export function createApp(): Express {
  const app = express();

  // Trust proxy for reverse proxies on free cloud platforms (Render, Koyeb, etc.)
  app.set('trust proxy', 1);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Handled by frontend Nginx in production
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman, k8s probes)
        if (!origin) return callback(null, true);
        if (
          config.corsOrigins.indexOf(origin) !== -1 ||
          config.env === 'development' ||
          origin.endsWith('.onrender.com') ||
          origin.endsWith('.vercel.app') ||
          origin.endsWith('.netlify.app')
        ) {
          callback(null, true);
        } else {
          callback(new Error('CORS policy: Not allowed by origin'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request body parsers with safety limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Metrics and Request Logging Middleware
  app.use(requestLogger);

  // Health and Metrics Probes (No rate limiting for probes)
  app.use('/', healthRouter);
  app.use('/', metricsRouter);

  // Apply General API Rate Limiting for business routes
  app.use('/api', apiLimiter);
  app.use('/api/v1', apiLimiter);

  // Application REST API Routes
  app.use('/api', apiRouter);
  app.use('/api/v1', apiRouter);

  // Static Assets & Single-Page Application (SPA) Serving for Free-Tier Deployment
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      // Don't intercept API, metrics, or health requests
      if (
        req.originalUrl.startsWith('/api') ||
        req.originalUrl.startsWith('/health') ||
        req.originalUrl.startsWith('/metrics') ||
        req.originalUrl.startsWith('/ready') ||
        req.originalUrl.startsWith('/live')
      ) {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  // 404 Catch-All Route for API or unmatched routes
  app.use('*', (req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp();
