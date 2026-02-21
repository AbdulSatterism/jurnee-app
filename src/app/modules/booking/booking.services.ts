/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { IBooking, IBoost } from './booking.interface';
import { Booking } from './booking.model';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { Payment } from '../payment/payment.model';
import { User } from '../user/user.model';
import { Post } from '../post/post.model';
import { captureOrder, transferMoney } from '../payment/utils';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { IPayoutConfirmation } from '../../../types/emailTamplate';
import { IPayment } from '../payment/paypment.inteface';

const createBooking = async (userId: string, payload: Partial<IBooking>) => {
  payload.customer = new Types.ObjectId(userId);

  const serviceExists = await Post.findById(payload.service);
  if (!serviceExists) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Service not found');
  }

  payload.provider = serviceExists.author;

  if (!payload.service || !payload.scheduleId || !payload.slotId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Service, scheduleId, and slotId are required',
    );
  }

  // Update service schedule slot to unavailable
  await Post.findByIdAndUpdate(
    payload.service,
    {
      $set: {
        'schedule.$[sch].timeSlots.$[ts].available': false,
      },
    },
    {
      arrayFilters: [
        { 'sch._id': new Types.ObjectId(payload.scheduleId) },
        { 'ts._id': new Types.ObjectId(payload.slotId) },
      ],
      new: true,
    },
  );

  // Update service provider earnings
  await User.findByIdAndUpdate(payload.provider, {
    $inc: { income: payload.amount || 0 },
  });

  // Create booking
  const booking = await Booking.create(payload);

  let result;
  if (booking) {
    result = await Booking.findById(booking._id)
      .populate('service', 'title category ')
      .populate('provider', 'name email address');
  }

  return result;
};

const completeBooking = async (userId: string, bookingId: string) => {
  const session = await Booking.db.startSession();
  try {
    session.startTransaction();

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
    }

    if (booking.status === 'COMPLETED') {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Booking is already completed',
      );
    }

    const serviceProvider = await User.findById(booking.provider).session(
      session,
    );
    if (!serviceProvider) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Service provider not found');
    }

    // get service provider and check have paypal account or not
    if (!serviceProvider.paypalAccount) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Service provider does not have a PayPal account',
      );
    }

    if (userId !== booking.customer.toString()) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to complete this booking',
      );
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'COMPLETED' },
      { new: true, session },
    );

    // Update the post schedule slot to available true again

    await Post.findByIdAndUpdate(
      booking.service,
      {
        $set: {
          'schedule.$[sch].timeSlots.$[ts].available': true,
        },
      },
      {
        arrayFilters: [
          { 'sch._id': new Types.ObjectId(booking.scheduleId) },
          { 'ts._id': new Types.ObjectId(booking.slotId) },
        ],
        new: true,
      },
    );

    // decrease service provider income
    await User.findByIdAndUpdate(
      booking.provider,
      { $inc: { income: -(booking.amount || 0) } },
      { session },
    );

    await session.commitTransaction();

    // perform external side-effects after successful commit
    const payoutAmount = (booking.amount || 0) - 8; // deduct platform fee

    //? for paypal payout
    // await payoutToHost(
    //   serviceProvider.paypalAccount as string,
    //   payoutAmount,
    //   booking.service.toString(),
    //   booking._id?.toString() || '',
    // );
    //? use stripe transfer money method
    await transferMoney({
      amount: payoutAmount,
      description: `Payout for booking ${booking._id}`,
      stripeAccountId: serviceProvider.stripeAccountId as string,
    });

    const emailValues: IPayoutConfirmation = {
      email: serviceProvider.paypalAccount as string,
      amount: payoutAmount,
      status: 'COMPLETED',
      paypalBatchId: 'TRANSFERRED_VIA_STRIPE',
    };

    const hostConfermationMail = emailTemplate.payoutConfirmation(emailValues);
    emailHelper.sendEmail(hostConfermationMail);

    return updatedBooking || booking;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// my upcomming booked services compare with live date

// compare with this time  "serviceDate": "2025-11-26T10:00:00.000Z", to live time

const upcommingBookings = async (
  userId: string,
  query: Record<string, any>,
) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const currentDate = new Date();
  const [result, total] = await Promise.all([
    Booking.find({
      customer: userId,
      serviceDate: { $gt: currentDate },
    })
      .populate('service', 'title category ')
      .populate('provider', 'name email image address')
      .skip(skip)
      .limit(size),
    Booking.countDocuments({
      customer: userId,
      serviceDate: { $gt: currentDate },
    }),
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

// past bookings can be implemented similarly by changing the comparison operator to $lt

const pastBookings = async (userId: string, query: Record<string, any>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const currentDate = new Date();

  const [result, total] = await Promise.all([
    Booking.find({
      customer: userId,
      serviceDate: { $lt: currentDate },
    })
      .populate('service', 'title category ')
      .populate('provider', 'name email image address')
      .skip(skip)
      .limit(size),
    Booking.countDocuments({
      customer: userId,
      serviceDate: { $lt: currentDate },
    }),
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

// also need for how many booking incompleted by service provider

const incompletedBookingsByProvider = async (
  userId: string,
  query: Record<string, any>,
) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Booking.find({
      provider: userId,
      status: { $ne: 'COMPLETED' },
    })
      .populate('service', 'title category ')
      .populate('provider', 'name email image address')
      .skip(skip)
      .limit(size),
    Booking.countDocuments({
      provider: userId,
      status: { $ne: 'COMPLETED' },
    }),
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

// also need completed bookings by service provider

const completedBookingsByProvider = async (
  userId: string,
  query: Record<string, any>,
) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Booking.find({
      provider: userId,
      status: 'COMPLETED',
    })
      .populate('service', 'title category ')
      .populate('provider', 'name email image address')
      .skip(skip)
      .limit(size),
    Booking.countDocuments({
      provider: userId,
      status: 'COMPLETED',
    }),
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

// boost post  after confiramation payment

const boostService = async (userId: string, payload: IBoost) => {
  const serviceExists = await Post.findById(payload.service);

  if (!serviceExists) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Service not found');
  }

  const captureResponse = await captureOrder(payload.orderId);

  if (!captureResponse || captureResponse.status !== 'COMPLETED') {
    throw new AppError(StatusCodes.PAYMENT_REQUIRED, 'Payment not completed');
  }

  // Extract capture details
  const captureId = captureResponse.purchase_units[0].payments.captures[0].id;
  const captureStatus = captureResponse.status;

  // update post boost status true
  serviceExists.boost = true;
  await serviceExists.save();

  //TODO: need to  update payment field
  const payment: IPayment = {
    userId: new Types.ObjectId(userId),
    offerId: serviceExists._id,
    status: captureStatus,
    transactionId: captureId,
    amount: payload.amount,
  };

  await Payment.create(payment);
};

export const BookingService = {
  createBooking,
  completeBooking,
  upcommingBookings,
  pastBookings,
  incompletedBookingsByProvider,
  completedBookingsByProvider,
  boostService,
};
