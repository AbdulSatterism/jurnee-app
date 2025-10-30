import { z } from 'zod';

/*


export interface IPost {
  author: Types.ObjectId;
  image?: string;
  media?: string[];
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

  // for deal posts
  endDate?: string;

  // for service posts
  price?: number;
  schedule?: { day: WeekDay; startTime: string; endTime: string }[];
  category?: string;
  serviceType?: string;

  // for alert posts
  missingName?: string;
  missingAge?: number;
  clothingDescription?: string;
  lastSeenLocation?: {
    type: 'Point';
    coordinates: [longitude: number, latitude: number];
  };
  lastSeenDate?: Date;
  contactInfo?: string;
  expireLimit?: number; // in days
  capacity?: number;
  amenities?: string[];
  licenses?: string;
  views?: number;
  likes?: number;
}

*/

const eventValidation = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    category: z.string(),
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
    category: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    address: z.string(),
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
    schedule: z.array(
      z.object({
        day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
        startTime: z.string(),
        endTime: z.string(),
      }),
    ),
    category: z.string(),
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
    schedule: z.array(
      z.object({
        day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
        startTime: z.string(),
        endTime: z.string(),
      }),
    ),
    category: z.string(),
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
    schedule: z.array(
      z.object({
        day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
        startTime: z.string(),
        endTime: z.string(),
      }),
    ),
    category: z.string(),
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
    schedule: z.array(
      z.object({
        day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
        startTime: z.string(),
        endTime: z.string(),
      }),
    ),
    category: z.string(),
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
    category: z.string(),
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
    category: z.string(),
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
