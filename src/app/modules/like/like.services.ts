import { Post } from '../post/post.model';
import { Like } from './like.model';

const toggleLike = async (userId: string, postId: string) => {
  const likeExists = await Like.findOne({ userId, postId });

  if (likeExists) {
    await Like.findByIdAndDelete(likeExists._id);
    await Post.findByIdAndUpdate(postId, {
      $inc: { likes: -1 },
    });
    return 'disliked';
  } else {
    const result = await Like.create({ userId, postId });
    await Post.findByIdAndUpdate(postId, {
      $inc: { likes: 1 },
    });
    return result;
  }
};

export const LikeService = {
  toggleLike,
};
