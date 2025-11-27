import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { InterestService } from './interest.service';

const createInterest = catchAsync(async (req, res) => {
  const result = await InterestService.createInterest(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interests fetched successfully',
    data: result,
  });
});

const allInterest = catchAsync(async (req, res) => {
  const result = await InterestService.allInterests(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Interests fetched successfully',
    meta: {
      page: result.meta.page,
      limit: result.meta.limit,
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const interestDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await InterestService.InterestDetails(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'interest details fetched successfully',
    data: result,
  });
});

export const InterestController = {
  createInterest,
  allInterest,
  interestDetails,
};
