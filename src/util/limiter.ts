import rateLimit from 'express-rate-limit';
import { errorLogger } from '../shared/logger';

import 'express';

const SKIP_PATHS = new Set(['/', '/health', '/ready', '/api/v1', '/webhook']);

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => SKIP_PATHS.has(req.path),
  handler: (req, res) => {
    errorLogger.warn(`Rate limit exceeded — IP: ${req.ip}, Path: ${req.path}`);

    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.ceil((resetTime.getTime() - Date.now()) / 1000) // seconds
      : undefined;

    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter,
    });
  },
});
