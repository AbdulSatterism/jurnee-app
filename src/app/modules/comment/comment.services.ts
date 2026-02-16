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
  query: Record<string, unknown>,
) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const postExist = await Post.exists({ _id: postId });
  if (!postExist) throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');

  const postObjectId = new Types.ObjectId(postId);

  const [rows, totalArr] = await Promise.all([
    Comment.aggregate([
      { $match: { postId: postObjectId } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

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

      {
        $lookup: {
          from: 'replies',
          let: { commentId: '$_id' },
          as: 'reply',
          pipeline: [
            { $match: { $expr: { $eq: ['$commentId', '$$commentId'] } } },
            { $sort: { createdAt: 1 } },

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
            {
              $project: {
                userId: 0,
              },
            },
          ],
        },
      },

      {
        $project: {
          userId: 0,
        },
      },
    ]),
    Comment.aggregate([
      { $match: { postId: postObjectId } },
      { $count: 'total' },
    ]),
  ]);

  const total = totalArr[0]?.total ?? 0;
  const totalPage = Math.ceil(total / limit);

  return {
    data: rows.map(c => ({
      ...c,
      reply: c.reply?.map((r: any) => ({
        ...r,
      })),
    })),
    meta: { page, limit, totalPage, total },
  };
};

*/
export const CommentServices = {
  createComment,
  allCommentsByPostId,
};
