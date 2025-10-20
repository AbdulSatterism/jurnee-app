import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FollowerService } from './follower.services';

const createFollower = catchAsync(async (req, res) => {
  const id = req.user.id;

  const result = await FollowerService.createFollower(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.isFollower ? 'Followed' : 'Unfollowed',
    data: result,
  });
});

export const FollowerController = {
  createFollower,
};
