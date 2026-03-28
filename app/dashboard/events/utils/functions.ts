export const generateTestimonailsInitialValues = (data: any = {}) => {
    return {
        ...data,
      image: data?.image?.url
        ? { file: data.image }
        : { file: [] },
    };
  };