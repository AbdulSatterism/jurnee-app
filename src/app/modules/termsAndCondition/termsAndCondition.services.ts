import { TTermsCondition } from './termsAndCondition.interface';
import { Guideline } from './termsAndCondition.model';

const createTermsCondition = async (payload: TTermsCondition) => {
  const result = await Guideline.create(payload);

  return result;
};

const getTermsCondinton = async () => {
  const result = await Guideline.find();

  return result;
};

const updateTermsCondition = async (payload: TTermsCondition) => {
  const result = await Guideline.findOneAndUpdate(
    {},
    { description: payload.description },
    { new: true },
  );

  return result;
};

export const termsConditionServices = {
  createTermsCondition,
  updateTermsCondition,
  getTermsCondinton,
};
