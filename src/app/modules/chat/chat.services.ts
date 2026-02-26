/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const search = query.search as string;

  const isUserExist = await User.isExistUserById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Build match condition for search – exclude self-chats
  const matchCondition: any = {
    members: userObjectId,
    $expr: { $gt: [{ $size: '$members' }, 1] }, // ← added
  };

  const chats = await Chat.aggregate([
    { $match: matchCondition },
    // ... (search lookup remains unchanged) ...
    ...(search
      ? [
          {
            $lookup: {
              from: 'users',
              localField: 'members',
              foreignField: '_id',
              as: 'memberDetails',
            },
          },
          {
            $match: {
              'memberDetails.name': {
                $regex: search,
                $options: 'i',
              },
            },
          },
        ]
      : []),
    { $sort: { updatedAt: -1 } },
    { $skip: skip },
    { $limit: limit },

    // Lookup messages – exclude messages sent by current user
    {
      $lookup: {
        from: 'messages',
        let: { chatId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
          { $match: { sender: { $ne: userObjectId } } }, // ← added
          { $sort: { createdAt: -1 } },
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
        lastMessage: { $arrayElemAt: ['$allMessages', 0] },
        unread: {
          $size: {
            $filter: {
              input: '$allMessages',
              as: 'message',
              cond: { $eq: ['$$message.read', false] },
            },
          },
        },
      },
    },
    // ... (rest of the pipeline for populating members remains unchanged) ...
    {
      $lookup: {
        from: 'users',
        let: { memberIds: '$members' },
        pipeline: [
          { $match: { $expr: { $in: ['$_id', '$$memberIds'] } } },
          {
            $match: {
              $expr: { $ne: ['$_id', new mongoose.Types.ObjectId(userId)] },
            },
          },
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
        memberDetails: 0,
      },
    },
  ]);

  // Update total count with self-chat exclusion
  const totalQuery: any = {
    members: userObjectId,
    $expr: { $gt: [{ $size: '$members' }, 1] },
  };

  if (search) {
    const searchChats = await Chat.aggregate([
      { $match: totalQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberDetails',
        },
      },
      {
        $match: {
          'memberDetails.name': {
            $regex: search,
            $options: 'i',
          },
        },
      },
      { $count: 'total' },
    ]);

    const total = searchChats[0]?.total || 0;
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
  }

  const total = await Chat.countDocuments(totalQuery);
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

/*
const chatListWithLastMessage = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = query.search as string;

  const isUserExist = await User.isExistUserById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'user not found');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Build match condition for search
  const matchCondition: any = {
    members: userObjectId,
  };

  const chats = await Chat.aggregate([
    {
      $match: matchCondition,
    },
    // Add search functionality by member name
    ...(search
      ? [
          {
            $lookup: {
              from: 'users',
              localField: 'members',
              foreignField: '_id',
              as: 'memberDetails',
            },
          },
          {
            $match: {
              'memberDetails.name': {
                $regex: search,
                $options: 'i',
              },
            },
          },
        ]
      : []),
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
          { $sort: { createdAt: -1 } },
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

    {
      $lookup: {
        from: 'users',
        let: { memberIds: '$members' },
        pipeline: [
          { $match: { $expr: { $in: ['$_id', '$$memberIds'] } } },
          {
            $match: {
              $expr: { $ne: ['$_id', new mongoose.Types.ObjectId(userId)] },
            },
          },
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
        memberDetails: 0,
      },
    },
  ]);

  // Update total count query to include search filter
  const totalQuery: any = { members: userObjectId };

  if (search) {
    const searchChats = await Chat.aggregate([
      { $match: totalQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberDetails',
        },
      },
      {
        $match: {
          'memberDetails.name': {
            $regex: search,
            $options: 'i',
          },
        },
      },
      { $count: 'total' },
    ]);

    const total = searchChats[0]?.total || 0;
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
  }

  const total = await Chat.countDocuments(totalQuery);
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

*/
const getChatInboxMessages = async (
  userId: string,
  chatId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = query.search as string;

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

  // add search functionality by message content
  // Build match condition for chat and search functionality
  const matchCondition: any = { chat: new mongoose.Types.ObjectId(chatId) };

  if (search) {
    matchCondition.message = { $regex: search, $options: 'i' };
  }
  const messages = await Message.find(matchCondition)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name image _id')
    .populate({
      path: 'offer',
      populate: [
        {
          path: 'service',
          select: 'image title description location category subcategory',
        },
        {
          path: 'provider',
          select: 'name image _id address email',
        },
      ],
    });

  //  read:false make it read:true
  await Message.updateMany({ chat: chatId, read: false }, { read: true });

  // Get total count for pagination
  const total = await Message.countDocuments(matchCondition);
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
