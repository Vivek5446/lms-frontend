import { initialValues } from "./constant";

export const generateIntialValues = (initialData: any = {}) => {
  return {
    ...initialValues,
    ...initialData
  };
};

