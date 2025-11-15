import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sortMembers from '../../../util/sortMembers';
import mongoose from 'mongoose';
import { Chat } from './chat.model';
import { User } from '../user/user.model';
import { IChat } from './chat.interface';
import { Notification } from '../notifications/notifications.model';

const createPrivateChat = async (creatorId: string, participantId: string) => {
  if (creatorId === participantId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Cannot create a chat with yourself.',
    );
  }

  // Sort the member pair to enforce consistent ordering
  const [a, b] = sortMembers(creatorId, participantId);
  const objectIdA = new mongoose.Types.ObjectId(a);
  const objectIdB = new mongoose.Types.ObjectId(b);

  // Try to find existing chat (members are stored in sorted order)
  const existingChat = await Chat.findOne({
    'members.0': objectIdA,
    'members.1': objectIdB,
  });

  if (existingChat) return existingChat;

  // Verify both users exist before creating chat
  const [creator, participant] = await Promise.all([
    User.findById(creatorId),
    User.findById(participantId),
  ]);

  if (!creator || !participant) {
    throw new AppError(StatusCodes.NOT_FOUND, 'One or both users not found');
  }

  const chat = await Chat.create({
    members: [objectIdA, objectIdB],
    createdBy: new mongoose.Types.ObjectId(creatorId),
  } as IChat);

  // Create a notification for the participant
  await Notification.create({
    content: `New chat has been started with ${creator?.name}`,
    senderId: creatorId,
    receiverId: participantId,
  });

  return chat;
};

export const ChatServices = {
  createPrivateChat,
};
