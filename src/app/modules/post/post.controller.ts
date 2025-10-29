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

export const PostController = {
  createPost,
};
