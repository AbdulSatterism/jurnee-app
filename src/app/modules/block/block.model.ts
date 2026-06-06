// block.model.ts
import { Schema, model } from 'mongoose';
import { TBlock } from './block.interface';

const blockSchema = new Schema<TBlock>(
  {
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blockedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['blocked', 'unblocked'],
      default: 'blocked',
    },
  },
  {
    timestamps: true,
  },
);

blockSchema.index({ blockedBy: 1, blockedUser: 1 }, { unique: true });

export const Block = model<TBlock>('Block', blockSchema);
