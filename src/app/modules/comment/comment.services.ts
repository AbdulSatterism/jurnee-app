/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { IComment } from './comment.interface';
import { StatusCodes } from 'http-status-codes';
import { Post } from '../post/post.model';
import AppError from '../../errors/AppError';
import { Comment } from './comment.model';
import { User } from '../user/user.model';

const createComment = async (userId: string, payload: Partial<IComment>) => {
  payload.userId = new Types.ObjectId(userId);

  const post = await Post.findById(payload.postId);
  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  // this comment only for non-service post

  if (post.category === 'service') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'service post cannot be commented on',
    );
  }

  const comment = await Comment.create(payload);
  return comment;
};
/*
const createComment = async (userId: string, payload: Partial<IComment>) => {
  const { postId, parentComment, content } = payload;

  const post = await Post.findById(postId);
  if (!post) throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');

  // If it's a reply, validate parent comment
  if (parentComment) {
    const parent = await Comment.findOne({ _id: parentComment, postId });
    if (!parent) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        'Parent comment not found in this post',
      );
    }
  }

  const comment = await Comment.create({
    userId: new Types.ObjectId(userId),
    postId: new Types.ObjectId(postId),
    parentComment: parentComment ? new Types.ObjectId(parentComment) : null,
    content,
    like: 0,
    replyCount: 0,
  });

  // Increment replyCount on parent if it's a reply
  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment, { $inc: { replyCount: 1 } });
  }

  // Return populated user
  return comment.populate('userId', 'name image');
};

*/

const allCommentsByPostId = async (
  postId: string,
  userId: string, // required
  query: Record<string, unknown>,
) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // validations
  if (!Types.ObjectId.isValid(postId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid postId');
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid userId');
  }

  const [postExist, viewerExist] = await Promise.all([
    Post.exists({ _id: postId }),
    User.exists({ _id: userId }),
  ]);

  if (!postExist) throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  if (!viewerExist) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  const postObjectId = new Types.ObjectId(postId);
  const viewerObjectId = new Types.ObjectId(userId);

  const [rows, totalArr] = await Promise.all([
    Comment.aggregate([
      { $match: { postId: postObjectId } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

      // comment user
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { name: 1, image: 1 } }],
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

      // comment liked by viewer
      {
        $lookup: {
          from: 'commentlikes',
          let: { commentId: '$_id' },
          as: 'viewerLike',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$commentId', '$$commentId'] },
                    { $eq: ['$userId', viewerObjectId] },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
            { $limit: 1 },
          ],
        },
      },
      {
        $addFields: {
          liked: { $gt: [{ $size: '$viewerLike' }, 0] },
        },
      },
      { $project: { viewerLike: 0 } },

      // replies + reply liked
      {
        $lookup: {
          from: 'replies',
          let: { commentId: '$_id' },
          as: 'reply',
          pipeline: [
            { $match: { $expr: { $eq: ['$commentId', '$$commentId'] } } },
            { $sort: { createdAt: 1 } },

            // reply user
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
                pipeline: [{ $project: { name: 1, image: 1 } }],
              },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

            // reply liked by viewer
            {
              $lookup: {
                from: 'replylikes',
                let: { replyId: '$_id' },
                as: 'viewerReplyLike',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$replyId', '$$replyId'] },
                          { $eq: ['$userId', viewerObjectId] },
                        ],
                      },
                    },
                  },
                  { $project: { _id: 1 } },
                  { $limit: 1 },
                ],
              },
            },
            {
              $addFields: {
                liked: { $gt: [{ $size: '$viewerReplyLike' }, 0] },
              },
            },
            { $project: { viewerReplyLike: 0, userId: 0 } },
          ],
        },
      },

      // clean top-level ids
      { $project: { userId: 0 } },
    ]),
    Comment.aggregate([
      { $match: { postId: postObjectId } },
      { $count: 'total' },
    ]),
  ]);

  const total = totalArr[0]?.total ?? 0;
  const totalPage = Math.ceil(total / limit);

  return {
    data: rows.map((c: any) => ({
      ...c,
      reply: c.reply?.map((r: any) => ({ ...r })) ?? [],
    })),
    meta: { page, limit, totalPage, total },
  };
};

