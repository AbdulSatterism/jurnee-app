import { model, Schema } from 'mongoose';
import { ISupport } from './support.interface';

const supportSchema = new Schema<ISupport>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    transactionId: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Support = model('Support', supportSchema);
