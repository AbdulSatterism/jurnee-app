import { Types } from 'mongoose';
import { IReview } from './review.interface';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { Post } from '../post/post.model';
import { Review } from './review.model';

const createReview = async (userId: string, payload: Partial<IReview>) => {
  payload.userId = new Types.ObjectId(userId);

  const post = await Post.findById(payload.postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  const review = await Review.create(payload);
  return review;
};

// get all review base on specific post id

const allReviewsByPostId = async (
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
    Review.find({ postId: new Types.ObjectId(postId) })
      .populate({ path: 'userId', select: 'name image -_id' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Review.countDocuments({ postId: new Types.ObjectId(postId) }),
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

export const ReviewServices = {
  createReview,
  allReviewsByPostId,
};
