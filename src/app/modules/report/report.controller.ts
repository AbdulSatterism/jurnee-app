import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReportService } from './report.services';

const createReport = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await ReportService.createReport(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Report created successfully',
    data: result,
  });
});

export const ReportController = {
  createReport,
};
