import { Router } from 'express';
import { LikeController } from './like.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.post(
  '/like-toggle',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  LikeController.likeToggle,
);

router.post(
  '/comment',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  LikeController.commentLikeToggle,
);
router.post(
  '/reply',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  LikeController.replyLikeToggle,
);

export const LikeRoutes = router;
