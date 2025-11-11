import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReviewServices } from './review.services';

// const createReport = catchAsync(async (req, res) => {
//   const userId = req.user.id;
//   const result = await ReportService.createReport(userId, req.body);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.CREATED,
//     message: 'Report created successfully',
//     data: result,
//   });
// });

const createReview = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await ReviewServices.createReview(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Review created successfully',
    data: result,
  });
});

const getReviewsByPostId = catchAsync(async (req, res) => {
  const postId = req.params.postId;
  const result = await ReviewServices.getReviewsByPostId(postId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reviews retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

export const ReviewController = {
  createReview,
  getReviewsByPostId,
};
