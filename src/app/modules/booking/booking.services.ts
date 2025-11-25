import { Types } from 'mongoose';
import { IBooking } from './booking.interface';
import { Booking } from './booking.model';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { Payment } from '../payment/payment.model';
import { User } from '../user/user.model';
import { Post } from '../post/post.model';
import { captureOrder } from '../payment/utils';

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

  if (!payload.orderId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Order ID is required');
  }

  const captureResponse = await captureOrder(payload.orderId);

  if (!captureResponse || captureResponse.status !== 'COMPLETED') {
    throw new AppError(StatusCodes.PAYMENT_REQUIRED, 'Payment not completed');
  }

  // Extract capture details
  const captureId = captureResponse.purchase_units[0].payments.captures[0].id;
  const paypalEmail = captureResponse.payer?.email_address;
  const captureStatus = captureResponse.status;

  // Start a mongoose transaction session to make DB writes atomic
  const session = await Booking.db.startSession();
  try {
    session.startTransaction();

    await User.findByIdAndUpdate(
      userId,
      { paypalAccount: paypalEmail },
      { session },
    );

    // Save payment record within the transaction
    const payment = new Payment({
      userId,
      serviceId: payload.service,
      status: captureStatus,
      transactionId: captureId,
      amount: payload.amount,
    });

    // also update service schedule which is Post collection slot to 'BOOKED' status here

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
          { 'ts._id': new Types.ObjectId(payload.slotId) }, // typo fix if needed: use '_id'
        ],
        new: true,
        session,
      },
    );

    // also update service provider earnings in the user collection

    await User.findByIdAndUpdate(
      payload.provider,
      {
        $inc: { earnings: payload.amount || 0 },
      },
      { session },
    );

    await payment.save({ session });

    // Save booking within the transaction
    const booking = new Booking(payload);
    await booking.save({ session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  return { message: 'Booking created successfully' };
};

// const createBooking = async (userId: string, payload: Partial<IBooking>) => {
//   const result = await Post.findByIdAndUpdate(
//     payload.service,
//     {
//       $set: {
//         'schedule.$[sch].timeSlots.$[ts].available': false,
//       },
//     },
//     {
//       arrayFilters: [
//         { 'sch._id': new Types.ObjectId(payload.scheduleId) },
//         { 'ts._id': new Types.ObjectId(payload.slotId) },
//       ],
//       new: true,
//     },
//   );

//   if (!result) throw new Error('Post not found');

//   return result;
// };

// complete booking when will be completed then update post schedule slot to available true again

// TODO: payout also to service provider when booking is completed and descrease earnings from user and payout to provider

const completeBooking = async (userId: string, bookingId: string) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  if (userId !== booking.customer.toString()) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to complete this booking',
    );
  }

  await Booking.findByIdAndUpdate(
    bookingId,
    { status: 'COMPLETED' },
    { new: true },
  );

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

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

  return booking;
};

export const BookingService = {
  createBooking,
  completeBooking,
};
