import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NotificationService } from './notifications.service';

const allNotificationBySpecificUser = catchAsync(async (req, res) => {
  const result = await NotificationService.allNotificationBySpecificUser(
    req.user.id,
    req.query,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

const singleNotification = catchAsync(async (req, res) => {
  const result = await NotificationService.singleNotification(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification retrieved successfully',
    data: result,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const result = await NotificationService.deleteNotification(
    req.user.id,
    req.params.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification deleted successfully',
    data: result,
  });
});

export const NotificationController = {
  allNotificationBySpecificUser,
  singleNotification,
  deleteNotification,
};
