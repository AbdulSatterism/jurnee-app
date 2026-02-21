import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ReviewController } from './review.controller';
import fileUploader from '../../middlewares/fileUploadHandler';

const router = Router();

router.post(
  '/create-review',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024 },
    video: { fileType: 'media', size: 100 * 1024 * 1024 },
  }),
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  ReviewController.createReview,
);

router.get(
  '/post-reviews/:postId',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  ReviewController.allReviewsByPostId,
);

export const ReviewRoutes = router;
