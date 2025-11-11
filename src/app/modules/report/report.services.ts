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

// all reports

const getAllReports = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Report.find()
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'postId' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Report.countDocuments(),
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

// report details

const getReportDetails = async (reportId: string) => {
  const report = await Report.findById(reportId)
    .populate({ path: 'userId', select: 'name email' })
    .populate({ path: 'postId' });

  if (!report) {
    throw new AppError(StatusCodes.NOT_FOUND, 'report not found');
  }

  return report;
};

export const ReportService = {
  createReport,
  getAllReports,
  getReportDetails,
};
