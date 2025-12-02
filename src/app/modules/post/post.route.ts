import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PostController } from './post.controller';
import validateRequest from '../../middlewares/validateRequest';
import { PostValidation } from './post.validation';
import fileUploader from '../../middlewares/fileUploadHandler';

const router = Router();

//! event

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

// join in the event
router.post(
  '/event/join/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PostController.joinEvent,
);
// my join events

router.get(
  '/my-join-event',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PostController.myJoinEvent,
);
// user join events

router.get(
  '/user-join-event/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PostController.userJoinEvent,
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

// Get all posts

router.get(
  '/all-post',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PostController.getAllPosts,
);

// Get post details
router.get(
  '/details/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PostController.postDetails,
);

// get individual author post
router.get(
  '/my-post',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PostController.myPost,
);

router.get(
  '/user-post/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PostController.userPost,
);

router.patch(
  '/:id',
  fileUploader({
    image: { fileType: 'images', size: 50 * 1024 * 1024, maxCount: 1 },
    media: { fileType: 'media', size: 100 * 1024 * 1024, maxCount: 6 },
  }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  PostController.updatePost,
);

// admin routes

router.get('/published', auth(USER_ROLES.ADMIN), PostController.publishedPosts);
router.get('/blocked', auth(USER_ROLES.ADMIN), PostController.blockedPosts);
router.get(
  '/suspicious',
  auth(USER_ROLES.ADMIN),
  PostController.suspiciousPosts,
);

router.patch(
  '/block-suspicious-to-published/:id',
  auth(USER_ROLES.ADMIN),
  PostController.blockOrSuspiciousToPublished,
);

router.patch(
  '/published-to-blocked/:id',
  auth(USER_ROLES.ADMIN),
  PostController.publishedToBlocked,
);

router.get(
  '/total/:category',
  auth(USER_ROLES.ADMIN),
  PostController.totalPostByCategory,
);

export const PostRoute = router;
