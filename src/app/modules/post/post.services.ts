import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IPost } from './post.interface';
import { Post } from './post.model';

const createEvent = async (author: string, payload: IPost) => {
  const isExist = await User.findById(author);
  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  payload.author = isExist._id;

  if (payload.media && !Array.isArray(payload.media)) {
    payload.media = [payload.media];
  }

  const result = await Post.create(payload);

  await User.findByIdAndUpdate(author, {
    $inc: { post: 1 },
  });

  return result;
};

export const PostService = {
  createEvent,
};
