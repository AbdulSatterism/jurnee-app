import { TTerms } from './terms.interface';
import { Terms } from './terms.model';

const createTerms = async (payload: TTerms) => {
  const result = await Terms.create(payload);

  return result;
};

const getAllTerms = async () => {
  const result = await Terms.find();

  return result;
};

const updateTerms = async (payload: TTerms) => {
  const result = await Terms.findOneAndUpdate(
    {},
    { description: payload.description },
    { new: true },
  );

  return result;
};

export const termsServices = {
  createTerms,
  getAllTerms,
  updateTerms,
};
