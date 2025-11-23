import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';

const allPayments = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Payment.find()
      .populate([
        { path: 'userId', select: 'name email paypalAccount' },
        { path: 'serviceId', select: 'title amount image' },
      ])
      .skip(skip)
      .limit(size)
      .lean(),
    Payment.countDocuments(),
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

const singlePayment = async (id: string) => {
  const isExist = await Payment.findById(id)
    .populate([
      { path: 'userId', select: 'name email paypalAccount' },
      { path: 'serviceId', select: 'title amount image' },
    ])
    .lean();

  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'this payment does not exist');
  }

  return isExist;
};

export const PaymentService = {
  allPayments,
  singlePayment,
};
