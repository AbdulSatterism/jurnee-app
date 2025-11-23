// /interfaces/payment.interface.ts
import { Types } from 'mongoose';

export interface IPayment {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  transactionId: string;
  amount: number;
}
