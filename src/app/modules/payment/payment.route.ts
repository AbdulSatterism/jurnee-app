import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PaymentController } from './payment.controller';

const router = express.Router();

//* get all payment and price
router.get('/', auth(USER_ROLES.ADMIN), PaymentController.allPayment);

//*
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  PaymentController.singlePayment,
);

export const PaymentRoutes = router;
