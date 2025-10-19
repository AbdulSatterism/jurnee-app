/* eslint-disable @typescript-eslint/no-explicit-any */

import { Schema } from 'mongoose';
import { TErrorSource, TGenericErrorResponse } from '../interface';
import { IFollowing } from '../modules/following/following.interface';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]*)"/);
  const extractMessage = match && match[1];

  const errorSources: TErrorSource = [
    {
      path: '',
      message: `${extractMessage} is already exists`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'validation error',
    errorSources,
  };
};

export default handleDuplicateError;
const followingSchema = new Schema<IFollowing>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isFollowing: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
  {},
);
