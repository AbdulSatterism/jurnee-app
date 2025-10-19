import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { followerValidation } from './follower.validation';
import { FollowerController } from './follower.controller';

const router = Router();

router.post(
  '/update-follower',
  validateRequest(followerValidation),
  FollowerController.createFollower,
);

export const FollowerRoutes = router;
