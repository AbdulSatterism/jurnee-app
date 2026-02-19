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

export const OfferController = {
  createOffer,
};
