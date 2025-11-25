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

export const BookingController = {
  createBooking,
  completeBooking,
};
