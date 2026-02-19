import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sortMembers from '../../../util/sortMembers';
import mongoose from 'mongoose';
import { Chat } from './chat.model';
import { User } from '../user/user.model';
import { IChat } from './chat.interface';
import { Notification } from '../notifications/notifications.model';
import { Message } from '../message/message.model';

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
  }).populate('members', '_id name image');

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

  const updatedChat = await chat.populate('members', '_id name image');

  // Create a notification for the participant
  await Notification.create({
    content: `New chat has been started with ${creator?.name}`,
    senderId: creatorId,
    receiverId: participantId,
  });

  return updatedChat;
};

const chatListWithLastMessage = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // ✅ Check user existence
  const isUserExist = await User.isExistUserById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const chats = await Chat.aggregate([
    {
      $match: {
        members: userObjectId,
      },
    },
    {
      $sort: { updatedAt: -1 },
    },
    { $skip: skip },
    { $limit: limit },

    // Populate messages

    {
      $lookup: {
        from: 'messages',
        let: { chatId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
          { $sort: { createdAt: -1 } }, // Sort messages by createdAt (latest first)
          {
            $project: {
              message: 1,
              read: 1,
              _id: 0,
            },
          },
        ],
        as: 'allMessages',
      },
    },
    {
      $addFields: {
        lastMessage: { $arrayElemAt: ['$allMessages', 0] }, // Get the last message
        unread: {
          $size: {
            $filter: {
              input: '$allMessages',
              as: 'message',
              cond: { $eq: ['$$message.read', false] }, // Filter unread messages
            },
          },
        },
      },
    },

    // ✅ Populate members
    {
      $lookup: {
        from: 'users',
        let: { memberIds: '$members' },
        pipeline: [
          { $match: { $expr: { $in: ['$_id', '$$memberIds'] } } },
          {
            $project: {
              _id: 1,
              name: 1,
              image: 1,
            },
          },
        ],
        as: 'populatedMembers',
      },
    },
    {
      $addFields: {
        members: '$populatedMembers',
      },
    },
    {
      $project: {
        populatedMembers: 0,
        allMessages: 0,
      },
    },
  ]);

  // ✅ Pagination
  const total = await Chat.countDocuments({
    members: userObjectId,
  });
  const totalPage = Math.ceil(total / limit);

  return {
    data: chats,
    meta: {
      page,
      limit,
      totalPage,
      total,
    },
  };
};

const getChatInboxMessages = async (
  userId: string,
  chatId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const isUserExist = await User.isExistUserById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found');
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Chat not found');
  }

  const isMember = chat.members.some(
    (member: mongoose.Types.ObjectId) => member.toString() === userId,
  );
  if (!isMember) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not a member of this chat',
    );
  }

  // Fetch messages for the chat with pagination
  const messages = await Message.find({ chat: chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name image _id')
    .populate({
      path: 'offer',
      populate: {
        path: 'service',
        select: 'image title description location category subcategory',
      },
    });

  //  read:false make it read:true
  await Message.updateMany({ chat: chatId, read: false }, { read: true });

  // Get total count for pagination
  const total = await Message.countDocuments({ chat: chatId });
  const totalPage = Math.ceil(total / limit);

  return {
    data: messages,
    meta: {
      page,
      limit,
      totalPage,
      total,
    },
  };
};

// delete inbox message by the message id and if this id  matched with message sender

const deleteInboxMessage = async (messageId: string, userId: string) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Message not found');
  }
  if (message.sender.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not allowed to delete this message',
    );
  }
  await Message.findByIdAndDelete(messageId);
  return message;
};

export const ChatServices = {
  createPrivateChat,
  chatListWithLastMessage,
  getChatInboxMessages,
  deleteInboxMessage,
};
