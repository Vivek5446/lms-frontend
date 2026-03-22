import {
  SimpleGrid,
  Button,
  Box,
  Grid,
  GridItem,
  Text,
  Flex,
  useColorModeValue,
  Divider,
  VStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import ShowFileUploadFile from "../../../../component/common/ShowFileUploadFile/ShowFileUploadFile";
import { removeDataByIndex } from "../../../../config/utils/utils";
import { titles, initialValues as adminInitialValues } from "../../../admins/component/utils/constant";
import { generateIntialValues } from "../../../admins/component/utils/function";
import { authStore } from "../../../../store/authStore/authStore";

const initialValues = {
  ...adminInitialValues,
  companyName: undefined,
  companyCode: undefined,
  companyType: undefined,
  addressInfo: undefined,
};

const WorkflowUserForm = ({ onSubmit, isOpen, onClose, isLoading }: any) => {
  const [formData, setFormData] = useState<any>(initialValues);
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");

  const validationSchema = Yup.object({
    title: Yup.mixed().required("Title is required"),
    pic: Yup.mixed(),
    name: Yup.string().required("Name is required"),
    username: Yup.string().required("Username (Email) is required").email("Invalid email"),
    bio: Yup.string().optional(),
    phoneNumber: Yup.string()
      .matches(/^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/, "Phone number is not valid")
      .required("Phone number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    code: Yup.string().required("User Code is required"),
  });

  if (!isOpen) return null;

  return (
    <Formik
      initialValues={formData}
      validationSchema={validationSchema}
      onSubmit={async (values: any) => {
        const payload = {
          ...values,
          role: "user",
          userType: "user",
          company: authStore.company,
        };
        // Remove confirmPassword before sending
        delete payload.confirmPassword;
        onSubmit(payload);
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
            <VStack spacing={6} align="stretch">
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Personal Information
                </Text>

                <Box mb={4}>
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
                      <Box>
                        <ShowFileUploadFile
                          files={values.pic?.file}
                          removeFile={() => {
                            setFieldValue("pic", {
                              ...values.pic,
                              file: [],
                              isDeleted: 1,
                            });
                          }}
                        />
                      </Box>
                    )}
                </Box>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
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
                    label="Full Name"
                    name="name"
                    placeholder="Enter Name"
                    value={values.name}
                    onChange={handleChange}
                    error={errors.name && touched.name}
                    showError={errors.name && touched.name}
                  />

                  <CustomInput
                    label="Email (Username)"
                    name="username"
                    placeholder="user@company.com"
                    value={values.username}
                    onChange={handleChange}
                    error={errors.username && touched.username}
                    showError={errors.username && touched.username}
                  />

                  <CustomInput
                    label="Phone Number"
                    name="phoneNumber"
                    placeholder="9876543210"
                    value={values.phoneNumber}
                    onChange={handleChange}
                    error={errors.phoneNumber && touched.phoneNumber}
                    showError={errors.phoneNumber && touched.phoneNumber}
                  />

                  <CustomInput
                    label="User Code"
                    name="code"
                    placeholder="E001"
                    value={values.code}
                    onChange={handleChange}
                    error={errors.code && touched.code}
                    showError={errors.code && touched.code}
                  />
                </Grid>

                <Box mt={4}>
                  <CustomInput
                    label="Bio"
                    name="bio"
                    type="textarea"
                    placeholder="Brief description..."
                    value={values.bio}
                    onChange={handleChange}
                    error={errors.bio && touched.bio}
                    showError={errors.bio && touched.bio}
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Authentication
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <CustomInput
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Min 6 chars"
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
                    error={errors.confirmPassword && touched.confirmPassword}
                    showError={errors.confirmPassword && touched.confirmPassword}
                  />
                </Grid>
              </Box>

              <Flex justifyContent="flex-end" gap={4} pt={4}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={isLoading}
                  px={8}
                >
                  Create User
                </Button>
              </Flex>
            </VStack>
          </FormikForm>
        );
      }}
    </Formik>
  );
};

export default WorkflowUserForm;
