import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { blockServices } from './block.services';

const blockUser = catchAsync(async (req, res) => {
  const blockedById = req.user.id;
  const blockedUserId = req.params.id;

  const result = await blockServices.blockUser(blockedById, blockedUserId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User blocked successfully',
    data: result,
  });
});

export const blockController = {
  blockUser,
};
