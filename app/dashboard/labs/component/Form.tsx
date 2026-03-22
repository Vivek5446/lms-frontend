"use client";
import {
  SimpleGrid,
  Button,
  Grid,
  GridItem,
  Text,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Formik, Form as FormikForm } from "formik";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { generateIntialValues } from "./utils/function";
import AddressesInput from "./formElement/AddressInput";
import {
  createValidationSchema,
  updateValidationSchema,
} from "./utils/validation";
import ItemOrderingInput from "./formElement/ItemOrders";
import BankDetailsInput from "./formElement/BankDetailsInput";
import StaffInput from "./formElement/StaffInput";

const Form = ({
  loading,
  initialData,
  onSubmit,
  isOpen,
  onClose,
  isEdit,
}: any) => {
  const [formData, setFormData] = useState<any>(initialData);


  useEffect(() => {
    if (initialData) {
      setFormData(generateIntialValues(initialData));
    }
  }, [initialData]);

  return (
    isOpen && (
      <Formik
        initialValues={formData}
        validationSchema={
          isEdit ? updateValidationSchema : createValidationSchema
        }
        enableReinitialize={true}
        onSubmit={async (values: any) => {
          onSubmit(values);
        }}
      >
        {({
          values,
          handleChange,
          handleSubmit,
          setFieldValue,
          errors,
          touched,
        }: any) => {
          return (
            <FormikForm onSubmit={handleSubmit}>
              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={6}
                mb={6}
                alignItems="center"
              >
                {/* Section 1: Personal Info */}
                <GridItem colSpan={2}>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Lab Information
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
                    {/* Basic Details */}
                    <Grid
                      gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
                      gap={5}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="sm"
                      bg="white"
                      mt={3}
                    >
                      <CustomInput
                        label="Name"
                        name="name"
                        placeholder="Enter Name"
                        value={values.name}
                        required={true}
                        onChange={handleChange}
                        error={errors?.name}
                        showError={errors.name && touched.name}
                      />
                    </Grid>
                    <AddressesInput
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                    />
                  </SimpleGrid>
                  <StaffInput
                    errors={errors}
                    setFieldValue={setFieldValue}
                    values={values}
                  />
                </GridItem>
                {!initialData.name && <ItemOrderingInput
                  errors={errors}
                  setFieldValue={setFieldValue}
                  values={values}
                />}
                <BankDetailsInput
                  errors={errors}
                  setFieldValue={setFieldValue}
                  values={values}
                />
              </Grid>
              <Flex justifyContent="flex-end" mt={4}>
                <Flex gap={4}>
                  <Button
                    colorScheme="red"
                    size="lg"
                    bgColor="red"
                    onClick={onClose}
                    _hover={{ bg: "red.500" }}
                    width="auto"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    isLoading={loading}
                    loadingText="Submitting"
                    size="lg"
                    _hover={{ bg: "teal.500" }}
                    width="auto"
                  >
                    {initialData?.name ? "Update" : "Save"}
                  </Button>
                </Flex>
              </Flex>
            </FormikForm>
          );
        }}
      </Formik>
    )
  );
};

export default Form;