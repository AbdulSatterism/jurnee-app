import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChatServices } from '../chat/chat.services';

const createPrivateChat = catchAsync(async (req, res) => {
  const { member } = req.body;
  const creatorId = req?.user?.id;
  const result = await ChatServices.createPrivateChat(creatorId, member);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'chat created successfully',
    data: result,
  });
});

const chatListWithLastMessage = catchAsync(async (req, res) => {
  const userId = req?.user?.id;
  const result = await ChatServices.chatListWithLastMessage(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Fetched chat list with last message successfully',
    meta: {
      page: result.meta.page,
      limit: result.meta.limit,
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const getChatInboxMessages = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;
  const result = await ChatServices.getChatInboxMessages(
    userId,
    chatId,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Got inbox messages successfully',
    meta: {
      page: result.meta.page,
      limit: result.meta.limit,
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const deleteInboxMessage = catchAsync(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;
  const result = await ChatServices.deleteInboxMessage(messageId, userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'deleted successfully',
    data: result,
  });
});

export const ChatController = {
  createPrivateChat,
  chatListWithLastMessage,
  getChatInboxMessages,
  deleteInboxMessage,
};
