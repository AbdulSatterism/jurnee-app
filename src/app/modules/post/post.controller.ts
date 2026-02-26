import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { PostService } from './post.services';
import sendResponse from '../../../shared/sendResponse';
import { Cache } from '../../../lib/cache';

const createPost = catchAsync(async (req, res) => {
  const author = req.user.id;
  const result = await PostService.createPost(author, req.body);

  await Cache.delByPattern('post:*');

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPosts = catchAsync(async (req, res) => {
  const result = await PostService.getAllPosts(req.query, req?.user.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const postDetails = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const result = await PostService.postDetails(postId, userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post retrieved successfully',
    data: result,
  });
});

const detailWithRelevantPost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const result = await PostService.detailWithRelevantPost(postId, userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post details with relevant posts',
    data: result,
  });
});

const joinEvent = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const result = await PostService.joinEvent(userId, postId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Joined successfully',
    data: result,
  });
});

const myJoinEvent = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await PostService.myJoinEvents(userId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Joined events retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const userJoinEvent = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await PostService.userJoinEvents(userId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User joined events retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const myPost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await PostService.myPost(userId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'My posts retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const myService = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await PostService.myService(userId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'my all services here',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const userPost = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await PostService.userPost(userId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User posts retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const updatePost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;
  const result = await PostService.updatePost(userId, postId, req.body);

  await Cache.delByPattern('post:*');

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post updated successfully',
    data: result,
  });
});

// for admin

const publishedPosts = catchAsync(async (req, res) => {
  const result = await PostService.publishedPost(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Published posts retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const blockedPosts = catchAsync(async (req, res) => {
  const result = await PostService.blockPost(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Blocked posts retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const suspiciousPosts = catchAsync(async (req, res) => {
  const result = await PostService.suspiciousPost(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Suspicious posts retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const blockOrSuspiciousToPublished = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const result = await PostService.blockOrSuspiciousToPublished(postId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post status updated to published successfully',
    data: result,
  });
});

const publishedToBlocked = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const result = await PostService.publishedToBlocked(postId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post status updated to blocked successfully',
    data: result,
  });
});

const totalPostByCategory = catchAsync(async (req, res) => {
  const category = req.params.category;
  const total = await PostService.totalPostByCategory(category);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `total posts in ${category} category`,
    data: total,
  });
});

const deletePost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const result = await PostService.deletePost(userId, postId);
  await Cache.delByPattern('post:*');
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post deleted successfully',
    data: result,
  });
});

const momnet = catchAsync(async (req, res) => {
  const result = await PostService.moment(req.params.id, req.params.tab);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Moment retrieved successfully',
    data: result,
  });
});

export const PostController = {
  createPost,
  getAllPosts,
  postDetails,
  joinEvent,
  myJoinEvent,
  myService,
  myPost,
  updatePost,
  userPost,
  userJoinEvent,
  publishedPosts,
  suspiciousPosts,
  blockedPosts,
  blockOrSuspiciousToPublished,
  publishedToBlocked,
  totalPostByCategory,
  deletePost,
  detailWithRelevantPost,
  momnet,
};
