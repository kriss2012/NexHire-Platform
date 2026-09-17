import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.isTest ? 10000 : config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      statusCode: 429,
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isTest ? 10000 : 20, // 20 login/register attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again later.',
      statusCode: 429,
    },
  },
});
