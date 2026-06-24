import { model, Schema } from 'mongoose';
import { IPayoutRecord } from './payoutRecord.interface';

const payoutRecordSchema = new Schema<IPayoutRecord>(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    card: {
      type: String,
      required: false,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED'],
      default: 'PENDING',
      required: false,
    },

    service: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const PayoutRecord = model('PayoutRecord', payoutRecordSchema);
