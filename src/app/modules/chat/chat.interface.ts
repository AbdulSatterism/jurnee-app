import { Types } from 'mongoose';

export interface IChat {
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
}
