import React from "react";
import TestimonialForm from "./MainForm";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import { readFileAsBase64 } from "../../../config/utils/utils";

const AddForm = observer(({ close }: any) => {
  const {
    EventStore: { createEvent },
    auth: { openNotification },
  } = stores;

  const initialValues = { title: "", price: "", category : "", target: "", eventDate : undefined, trigger : "" ,image:  { file: []  }};

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {

    const formData = {
      ...values
    };

    if (values.image?.file && values.image?.file?.length !== 0) {
      const buffer = await readFileAsBase64(values.image?.file);
      const fileData = {
        buffer: buffer,
        filename: values.image?.file?.name,
        type: values.image?.file?.type,
        isAdd : values.image?.isAdd || 1
      };
      formData.image = fileData;
    }

    createEvent(formData)
      .then((data: any) => {
        openNotification({ title: "Created Successfully", message: data?.message, type: "success" });
        resetForm();
        close();
      })
      .catch((err: any) => {
        openNotification({ title: "Create Failed", message: err?.message, type: "error" });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return <TestimonialForm initialValues={initialValues} onSubmit={handleSubmit} close={close} />;
});

export default AddForm;
