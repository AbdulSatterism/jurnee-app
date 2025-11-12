import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ReviewController } from './review.controller';

const router = Router();

router.post(
  '/create-review',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  ReviewController.createReview,
);

router.get(
  '/post-reviews/:postId',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  ReviewController.allReviewsByPostId,
);

export const ReviewRoutes = router;
