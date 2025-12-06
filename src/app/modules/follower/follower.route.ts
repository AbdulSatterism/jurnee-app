import { Router } from 'express';
import { FollowerController } from './follower.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.post(
  '/follow-unfollow',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  FollowerController.createFollower,
);

router.get(
  '/following/:userId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  FollowerController.getAllFollowers,
);

router.get(
  '/followers/:userId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  FollowerController.getAllFollowing,
);

export const FollowerRoutes = router;
