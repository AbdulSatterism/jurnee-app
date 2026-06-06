import { Router } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { blockController } from './block.controller';

const router = Router();
router.post(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  blockController.blockUser,
);

export const BlockRoutes = router;
