import { Document, Types } from 'mongoose';

export type PaymentStatus = 'PENDING' | 'COMPLETED';

export interface IPayoutRecord extends Document {
  provider: Types.ObjectId;
  card?: string;
  amount: number;
  status?: PaymentStatus;
  service: Types.ObjectId;
}
