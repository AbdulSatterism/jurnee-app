/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type IUser = {
  name: string;
  email: string;
  password: string;
  bio?: string;
  interested?: string[];
  phone?: string;
  googleId?: string;
  appleId?: string;
  role?: 'ADMIN' | 'USER';
  gender?: 'MALE' | 'FEMALE' | 'OTHERS';
  image?: string;
  isDeleted?: boolean;
  verified: boolean;
  address?: string;
  location: {
    type: string;
    coordinates: [longtitude: number, latitude: number];
  };
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
