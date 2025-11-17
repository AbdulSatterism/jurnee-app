import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SupportService } from './support.services';

const submitSupport = catchAsync(async (req, res) => {
  const result = await SupportService.sumbitSupport(req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Support submitted successfully',
    data: result,
  });
});

const allSuportByAdmin = catchAsync(async (req, res) => {
  const result = await SupportService.allSupportByAdmin(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Supports retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const getSingleSupport = catchAsync(async (req, res) => {
  const result = await SupportService.getSingleSupport(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Support retrieved successfully',
    data: result,
  });
});

export const SupportController = {
  submitSupport,
  allSuportByAdmin,
  getSingleSupport,
};
