import { Post } from '../post/post.model';
import { Saved } from './saved.model';

const toggleSaved = async (userId: string, postId: string) => {
  const savedExists = await Saved.findOne({ userId, postId });

  if (savedExists) {
    await Saved.findByIdAndDelete(savedExists._id);
    await Post.findByIdAndUpdate(postId, { $inc: { totalSaved: -1 } });
    return 'unsaved';
  }

  const result = await Saved.create({ userId, postId });
  await Post.findByIdAndUpdate(postId, { $inc: { totalSaved: 1 } });

  return result;
};

export const SavedService = {
  toggleSaved,
};
