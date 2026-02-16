import { model, Schema } from 'mongoose';
import { ICommentLike, ILike, IReplyLike } from './like.interface';

const likeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Like = model('Like', likeSchema);

// like for comment and reply like

const commentLikeSchema = new Schema<ICommentLike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
  },
  { timestamps: true, versionKey: false },
);

export const CommentLike = model('CommentLike', commentLikeSchema);

const replyLikeSchema = new Schema<IReplyLike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    replyId: { type: Schema.Types.ObjectId, ref: 'Reply', required: true },
  },
  { timestamps: true, versionKey: false },
);

export const ReplyLike = model('ReplyLike', replyLikeSchema);
