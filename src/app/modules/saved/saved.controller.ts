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

export const SavedController = {
  savedToggle,
};
