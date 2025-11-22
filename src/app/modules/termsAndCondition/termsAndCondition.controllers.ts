import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { termsConditionServices } from './termsAndCondition.services';

const createTermsCondition = catchAsync(async (req, res) => {
  const result = await termsConditionServices.createTermsCondition(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'guideline created succefully',
    data: result,
  });
});
const getTersmCondition = catchAsync(async (req, res) => {
  const result = await termsConditionServices.getTermsCondinton();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'guideline retrieve succefully',
    data: result,
  });
});

const updateTersmCondition = catchAsync(async (req, res) => {
  const result = await termsConditionServices.updateTermsCondition(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'guideline updated succefully',
    data: result,
  });
});

export const termsConditionController = {
  createTermsCondition,
  getTersmCondition,
  updateTersmCondition,
};
