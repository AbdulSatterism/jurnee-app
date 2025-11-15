import { model, Schema } from 'mongoose';
import { IChat } from './chat.interface';

const chatSchema = new Schema<IChat>(
  {
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

// Ensure private chats have unique pairings of members
chatSchema.index({ 'members.0': 1, 'members.1': 1 }, { unique: true });

export const Chat = model<IChat>('Chat', chatSchema);
