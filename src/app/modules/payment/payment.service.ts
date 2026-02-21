import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';
import { stripe } from './utils';
import Stripe from 'stripe';
import { logger } from '../../../shared/logger';
import { Offer } from '../offer/offer.model';
import { User } from '../user/user.model';

const createStripePaymentIntent = async (
  userId: string,
  email: string,
  offerId: string,
  amount: number,
) => {
  const isOfferExist = await Offer.findById(offerId);

  if (!isOfferExist) {
    throw new AppError(StatusCodes.BAD_GATEWAY, 'Offer is not found!');
  }

  try {
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Offer Payment',
            description: `Payment for offer ${offerId}`,
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
      success_url: 'https://joinjurnee.com/', //todo: change this later

      cancel_url: 'https://joinjurnee.com/', //todo: change this later
      metadata: {
        userId,
        offerId,
        providerId: isOfferExist.provider.toString(),
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

  const [result, total, totalAmount] = await Promise.all([
    Payment.find()
      .populate([
        { path: 'userId', select: 'name email ' },
        { path: 'offerId', select: 'title amount image' },
      ])
      .skip(skip)
      .limit(size)
      .lean(),
    Payment.countDocuments(),
    Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: {
      data: result,
      totalAmount: totalAmount[0]?.totalAmount || 0,
    },

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
      { path: 'userId', select: 'name email' },
      { path: 'offerId', select: 'title amount image' },
    ])
    .lean();

  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'this payment does not exist');
  }

  return isExist;
};

const handleStripeWebhookService = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const { amount_total, metadata, payment_intent } = session;
      const userId = metadata?.userId;
      const offerId = metadata?.offerId;
      const providerId = metadata?.providerId;

      const amountTotal = (amount_total ?? 0) / 100;

      // Save payment record within the transaction
      const payment = new Payment({
        userId,
        offerId,
        status: 'COMPLETED',
        transactionId: payment_intent,
        amount: amountTotal,
      });

      await payment.save();

      //* update offer status
      await Offer.findByIdAndUpdate(
        offerId,
        { status: 'accepted' },
        { new: true },
      );

      // update provider income

      await User.findByIdAndUpdate(
        providerId,
        { $inc: { income: amountTotal } },
        { new: true },
      );

      break;
    }

    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { client_secret } = session;
      const payment = await Payment.findOne({ client_secret });
      if (payment) {
        payment.status = 'FAILED';
        await payment.save();
      }

      const offerId = session?.metadata?.offerId;
      //* update offer status if failed
      await Offer.findByIdAndUpdate(
        offerId,
        { status: 'failed' },
        { new: true },
      );

      break;
    }

    default:
      logger.warn(`Unhandled event type ${event.type}`);
  }
};

export const PaymentService = {
  allPayments,
  singlePayment,
  createStripePaymentIntent,
  handleStripeWebhookService,
};
