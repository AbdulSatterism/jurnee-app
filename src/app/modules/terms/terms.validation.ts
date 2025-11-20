import { z } from 'zod';

const createTermsValidation = z.object({
  body: z.object({
    description: z.string(),
  }),
});

const updateTermsValidation = z.object({
  body: z.object({
    description: z.string().optional(),
  }),
});

export const termsValidations = {
  createTermsValidation,
  updateTermsValidation,
};
