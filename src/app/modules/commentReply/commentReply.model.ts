import { model, Schema } from 'mongoose';
import { IReply } from './commentReply.interface';

const replySchema = new Schema<IReply>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
    like: { type: Number, default: 0 },
    content: { type: String, default: '' },
    image: { type: String, default: '' },
    video: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Reply = model<IReply>('Reply', replySchema);
