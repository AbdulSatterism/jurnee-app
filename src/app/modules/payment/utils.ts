/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../../config';
import Stripe from 'stripe';

export const stripe = new Stripe(config.payment.stripe_secret_key!, {
  apiVersion: '2025-10-29.clover',
});

export const getStripeAccountId = async (
  email: string | undefined = undefined,
): Promise<string> => {
  const stripeAccount = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      transfers: { requested: true },
    },
  });

  return stripeAccount.id;
};

export const transferMoney = async ({
  amount,
  stripeAccountId,
  description,
}: {
  amount: number;
  stripeAccountId: string;
  description: string | undefined;
}) => {
  //? create a transfer to the connected account
  await stripe.transfers.create({
    amount: amount * 100, //? convert to cents
    currency: 'usd',
    destination: stripeAccountId,
    description,
  });

  //? create a payout to the connected account
  await stripe.payouts.create(
    { amount: amount * 100, currency: 'usd' },
    { stripeAccount: stripeAccountId },
  );
};
