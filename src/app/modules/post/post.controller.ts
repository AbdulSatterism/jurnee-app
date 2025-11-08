import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { PostService } from './post.services';
import sendResponse from '../../../shared/sendResponse';

const createPost = catchAsync(async (req, res) => {
  const author = req.user.id;
  const result = await PostService.createPost(author, req.body);
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

export const PostController = {
  createPost,
  getAllPosts,
};
