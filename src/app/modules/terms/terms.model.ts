import { model, Schema } from 'mongoose';
import { TTerms } from './terms.interface';

const settingSchema = new Schema<TTerms>(
  {
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export const Terms = model<TTerms>('Terms', settingSchema);
