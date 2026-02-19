import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OfferService } from './offer.services';

const createOffer = catchAsync(async (req, res) => {
  const result = await OfferService.createOffer(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Offer created successfully',
    data: result,
  });
});

const acceptOffer = catchAsync(async (req, res) => {
  const { offerId, customerId } = req.body;

  const result = await OfferService.acceptOffer(offerId, customerId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Offer accepted successfully',
    data: result,
  });
});

const rejectOffer = catchAsync(async (req, res) => {
  const { offerId, customerId } = req.body;

  const result = await OfferService.rejectOffer(offerId, customerId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Offer rejected successfully',
    data: result,
  });
});

export const OfferController = {
  createOffer,
  acceptOffer,
  rejectOffer,
};
