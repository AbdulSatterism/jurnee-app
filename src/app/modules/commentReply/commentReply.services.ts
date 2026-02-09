import { Types } from 'mongoose';
import { IReply } from './commentReply.interface';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { Reply } from './commentReply.model';
import { Comment } from '../comment/comment.model';

const commnentReply = async (userId: string, payload: Partial<IReply>) => {
  payload.userId = new Types.ObjectId(userId);

  const comment = await Comment.findById(payload.commentId);
  if (!comment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Comment not found');
  }

  const reply = await Reply.create(payload);
  return reply;
};

export const CommentReplyService = {
  commnentReply,
};
