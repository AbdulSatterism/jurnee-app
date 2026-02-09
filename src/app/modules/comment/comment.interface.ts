import { Types } from 'mongoose';

export interface IComment {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  like?: number;
  content?: string;
  image?: string;
  video?: string;
}
