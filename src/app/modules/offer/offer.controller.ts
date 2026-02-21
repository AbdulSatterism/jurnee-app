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

const upcomingOffers = catchAsync(async (req, res) => {
  const result = await OfferService.upcomingOffers(req.user.id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Upcoming offers retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});
const pastOffers = catchAsync(async (req, res) => {
  const result = await OfferService.pastOffers(req.user.id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Past offers retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const incompletedOffersByProvider = catchAsync(async (req, res) => {
  const result = await OfferService.incompletedOffersByProvider(
    req.user.id,
    req.query,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Incompleted offers by provider retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const completedOffersByProvider = catchAsync(async (req, res) => {
  const result = await OfferService.completedOffersByProvider(
    req.user.id,
    req.query,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Completed offers by provider retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

export const OfferController = {
  createOffer,
  acceptOffer,
  rejectOffer,
  upcomingOffers,
  pastOffers,
  incompletedOffersByProvider,
  completedOffersByProvider,
};
