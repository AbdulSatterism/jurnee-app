/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploader from '../../middlewares/fileUploadHandler';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
// import { cacheGet } from '../../middlewares/cacheGet';

const router = express.Router();

router.post(
  '/create-user',
  validateRequest(UserValidation.createUserSchema),
  UserController.createUser,
);

router.get(
  '/all-user',
  auth(USER_ROLES.ADMIN),
  // cacheGet('users:all', 3600, req => ({ q: req.query })),
  UserController.getAllUser,
);

router.patch(
  '/update-profile',
  fileUploader({ image: { fileType: 'images', size: 50 * 1024 * 1024 } }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(UserValidation.updateUserProfileSchema),
  UserController.updateProfile,
);

router.get(
  '/user',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  UserController.getUserProfile,
);

router.get(
  '/get-single-user/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  // cacheGet('users:single', 3600, req => ({ params: req.params })),
  UserController.getSingleUser,
);

// get user by search by phone
router.get(
  '/user-search',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  // cacheGet('users:search', 3600, req => ({ q: req.query })),
  UserController.searchByPhone,
);

router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  UserController.getUserProfile,
);

router.delete(
  '/delete-profile',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  UserController.deleteUser,
);

router.get('/connect-stripe', auth(), UserController.connectStripeAccount);

export const UserRoutes = router;
