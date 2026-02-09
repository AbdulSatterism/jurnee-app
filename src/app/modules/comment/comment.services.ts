import { Types } from 'mongoose';
import { IComment } from './comment.interface';
import { StatusCodes } from 'http-status-codes';
import { Post } from '../post/post.model';
import AppError from '../../errors/AppError';
import { Comment } from './comment.model';

const createComment = async (userId: string, payload: Partial<IComment>) => {
  payload.userId = new Types.ObjectId(userId);

  const post = await Post.findById(payload.postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  // this comment only for non-service post

  if (post.category === 'service') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'service post cannot be commented on',
    );
  }

  const comment = await Comment.create(payload);
  return comment;
};

// get all comment base on specific post id

const allCommentsByPostId = async (
  postId: string,
  query: Record<string, unknown>,
) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const postExist = await Post.findById(postId);
  if (!postExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  const [result, total] = await Promise.all([
    Comment.find({ postId: new Types.ObjectId(postId) })
      .populate({ path: 'userId', select: 'name image -_id' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Comment.countDocuments({ postId: new Types.ObjectId(postId) }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

export const CommentServices = {
  createComment,
  allCommentsByPostId,
};
