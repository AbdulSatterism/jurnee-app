import { Types } from 'mongoose';

export interface ILike {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
}
