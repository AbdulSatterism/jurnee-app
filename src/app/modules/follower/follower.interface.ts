import { Types } from 'mongoose';

export interface IFollower {
  followed: Types.ObjectId;
  follower: Types.ObjectId;
  isFollower?: boolean;
}
