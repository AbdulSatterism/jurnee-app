import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FollowerService } from './follower.services';

const createFollower = catchAsync(async (req, res) => {
  const body = {
    followed: req.user.id,
    ...req.body,
  };

  await FollowerService.createFollower(body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Followed.',
  });
});

export const FollowerController = {
  createFollower,
};
