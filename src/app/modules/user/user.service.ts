/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import generateOTP from '../../../util/generateOTP';

import { IUser } from './user.interface';
import { User } from './user.model';

import AppError from '../../errors/AppError';
import { deleteFromCloudinary } from '../../../helpers/cloudinaryHelper';
import { Types } from 'mongoose';
import { Follower } from '../follower/follower.model';
import { Post } from '../post/post.model';
import { Saved } from '../saved/saved.model';
import { Report } from '../report/report.model';

const createUserFromDb = async (payload: IUser) => {
  payload.role = USER_ROLES.USER;
  const result = await User.create(payload);

  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const otp = generateOTP();
  const emailValues = {
    name: result.name || 'User',
    otp,
    email: result.email,
  };

  const accountEmailTemplate = emailTemplate.createAccount(emailValues);
  emailHelper.sendEmail(accountEmailTemplate);

  // Update user with authentication details
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 20 * 60000),
  };
  const updatedUser = await User.findOneAndUpdate(
    { _id: result._id },
    { $set: { authentication } },
  );
  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found for update');
  }

  return result;
};

const getAllUsers = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  let data: any[] = [];
  let total = 0;

  if (query.searchTerm) {
    const { searchTerm } = query as { searchTerm: string };
    data = await User.find({
      $or: [
        { phone: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } },
      ],
      _id: { $ne: userId },
    }).lean();
    total = data.length;
  } else {
    [data, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(size).lean(),
      User.countDocuments(),
    ]);
  }

  const totalPage = Math.ceil(total / size);

  return {
    data: data,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Blog not found');
  }

  if (!isExistUser.verified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account first',
    );
  }

  if (payload.image && isExistUser.image) {
    await deleteFromCloudinary(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getSingleUser = async (loginUser: string, userId: string) => {
  const loginUserId = new Types.ObjectId(loginUser);
  const targetUserId = new Types.ObjectId(userId);

  const [user, followRelation] = await Promise.all([
    User.findById(targetUserId).lean(), // target profile user
    Follower.findOne({
      followed: loginUserId, // me
      follower: targetUserId, // the user I'm exploring
    }).lean(),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  // Default: not following
  let isFollow = false;

  // If I'm checking my own profile, keep isFollow = false
  if (!loginUserId.equals(targetUserId)) {
    if (followRelation) {
      isFollow = followRelation.isFollower === true;
    }
  }

  // Attach `isFollow` field to response
  return {
    ...user,
    isFollow,
  };
};

// search user by phone
const searchUserByPhone = async (searchTerm: string, userId: string) => {
  let result;

  if (searchTerm) {
    result = await User.find({
      $or: [
        { phone: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
      _id: { $ne: userId },
    });
  } else {
    result = await User.find({ _id: { $ne: userId } }).limit(10);
  }

  return result;
};

const deleteUser = async (id: string) => {
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User doesn't exist!");
  }
  const result = await User.findByIdAndDelete(id);
  return result;
};

const userProfileWithAllData = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const user = await User.findById(userId).lean();

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [
    posts,
    totalPosts,
    savedPostsData,
    attendingEventsData,
    followers,
    following,
    totalSavedPosts,
    totalAttendingEvents,
  ] = await Promise.all([
    Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Post.countDocuments({ author: user._id }),
    Saved.find({ userId: user._id })
      .populate('postId', 'name')
      .populate('userId', 'name email image')
      .skip(skip)
      .limit(size)
      .lean(),
    Post.find({ attenders: user._id }).skip(skip).limit(size).lean(),
    Follower.countDocuments({ followed: user._id, isFollower: true }),
    Follower.countDocuments({ follower: user._id, isFollower: true }),
    Saved.countDocuments({ userId: user._id }),
    Post.countDocuments({ attenders: user._id }),
  ]);

  const createPaginationMeta = (total: number) => ({
    page: pages,
    limit: size,
    totalPage: Math.ceil(total / size),
    total,
  });

  return {
    followers,
    following,
    posts: {
      data: posts,
      meta: createPaginationMeta(totalPosts),
    },
    savedPosts: {
      data: savedPostsData,
      meta: createPaginationMeta(totalSavedPosts),
    },
    attendingEvents: {
      data: attendingEventsData,
      meta: createPaginationMeta(totalAttendingEvents),
    },
  };
};

// total user count, total service count, total event count, total deal count, total report count ( post collection has  'event' | 'service' | 'alert' | 'deal' category) and report collection and gimme recent users with search by name or email or phone

const getDashboardStats = async (query: Record<string, unknown>) => {
  const { searchTerm } = query as { searchTerm: string };
  const [
    totalUsers,
    totalServices,
    totalEvents,
    totalDeals,
    recentUsers,
    totalReports,
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments({ category: 'service' }),
    Post.countDocuments({ category: 'event' }),
    Post.countDocuments({ category: 'deal' }),
    Report.countDocuments(),
    User.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return {
    totalUsers,
    totalServices,
    totalEvents,
    totalDeals,
    totalReports,
    recentUsers,
  };
};

export const UserService = {
  createUserFromDb,
  getUserProfileFromDB,
  updateProfileToDB,
  getSingleUser,
  searchUserByPhone,
  getAllUsers,
  deleteUser,
  userProfileWithAllData,
  getDashboardStats,
};
