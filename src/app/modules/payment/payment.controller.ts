import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentService } from './payment.service';
import AppError from '../../errors/AppError';
import { createPaymentIntent } from './utils';
import { User } from '../user/user.model';

const createPayment = catchAsync(async (req, res) => {
  const userId = req?.user?.id;

  const { serviceId, amount } = req.body;

  // Validate input
  if (!serviceId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'missing serviceId');
  }
  if (!userId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'missing  userId');
  }

  if (!amount) {
    throw new AppError(StatusCodes.NOT_FOUND, 'missing amount');
  }

  // Get PayPal payment link
  const paymentUrl = await createPaymentIntent(serviceId, amount);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'payment intent created successfully',
    data: paymentUrl,
  });
});

const allPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.allPayments(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all payment returns successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const singlePayment = catchAsync(async (req, res) => {
  const result = await PaymentService.singlePayment(req?.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'user payment returns successfully',
    data: result,
  });
});

const stripeConnect = catchAsync(async ({ query }, res) => {
  await User.updateOne(
    {
      _id: query.userId,
    },
    {
      $set: {
        isStripeConnected: true,
      },
    },
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Stripe account connected successfully',
  });
});

export const PaymentController = {
  allPayment,
  singlePayment,
  createPayment,
  stripeConnect,
};
