import chalk from 'chalk';
import { logger } from '../../../shared/logger';
import { Like } from './like.model';
import { Post } from '../post/post.model';

const likeToggleSocket = (io: any) => {
  io.on('connection', (socket: any) => {
    logger.info(chalk.green(`Socket connected in the likes: ${socket.id}`));

    socket.on(
      'like-toggle',
      async ({ postId, userId }: { postId: string; userId: string }) => {
        try {
          const likeExists = await Like.findOne({ userId, postId });

          if (likeExists) {
            await Like.findByIdAndDelete(likeExists._id, { new: true });
            await Post.findByIdAndUpdate(postId, {
              $inc: { likes: -1 },
              new: true,
            });
          } else {
            await Like.create({ userId, postId });
            await Post.findByIdAndUpdate(postId, {
              $inc: { likes: 1 },
              new: true,
            });
          }
        } catch (error) {
          logger.error(chalk.red('Error toggling like:'), error);
        }
      },
    );

    socket.on('disconnect', () => {
      logger.info(chalk.yellow(`Socket disconnected: ${socket.id}`));
    });
  });
};

export default likeToggleSocket;
