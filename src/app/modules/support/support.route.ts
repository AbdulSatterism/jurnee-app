import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { supportValidations } from './support.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SupportController } from './support.controller';
const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  validateRequest(supportValidations.supportValidationSchema),
  SupportController.submitSupport,
);

router.get('/', auth(USER_ROLES.ADMIN), SupportController.allSuportByAdmin);
router.get('/:id', auth(USER_ROLES.ADMIN), SupportController.getSingleSupport);

export const supportRoutes = router;
