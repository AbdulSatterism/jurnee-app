import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CommentServices } from './comment.services';

const createComment = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await CommentServices.createComment(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'comment created successfully',
    data: result,
  });
});

const allCommentsByPostId = catchAsync(async (req, res) => {
  const postId = req.params.postId;
  const result = await CommentServices.allCommentsByPostId(postId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All comments retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

export const CommentController = {
  createComment,
  allCommentsByPostId,
};
