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

export const ChatController = {
  createPrivateChat,
};
