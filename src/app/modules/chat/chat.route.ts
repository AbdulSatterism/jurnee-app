import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ChatController } from './chat.controller';

const router = Router();

router.post(
  '/create',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  ChatController.createPrivateChat,
);

router.get(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  ChatController.chatListWithLastMessage,
);

router.get(
  '/inbox/:chatId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  ChatController.getChatInboxMessages,
);

router.delete(
  '/:messageId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  ChatController.deleteInboxMessage,
);

export const ChatRoutes = router;
