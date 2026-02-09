import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CommentReplyService } from './commentReply.services';

const commentReply = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await CommentReplyService.commnentReply(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'reply created successfully',
    data: result,
  });
});

export const CommentReplyController = {
  commentReply,
};
