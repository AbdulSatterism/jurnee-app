import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { IOffer } from './offer.interface';
import { User } from '../user/user.model';
import { Post } from '../post/post.model';
import { Offer } from './offer.model';

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

  const offer = await Offer.create(payload);

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

export const OfferService = {
  createOffer,
  acceptOffer,
  rejectOffer,
};
