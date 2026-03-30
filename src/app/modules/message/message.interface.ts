import { Types } from 'mongoose';

export interface IMessage {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  read?: boolean;
  message?: string;
  video?: string;
  image?: string;
  offer?: Types.ObjectId;
  type?: 'text' | 'offer' | 'quote' | 'media';
  isOwner?: boolean;
}
