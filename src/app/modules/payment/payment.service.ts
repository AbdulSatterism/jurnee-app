import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';
import { Post } from '../post/post.model';
import { stripe } from './utils';

const createStripePaymentIntent = async (
  userId: string,
  email: string,
  serviceId: string,
  amount: number,
) => {
  const isSeviceExist = await Post.findById(serviceId);

  if (!isSeviceExist) {
    throw new AppError(StatusCodes.BAD_GATEWAY, 'Service is not found!');
  }

  try {
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Service Payment',
            description: `Payment for service ${serviceId}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ];

    //TODO: change success_url and cancel_url later

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/payment/success',

      cancel_url: 'http://localhost:3000/payment/failure',
      metadata: {
        userId,
        serviceId,
      },
      customer_email: email,
    });

    return session.url;
  } catch (error) {
    throw new Error('Failed to create checkout session');
  }
};

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
  createStripePaymentIntent,
};
