import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BookingService } from './booking.services';

const createBooking = catchAsync(async (req, res) => {
  const result = await BookingService.createBooking(req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'service booked successfully',
    data: result,
  });
});

const completeBooking = catchAsync(async (req, res) => {
  const result = await BookingService.completeBooking(
    req.user.id,
    req.params.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Booking completed successfully',
    data: result,
  });
});

const upcommingBookings = catchAsync(async (req, res) => {
  const result = await BookingService.upcommingBookings(req.user.id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Upcoming bookings retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const pastBookings = catchAsync(async (req, res) => {
  const result = await BookingService.pastBookings(req.user.id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Past bookings retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const incompletedBookingsByProvider = catchAsync(async (req, res) => {
  const result = await BookingService.incompletedBookingsByProvider(
    req.user.id,
    req.query,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Incompleted upcoming bookings ',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const completedBookingsByProvider = catchAsync(async (req, res) => {
  const result = await BookingService.completedBookingsByProvider(
    req.user.id,
    req.query,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Completed bookings',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

export const BookingController = {
  createBooking,
  completeBooking,
  upcommingBookings,
  pastBookings,
  incompletedBookingsByProvider,
  completedBookingsByProvider,
};
