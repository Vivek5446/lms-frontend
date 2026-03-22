import {
  SimpleGrid,
  Button,
  Box,
  Grid,
  GridItem,
  Text,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import ShowFileUploadFile from "../../../component/common/ShowFileUploadFile/ShowFileUploadFile";
import { removeDataByIndex } from "../../../config/utils/utils";
import { titles } from "./utils/constant";
import { generateIntialValues } from "./utils/function";

const Form = ({ initialData, onSubmit, isOpen, onClose, isEdit, isLoading }: any) => {
  const [formData, setFormData] = useState<any>(initialData);
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");

  useEffect(() => {
    if (initialData) {
      setFormData(generateIntialValues(initialData));
    }
  }, [initialData]);

  // VALIDATION SCHEMA
  const validationSchema = Yup.object({
    // Personal
    title: Yup.mixed().required("Title is required"),
    pic: Yup.mixed(),

    name: Yup.string().required("Name is required"),
    username: Yup.string().required("Username is required"),

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

    // Company Fields
    companyName: Yup.string().required("Company name is required"),
    companyCode: Yup.string().optional(),
    companyType: Yup.string().optional(),
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
              {/* PERSONAL INFORMATION */}
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

                  {/* Grid Fields */}
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
                      label="Username"
                      name="username"
                      placeholder="Enter Username"
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
                      label="Link"
                      name="link"
                      placeholder="Enter Link"
                      value={values.link}
                      onChange={handleChange}
                      error={errors.link && touched.link}
                      showError={errors.link && touched.link}
                    />
                  </Grid>

                  {/* BIO */}
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

                  {/* ADDRESS */}
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

              {/* COMPANY INFORMATION */}
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
                  <Text fontSize="lg" fontWeight="bold" mb={4} color="brand.600">
                    Company Information
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <CustomInput
                      label="Company Name"
                      name="companyName"
                      placeholder="Enter company name"
                      value={values.companyName}
                      onChange={handleChange}
                      error={errors.companyName && touched.companyName}
                      showError={errors.companyName && touched.companyName}
                    />

                    <CustomInput
                      label="Company Code"
                      name="companyCode"
                      placeholder="Enter company code"
                      value={values.companyCode}
                      onChange={handleChange}
                      error={errors.companyCode && touched.companyCode}
                      showError={errors.companyCode && touched.companyCode}
                    />

                    <CustomInput
                      label="Company Type"
                      name="companyType"
                      placeholder="Enter company type"
                      value={values.companyType}
                      onChange={handleChange}
                      error={errors.companyType && touched.companyType}
                      showError={errors.companyType && touched.companyType}
                    />
                  </SimpleGrid>
                </Box>
              </GridItem>

              {/* PASSWORD SECTION (Only when adding) */}
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

            {/* BUTTONS */}
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
