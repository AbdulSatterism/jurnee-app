import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Notification } from '../notifications/notifications.model';
import { Post } from '../post/post.model';
import { User } from '../user/user.model';
import { CommentLike, Like, ReplyLike } from './like.model';
import { Comment } from '../comment/comment.model';
import { Reply } from '../commentReply/commentReply.model';

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

const commentLikeToggle = async (userId: string, commentId: string) => {
  const userExist = await User.findById(userId);

  if (!userExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const likeExists = await CommentLike.findOne({ userId, commentId });

  if (likeExists) {
    await CommentLike.findByIdAndDelete(likeExists._id);
    await Comment.findByIdAndUpdate(commentId, {
      $inc: { like: -1 },
    });
    return 'disliked';
  } else {
    const result = await CommentLike.create({ userId, commentId });
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $inc: { like: 1 },
    });

    if (!comment) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found');
    }

    return result;
  }
};

const replyLikeToggle = async (userId: string, replyId: string) => {
  const userExist = await User.findById(userId);

  if (!userExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const likeExists = await ReplyLike.findOne({ userId, replyId });

  if (likeExists) {
    await ReplyLike.findByIdAndDelete(likeExists._id);
    await Reply.findByIdAndUpdate(replyId, {
      $inc: { like: -1 },
    });
    return 'disliked';
  } else {
    const result = await ReplyLike.create({ userId, replyId });
    const reply = await Reply.findByIdAndUpdate(replyId, {
      $inc: { like: 1 },
    });

    if (!reply) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Reply not found');
    }
    return result;
  }
};

export const LikeService = {
  toggleLike,
  commentLikeToggle,
  replyLikeToggle,
};
