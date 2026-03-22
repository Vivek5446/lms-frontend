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
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import stores from "../../../../store/stores";
import ChairColorPicker from "../ChairColorPicker/ChairColorPicker";
// -------------------------------------------------
// Validation Schema
// -------------------------------------------------
const ChairSchema = Yup.object().shape({
  chairName: Yup.string().required("Chair Name is required"),
  chairColor: Yup.string().required("Chair Color is required"),
  chairDetails: Yup.string().required("Chair Details are required"),
  chairNo: Yup.string().required("Chair Number is required"),
});

const ChairsForm = observer(
  ({ isOpen, onClose, initialValues, isEdit }: any) => {
    if (!isOpen) return null;
    const { chairsStore } = stores;
    const [loading, setLoading] = useState(false);

    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        // initialValues={initialValues}
        validationSchema={ChairSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            setLoading(true);

            // const res: any = await chairsStore.createChair(values);
            const res: any = isEdit
              ? await chairsStore.updateChair(values._id, values)
              : await chairsStore.createChair(values);

            if (res.status === "success") {
              stores.auth?.openNotification?.({
                type: "success",
                title: isEdit ? "Chair Updated" : "Chair Added",
                message: isEdit
                  ? "Chair updated successfully!"
                  : "Chair created successfully!",
                // title: "Chair Added",
                // message: "Chair created successfully!",
              });
              resetForm();
              onClose();
            } else {
              stores.auth?.openNotification?.({
                type: "error",
                title: "Failed",
                message: res?.message || "Something went wrong",
              });
            }
          } catch (err: any) {
            stores.auth?.openNotification?.({
              type: "error",
              title: "Failed",
              message: err?.message || "Something went wrong",
            });
          } finally {
            setLoading(false); // 👉 Always stop loading
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
        }: any) => (
          <FormikForm onSubmit={handleSubmit}>
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={6}
              mb={6}
              p={4}
              alignItems="center"
            >
              <GridItem colSpan={2}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <CustomInput
                    label="Chair Name"
                    name="chairName"
                    placeholder="Enter Chair Name"
                    value={values.chairName}
                    onChange={handleChange}
                    required
                    error={errors.chairName}
                    showError={touched.chairName}
                  />
                  <CustomInput
                    label="Chair Number"
                    name="chairNo"
                    placeholder="Enter Chair Number"
                    value={values.chairNo}
                    onChange={handleChange}
                    required
                    error={errors.chairNo}
                    showError={touched.chairNo}
                  />

                  <Box gridColumn="span 2">
                    <CustomInput
                      label="Chair Details"
                      name="chairDetails"
                      type="textarea"
                      placeholder="Enter Chair Description"
                      value={values.chairDetails}
                      onChange={handleChange}
                      required
                      error={errors.chairDetails}
                      showError={touched.chairDetails}
                    />
                  </Box>
                </SimpleGrid>
              </GridItem>
              <GridItem colSpan={2}>
                <ChairColorPicker
                  value={values.chairColor}
                  onChange={(col: string) => setFieldValue("chairColor", col)}
                />

                {errors.chairColor && touched.chairColor && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {errors.chairColor}
                  </p>
                )}
              </GridItem>
            </Grid>

            <Flex justifyContent="flex-end" mt={4}>
              <Flex gap={4} align={"end"}>
                <Button
                  colorScheme="red"
                  bgColor="red"
                  onClick={onClose}
                  _hover={{ bg: "red.500" }}
                >
                  Close
                </Button>

                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={loading}
                  _hover={{ bg: "teal.500" }}
                >
                  Save
                </Button>
              </Flex>
            </Flex>
          </FormikForm>
        )}
      </Formik>
    );
  }
);

export default ChairsForm;