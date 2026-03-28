"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import ShowFileUploadFile from "../../../component/common/ShowFileUploadFile/ShowFileUploadFile";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { removeDataByIndex } from "../../../config/utils/utils";
import { titles } from "./utils/constant";
import { generateIntialValues } from "./utils/function";

const Form = ({
  initialData,
  onSubmit,
  isOpen,
  onClose,
  isEdit,
  isLoading,
  selectedCompany,
}: any) => {
  const [formData, setFormData] = useState<any>(initialData);
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");

  useEffect(() => {
    if (initialData) {
      setFormData(generateIntialValues(initialData));
    }
  }, [initialData]);

  const validationSchema = Yup.object({
    title: Yup.mixed().required("Title is required"),
    pic: Yup.mixed(),
    name: Yup.string().required("Name is required"),
    username: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    bio: Yup.string().required("Bio is required"),
    phoneNumber: Yup.string()
      .matches(/^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/, "Phone number is not valid")
      .required("Phone number is required"),
    password: !isEdit
      ? Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required")
      : Yup.string().optional(),
    confirmPassword: !isEdit
      ? Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match")
      : Yup.string().optional(),
    code: Yup.string().optional(),
    link: Yup.string().url("Enter a valid URL").optional(),
  });

  if (!isOpen) return null;

  return (
    <Formik
      initialValues={formData}
      validationSchema={validationSchema}
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
              <GridItem colSpan={2}>
                <Box
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  boxShadow="sm"
                  bg={bgBox}
                  borderColor={borderColor}
                >
                  <Flex justify="space-between" align="center" gap={4} wrap="wrap">
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold">
                        Company Context
                      </Text>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        This admin will be created under the selected company.
                      </Text>
                    </Box>
                    <Box textAlign={{ base: "left", md: "right" }}>
                      <Text fontWeight="bold">{selectedCompany?.company_name || "No company selected"}</Text>
                      {selectedCompany?.tenantUrl ? (
                        <Badge mt={2} colorScheme="purple" px={3} py={1} borderRadius="full">
                          {selectedCompany.tenantUrl}
                        </Badge>
                      ) : null}
                    </Box>
                  </Flex>
                </Box>
              </GridItem>

              <GridItem colSpan={2}>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Personal Information
                </Text>

                <SimpleGrid columns={{ base: 1 }} spacing={4}>
                  <Box width="100%">
                    {values?.pic?.file?.length === 0 ? (
                      <CustomInput
                        type="file-drag"
                        name="pic"
                        value={values.pic}
                        isMulti={true}
                        accept="image/*"
                        onChange={(e: any) => {
                          setFieldValue("pic", {
                            ...values.pic,
                            file: e.target.files[0],
                            isAdd: 1,
                          });
                        }}
                        error={errors.pic}
                      />
                    ) : (
                      <Box mt={-5}>
                        <ShowFileUploadFile
                          files={values.pic?.file}
                          removeFile={() => {
                            setFieldValue("pic", {
                              ...values.pic,
                              file: removeDataByIndex(values.pic, 0),
                              isDeleted: 1,
                            });
                          }}
                          edit={isEdit}
                        />
                      </Box>
                    )}
                  </Box>

                  <Grid
                    gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap={5}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    bg={bgBox}
                    mt={3}
                    borderColor={borderColor}
                  >
                    <CustomInput
                      label="Title"
                      name="title"
                      type="select"
                      options={titles}
                      value={values.title}
                      onChange={(e: any) => setFieldValue("title", e)}
                      error={errors.title && touched.title}
                      showError={errors.title && touched.title}
                    />

                    <CustomInput
                      label="Name"
                      name="name"
                      placeholder="Enter Name"
                      value={values.name}
                      onChange={handleChange}
                      error={errors.name && touched.name}
                      showError={errors.name && touched.name}
                    />

                    <CustomInput
                      label="Email"
                      name="username"
                      placeholder="admin@company.com"
                      value={values.username}
                      onChange={handleChange}
                      error={errors.username && touched.username}
                      showError={errors.username && touched.username}
                    />

                    <CustomInput
                      label="Phone Number"
                      name="phoneNumber"
                      placeholder="Enter Phone Number"
                      value={values.phoneNumber}
                      onChange={handleChange}
                      error={errors.phoneNumber && touched.phoneNumber}
                      showError={errors.phoneNumber && touched.phoneNumber}
                    />

                    <CustomInput
                      label="Code"
                      name="code"
                      placeholder="Enter Code"
                      value={values.code}
                      onChange={handleChange}
                      error={errors.code && touched.code}
                      showError={errors.code && touched.code}
                    />

                    <CustomInput
                      label="Profile Link"
                      name="link"
                      placeholder="https://..."
                      value={values.link}
                      onChange={handleChange}
                      error={errors.link && touched.link}
                      showError={errors.link && touched.link}
                    />
                  </Grid>

                  <Box
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    bg={bgBox}
                    mt={3}
                    borderColor={borderColor}
                    p={3}
                  >
                    <CustomInput
                      label="Bio"
                      name="bio"
                      type="textarea"
                      placeholder="Enter Bio"
                      value={values.bio}
                      onChange={handleChange}
                      error={errors.bio && touched.bio}
                      showError={errors.bio && touched.bio}
                    />
                  </Box>

                  <Box
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    bg={bgBox}
                    mt={3}
                    borderColor={borderColor}
                    p={3}
                  >
                    <CustomInput
                      label="Address"
                      name="address"
                      type="textarea"
                      placeholder="Enter Address"
                      value={values.address}
                      onChange={handleChange}
                      error={errors.address && touched.address}
                      showError={errors.address && touched.address}
                    />
                  </Box>
                </SimpleGrid>
              </GridItem>

              {!isEdit && (
                <GridItem colSpan={2}>
                  <Box
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    bg={bgBox}
                    mt={3}
                    borderColor={borderColor}
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      mb={4}
                      color="brand.600"
                    >
                      Authentication
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <CustomInput
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter Password"
                        value={values.password}
                        onChange={handleChange}
                        error={errors.password && touched.password}
                        showError={errors.password && touched.password}
                      />
                      <CustomInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        error={
                          errors.confirmPassword && touched.confirmPassword
                        }
                        showError={
                          errors.confirmPassword && touched.confirmPassword
                        }
                      />
                    </SimpleGrid>
                  </Box>
                </GridItem>
              )}
            </Grid>

            <Flex justifyContent="flex-end" mt={4}>
              <Flex gap={4}>
                <Button colorScheme="red" size="lg" onClick={onClose}>
                  Close
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={isLoading}
                  size="lg"
                  isDisabled={!selectedCompany?._id}
                >
                  {isEdit ? "Update" : "Add"} Admin
                </Button>
              </Flex>
            </Flex>
          </FormikForm>
        );
      }}
    </Formik>
  );
};

export default Form;
