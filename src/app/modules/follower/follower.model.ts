import { model, Schema } from 'mongoose';
import { IFollower } from './follower.interface';

const followerSchema = new Schema<IFollower>(
  {
    followed: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isFollower: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Follower = model<IFollower>('Follower', followerSchema);
