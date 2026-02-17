import { model, Schema } from 'mongoose';
import { IOffer, IOfferItem } from './offer.interface';

const OfferItemSchema = new Schema<IOfferItem>({
  title: { type: String, required: false, default: '' },
  quantity: { type: Number, required: false, default: 0 },
  unitPrice: { type: Number, required: false, default: 0 },
});

const OfferSchema = new Schema<IOffer>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    description: { type: String, default: '', required: false },

    date: { type: Date, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },

    items: { type: [OfferItemSchema], required: false, default: [] },
    discount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'accepted', 'rejected'],
      default: 'draft',
    },
  },
  { timestamps: true },
);

export const Offer = model<IOffer>('Offer', OfferSchema);
