import { z } from 'zod';

export const followerValidation = z.object({
  body: z.object({
    followed: z.string({ required_error: 'Follower id is required' }),
    follower: z.string({ required_error: 'Following id is required' }),
  }),
});
