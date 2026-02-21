import { Types } from 'mongoose';

export interface IBooking {
  service: Types.ObjectId;
  provider: Types.ObjectId;
  customer: Types.ObjectId;
  scheduleId: Types.ObjectId;
  slotId: Types.ObjectId;
  slotStart: string;
  slotEnd: string;
  serviceDate: Date;
  status: 'PENDING' | 'FAILED' | 'COMPLETED';
  amount: number;
}

export interface IBoost {
  orderId: string;
  service: Types.ObjectId;
  amount: number;
}
