import { z } from 'zod';

export const followingValidation = z.object({
  body: z.object({
    user: z.string({ required_error: 'User id is required' }),
    following: z.string({ required_error: 'Following id is required' }),
  }),
});
