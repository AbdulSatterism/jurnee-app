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
  price?: number;
  schedule?: { day: WeekDay; startTime: string; endTime: string }[];
  category?: string;
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
  status?: 'PUBLISHED' | 'REJECTED';
  boost?: boolean;
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
