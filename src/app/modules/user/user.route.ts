/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import { cacheGet } from '../../middlewares/cacheGet';
const router = express.Router();

router.post(
  '/create-user',
  validateRequest(UserValidation.createUserSchema),
  UserController.createUser,
);

router.get(
  '/all-user',
  auth(USER_ROLES.ADMIN),
  cacheGet('users:all', 120, req => ({ q: req.query })),
  UserController.getAllUser,
);

router.patch(
  '/update-profile',
  fileUploadHandler({ image: { fileType: 'images', size: 50 * 1024 * 1024 } }),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  validateRequest(UserValidation.updateUserProfileSchema),
  UserController.updateProfile,
);

router.get(
  '/user',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  UserController.getUserProfile,
);

// router.get('/get-all-users', auth(USER_ROLES.ADMIN), UserController.getAllUser);

router.get(
  '/get-single-user/:id',
  auth(USER_ROLES.ADMIN),
  UserController.getSingleUser,
);

// get user by search by phone
router.get(
  '/user-search',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
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

export const UserRoutes = router;
