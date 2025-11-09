import { model, Schema } from 'mongoose';
import { ILike } from './like.interface';

const likeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Like = model('Like', likeSchema);
