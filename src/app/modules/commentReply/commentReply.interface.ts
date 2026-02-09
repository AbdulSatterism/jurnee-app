import { Types } from 'mongoose';

export interface IReply {
  userId: Types.ObjectId;
  commentId: Types.ObjectId;
  like?: number;
  content?: string;
  image?: string;
  video?: string;
}
