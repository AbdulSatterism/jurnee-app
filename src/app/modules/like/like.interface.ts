import { Types } from 'mongoose';

export interface ILike {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
}

// like for comment and reply like

export interface ICommentLike {
  userId: Types.ObjectId;
  commentId?: Types.ObjectId;
}

export interface IReplyLike {
  userId: Types.ObjectId;
  replyId?: Types.ObjectId;
}
