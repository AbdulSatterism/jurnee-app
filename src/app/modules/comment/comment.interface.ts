import { Types } from 'mongoose';

export interface IComment {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  like?: number;
  content?: string;
  image?: string;
  video?: string;
}

// export interface IComment extends Document {
//   userId: Types.ObjectId;
//   postId: Types.ObjectId;
//   parentComment?: Types.ObjectId | null;
//   content?: string;
//   image?: string;
//   video?: string;
//   like: number;
//   replyCount: number;
// }
