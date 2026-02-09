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
