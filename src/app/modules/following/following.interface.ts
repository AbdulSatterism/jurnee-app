import { Types } from 'mongoose';

export interface IFollowing {
  user: Types.ObjectId;
  following: Types.ObjectId;
  isFollowing?: boolean;
}
