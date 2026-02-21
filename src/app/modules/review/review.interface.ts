import { Types } from 'mongoose';

export interface IReview {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  image?: string;
  video?: string;
  rating: number;
  content: string;
}
