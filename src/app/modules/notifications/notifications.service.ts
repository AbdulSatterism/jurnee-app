/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { Notification } from './notifications.model';

const allNotificationBySpecificUser = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const [notifications, total] = await Promise.all([
    Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean(),
    Notification.countDocuments({ receiverId: userId }),
  ]);

  const totalPage = Math.ceil(total / size);

  return {
    data: notifications,
    meta: {
      page: pages,
      limit: size,
      totalPage,
      total,
    },
  };
};

const singleNotification = async (notificationId: string) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Notification not found');
  }

  // update also notification status which is false make it true

  const result = await Notification.findByIdAndUpdate(notificationId, {
    read: true,
  });

  return result;
};

const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Notification not found');
  }

  //

  if (notification.receiverId.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not allowed to delete this notification',
    );
  }

  const result = await Notification.findByIdAndDelete(notificationId);
  return result;
};

export const NotificationService = {
  allNotificationBySpecificUser,
  singleNotification,
  deleteNotification,
};
