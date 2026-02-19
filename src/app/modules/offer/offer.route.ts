import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { OfferController } from './offer.controller';

const router = Router();

router.post(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  OfferController.createOffer,
);

router.post(
  '/accept',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  OfferController.acceptOffer,
);

router.post(
  '/reject',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  OfferController.rejectOffer,
);

export const OfferRoute = router;
