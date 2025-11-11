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

// all reports

const getAllReports = catchAsync(async (req, res) => {
  const result = await ReportService.getAllReports(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all reports retrieved successfully',
    meta: {
      page: Number(result.meta.page),
      limit: Number(result.meta.limit),
      totalPage: result.meta.totalPage,
      total: result.meta.total,
    },
    data: result.data,
  });
});

// report details

const getReportDetails = catchAsync(async (req, res) => {
  const reportId = req.params.id;
  const result = await ReportService.getReportDetails(reportId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Report details retrieved successfully',
    data: result,
  });
});

export const ReportController = {
  createReport,
  getAllReports,
  getReportDetails,
};
