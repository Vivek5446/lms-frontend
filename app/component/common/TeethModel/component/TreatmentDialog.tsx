'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Grid,
  GridItem,
  SimpleGrid
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
// import CustomInput from "@/component/config/component/customInput/CustomInput";
import { useToast } from "@chakra-ui/react";
import CustomInput from "../../../config/component/customInput/CustomInput";

interface ToothData {
  number: number;
  name: string;
  type: string;
  quadrant: string;
  description: string;
  years: string;
}

interface TreatmentDialogProps {
  tooth: ToothData | null;
  isOpen: boolean;
  onClose: () => void;
}

// -----------------------------
// VALIDATION SCHEMA
// -----------------------------
const TreatmentSchema = Yup.object().shape({
  condition: Yup.mixed().required("Condition is required"),
  date: Yup.string().required("Date is required"),
  treatment: Yup.string().required("Treatment details are required"),
  notes: Yup.string().optional(),
});

// -----------------------------

export default function TreatmentDialog({
  tooth,
  isOpen,
  onClose,
}: TreatmentDialogProps) {
  const toast = useToast();
  if (!tooth) return null;

  const initialValues = {
    condition: "",
    date: new Date().toISOString().split("T")[0],
    treatment: "",
    notes: "",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Tooth #{tooth.number} Treatment Details
          <Text fontSize="sm" color="gray.500" mt={1}>
            {tooth.name} – {tooth.type}
          </Text>
        </ModalHeader>

        <ModalCloseButton />

        <Formik
          initialValues={initialValues}
          validationSchema={TreatmentSchema}
       onSubmit={({},{}) => {

  // const payload = {
  //   ...values,
  //   toothNumber: tooth?.number,
  //   toothName: tooth?.name,
  //   toothType: tooth?.type,
  //   quadrant: tooth?.quadrant
  // };

  toast({
    title: "Success",
    description: "Treatment details saved successfully",
    status: "success",
  });

  // resetForm();
  onClose();
}}

        >
          {({ values, errors, touched, handleSubmit, setFieldValue }) => (
            <FormikForm onSubmit={handleSubmit}>
              <ModalBody pb={4}>
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr" }}
                  gap={6}
                  mb={2}
                >
                  <GridItem>
                    <SimpleGrid columns={1} spacing={4}>

                      {/* CONDITION */}
                      <CustomInput
                        label="Condition"
                        name="condition"
                        type="select"
                        required
                        options={[
                          { label: "Cavity/Decay", value: "cavity" },
                          { label: "Crown Needed", value: "crown" },
                          { label: "Root Canal", value: "root-canal" },
                          { label: "Filling", value: "filling" },
                          { label: "Extraction", value: "extraction" },
                          { label: "Cleaning", value: "cleaning" },
                          { label: "Whitening", value: "whitening" },
                          { label: "Sensitivity", value: "sensitivity" },
                          { label: "Gum Disease", value: "gum-disease" },
                          { label: "Other", value: "other" },
                        ]}
                        value={values.condition}
                        onChange={(val: any) => setFieldValue("condition", val)}
                        error={errors.condition}
                        showError={touched.condition}
                      />

                      {/* DATE */}
                      <CustomInput
                        label="Treatment Date"
                        name="date"
                        type="date"
                        required
                        value={values.date}
                        onChange={(e: any) => setFieldValue("date", e.target.value)}
                        error={errors.date}
                        showError={touched.date}
                      />

                      {/* TREATMENT DETAILS */}
                      <CustomInput
                        label="Treatment Details"
                        name="treatment"
                        type="textarea"
                        placeholder="Describe treatment plan..."
                        required
                        value={values.treatment}
                        onChange={(e: any) => setFieldValue("treatment", e.target.value)}
                        error={errors.treatment}
                        showError={touched.treatment}
                      />

                      {/* NOTES */}
                      <CustomInput
                        label="Additional Notes"
                        name="notes"
                        type="textarea"
                        placeholder="Any additional notes..."
                        value={values.notes}
                        onChange={(e: any) => setFieldValue("notes", e.target.value)}
                        error={errors.notes}
                        showError={touched.notes}
                      />

                    </SimpleGrid>
                  </GridItem>
                </Grid>
              </ModalBody>

              <ModalFooter gap={3}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit">
                  Save Treatment
                </Button>
              </ModalFooter>
            </FormikForm>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
}
