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
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: {
        path: '$author',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        reviews: 0,
        'author.password': 0,
        'author.authentication': 0,
        'author.googleId': 0,
        'author.appleId': 0,
        'author.isDeleted': 0,
        'author.location': 0,
        'author.role': 0,
        'author.interested': 0,
        'author.phone': 0,
        'author.address': 0,
        'author.paypalAccount': 0,
        'author.income': 0,
        'author.verified': 0,
        'author.createdAt': 0,
        'author.updatedAt': 0,
        'author.__v': 0,
        'author.likes': 0,
        'author.following': 0,
        'author.follower': 0,
        'author.gender': 0,
        'author.bio': 0,
        'author.post': 0,
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

// attend in the event in this field =>  attenders?: Types.ObjectId[];

const joinEvent = async (userId: string, postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // also check category if not category; throw new AppError('Event');

  if (post.category?.toLowerCase() !== 'event') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'only able to join in the event',
    );
  }

  // also check user id != author
  if (post.author.toString() === userId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You cannot join your own event',
    );
  }

  const id = new mongoose.Types.ObjectId(userId);

  if (post?.attenders?.includes(id)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'User already joined the event',
    );
  }

  if (!post.attenders) {
    post.attenders = [];
  }

  post.attenders.push(id);
  await post.save();

  return post;
};

// update post by the author

const updatePost = async (
  userId: string,
  postId: string,
  payload: Partial<IPost>,
) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  if (post.author.toString() !== userId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot update this post');
  }

  const updatedPost = await Post.findOneAndUpdate(
    { _id: postId },
    { $set: payload },
    { new: true },
  );

  return updatedPost;
};

// my join events

const myJoinEvents = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const [post, total] = await Promise.all([
    Post.find({ attenders: userId })
      .populate('attenders', 'name image -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Post.countDocuments({ attenders: userId }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: post,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};
// user join events

const userJoinEvents = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const [post, total] = await Promise.all([
    Post.find({ attenders: userId })
      .populate('attenders', 'name image -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Post.countDocuments({ attenders: userId }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: post,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

// my post

const myPost = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const [post, total] = await Promise.all([
    Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Post.countDocuments({ author: userId }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: post,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

const userPost = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const [post, total] = await Promise.all([
    Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Post.countDocuments({ author: userId }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: post,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

// for admin

const publishedPost = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Post.find({ status: 'PUBLISHED' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Post.countDocuments({ status: 'PUBLISHED' }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

// suspicious post
const suspiciousPost = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [result, total] = await Promise.all([
    Post.find({ status: 'SUSPICIOUS' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Post.countDocuments({ status: 'SUSPICIOUS' }),
  ]);
  const totalPage = Math.ceil(total / size);

  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

// block post
const blockPost = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;
  const [result, total] = await Promise.all([
    Post.find({ status: 'BLOCKED' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Post.countDocuments({ status: 'BLOCKED' }),
  ]);
  const totalPage = Math.ceil(total / size);
  return {
    data: result,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

export const PostService = {
  createPost,
  getAllPosts,
  postDetails,
  joinEvent,
  myJoinEvents,
  myPost,
  updatePost,
  userPost,
  userJoinEvents,
  publishedPost,
  suspiciousPost,
  blockPost,
};
