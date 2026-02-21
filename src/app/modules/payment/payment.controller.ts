/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentService } from './payment.service';
import { stripe } from './utils';
import { User } from '../user/user.model';
import config from '../../../config';
import { Offer } from '../offer/offer.model';
import AppError from '../../errors/AppError';

const createStripePaymentIntent = catchAsync(async (req, res) => {
  const userId: string = req.user.id;
  const email: string = req.user.email;

  const { offerId, amount } = req.body;

  const isOfferExist = await Offer.findById(offerId);

  if (!isOfferExist) {
    throw new AppError(StatusCodes.BAD_GATEWAY, 'Offer is not found!');
  }

  if (isOfferExist.status === 'rejected') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'offer already rejected, need to create a new offer',
    );
  }

  const customer = await User.findById(isOfferExist.customer);
  if (!customer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'customer not found');
  }

  if (isOfferExist.customer.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'only customers can accept offers',
    );
  }

  try {
    const sessionUrl = await PaymentService.createStripePaymentIntent(
      userId,
      email,
      offerId,
      amount,
    );
    res.status(200).json({ url: sessionUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

// const createPayment = catchAsync(async (req, res) => {
//   const userId = req?.user?.id;

//   const { serviceId, offerId, amount } = req.body;

//   // Validate input
//   if (!serviceId) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'missing serviceId');
//   }
//   if (!userId) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'missing  userId');
//   }
//   if (!offerId) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'missing offerId');
//   }

//   if (!amount) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'missing amount');
//   }

//   // Get PayPal payment link
//   const paymentUrl = await createPaymentIntent(serviceId, amount);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: 'payment intent created successfully',
//     data: paymentUrl,
//   });
// });

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

const paymentStripeWebhookController = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.payment.stripe_webhook_secret as string,
    );

    await PaymentService.handleStripeWebhookService(event);

    res.status(200).send({ received: true });
  } catch (err: any) {
    {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
});

export const PaymentController = {
  allPayment,
  singlePayment,
  stripeConnect,
  createStripePaymentIntent,
  paymentStripeWebhookController,
};
