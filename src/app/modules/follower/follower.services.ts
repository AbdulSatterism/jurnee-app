import { User } from '../user/user.model';
import { IFollower } from './follower.interface';
import { Follower } from './follower.model';
import { Types } from 'mongoose';

const createFollower = async (id: string, payload: IFollower) => {
  payload.followed = new Types.ObjectId(id);
  const { followed, follower } = payload;

  if (followed.equals(follower)) {
    throw new Error('You cannot follow yourself');
  }

  const existingFollower = await Follower.findOne({ followed, follower });
  if (existingFollower) {
    existingFollower.isFollower = !existingFollower.isFollower;
    await existingFollower.save();
    return existingFollower;
  }

  const result = await Follower.create(payload);
  return result;
};

const getAllFollowers = async (id: string, query: Record<string, unknown>) => {
  const isFollowedExists = await User.findById(id);
  if (!isFollowedExists) {
    throw new Error('User not found');
  }

  const { page, limit } = query || {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 20;
  const skip = (pages - 1) * size;

  const filter = { followed: isFollowedExists._id, isFollower: true };

  const [result, total] = await Promise.all([
    Follower.find(filter)
      .populate('follower', 'name image -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean()
      .exec(),
    Follower.countDocuments(filter),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

const getAllFollowing = async (id: string, query: Record<string, unknown>) => {
  const isFollowedExists = await User.findById(id);
  if (!isFollowedExists) {
    throw new Error('User not found');
  }

  const { page, limit } = query || {};
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 20;
  const skip = (pages - 1) * size;

  const filter = { follower: isFollowedExists._id, isFollower: true };

  const [result, total] = await Promise.all([
    Follower.find(filter)
      .populate('followed', 'name image -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean()
      .exec(),
    Follower.countDocuments(filter),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

export const FollowerService = {
  createFollower,
  getAllFollowers,
  getAllFollowing,
};
