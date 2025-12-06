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

const getAllFollowers = catchAsync(async (req, res) => {
  const id = req.params.userId;

  const result = await FollowerService.getAllFollowers(id, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Followers retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const getAllFollowing = catchAsync(async (req, res) => {
  const id = req.params.userId;

  const result = await FollowerService.getAllFollowing(id, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Following retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

export const FollowerController = {
  createFollower,
  getAllFollowers,
  getAllFollowing,
};
