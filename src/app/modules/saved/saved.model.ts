import { model, Schema } from 'mongoose';
import { ISaved } from './saved.interface';

const savedSchema = new Schema<ISaved>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Saved = model('Saved', savedSchema);
