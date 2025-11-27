import { model, Schema } from 'mongoose';

export interface IInterest {
  email: string;
  reason: string;
}

const interestSchema = new Schema<IInterest>(
  {
    email: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true },
);

export const Interest = model<IInterest>('Interest', interestSchema);
