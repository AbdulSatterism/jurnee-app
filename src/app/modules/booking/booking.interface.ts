import { Types } from 'mongoose';

export interface IBooking {
  orderId: string;
  service: Types.ObjectId;
  provider: Types.ObjectId;
  customer: Types.ObjectId;
  scheduleId: Types.ObjectId;
  slotId: Types.ObjectId;
  slotStart: string;
  slotEnd: string;
  status: 'PENDING' | 'CANCELLED' | 'COMPLETED';
  amount: number;
}
