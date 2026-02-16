import { Router } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { CommentController } from './comment.controller';
import fileUploader from '../../middlewares/fileUploadHandler';

const router = Router();
router.post(
  '/',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024 },
    video: { fileType: 'videos', size: 100 * 1024 * 1024 },
  }),
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  CommentController.createComment,
);

router.get(
  '/:postId',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  CommentController.allCommentsByPostId,
);

// router.post(
//   '/like/:id',
//   auth(USER_ROLES.ADMIN, USER_ROLES.USER),
//   CommentController.commentReplyLike,
// );

export const CommentRoutes = router;
