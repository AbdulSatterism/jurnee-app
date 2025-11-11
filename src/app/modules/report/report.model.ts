import { model, Schema } from 'mongoose';
import { IReport } from './report.interface';

const reportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export const Report = model<IReport>('Report', reportSchema);
