/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { IOffer } from './offer.interface';
import { User } from '../user/user.model';
import { Post } from '../post/post.model';
import { Offer } from './offer.model';
import { transferMoney } from '../payment/utils';
import { IPayoutConfirmation } from '../../../types/emailTamplate';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';

const createOffer = async (payload: IOffer) => {
  const validProvider = await User.findById(payload.provider);

  if (!validProvider) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  const validService = await Post.findById(payload.service);

  if (!validService) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Service not found');
  }

  // check validProvider and valid service author same or not if not same then throw error

  if (validProvider._id.toString() !== validService.author.toString()) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'this provider is not the author of the service',
    );
  }

  const offer = (await Offer.create(payload)).populate(
    'service',
    'image title description location category subcategory',
  );

  return offer;
};

// offer accept by customer if not customer then cannot accept the offer

const acceptOffer = async (offerId: string, customerId: string) => {
  const offer = await Offer.findById(offerId);

  if (!offer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'offer not found');
  }

  if (offer.status === 'accepted') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'offer already accepted');
  }

  // if offer already rejected then throw error
  if (offer.status === 'rejected') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'offer already rejected, need to create a new offer',
    );
  }

  const customer = await User.findById(customerId);
  if (!customer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'customer not found');
  }

  if (offer.customer.toString() !== customerId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'only customers can accept offers',
    );
  }

  offer.status = 'accepted';
  await offer.save();

  return offer;
};

// offer reject by customer if not customer then cannot reject the offer

const rejectOffer = async (offerId: string, customerId: string) => {
  const offer = await Offer.findById(offerId);

  if (!offer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'offer not found');
  }

  if (offer.status === 'accepted') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'accepted offer cannot be rejected',
    );
  }

  // if offer already rejected then throw error
  if (offer.status === 'rejected') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'offer already rejected');
  }

  const customer = await User.findById(customerId);
  if (!customer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'customer not found');
  }

  if (offer.customer.toString() !== customerId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'only customers can reject offers',
    );
  }

  offer.status = 'rejected';
  await offer.save();

  return offer;
};

const completeOffer = async (
  userId: string,
  offerId: string,
  amount: number,
) => {
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Offer not found');
  }

  if (offer.status === 'completed') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Offer is already completed');
  }

  if (userId !== offer.customer.toString()) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to complete this offer',
    );
  }

  const serviceProvider = await User.findById(offer.provider);
  if (!serviceProvider) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Service provider not found');
  }

  // Perform all database operations
  const payoutAmount = (amount || 0) - 8;

  // External side-effects
  await transferMoney({
    amount: payoutAmount,
    description: `Payout for offer ${offerId}`,
    stripeAccountId: serviceProvider.stripeAccountId as string,
  });

  const updatedOffer = await Offer.findByIdAndUpdate(
    offerId,
    { status: 'completed' },
    { new: true },
  );

  const emailValues: IPayoutConfirmation = {
    email: serviceProvider.paypalAccount as string,
    amount: payoutAmount,
    status: 'COMPLETED',
    paypalBatchId: 'TRANSFERRED_VIA_STRIPE',
  };

  const hostConfirmationMail = emailTemplate.payoutConfirmation(emailValues);
  await emailHelper.sendEmail(hostConfirmationMail);

  return updatedOffer;
};

// my upcoming offer

// compare with this time  "serviceDate": "2025-11-26T10:00:00.000Z", to live time

const upcomingOffers = async (userId: string, query: Record<string, any>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const currentDate = new Date();
  const [result, total] = await Promise.all([
    Offer.find({
      customer: userId,
      date: { $gt: currentDate },
    })
      .populate(
        'service',
        'image title description location category subcategory',
      )
      .populate('provider', 'name email image address')
      .skip(skip)
      .limit(size),
    Offer.countDocuments({
      customer: userId,
      date: { $gt: currentDate },
    }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

// past offer can be implemented similarly by changing the comparison operator to $lt

const pastOffers = async (userId: string, query: Record<string, any>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const currentDate = new Date();

  const [result, total] = await Promise.all([
    Offer.find({
      customer: userId,
      date: { $lt: currentDate },
    })
      .populate(
        'service',
        'image title description location category subcategory',
      )
      .populate('provider', 'name email image address')
      .skip(skip)
      .limit(size),
    Offer.countDocuments({
      customer: userId,
      date: { $lt: currentDate },
    }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

// also need for how many booking incompleted by service provider

const incompletedOffersByProvider = async (
  userId: string,
  query: Record<string, any>,
) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Offer.find({
      provider: userId,
      status: { $ne: 'completed' },
    })
      .populate('service', 'title category ')
      .populate('provider', 'name email image address')
      .skip(skip)
      .limit(size),
    Offer.countDocuments({
      provider: userId,
      status: { $ne: 'completed' },
    }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

// also need completed bookings by service provider

const completedOffersByProvider = async (
  userId: string,
  query: Record<string, any>,
) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Offer.find({
      provider: userId,
      status: 'completed',
    })
      .populate(
        'service',
        'image title description location category subcategory',
      )
      .populate('provider', 'name email image address')
      .skip(skip)
      .limit(size),
    Offer.countDocuments({
      provider: userId,
      status: 'completed',
    }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

export const OfferService = {
  completeOffer,
  createOffer,
  acceptOffer,
  rejectOffer,
  upcomingOffers,
  pastOffers,
  incompletedOffersByProvider,
  completedOffersByProvider,
};
