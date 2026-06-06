import { Types } from 'mongoose';

export type TBlockStatus = 'blocked' | 'unblocked';

export interface TBlock {
  blockedBy: Types.ObjectId;
  blockedUser: Types.ObjectId;
  status: TBlockStatus;
}
