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

export const LikeController = {
  likeToggle,
};
