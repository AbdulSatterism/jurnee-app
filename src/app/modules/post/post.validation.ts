import { z } from 'zod';

// const timeSlotSchema = z.object({
//   start: z.string(), // "09:00"
//   end: z.string(), // "10:00"
// });

const scheduleSchema = z.array(
  z.object({
    day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
    startTime: z.string(), // "09:00"
    endTime: z.string(), // "17:00"
  }),
);

const eventValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    category: z.enum(['event', 'service', 'alert', 'deal']),
    startDate: z.string(),
    startTime: z.string(),
    address: z.string(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    hasTag: z.array(z.string()),
  }),
});

const dealValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    category: z.enum(['event', 'service', 'alert', 'deal']),
    startDate: z.string(),
    endDate: z.string(),
    address: z.string(),
    couponCode: z.string().optional(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    hasTag: z.array(z.string()),
  }),
});

const foodBeverageServiceValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    price: z.number(),
    schedule: scheduleSchema,
    category: z.enum(['event', 'service', 'alert', 'deal']),
    subcategory: z.string(),
    address: z.string(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    hasTag: z.array(z.string()),
  }),
});

const entertainmentServiceValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    price: z.number(),
    schedule: scheduleSchema,
    category: z.enum(['event', 'service', 'alert', 'deal']),
    subcategory: z.string(),
    address: z.string(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    hasTag: z.array(z.string()),
  }),
});

const homeServiceValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    price: z.number(),
    schedule: scheduleSchema,
    category: z.enum(['event', 'service', 'alert', 'deal']),
    subcategory: z.string(),
    address: z.string(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    hasTag: z.array(z.string()),
    serviceType: z.string(),
  }),
});

const venueServiceValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    price: z.number(),
    schedule: scheduleSchema,
    category: z.enum(['event', 'service', 'alert', 'deal']),
    subcategory: z.string(),
    address: z.string(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    hasTag: z.array(z.string()),
    capacity: z.number(),
    amenities: z.array(z.string()),
  }),
});

const alertMissingPersonValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    category: z.enum(['event', 'service', 'alert', 'deal']),
    subcategory: z.string(),
    address: z.string(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    lastSeenLocation: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    hasTag: z.array(z.string()),
    missingName: z.string().min(1, 'Missing person name is required'),
    missingAge: z.number().min(0, 'Missing person age is required'),
    clothingDescription: z.string(),
    lastSeenDate: z.string(),
    contactInfo: z.string().min(1, 'Contact information is required'),
    expireLimit: z.number(),
  }),
});

const alertValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    category: z.enum(['event', 'service', 'alert', 'deal']),
    subcategory: z.string(),
    address: z.string(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    hasTag: z.array(z.string()),
    contactInfo: z.string().min(1, 'Contact information is required'),
    expireLimit: z.number(),
  }),
});

export const PostValidation = {
  eventValidation,
  dealValidation,
  foodBeverageServiceValidation,
  entertainmentServiceValidation,
  homeServiceValidation,
  venueServiceValidation,
  alertMissingPersonValidation,
  alertValidation,
};
