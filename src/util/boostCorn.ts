import cron from 'node-cron';
import { Post } from '../app/modules/post/post.model';
import { logger } from '../shared/logger';
import chalk from 'chalk';
/* eslint-disable @typescript-eslint/no-explicit-any */

export const startBoostCron = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const date24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const result = await Post.updateMany(
        {
          boost: true,
          boostActivatedAt: { $lte: date24HoursAgo },
        },
        {
          $set: {
            boost: false,
            boostActivatedAt: null,
          },
        },
      );

      if (result.modifiedCount > 0) {
        logger.info(
          chalk.green(`Boost deactivated for ${result.modifiedCount} posts`),
        );
      }
    } catch (err: any) {
      logger.error(chalk.red(`Boost cron error: ${err.message}`));
    }
  });

  logger.info(chalk.blue('Boost cron job started'));
};
