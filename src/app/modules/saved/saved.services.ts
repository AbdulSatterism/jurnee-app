import { Saved } from './saved.model';

const toggleSaved = async (userId: string, postId: string) => {
  const savedExists = await Saved.findOne({ userId, postId });

  if (savedExists) {
    await Saved.findByIdAndDelete(savedExists._id);
    return 'unsaved';
  }

  const result = await Saved.create({ userId, postId });
  return result;
};

export const SavedService = {
  toggleSaved,
};
