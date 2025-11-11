import { Types } from 'mongoose';

export interface IReview {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  rating: number;
  content: string;
}
