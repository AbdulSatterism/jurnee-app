import { Types } from 'mongoose';

export interface ISupport {
  name: string;
  email: string;
  description: string;
  user: Types.ObjectId;
  subject: string;
  transactionId: string;
}
