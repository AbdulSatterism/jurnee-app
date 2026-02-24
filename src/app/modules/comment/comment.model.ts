import { model, Schema } from 'mongoose';
import { IComment } from './comment.interface';

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    like: { type: Number, required: false, default: 0 },
    content: { type: String, required: false, default: '' },
    image: { type: String, default: '' },
    video: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Comment = model<IComment>('Comment', commentSchema);

// const CommentSchema = new Schema<IComment>(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true,
//     },
//     postId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Post',
//       required: true,
//       index: true,
//     },
//     parentComment: {
//       type: Schema.Types.ObjectId,
//       ref: 'Comment',
//       default: null,
//       index: true,
//     },
//     content: { type: String, trim: true, maxlength: 2000 },
//     image: { type: String },
//     video: { type: String },
//     like: { type: Number, default: 0, min: 0 },
//     replyCount: { type: Number, default: 0, min: 0 },
//   },
//   { timestamps: true },
// );

// // Compound index for top-level pagination
// CommentSchema.index({ postId: 1, parentComment: 1, createdAt: -1 });

// export const Comment = model<IComment>('Comment', CommentSchema);
