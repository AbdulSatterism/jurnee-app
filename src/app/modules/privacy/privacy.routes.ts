/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

import validateRequest from '../../middlewares/validateRequest';
import { privacyValidations } from './privacy.validation';
import { privacyControllers } from './privacy.controller';
const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(privacyValidations.createPrivacyValidation),
  privacyControllers.createPrivacy,
);

router.get('/', privacyControllers.getAllPrivacy);

router.patch(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(privacyValidations.updatePrivacyValidation),
  privacyControllers.updatePrivacy,
);

export const privacyRoutes = router;
