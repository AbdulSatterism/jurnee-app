import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Notification } from '../notifications/notifications.model';
import { Post } from '../post/post.model';
import { User } from '../user/user.model';
import { Like } from './like.model';

const toggleLike = async (userId: string, postId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const likeExists = await Like.findOne({ userId, postId });

  if (likeExists) {
    await Like.findByIdAndDelete(likeExists._id);
    await Post.findByIdAndUpdate(postId, {
      $inc: { likes: -1 },
    });
    return 'disliked';
  } else {
    const result = await Like.create({ userId, postId });
    const post = await Post.findByIdAndUpdate(postId, {
      $inc: { likes: 1 },
    });

    if (!post) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
    }

    await Notification.create({
      content: `${user.name} liked your post`,
      senderId: userId,
      receiverId: post.author,
    });

    return result;
  }
};

export const LikeService = {
  toggleLike,
};
