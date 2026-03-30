import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ChatController } from './chat.controller';
import fileUploader from '../../middlewares/fileUploadHandler';

const router = Router();

router.post(
  '/create',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  ChatController.createPrivateChat,
);

router.post(
  '/upload',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  fileUploader({
    image: {
      fileType: 'images',
      size: 50 * 1024 * 1024,
    },
    video: {
      fileType: 'videos',
      size: 1000 * 1024 * 1024,
    },
  }),
  (req, res) => {
    const media_url = req.body.video || req.body.image || '';
    res.status(200).json({
      media_url,
    });
  },
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
