"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import * as Yup from "yup";
import { format } from "date-fns";
import { useEffect } from "react";
import stores from "../../../../store/stores";
import { status } from "../utils/constant";
import { replaceLabelValueObjects } from "../../../../config/utils/function";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

/* -------------------------------------------------
   Validation
------------------------------------------------- */
const RecallAppointmentValidation = Yup.object().shape({
  patient: Yup.object().required("Patient is required"),
  doctor: Yup.object().nullable(),
  appointment: Yup.object().nullable(),
  recallDate: Yup.date().nullable(),
  reason: Yup.string().required("Reason is required"),
  status: Yup.mixed(),
  startTime: Yup.string().nullable(),
  endTime: Yup.string().nullable(),
});

const RecallAppointmentForm = observer(
  ({
    isPatient,
    patientDetails,
    onClose,
    initialValues,
    isEdit = false,
    applyGetAllRecords,
    setOpenReportModal,
    haveAppointmentDetails,
    autofillData
  }: any) => {
    const {
      recallAppointmentStore: {
        createRecallAppointment,
        updateRecallAppointment,
      },
      auth: { openNotification },
    } = stores;
    const [loading, setLoading] = useState(false);

    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={RecallAppointmentValidation}
        onSubmit={async (values, { resetForm }) => {
          try {
            setLoading(true);
            if (isEdit) {
              let dts = values
              delete dts.createdBy
              delete dts.company
              updateRecallAppointment(
                replaceLabelValueObjects({ ...dts, _id: initialValues?._id, appointment : haveAppointmentDetails?._id })
              )
                .then(() => {
                  setLoading(false);
                  openNotification({
                    type: "success",
                    title: "Update SUCCESSFULLY",
                    message: "Recall Appointment has been updated Successfully",
                  });
                  if (onClose && applyGetAllRecords) {
                    applyGetAllRecords({});
                    resetForm();
                    onClose();
                  }
                })
                .catch((err) => {
                  setLoading(false);
                  openNotification({
                    type: "error",
                    title: "Failed to update Recall Appointment",
                    message: err?.message,
                  });
                })
                .finally(() => {});
            } else {
              createRecallAppointment(replaceLabelValueObjects({...values,appointment : haveAppointmentDetails?._id}))
                .then(() => {
                  setLoading(false);

                  openNotification({
                    type: "success",
                    title: "CREATED SUCCESSFULLY",
                    message: "Appointment has been Created Successfully",
                  });
                  if (onClose && applyGetAllRecords) {
                    applyGetAllRecords({});
                    resetForm();
                    onClose();
                  }
                })
                .catch((err) => {
                  setLoading(false);
                  openNotification({
                    type: "error",
                    title: "Failed to Create Appointment",
                    message: err?.message,
                  });
                })
                .finally(() => {});
            }
          } catch (err: any) {
            openNotification?.({
              type: "error",
              title: "Failed",
              message: err?.message || "Something went wrong",
            });
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
        }: any) => {

          // Listen for autofillData changes
          useEffect(() => {
            console.log("Autofill Data Received:", autofillData);
            if (autofillData) {
                if(autofillData.appointmentDate) {
                    setFieldValue("appointmentDate", format(new Date(autofillData.appointmentDate), "yyyy-MM-dd"));
                }
                if(autofillData.startTime) {
                    console.log("Setting startTime:", autofillData.startTime);
                    setFieldValue("startTime", autofillData.startTime);
                }
                if(autofillData.endTime) {
                    setFieldValue("endTime", autofillData.endTime);
                }
                // Optional: set doctor or chair if provided
                 if(autofillData.doctor) {
                    // setFieldValue("doctor", autofillData.doctor);
                 }
            }
          }, [autofillData, setFieldValue]);

          return (
            <FormikForm onSubmit={handleSubmit}>
  <Box
    bg="white"
    borderRadius="xl"
    boxShadow="sm"
    p={{ base: 4, md: 6 }}
  >
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {/* -------- Patient & Doctor -------- */}
      <Box>
        <CustomInput
          name="patient"
          label="Patient"
          type="real-time-user-search"
          placeholder="Search Patient"
          required
          value={values.patient}
          onChange={(val: any) => setFieldValue("patient", val)}
          options={
            isPatient
              ? [
                  {
                    label: `${patientDetails?.name} (${patientDetails?.code})`,
                    value: patientDetails?._id,
                  },
                ]
              : values?.patient
              ? [values.patient]
              : []
          }
          error={errors.patient}
          showError={touched.patient}
          query={{ type: "patient" }}
        />
      </Box>

      <Box>
        <CustomInput
          name="doctor"
          label="Doctor"
          type="real-time-user-search"
          placeholder="Assign Doctor"
          value={values.doctor}
          options={values?.doctor ? [values.doctor] : []}
          onChange={(val: any) => setFieldValue("doctor", val)}
          error={errors.doctor}
          showError={touched.doctor}
          query={{ type: "doctor" }}
        />
      </Box>

      {/* -------- Dates -------- */}
      <Box>
        <CustomInput
          name="recallDate"
          label="Recall Date"
          type="date"
          value={values.recallDate}
          onChange={handleChange}
          error={errors.recallDate}
          showError={touched.recallDate}
        />
      </Box>

      <Box>
        <CustomInput
          name="appointmentDate"
          label="Appointment Date"
          type="date"
          placeholder="Appointment Date"
          value={values.appointmentDate}
          onChange={handleChange}
        />
      </Box>

      {/* -------- Status -------- */}
      <Box>
        <CustomInput
          name="status"
          label="Status"
          type="select"
          options={status}
          value={values.status}
          onChange={(val: any) => setFieldValue("status", val)}
        />
      </Box>

      {/* -------- Action Button -------- */}
      {values.patient && values?.appointmentDate && (
        <Flex align="flex-end">
          <Button
            colorScheme="blue"
            variant="outline"
            width="100%"
            onClick={() => setOpenReportModal(values)}
          >
            Show Appointment
          </Button>
        </Flex>
      )}

      {/* -------- Reason -------- */}
      <Box gridColumn={{ base: "span 1", md: "span 2" }}>
        <CustomInput
          label="Reason"
          name="reason"
          type="textarea"
          placeholder="Enter recall reason"
          required
          value={values.reason}
          onChange={handleChange}
          error={errors.reason}
          showError={touched.reason}
        />
      </Box>
    </SimpleGrid>

    {/* -------- Footer Actions -------- */}
    <Flex
      justify="flex-end"
      gap={3}
      mt={6}
      pt={4}
      borderTop="1px solid"
      borderColor="gray.100"
    >
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" colorScheme="teal" isLoading={loading}>
        {isEdit ? "Update Recall" : "Create Recall"}
      </Button>
    </Flex>
  </Box>
</FormikForm>

          );
        }}
      </Formik>
    );
  }
);

export default RecallAppointmentForm;