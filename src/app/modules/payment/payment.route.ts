import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PaymentController } from './payment.controller';

const router = express.Router();

// router.post(
//   '/intent',
//   auth(USER_ROLES.ADMIN, USER_ROLES.USER),
//   PaymentController.createPayment,
// );

router.post(
  '/stripe-intent',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  PaymentController.createStripePaymentIntent,
);

//* get all payment and price
router.get('/', auth(USER_ROLES.ADMIN), PaymentController.allPayment);

//*
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  PaymentController.singlePayment,
);

router.all('/stripe/connect', PaymentController.stripeConnect);

export const PaymentRoutes = router;
