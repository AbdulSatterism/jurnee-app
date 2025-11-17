import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { NotificationController } from './notifications.controller';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  NotificationController.allNotificationBySpecificUser,
);

router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  NotificationController.singleNotification,
);

router.delete(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  NotificationController.deleteNotification,
);

export const NotificationRoutes = router;
