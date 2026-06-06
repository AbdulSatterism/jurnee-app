import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Block } from './block.model';

const blockUser = async (blockedById: string, blockedUserId: string) => {
  if (blockedById === blockedUserId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot block yourself');
  }

  // Check if block record already exists
  const existingBlock = await Block.findOne({
    blockedBy: blockedById,
    blockedUser: blockedUserId,
    status: 'blocked',
  });

  if (existingBlock) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User is already blocked');
  }

  // Create new block record
  const newBlock = await Block.create({
    blockedBy: blockedById,
    blockedUser: blockedUserId,
    status: 'blocked',
  });

  return newBlock;
};

export const blockServices = {
  blockUser,
};
