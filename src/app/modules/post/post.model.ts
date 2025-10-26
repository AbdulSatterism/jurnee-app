import { model, Schema } from 'mongoose';
import { IPost } from './post.interface';

const scheduleSchema = new Schema({
  day: {
    type: String,
    enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    required: false,
  },
  startTime: { type: String, required: false },
  endTime: { type: String, required: false },
});

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, default: null },
    media: { type: [String], default: null },
    title: { type: String, default: null },
    description: { type: String, default: null },
    startDate: { type: Date, default: null },
    startTime: { type: String, default: null },
    address: { type: String, default: null },
    location: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: { type: [Number] },
    },
    hasTag: { type: [String], default: null },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },

    endDate: { type: String, default: null },

    // service posts
    startingPrice: { type: Number, default: null },
    schedule: { type: [scheduleSchema] },
    category: { type: String, default: null },
    serviceType: { type: String, default: null },

    // alert posts
    missingName: { type: String, default: null },
    missingAge: { type: Number, default: null },
    clothingDescription: { type: String, default: null },
    lastSeenLocation: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: { type: [Number] },
    },
    lastSeenDate: { type: Date, default: null },
    contactInfo: { type: String, default: null },
    expireLimit: { type: Number, default: null }, // in days
    capacity: { type: Number, default: null },
    amenities: { type: [String], default: null },
    licenses: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

// Add 2dsphere index for geospatial queries
postSchema.index({ location: '2dsphere' });
export const Post = model('Post', postSchema);

/*
const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String },
    media: { type: [String] },
    title: { type: String },
    description: { type: String },
    startDate: { type: Date },
    startTime: { type: String },
    address: { type: String },
    location: pointSchema,
    hasTag: { type: [String] },

    // deal posts
    endDate: { type: String },

    // service posts
    startingPrice: { type: Number },
    schedule: { type: [scheduleSchema] },
    category: { type: String },
    serviceType: { type: String },

    // alert posts
    missingName: { type: String },
    missingAge: { type: Number },
    clothingDescription: { type: String },
    lastSeenLocation: pointSchema,
    lastSeenDate: { type: Date },
    contactInfo: { type: String },
    expireLimit: { type: Number }, // in days
    capacity: { type: Number },
    amenities: { type: [String] },
    licenses: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

*/
