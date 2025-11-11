import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Types } from 'mongoose';
import { Post } from '../post/post.model';
import { Report } from './report.model';
import { IReport } from './report.interface';

const createReport = async (userId: string, payload: Partial<IReport>) => {
  payload.userId = new Types.ObjectId(userId);

  const postExist = await Post.findById(payload.postId);

  if (!postExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'post not found');
  }

  const result = await Report.create(payload);
  return result;
};

export const ReportService = {
  createReport,
};
