import Redis from 'ioredis';
import { errorLogger, logger } from '../shared/logger';
import chalk from 'chalk';

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  retryStrategy: times => Math.min(times * 50, 2000),
});
// logger.info(chalk.green('🚀 Database connected successfully'));
redis.on('connect', () => logger.info(chalk.green('✅ Redis connected')));
redis.on('error', err =>
  errorLogger.error(chalk.red('❌ Failed to connect to Redis:', err)),
);

export default redis;
