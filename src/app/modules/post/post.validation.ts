// const createUserSchema = z.object({
//   body: z.object({
//     name: z.string().min(1, 'Name is required'),
//     email: z.string().email('Invalid email address'),
//     address: z.string(),
//     location: z.object({
//       type: z.literal('Point'),
//       coordinates: z.array(z.number()),
//     }),
//     password: z.string(),
//   }),
// });

import { z } from 'zod';

// for post validation date in below =>
/**
  title?: string;
  description?: string;
  startDate?: Date;
  startTime?: string;
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [longitude: number, latitude: number];
  };
  hasTag?: string[];
 * 
 */

const eventValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    startDate: z.date(),
    startTime: z.string(),
    address: z.string(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    hasTag: z.array(z.string()),
  }),
});

export const PostValidation = {
  eventValidation,
};
