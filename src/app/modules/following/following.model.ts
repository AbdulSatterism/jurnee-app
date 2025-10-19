import { model, Schema } from 'mongoose';
import { IFollowing } from './following.interface';

const followingSchema = new Schema<IFollowing>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isFollowing: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Following = model<IFollowing>('Following', followingSchema);
