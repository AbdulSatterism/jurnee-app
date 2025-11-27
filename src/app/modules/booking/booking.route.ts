import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { BookingController } from './booking.controller';

const router = Router();

router.post(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  BookingController.createBooking,
);

router.patch(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  BookingController.completeBooking,
);

// upcoming bookings
router.get(
  '/upcoming',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  BookingController.upcommingBookings,
);

// past bookings
router.get(
  '/past',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  BookingController.pastBookings,
);

// incompleted bookings by service provider
router.get(
  '/incompleted',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  BookingController.incompletedBookingsByProvider,
);

// completed bookings by service provider
router.get(
  '/completed',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  BookingController.completedBookingsByProvider,
);

router.post(
  '/boost',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  BookingController.boostService,
);

export const BookingRoutes = router;
