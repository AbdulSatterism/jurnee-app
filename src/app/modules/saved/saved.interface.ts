import { Types } from 'mongoose';

export interface ISaved {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
}
