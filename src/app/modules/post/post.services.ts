/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IPost, IQuery } from './post.interface';
import { Post } from './post.model';
import mongoose, { FilterQuery } from 'mongoose';
import { Saved } from '../saved/saved.model';

const createPost = async (author: string, payload: IPost) => {
  const isExist = await User.findById(author);
  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  payload.author = isExist._id;

  if (payload.media && !Array.isArray(payload.media)) {
    payload.media = [payload.media];
  }

  const result = await Post.create(payload);

  await User.findByIdAndUpdate(author, {
    $inc: { post: 1 },
  });

  return result;
};

// get all post

const getAllPosts = async (query: IQuery, userId: string) => {
  const {
    page = '1',
    limit = '10',
    category,
    search,
    date,
    lat,
    lng,
    maxDistance,
    subcategory,
    minPrice,
    maxPrice,
  } = query;

  const user = await User.findById(userId);
  const userLocation = user?.location
    ? { lat: user.location.coordinates[1], lng: user.location.coordinates[0] }
    : null;

  const pageNum = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNum - 1) * pageSize;

  // Base filter
  const filter: FilterQuery<IPost> = { status: 'PUBLISHED' };

  // Category filter
  if (category) filter.category = { $regex: new RegExp(category, 'i') };
  //  Subcategory filter
  if (subcategory) {
    filter.subcategory = { $regex: new RegExp(subcategory, 'i') };
  }

  // Price filter
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }

  // Date filter
  const now = new Date();
  if (date === 'today') {
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  } else if (date === 'upcoming') {
    filter.startDate = { $gt: now };
  }

  // Search (title, description, category, tags)
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { title: regex },
      { description: regex },
      { category: regex },
      { hasTag: regex },
    ];
  }

  //  Distance filter (if user or query location provided)
  const userLat = userLocation?.lat || (lat ? parseFloat(lat) : null);
  const userLng = userLocation?.lng || (lng ? parseFloat(lng) : null);
  const maxDist = maxDistance ? parseFloat(maxDistance) : 50000; // default 50km

  const geoNearStage =
    userLat && userLng
      ? [
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [userLng, userLat] },
              distanceField: 'distance',
              maxDistance: maxDist,
              spherical: true,
            },
          },
        ]
      : [];

  // Main aggregation pipeline
  const pipeline: any[] = [
    ...geoNearStage,
    { $match: filter },
    {
      $addFields: {
        boostPriority: { $cond: [{ $eq: ['$boost', true] }, 1, 0] },
      },
    },
    // Join with the Review collection to calculate average rating
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'postId',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' }, // Calculate average rating
        reviewsCount: { $size: '$reviews' }, // Count the number of reviews
      },
    },
    {
      $project: {
        reviews: 0,
      },
    },

    {
      $sort: {
        boostPriority: -1, // boosted posts first
        likes: -1,
        views: -1,
        createdAt: -1,
      },
    },
    { $skip: skip },
    { $limit: pageSize },
  ];

  //  Execute query
  const [posts, total] = await Promise.all([
    Post.aggregate(pipeline),
    Post.countDocuments(filter),
  ]);

  //  Hashtag similarity sort (optional enhancement)
  if (search) {
    const searchWords = search.toLowerCase().split(/\s+/);
    posts.sort((a, b) => {
      const matchCount = (post: any) =>
        post.hasTag?.filter((tag: string) =>
          searchWords.some(word => tag.toLowerCase().includes(word)),
        ).length || 0;

      return matchCount(b) - matchCount(a);
    });
  }

  await Post.updateMany({}, { $set: { totalSaved: 0 } });

  return {
    data: posts,
    meta: {
      page: pageNum,
      limit: pageSize,
      totalPage: Math.ceil(total / pageSize),
      total,
    },
  };
};

const postDetails = async (postId: string, userId: string) => {
  const post = await Post.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(postId) } },

    // Lookup author details from 'users' collection
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: { path: '$author', preserveNullAndEmptyArrays: true }, // Unwind author to get a single object
    },

    // Lookup attenders details from 'users' collection
    {
      $lookup: {
        from: 'users',
        localField: 'attenders',
        foreignField: '_id',
        as: 'attenders',
      },
    },

    // Join reviews collection and calculate
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'postId',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: {
          $cond: [
            { $gt: [{ $size: '$reviews' }, null] },
            { $avg: '$reviews.rating' },
            null,
          ],
        },
        reviewsCount: { $size: '$reviews' },
      },
    },

    // Remove the review
    { $project: { reviews: 0 } },

    // Project necessary fields to return in the final result
    {
      $project: {
        'author.name': 1,
        'author.image': 1,
        'attenders.name': 1,
        'attenders.image': 1,
        title: 1,
        description: 1,
        location: 1,
        address: 1,
        views: 1,
        likes: 1,
        price: 1,
        category: 1,
        subcategory: 1,
        amenities: 1,
        schedule: 1,
        startDate: 1,
        endDate: 1,
        isSaved: 1,
        averageRating: 1,
        reviewsCount: 1,
        createdAt: 1,
        updatedAt: 1,
        totalSaved: 1,
      },
    },
  ]);

  if (post.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This service not found');
  }

  const updatedPost = post[0];

  const savedPost = await Saved.findOne({ userId, postId });
  updatedPost.isSaved = savedPost ? true : false;

  updatedPost.views = (updatedPost.views ?? 0) + 1;

  await Post.updateOne(
    { _id: postId },
    { $set: { views: updatedPost.views, isSaved: updatedPost.isSaved } },
  );

  return updatedPost;
};

export const PostService = {
  createPost,
  getAllPosts,
  postDetails,
};
