import { model, Schema } from 'mongoose';
import { IReview } from './review.interface';

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    image: { type: String, required: false, default: '' },
    video: { type: String, required: false, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export const Review = model<IReview>('Review', reviewSchema);
