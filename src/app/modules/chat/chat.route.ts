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

export const ChatRoutes = router;
