// /interfaces/payment.interface.ts
import { Types } from 'mongoose';

export interface IPayment {
  userId: Types.ObjectId;
  offerId: Types.ObjectId;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  transactionId: string;
  amount: number;
}
