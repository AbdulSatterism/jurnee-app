import { IFollower } from './follower.interface';
import { Follower } from './follower.model';
import { Types } from 'mongoose';

const createFollower = async (id: string, payload: IFollower) => {
  payload.followed = new Types.ObjectId(id);
  const { followed, follower } = payload;

  // here have some business logic
  /* 
  . followed is  some one follow him
  . follower is  some one who follow her/him
  . create a relationship between followed and follower
  . isFollower by default is true
  . if this follower already followed this followed then if follow again just update isFollower true to false or false to true
  . also check that followed and follower should not be same
  */

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

export const FollowerService = {
  createFollower,
};