/*
const allCommentsByPostId = async (
  postId: string,
  viewerId: string,
  query: Record<string, unknown>,
) => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.max(1, parseInt(query.limit as string) || 10);
  const skip = (page - 1) * limit;

  // Validate IDs
  if (!Types.ObjectId.isValid(postId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid postId');
  }
  if (!Types.ObjectId.isValid(viewerId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid viewerId');
  }

  const postObjectId = new Types.ObjectId(postId);
  const viewerObjectId = new Types.ObjectId(viewerId);

  // Verify post exists
  const postExists = await Post.exists({ _id: postObjectId });
  if (!postExists) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  // 1. Fetch paginated top-level comments (parentComment: null)
  const topComments = await Comment.find({
    postId: postObjectId,
    parentComment: null,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name image') // populate author details
    .lean();

  if (topComments.length === 0) {
    return {
      data: [],
      meta: { page, limit, totalPage: 0, total: 0 },
    };
  }

  // 2. Fetch ALL comments of this post (including replies) to build the tree
  const allComments = await Comment.find({ postId: postObjectId })
    .populate('userId', 'name image')
    .lean();

  // 3. Build a map: commentId -> comment with an empty children array
  const commentMap = new Map<string, any>();
  allComments.forEach(comment => {
    commentMap.set(comment._id.toString(), {
      ...comment,
      children: [],
    });
  });

  // 4. Attach each comment to its parent
  const roots: any[] = [];
  allComments.forEach(comment => {
    const commentWithChildren = commentMap.get(comment._id.toString());
    if (comment.parentComment) {
      const parent = commentMap.get(comment.parentComment.toString());
      if (parent) {
        parent.children.push(commentWithChildren);
      }
    } else {
      roots.push(commentWithChildren);
    }
  });

  // 5. Filter roots to only those that are in the current paginated topComments
  const paginatedRootIds = new Set(topComments.map(c => c._id.toString()));
  const paginatedRoots = roots.filter(root =>
    paginatedRootIds.has(root._id.toString()),
  );

  // 6. Collect all comment IDs from the paginated tree (including nested replies)
  const collectIds = (comments: any[]): string[] => {
    const ids: string[] = [];
    for (const c of comments) {
      ids.push(c._id.toString());
      if (c.children && c.children.length) {
        ids.push(...collectIds(c.children));
      }
    }
    return ids;
  };
  const allCommentIds = collectIds(paginatedRoots);

  // 7. Fetch viewer's likes on these comments
  const viewerLikes = await CommentLike.find({
    commentId: { $in: allCommentIds.map(id => new Types.ObjectId(id)) },
    userId: viewerObjectId,
  }).lean();

  const likedCommentIds = new Set(
    viewerLikes.map(like => like.commentId!.toString()),
  );

  // 8. Recursively add `liked` flag to each comment and clean up
  const addLikedFlag = (comment: any) => {
    comment.liked = likedCommentIds.has(comment._id.toString());
    // Rename userId to user (since populated)
    comment.user = comment.userId;
    delete comment.userId;
    if (comment.children && comment.children.length) {
      comment.children.forEach(addLikedFlag);
    }
    return comment;
  };

  paginatedRoots.forEach(addLikedFlag);

  // 9. Count total top-level comments for pagination metadata
  const totalTop = await Comment.countDocuments({
    postId: postObjectId,
    parentComment: null,
  });

  return {
    data: paginatedRoots,
    meta: {
      page,
      limit,
      totalPage: Math.ceil(totalTop / limit),
      total: totalTop,
    },
  };
};
*/
export const CommentServices = {
  createComment,
  allCommentsByPostId,
};
