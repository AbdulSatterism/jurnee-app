/* eslint-disable @typescript-eslint/no-explicit-any */
import { IInterest, Interest } from './interest.model';

const createInterest = async (payload: IInterest) => {
  const result = await Interest.create(payload);

  return result;
};

const allInterests = async (query: Record<string, any>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Interest.find().skip(skip).limit(size),
    Interest.countDocuments(),
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

const InterestDetails = async (id: string) => {
  const result = await Interest.findById(id);
  return result;
};

export const InterestService = {
  createInterest,
  allInterests,
  InterestDetails,
};
