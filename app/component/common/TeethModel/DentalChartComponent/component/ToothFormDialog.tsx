import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Heading,
  SimpleGrid,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import {
  FiCalendar,
  FiFileText,
  FiMessageSquare,
  FiUser,
} from "react-icons/fi";

import { ToothData } from "../utils/teethData";
import CustomInput from "../../../../config/component/customInput/CustomInput";
import FormModel from "../../../FormModel/FormModel";
import { replaceLabelValueObjects } from "../../../../../config/utils/function";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";

interface ToothFormDialogProps {
  tooth: ToothData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPatient: boolean;
  patientDetails: any;
}

interface TreatmentFormData {
  treatmentPlan: string;
  treatmentDate: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  notes: string;
  patient?: any;
  doctor?: any; // Added doctor field
}

const initialFormData: TreatmentFormData = {
  treatmentPlan: "",
  treatmentDate: "",
  status: "pending",
  notes: "",
  patient: undefined,
  doctor: undefined,
};

const treatmentOptions = [
  { label: "Extraction", value: "Extraction" },
  { label: "Root Canal Treatment", value: "Root Canal Treatment" },
  { label: "Filling", value: "Filling" },
  { label: "Crown", value: "Crown" },
  { label: "Bridge", value: "Bridge" },
  { label: "Cleaning", value: "Cleaning" },
  { label: "Whitening", value: "Whitening" },
  { label: "Orthodontic Treatment", value: "Orthodontic Treatment" },
  { label: "Implant", value: "Implant" },
  { label: "Denture", value: "Denture" },
  { label: "Gum Treatment", value: "Gum Treatment" },
  { label: "Other", value: "Other" },
];

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export const ToothFormDialog = observer(
  ({
    tooth,
    open,
    onOpenChange,
    isPatient,
    patientDetails,
  }: ToothFormDialogProps) => {
    const toast = useToast();
    const [formLoading, setFormLoading] = useState(false);
    const {
      toothTreatmentStore: { createToothTreatment },
    } = stores;
    if (!tooth) return null;
    const handleSubmit = async (formData: any) => {
      try {
        setFormLoading(true);
        const values = { ...formData };

        createToothTreatment({
          ...values,
          ...(replaceLabelValueObjects(values) || {}),
          tooth,
        })
          .then(() => {
            setFormLoading(false);
            toast({
              title: "Patient Added.",
              description: `Record has been successfully added.`,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            if(onOpenChange){
              onOpenChange(false)
            }
          })
          .catch((err: any) => {
            setFormLoading(false);
            toast({
              title: "failed to create",
              description: `${err?.message}`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          });
      } catch (err: any) {
        setFormLoading(false);
        toast({
          title: "failed to create",
          description: `${err?.message}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const modalTitle = (
      <HStack spacing={3}>
        <Box
          w="40px"
          h="40px"
          rounded="full"
          bg="blue.50"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
          color="blue.600"
        >
          {tooth.fdi}
        </Box>
        <Heading size="md">Tooth Treatment</Heading>
      </HStack>
    );

    return (
      <FormModel
        open={open}
        close={() => onOpenChange(false)}
        isCentered
        title={modalTitle}
        size="xl"
      >
        <VStack spacing={6} align="stretch" p={4}>
          {/* Tooth Info */}
          <HStack spacing={2} wrap="wrap">
            <Badge colorScheme="gray">{tooth.name}</Badge>
            <Badge variant="outline">FDI: {tooth.fdi}</Badge>
            <Badge variant="outline">Universal: {tooth.universal}</Badge>
            <Badge variant="outline">Palmer: {tooth.palmer}</Badge>
          </HStack>

          <Formik
            initialValues={{
              ...initialFormData,
              patient: {
                label: `${patientDetails?.name}`,
                value: patientDetails?._id,
              },
            }}
            enableReinitialize={true}
            validate={(values) => {
              const errors: Partial<TreatmentFormData> = {};
              if (!values.treatmentPlan) {
                errors.treatmentPlan = "Treatment plan is required";
              }
              // Optional: require doctor if not pre-filled
              // if (!values.doctor) errors.doctor = "Doctor is required";
              return errors;
            }}
            onSubmit={handleSubmit}
          >
            {({
              values,
              setFieldValue,
              errors,
              touched,
              handleSubmit,
            }: any) => (
              <FormikForm onSubmit={handleSubmit}>
                <VStack spacing={5} align="stretch">
                  {/* Patient Search */}
                  <Grid
                    gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap={4}
                  >
                    <CustomInput
                      name="patient"
                      placeholder="Search Patient"
                      type="real-time-user-search"
                      label="Patient"
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
                          ? [values?.patient]
                          : []
                      }
                      error={errors.patient as string}
                      query={{ type: "patient" }}
                    />

                    {/* Doctor Search */}
                    <CustomInput
                      name="doctor"
                      placeholder="Search Doctor"
                      type="real-time-user-search"
                      label="Doctor"
                      required // Change to false if optional
                      value={values.doctor}
                      onChange={(val: any) => {
                        setFieldValue("doctor", val);
                      }}
                      options={
                        patientDetails?.primaryDoctor
                          ? [
                              {
                                label: patientDetails.primaryDoctor.name,
                                value: patientDetails.primaryDoctor._id,
                              },
                            ]
                          : values?.doctor
                          ? [values?.doctor]
                          : []
                      }
                      error={errors.doctor as string}
                      query={{ type: "doctor" }} // Assuming your backend supports this
                    />
                  </Grid>
                  {/* Treatment Plan */}
                  <FormControl isRequired>
                    <FormLabel display="flex" gap={2}>
                      <FiFileText /> Treatment Plan
                    </FormLabel>
                    <CustomInput
                      name="treatmentPlan"
                      type="select"
                      placeholder="Select treatment"
                      options={treatmentOptions}
                      value={values.treatmentPlan}
                      onChange={(value: string) =>
                        setFieldValue("treatmentPlan", value)
                      }
                      error={
                        touched.treatmentPlan ? errors.treatmentPlan : undefined
                      }
                      showError={
                        touched.treatmentPlan && !!errors.treatmentPlan
                      }
                    />
                  </FormControl>

                  {/* Date & Status */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel display="flex" gap={2}>
                        <FiCalendar /> Treatment Date
                      </FormLabel>
                      <CustomInput
                        name="treatmentDate"
                        type="date"
                        value={values.treatmentDate}
                        onChange={(e: any) =>
                          setFieldValue("treatmentDate", e.target.value)
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <CustomInput
                        name="status"
                        type="select"
                        options={statusOptions}
                        value={values.status}
                        onChange={(value: string) =>
                          setFieldValue("status", value)
                        }
                      />
                    </FormControl>
                  </SimpleGrid>

                  {/* Notes */}
                  <FormControl>
                    <FormLabel display="flex" gap={2}>
                      <FiMessageSquare /> Notes
                    </FormLabel>
                    <CustomInput
                      name="notes"
                      type="textarea"
                      placeholder="Additional notes..."
                      value={values.notes}
                      onChange={(e: any) =>
                        setFieldValue("notes", e.target.value)
                      }
                      style={{ minHeight: "80px", resize: "none" }}
                    />
                  </FormControl>

                  {/* Footer Buttons */}
                  <HStack spacing={3} pt={4} justify="flex-end">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      type="submit"
                      isLoading={formLoading}
                    >
                      Save Treatment
                    </Button>
                  </HStack>
                </VStack>
              </FormikForm>
            )}
          </Formik>
        </VStack>
      </FormModel>
    );
  }
);