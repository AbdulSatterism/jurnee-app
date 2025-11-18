import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Post } from '../post/post.model';
import { Saved } from './saved.model';
import { User } from '../user/user.model';

const toggleSaved = async (userId: string, postId: string) => {
  const savedExists = await Saved.findOne({ userId, postId });

  if (savedExists) {
    await Saved.findByIdAndDelete(savedExists._id);
    await Post.findByIdAndUpdate(postId, { $inc: { totalSaved: -1 } });
    return 'unsaved';
  }

  const result = await Saved.create({ userId, postId });
  await Post.findByIdAndUpdate(postId, { $inc: { totalSaved: 1 } });

  return result;
};

const mySavedPost = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const [post, total] = await Promise.all([
    Saved.find({ userId })
      .populate({ path: 'postId' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Saved.countDocuments({ userId }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: post,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

export const SavedService = {
  toggleSaved,
  mySavedPost,
};
