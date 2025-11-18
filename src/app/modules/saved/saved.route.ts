import { Router } from 'express';
import { SavedController } from './saved.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.post(
  '/save-toggle',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  SavedController.savedToggle,
);

router.get(
  '/my-saved-post',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  SavedController.mySavedPost,
);

export const SavedRoutes = router;
