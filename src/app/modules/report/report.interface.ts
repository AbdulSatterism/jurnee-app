import { Types } from 'mongoose';

export interface IReport {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  description: string;
}
