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
  PostController.createPost,
);

router.post(
  '/deal',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024, maxCount: 1 },
    media: { fileType: 'media', size: 100 * 1024 * 1024, maxCount: 6 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PostValidation.dealValidation),
  PostController.createPost,
);

router.post(
  '/service/food-beverage',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024, maxCount: 1 },
    media: { fileType: 'media', size: 100 * 1024 * 1024, maxCount: 6 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PostValidation.foodBeverageServiceValidation),
  PostController.createPost,
);

router.post(
  '/service/entertainment',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024, maxCount: 1 },
    media: { fileType: 'media', size: 100 * 1024 * 1024, maxCount: 6 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PostValidation.entertainmentServiceValidation),
  PostController.createPost,
);

router.post(
  '/service/home',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024, maxCount: 1 },
    media: { fileType: 'media', size: 100 * 1024 * 1024, maxCount: 6 },
    licenses: { fileType: 'licenses', size: 20 * 1024 * 1024, maxCount: 1 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PostValidation.homeServiceValidation),
  PostController.createPost,
);

router.post(
  '/service/venue',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024, maxCount: 1 },
    media: { fileType: 'media', size: 100 * 1024 * 1024, maxCount: 6 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PostValidation.venueServiceValidation),
  PostController.createPost,
);

router.post(
  '/alert/missing-person',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024, maxCount: 1 },
    media: { fileType: 'media', size: 100 * 1024 * 1024, maxCount: 6 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PostValidation.alertMissingPersonValidation),
  PostController.createPost,
);

router.post(
  '/alert/others',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024, maxCount: 1 },
    media: { fileType: 'media', size: 100 * 1024 * 1024, maxCount: 6 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(PostValidation.alertValidation),
  PostController.createPost,
);

export const PostRoute = router;
