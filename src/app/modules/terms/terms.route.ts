/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

import validateRequest from '../../middlewares/validateRequest';
import { termsValidations } from './terms.validation';
import { TermsControllers } from './terms.controller';
const router = express.Router();

router.post(
  '/create-terms',
  auth(USER_ROLES.ADMIN),
  validateRequest(termsValidations.createTermsValidation),
  TermsControllers.createTerms,
);

router.get('/', TermsControllers.getAllTerms);

router.post(
  '/update-terms',
  auth(USER_ROLES.ADMIN),
  validateRequest(termsValidations.updateTermsValidation),
  TermsControllers.updateTerms,
);

export const termsRoutes = router;
