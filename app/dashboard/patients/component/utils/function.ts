import { genderOptions, insuranceTypeOptions, vaccinationTypeOptions } from "../../../../config/constant";
import { initialValues, titles } from "./constant";

export const generateIntialValues = (initialData: any = {}) => {

  return {
    ...initialValues,
    ...initialData,
    pic: initialData?.pic?.url
      ? { file: initialData.pic }
      : { file: [] },
    refrenceBy : initialData?.refrenceBy ? Object.keys(initialData?.refrenceBy || {}).length > 1 ? {label : `${initialData?.refrenceBy?.username}(${initialData?.refrenceBy?.code})`, value : initialData?.refrenceBy?._id } : undefined : undefined,
    gender:
      genderOptions.find((it: any) => it.value === initialData?.gender) ||
      genderOptions[0],
    vaccinations: Array.isArray(initialData?.vaccinations)
      ? initialData.vaccinations.map((it: any) => ({
          ...it,
          type:
            vaccinationTypeOptions.find((opt: any) => opt.value === it?.type) ||
            null,
        }))
      : [],
      degreeInfo: Array.isArray(initialData?.degreeInfo)
      ? initialData.degreeInfo.map((it: any) => ({
          ...it,
        }))
      : [],
    insurances: Array.isArray(initialData?.insurances)
      ? initialData.insurances.map((it: any) => ({
          ...it
        }))
      : [],
    title:
     initialData?.title?.value  ?  titles[0] : {label : initialData?.title, value : initialData?.title},
  };
};

