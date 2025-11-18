import catchAsync from '../../../shared/catchAsync';
import { SavedService } from './saved.services';

const savedToggle = catchAsync(async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.id;

  const result = await SavedService.toggleSaved(userId, postId);
  res.status(200).json({
    success: true,
    message: 'Saved toggled successfully',
    data: result,
  });
});

const mySavedPost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await SavedService.mySavedPost(userId, req.query);
  res.status(200).json({
    success: true,
    message: ' Saved posts retrieved successfully',

    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

export const SavedController = {
  savedToggle,
  mySavedPost,
};
