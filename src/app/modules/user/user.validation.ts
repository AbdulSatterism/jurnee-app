import { z } from 'zod';

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    address: z.string(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()),
    }),
    password: z.string(),
  }),
});

const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
  }),
});

const updateLocationZodSchema = z.object({
  body: z.object({
    longitude: z.string({ required_error: 'Longitude is required' }),
    latitude: z.string({ required_error: 'Latitude is required' }),
  }),
});

export const UserValidation = {
  createUserSchema,
  updateLocationZodSchema,
  updateUserProfileSchema,
};
