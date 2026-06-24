import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PayoutRecordService } from './payoutRecord.services';

const getAllPayoutRecord = catchAsync(async (req, res) => {
  const result = await PayoutRecordService.getAllPayoutRecord(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Payout records retrieved successfully',

    data: result.data,
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
  });
});

const getPayoutRecordById = catchAsync(async (req, res) => {
  const result = await PayoutRecordService.getPayoutRecordById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Payout record retrieved successfully',
    data: result,
  });
});

const updatePayoutRecordStatus = catchAsync(async (req, res) => {
  const result = await PayoutRecordService.updatePayoutRecordStatus(
    req.params.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Payout record status updated successfully',
    data: result,
  });
});

export const PayoutRecordController = {
  getAllPayoutRecord,
  getPayoutRecordById,
  updatePayoutRecordStatus,
};
