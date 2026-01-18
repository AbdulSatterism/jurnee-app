/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { Cache } from '../../lib/cache';
import { errorLogger } from '../../shared/logger';
import chalk from 'chalk';

export const cacheGet =
  (prefix: string, ttl = 3600, keySelector?: (req: Request) => object) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') return next();

    try {
      // Build cache key
      const keyBasis = keySelector
        ? keySelector(req)
        : { path: req.path, query: req.query };
      const key = Cache.buildKey(prefix, keyBasis);

      // Try to get cache
      const cachedData = await Cache.get<any>(key);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');

        res.status(200).json(cachedData);
        return;
      }

      // Wrap res.json to intercept the response body before sending
      const originalJson = res.json.bind(res);
      res.json = (body: any): Response => {
        res.setHeader('X-Cache', 'MISS');

        // Async cache set (non-blocking)
        Cache.set(key, body, ttl).catch(err => {
          errorLogger.error(chalk.red('Redis cache set error:'), err.message);
        });

        return originalJson(body);
      };

      return next();
    } catch (error) {
      if (error instanceof Error)
        errorLogger.error(
          chalk.red('Redis cache middleware error:'),
          error.message,
        );
      return next();
    }
  };
