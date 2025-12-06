import { Types } from 'mongoose';

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface ITimeSlot {
  start: string;
  end: string;
  available?: boolean;
}

export interface ISchedule {
  day: WeekDay;
  startTime: string;
  endTime: string;
  timeSlots: ITimeSlot[];
}

export interface IPost {
  author: Types.ObjectId;
  image?: string;
  media?: string[];
  title?: string;
  description?: string;
  startDate?: Date;
  startTime?: Date;
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
  schedule?: ISchedule[];
  category?: 'event' | 'service' | 'alert' | 'deal';
  subcategory?: string;
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
  status?: 'PUBLISHED' | 'BLOCKED' | 'SUSPICIOUS';
  boost?: boolean;
  attenders?: Types.ObjectId[];
  isSaved?: boolean;
  totalSaved?: number;
}

export interface IQuery {
  page?: string;
  limit?: string;
  category?: string;
  subcategory?: string;
  search?: string;
  date?: string; // "today" | "upcoming"
  lat?: string;
  lng?: string;
  maxDistance?: string;
  minPrice?: string;
  maxPrice?: string;
}
