import { Types } from 'mongoose';

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

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
  startingPrice?: number;
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

/**
 * Event-specific post
 
export interface EventPost extends BasePost {
  category: PostCategory.EVENT;
  // schedule: either weekly schedule OR date ranges (one or more)
  weeklySchedule?: WeeklyScheduleItem[]; // recurring schedule
  dateRanges?: DateRange[]; // one-off events or multi-day events

  venue?: {
    name?: string;
    address?: string;
    geo?: GeoPoint;
  };

  attendingCount?: number;
  attendeesPreview?: { userId: string; avatar?: string }[];

  ticketUrl?: string;
  bookingEnabled?: boolean;
  totalBookings?: number;
}

/**
 * Service-specific post (e.g., DJ, plumber, photographer)
 
export interface ServicePost extends BasePost {
  category: PostCategory.SERVICE;
  // typical for services
  hourlyRate?: number;
  minBookingHours?: number;
  availableSchedule?: WeeklyScheduleItem[]; // availability window
  // qualifications/certifications
  certifications?: string[];
  rating?: number;
  totalEarnings?: number;
}

/**
 * Deal / Offer post

export interface DealPost extends BasePost {
  category: PostCategory.DEAL;
  discountPercent?: number;
  validFrom?: string;
  validUntil?: string;
  terms?: string;
  couponCode?: string;
}

/**
 * Food post (restaurant / menu / food delivery)

export interface FoodPost extends BasePost {
  category: PostCategory.FOOD;
  menuUrl?: string;
  openingHours?: WeeklyScheduleItem[];
  rating?: number;
  priceRange?: { min?: number; max?: number; currency?: string };
}

/**
 * Alert / Missing person / Emergency post

export interface AlertPost extends BasePost {
  category: PostCategory.ALERT;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  lastSeenGeo?: GeoPoint;
  reward?: number;
  isVerified?: boolean;
  reporterContact?: { phone?: string; email?: string };
}

*/
