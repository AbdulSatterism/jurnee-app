import { Router } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploader from '../../middlewares/fileUploadHandler';
import { CommentReplyController } from './commentReply.controller';

const router = Router();
router.post(
  '/',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024 },
    video: { fileType: 'videos', size: 100 * 1024 * 1024 },
  }),
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  CommentReplyController.commentReply,
);

export const replyRoutes = router;
