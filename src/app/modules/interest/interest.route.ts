import { Router } from 'express';
import { InterestController } from './interest.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  InterestController.createInterest,
);

router.get('/', auth(USER_ROLES.ADMIN), InterestController.allInterest);

router.get('/:id', auth(USER_ROLES.ADMIN), InterestController.interestDetails);

export const InterestRoutes = router;
