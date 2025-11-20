/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import { termsServices } from './terms.service';

const createTerms = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await termsServices.createTerms(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'terms created succefully',
      data: result,
    });
  },
);
const getAllTerms = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await termsServices.getAllTerms();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'terms retrieve succefully',
      data: result,
    });
  },
);

const updateTerms = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await termsServices.updateTerms(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'terms updated succefully',
      data: result,
    });
  },
);

export const TermsControllers = {
  createTerms,
  getAllTerms,
  updateTerms,
};
