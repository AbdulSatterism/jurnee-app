/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { AIData, IPost, IQuery } from './post.interface';
import { Post } from './post.model';
import mongoose, { FilterQuery } from 'mongoose';
import { Saved } from '../saved/saved.model';
import { Comment } from '../comment/comment.model';
import { Reply } from '../commentReply/commentReply.model';
import { Review } from '../review/review.model';
import axios from 'axios';

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

  const populatePost = await result.populate(
    'author',
    'name image email image _id isStripeConnected stripeAccountId',
  );

  await User.findByIdAndUpdate(author, {
    $inc: { post: 1 },
  });

  const ai_data: AIData = {
    description: result.description!,
    image: result.image || '',
    id: result._id.toString(),
    media: result.media || [],
  };

  await axios.post('https://ai.joinjurnee.com/webhook/moderate', ai_data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return populatePost;
};

// get all post

const getAllPosts = async (query: IQuery, userId: string) => {
  const {
    page = '1',
    limit = '10',
    category,
    search,
    date,
    dateFrom,
    dateTo,
    lat,
    lng,
    maxDistance,
    rating,
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
  const filter: FilterQuery<IPost> = {
    status: 'PUBLISHED',
  };

  // Category filter
  if (category) filter.category = { $regex: new RegExp(category, 'i') };

  // Price filter
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }

  const now = new Date();

  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(dateTo) : null;

  if (fromDate && !isNaN(fromDate.getTime())) {
    fromDate.setUTCHours(0, 0, 0, 0); // start of day
  }
  if (toDate && !isNaN(toDate.getTime())) {
    toDate.setUTCHours(23, 59, 59, 999); // end of day
  }

  const isValidFrom = fromDate && !isNaN(fromDate.getTime());
  const isValidTo = toDate && !isNaN(toDate.getTime());

  if (date === 'today') {
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  } else if (date === 'upcoming') {
    filter.startDate = { $gt: now };
  } else if (isValidFrom && isValidTo) {
    filter.$expr = {
      $and: [
        { $lte: ['$startDate', toDate] },
        { $gte: [{ $ifNull: ['$endDate', '$startDate'] }, fromDate] },
      ],
    };
  } else if (isValidFrom) {
    filter.$expr = {
      $gte: [{ $ifNull: ['$endDate', '$startDate'] }, fromDate],
    };
  } else if (isValidTo) {
    filter.startDate = { $lte: toDate };
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
  const userLat = lat ? parseFloat(lat) : userLocation?.lat;
  const userLng = lng ? parseFloat(lng) : userLocation?.lng;
  const maxDist = maxDistance ? parseFloat(maxDistance) : 50000; // default 50km
  const ratingNum = typeof rating === 'string' ? parseFloat(rating) : rating;

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
      $lookup: {
        from: 'likes',
        let: { postId: '$_id' },
        as: 'viewerLike',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$postId', '$$postId'] },
                  { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
          { $limit: 1 },
        ],
      },
    },
    {
      $lookup: {
        from: 'saveds',
        let: { postId: '$_id' },
        as: 'viewerSaved',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$postId', '$$postId'] },
                  { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
          { $limit: 1 },
        ],
      },
    },

    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' }, // Calculate average rating
        reviewsCount: { $size: '$reviews' }, // Count the number of reviews
        isLiked: { $gt: [{ $size: '$viewerLike' }, 0] },
        isSaved: { $gt: [{ $size: '$viewerSaved' }, 0] },
      },
    },

    ...(rating
      ? [
          {
            $match: {
              $expr: {
                $gte: [{ $avg: '$reviews.rating' }, ratingNum],
              },
            },
          },
        ]
      : []),

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
      $lookup: {
        from: 'users',
        localField: 'attenders',
        foreignField: '_id',
        as: 'attenders',
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
        'attenders.password': 0,
        'attenders.authentication': 0,
        'attenders.googleId': 0,
        'attenders.appleId': 0,
        'attenders.isDeleted': 0,
        'attenders.location': 0,
        'attenders.role': 0,
        'attenders.interested': 0,
        'attenders.phone': 0,
        'attenders.address': 0,
        'attenders.paypalAccount': 0,
        'attenders.income': 0,
        'attenders.verified': 0,
        'attenders.createdAt': 0,
        'attenders.updatedAt': 0,
        'attenders.__v': 0,
        'attenders.likes': 0,
        'attenders.following': 0,
        'attenders.follower': 0,
        'attenders.gender': 0,
        'attenders.bio': 0,
        'attenders.post': 0,
        'attenders.stripeAccountId': 0,
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
      $unwind: { path: '$author', preserveNullAndEmptyArrays: true },
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

    // Lookup reviews
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'postId',
        as: 'reviews',
      },
    },
    // Lookup comments
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comments',
      },
    },
    // Lookup post likes by viewer
    {
      $lookup: {
        from: 'likes',
        let: { postId: '$_id' },
        as: 'viewerLike',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$postId', '$$postId'] },
                  { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
          { $limit: 1 },
        ],
      },
    },
    // Conditional feedback assignment based on category
    {
      $addFields: {
        feedback: {
          $cond: [{ $eq: ['$category', 'service'] }, '$reviews', '$comments'],
        },
        liked: { $gt: [{ $size: '$viewerLike' }, 0] },
      },
    },
    // Remove individual reviews and comments fields
    {
      $project: {
        reviews: 0,
        comments: 0,
        viewerLike: 0,
      },
    },
    {
      $addFields: {
        averageRating: {
          $cond: [
            { $gt: [{ $size: '$feedback' }, 0] },
            { $avg: '$feedback.rating' },
            null,
          ],
        },
        reviewsCount: { $size: '$feedback' },
      },
    },

    // Remove the feedback
    { $project: { feedback: 0 } },

    // Project necessary fields to return in the final result
    {
      $project: {
        'author.name': 1,
        'author.image': 1,
        'attenders.name': 1,
        'attenders.image': 1,
        title: 1,
        image: 1,
        media: 1,
        description: 1,
        location: 1,
        address: 1,
        views: 1,
        likes: 1,
        liked: 1,
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
        hasTag: 1,
        isLiked: 1,
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

// post details with relevant post at least 4 relevant post based on category and subcategory and location and price range
const detailWithRelevantPost = async (postId: string, userId: string) => {
  // if userId exist in attenders array so add another filed isAttender: true else false

  const post = await Post.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(postId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: { path: '$author', preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'attenders',
        foreignField: '_id',
        as: 'attenders',
      },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'postId',
        as: 'reviews',
      },
    },
    // Lookup post likes by viewer
    {
      $lookup: {
        from: 'likes',
        let: { postId: '$_id' },
        as: 'viewerLike',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$postId', '$$postId'] },
                  { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
          { $limit: 1 },
        ],
      },
    },

    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comments',
      },
    },
    {
      $addFields: {
        feedback: {
          $cond: [{ $eq: ['$category', 'service'] }, '$reviews', '$comments'],
        },
        liked: { $gt: [{ $size: '$viewerLike' }, 0] },
        isAttend: { $gt: [{ $size: { $filter: { input: '$attenders', as: 'attender', cond: { $eq: ['$$attender._id', new mongoose.Types.ObjectId(userId)] } } } }, 0] },
      },
    },
    {
      $project: {
        reviews: 0,
        comments: 0,
        viewerLike: 0,
      },
    },
    {
      $addFields: {
        averageRating: {
          $cond: [
            { $gt: [{ $size: '$feedback' }, 0] },
            { $avg: '$feedback.rating' },
            null,
          ],
        },
        reviewsCount: { $size: '$feedback' },
      },
    },
    { $project: { feedback: 0 } },

    {
      $project: {
        'author._id': 1,
        'author.name': 1,
        'author.image': 1,
        'attenders.name': 1,
        'attenders._id': 1,
        'attenders.image': 1,
        title: 1,
        image: 1,
        media: 1,
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
        liked: 1,
        isAttend: 1,
        averageRating: 1,
        reviewsCount: 1,
        createdAt: 1,
        updatedAt: 1,
        totalSaved: 1,
        hasTag: 1,
      },
    },
  ]);

  if (post.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This service not found');
  }

  const detail = post[0];

  const savedPost = await Saved.findOne({ userId, postId });
  detail.isSaved = savedPost ? true : false;

  detail.views = (detail.views ?? 0) + 1;

  await Post.updateOne(
    { _id: postId },
    { $set: { views: detail.views, isSaved: detail.isSaved } },
  );

  const relevantPosts = await Post.aggregate([
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(postId) },
        status: 'PUBLISHED',
        $or: [
          { category: detail.category },
          ...(detail.subcategory
            ? [{ subcategory: { $regex: new RegExp(detail.subcategory, 'i') } }]
            : []),
        ],
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
    { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'postId',
        as: 'reviews',
      },
    },
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comments',
      },
    },
    {
      $addFields: {
        feedback: {
          $cond: [{ $eq: ['$category', 'service'] }, '$reviews', '$comments'],
        },
      },
    },
    {
      $addFields: {
        averageRating: {
          $cond: [
            { $gt: [{ $size: '$feedback' }, 0] },
            { $avg: '$feedback.rating' },
            null,
          ],
        },
        reviewsCount: { $size: '$feedback' },
      },
    },
    {
      $project: {
        title: 1,
        image: 1,
        location: 1,
        address: 1,
        category: 1,
        averageRating: 1,
        reviewsCount: 1,
      },
    },
    { $limit: 4 },
  ]);

  return {
    detail,
    relevantPosts,
  };
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
  ).populate('author', 'name image _id');

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
  postId: string,
  query: Record<string, unknown>,
) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const [post, total] = await Promise.all([
    Post.find({ _id: postId })
      .populate('attenders', 'name email image -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Post.countDocuments({ _id: postId }),
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

const myService = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const [post, total] = await Promise.all([
    Post.find({ author: userId, category: 'service' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean()
      .select('title category  subcategory _id')
      .populate('author', 'name image _id'),

    Post.countDocuments({ author: userId, category: 'service' }),
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
      .populate('author', 'name image _id')
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

// delete post admin and  check status if published then don't delete just change status to blocked

const publishedToBlocked = async (postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  if (post.status === 'PUBLISHED') {
    post.status = 'BLOCKED';
    await post.save();
    return;
  }
};

const blockOrSuspiciousToPublished = async (postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }
  if (post.status === 'BLOCKED' || post.status === 'SUSPICIOUS') {
    post.status = 'PUBLISHED';
    await post.save();
    return;
  }
};

// need total post base on category

const totalPostByCategory = async (category: string) => {
  const total = await Post.countDocuments({
    category: { $regex: new RegExp(category, 'i') },
  });
  return total;
};

// delete post by author

const deletePost = async (userId: string, postId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }
  if (post.author.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to delete this post',
    );
  }
  await Post.findByIdAndDelete(postId);
};

const moment = async (postId: string, tab: string) => {
  const post = await Post.findById(postId).populate('author', 'name image');
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  const media: string[] = [];
  const mediaSource: Array<{
    url: string;
    type: string;
    source: string;
    userName: string;
    userImage: string;
    like?: number;
  }> = [];

  if (post.category?.toLowerCase() !== 'service') {
    if (tab === 'all' || tab === 'owner') {
      // Add owner media
      if (post.media?.length) {
        post.media.forEach(url => {
          media.push(url);
          mediaSource.push({
            url,
            type:
              url.includes('.mp4') || url.includes('.mov') ? 'video' : 'image',
            source: 'owner',
            userName: (post.author as any).name,
            userImage: (post.author as any).image,
            like: post.likes || 0,
          });
        });
      }
    }

    if (tab === 'all' || tab === 'community') {
      const comments = await Comment.find({ postId }).populate(
        'userId',
        'name image',
      );
      const commentIds = comments.map(comment => comment._id);
      const replies = await Reply.find({
        commentId: { $in: commentIds },
      }).populate('userId', 'name image');

      // Process comments
      comments.forEach(comment => {
        const user = comment.userId as any;
        if (comment.video?.length) {
          const videos = Array.isArray(comment.video)
            ? comment.video
            : [comment.video];
          videos.forEach(url => {
            media.push(url);
            mediaSource.push({
              url,
              type: 'video',
              source: 'community',
              userName: user?.name,
              userImage: user?.image,
              like: comment.like || 0,
            });
          });
        }
        if (comment.image?.length) {
          const images = Array.isArray(comment.image)
            ? comment.image
            : [comment.image];
          images.forEach(url => {
            media.push(url);
            mediaSource.push({
              url,
              type: 'image',
              source: 'community',
              userName: user?.name,
              userImage: user?.image,
              like: comment.like || 0,
            });
          });
        }
      });

      // Process replies
      replies.forEach(reply => {
        const user = reply.userId as any;
        if (reply.video?.length) {
          const videos = Array.isArray(reply.video)
            ? reply.video
            : [reply.video];
          videos.forEach(url => {
            media.push(url);
            mediaSource.push({
              url,
              type: 'video',
              source: 'community',
              userName: user?.name,
              userImage: user?.image,
              like: reply.like || 0,
            });
          });
        }
        if (reply.image?.length) {
          const images = Array.isArray(reply.image)
            ? reply.image
            : [reply.image];
          images.forEach(url => {
            media.push(url);
            mediaSource.push({
              url,
              type: 'image',
              source: 'community',
              userName: user?.name,
              userImage: user?.image,
              like: reply.like || 0,
            });
          });
        }
      });
    }
  } else {
    // Handle service posts (reviews)
    if (tab === 'all' || tab === 'owner') {
      // Add owner media
      if (post.media?.length) {
        post.media.forEach(url => {
          media.push(url);
          mediaSource.push({
            url,
            type:
              url.includes('.mp4') || url.includes('.mov') ? 'video' : 'image',
            source: 'owner',
            userName: (post.author as any).name,
            userImage: (post.author as any).image,
            like: post.likes || 0,
          });
        });
      }
    }

    if (tab === 'all' || tab === 'community') {
      const reviews = await Review.find({ postId }).populate(
        'userId',
        'name image',
      );

      reviews.forEach(review => {
        const user = review.userId as any;
        if (review.video?.length) {
          const videos = Array.isArray(review.video)
            ? review.video
            : [review.video];
          videos.forEach(url => {
            media.push(url);
            mediaSource.push({
              url,
              type: 'video',
              source: 'community',
              userName: user?.name,
              userImage: user?.image,
            });
          });
        }
        if (review.image?.length) {
          const images = Array.isArray(review.image)
            ? review.image
            : [review.image];
          images.forEach(url => {
            media.push(url);
            mediaSource.push({
              url,
              type: 'image',
              source: 'community',
              userName: user?.name,
              userImage: user?.image,
            });
          });
        }
      });
    }
  }

  return {
    media,
    mediaSource,
    postInfo: {
      authorName: (post.author as any)?.name,
      likes: post.likes || 0,
      views: post.views || 0,
      category: post.category,
      hasTag: post.hasTag,
    },
  };
};

const sideData = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const userLocation = user.location;

  const trendingServices = await Post.find({
    category: 'service',
    location: { $near: userLocation },
  })
    .sort({ likes: -1, views: -1 })
    .lean();
  const upcomingEvents = await Post.find({
    category: 'event',
    location: { $near: userLocation },
    startDate: { $gte: new Date() },
  })
    .sort({ startDate: 1 })
    .lean();

  const nearestDeals = await Post.find({
    category: 'deal',
    location: { $near: userLocation },
  })
    .sort({ createdAt: -1 })
    .lean();

  const alerts = await Post.find({
    category: 'alert',
    location: { $near: userLocation },
  })
    .sort({ createdAt: -1 })
    .lean();

  return {
    trendingServices,
    upcomingEvents,
    nearestDeals,
    alerts,
  };
};

export const PostService = {
  createPost,
  getAllPosts,
  postDetails,
  joinEvent,
  myJoinEvents,
  myPost,
  myService,
  updatePost,
  userPost,
  userJoinEvents,
  publishedPost,
  suspiciousPost,
  blockPost,
  publishedToBlocked,
  blockOrSuspiciousToPublished,
  totalPostByCategory,
  deletePost,
  detailWithRelevantPost,
  moment,
  sideData,
};
