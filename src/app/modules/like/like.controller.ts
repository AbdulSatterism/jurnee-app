import catchAsync from '../../../shared/catchAsync';
import { LikeService } from './like.services';

const likeToggle = catchAsync(async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.id;

  const result = await LikeService.toggleLike(userId, postId);
  res.status(200).json({
    success: true,
    message: 'Like toggled successfully',
    data: result,
  });
});

const commentLikeToggle = catchAsync(async (req, res) => {
  const { commentId } = req.body;
  const userId = req.user.id;
  const result = await LikeService.commentLikeToggle(userId, commentId);
  res.status(200).json({
    success: true,
    message: 'Comment like toggled successfully',
    data: result,
  });
});

const replyLikeToggle = catchAsync(async (req, res) => {
  const { replyId } = req.body;
  const userId = req.user.id;
  const result = await LikeService.replyLikeToggle(userId, replyId);
  res.status(200).json({
    success: true,
    message: 'Reply like toggled successfully',
    data: result,
  });
});

export const LikeController = {
  likeToggle,
  commentLikeToggle,
  replyLikeToggle,
};
