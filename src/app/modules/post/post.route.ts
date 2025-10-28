import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PostController } from './post.controller';
import validateRequest from '../../middlewares/validateRequest';
import { PostValidation } from './post.validation';
import fileUploader from '../../middlewares/fileUploadHandler';

const router = Router();

router.post(
  '/event',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024, maxCount: 1 },
    media: { fileType: 'media', size: 100 * 1024 * 1024, maxCount: 10 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PostValidation.eventValidation),
  PostController.createEvent,
);

export const PostRoute = router;
