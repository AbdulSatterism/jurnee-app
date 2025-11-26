export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};

export type IPayoutConfirmation = {
  email: string;
  amount: number;
  status: string;
  paypalBatchId: string;
};
