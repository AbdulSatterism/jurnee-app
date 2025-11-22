/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

import validateRequest from '../../middlewares/validateRequest';
import { tersmConditionValidation } from './termsAndCondition.validation';
import { termsConditionController } from './termsAndCondition.controllers';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(
    tersmConditionValidation.createTermsConditionSchemaValidation,
  ),
  termsConditionController.createTermsCondition,
);

router.get('/', termsConditionController.getTersmCondition);

router.patch(
  '/',
  auth(USER_ROLES.ADMIN),
  validateRequest(
    tersmConditionValidation.updateTermsConditionSchemaValidation,
  ),
  termsConditionController.updateTersmCondition,
);

export const tersmConditionRoutes = router;
