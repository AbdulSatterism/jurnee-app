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

// upcoming bookings
router.get(
  '/upcoming',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  OfferController.upcomingOffers,
);
// past bookings
router.get(
  '/past',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  OfferController.pastOffers,
);

// incompleted offers by provider
router.get(
  '/incompleted',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  OfferController.incompletedOffersByProvider,
);

// completed offers by provider
router.get(
  '/completed',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  OfferController.completedOffersByProvider,
);

router.post(
  '/complete',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  OfferController.completeOffer,
);

export const OfferRoute = router;
