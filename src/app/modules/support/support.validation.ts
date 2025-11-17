import { z } from 'zod';

const supportValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    description: z.string().min(1, 'Message is required'),
    subject: z.string().min(1, 'Subject is required'),
    transactionId: z.string().min(1, 'Transaction ID is required'),
  }),
});

export const supportValidations = {
  supportValidationSchema,
};
