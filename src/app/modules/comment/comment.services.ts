/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { IComment } from './comment.interface';
import { StatusCodes } from 'http-status-codes';
import { Post } from '../post/post.model';
import AppError from '../../errors/AppError';
import { Comment } from './comment.model';

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

// get all comment base on specific post id

// const allCommentsByPostId = async (
//   postId: string,
//   query: Record<string, unknown>,
// ) => {
//   const { page, limit } = query;
//   const pages = parseInt(page as string) || 1;
//   const size = parseInt(limit as string) || 10;
//   const skip = (pages - 1) * size;

//   const postExist = await Post.findById(postId);
//   if (!postExist) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
//   }

//   const [result, total] = await Promise.all([
//     Comment.find({ postId: new Types.ObjectId(postId) })
//       .populate({ path: 'userId', select: 'name image -_id' })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(size)
//       .lean(),
//     Comment.countDocuments({ postId: new Types.ObjectId(postId) }),
//   ]);

//   const totalPage = Math.ceil(total / size);

//   return {
//     data: result,
//     meta: {
//       page: pages,
//       limit: size,
//       totalPage,
//       total,
//     },
//   };
// };

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

export const CommentServices = {
  createComment,
  allCommentsByPostId,
};
