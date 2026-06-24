/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayoutRecord } from './payoutRecord.model';

const getAllPayoutRecord = async (query: Record<string, any>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    PayoutRecord.find()
      .populate('provider', 'name email card')
      .sort({ status: -1, createdAt: -1 })
      .skip(skip)
      .limit(size),
    PayoutRecord.countDocuments(),
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

const getPayoutRecordById = async (id: string) => {
  const result = await PayoutRecord.findById(id).populate(
    'provider',
    'name email card',
  );

  return result;
};

const updatePayoutRecordStatus = async (id: string) => {
  const result = await PayoutRecord.findByIdAndUpdate(
    id,
    { status: 'COMPLETED' },
    { new: true, runValidators: true },
  ).populate('provider', 'name email card');

  return result;
};

export const PayoutRecordService = {
  getAllPayoutRecord,
  getPayoutRecordById,
  updatePayoutRecordStatus,
};
