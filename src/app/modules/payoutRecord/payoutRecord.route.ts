import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PayoutRecordController } from './payoutRecord.controller';

const router = Router();

router.get(
  '/',
  auth(USER_ROLES.ADMIN),
  PayoutRecordController.getAllPayoutRecord,
);

router.get(
  '/:id',
  auth(USER_ROLES.ADMIN),
  PayoutRecordController.getPayoutRecordById,
);

router.patch(
  '/paid/:id',
  auth(USER_ROLES.ADMIN),
  PayoutRecordController.updatePayoutRecordStatus,
);

export const PayoutRecordRoute = router;
