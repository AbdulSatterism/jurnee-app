import { StatusCodes } from 'http-status-codes';
import { ISupport } from './support.interface';
import AppError from '../../errors/AppError';
import { Support } from './support.model';
import { User } from '../user/user.model';

const sumbitSupport = async (userId: string, payload: ISupport) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  payload.user = user._id;

  const result = await Support.create(payload);
  return result;
};

const allSupportByAdmin = async (query: Record<string, unknown>) => {
  const { page, limit } = query;

  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Support.find()
      .populate('user', 'name image -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Support.countDocuments(),
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

const getSingleSupport = async (id: string) => {
  const result = await Support.findById(id)
    .populate('user', 'name image -_id')
    .lean();
  return result;
};

export const SupportService = {
  sumbitSupport,
  allSupportByAdmin,
  getSingleSupport,
};
