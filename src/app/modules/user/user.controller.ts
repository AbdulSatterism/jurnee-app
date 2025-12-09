/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import getFilePath from '../../../shared/getFilePath';
import { Cache } from '../../../lib/cache';
import AppError from '../../errors/AppError';
import { getStripeAccountId, stripe } from '../payment/utils';
import { User } from './user.model';

const createUser = catchAsync(async (req, res) => {
  await UserService.createUserFromDb(req.body);

  // await Cache.delByPattern('users:*');

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Please check your email to verify your account.',
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all user retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const getUserProfile = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await UserService.updateProfileToDB(user, req.body);

  // await Cache.delByPattern('users:*');

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await UserService.getSingleUser(req.user.id, req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User retrived successfully',
    data: result,
  });
});

// search by phone number
const searchByPhone = catchAsync(async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const userId = req?.user?.id;

  const result = await UserService.searchUserByPhone(
    searchTerm as string,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'get user by searching phone number',
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const result = await UserService.deleteUser(req.user.id);

  // await Cache.delByPattern('users:*');

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

const connectStripeAccount = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (!user?.stripeAccountId) {
    Object.assign(user, {
      stripeAccountId: await getStripeAccountId(user.email),
    });

    await user.save();
  }

  if (user.isStripeConnected) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Stripe account already connected',
    );
  }

  const { url } = await stripe.accountLinks.create({
    account: user.stripeAccountId!,
    refresh_url: `https://mtjz2v20-3001.inc1.devtunnels.ms/not-found`,
    //TODO: change return url
    return_url: `https://mtjz2v20-3001.inc1.devtunnels.ms/api/v1/payments/stripe/connect?userId=${user.id}`,
    type: 'account_onboarding',
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Stripe connect link created successfully!',
    data: {
      url,
    },
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  searchByPhone,
  getSingleUser,
  getAllUser,
  deleteUser,
  connectStripeAccount,
};
