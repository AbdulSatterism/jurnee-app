import { Types } from 'mongoose';

export type OfferStatus = 'draft' | 'accepted' | 'rejected';

export interface IOfferItem {
  title?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface IOffer {
  chat: Types.ObjectId;
  provider: Types.ObjectId;
  customer: Types.ObjectId;
  service: Types.ObjectId;
  description?: string;
  date: Date;
  from: string;
  to: string;
  items: IOfferItem[];
  discount?: number;
  status: OfferStatus;
}
