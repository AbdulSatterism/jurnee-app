import { z } from 'zod';

export const followerValidation = z.object({
  body: z.object({
    followerId: z.string({ required_error: 'Follower id is required' }),
    followingId: z.string({ required_error: 'Following id is required' }),
  }),
});
