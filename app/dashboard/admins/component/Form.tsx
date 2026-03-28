"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import {
  FileText,
  Image as ImageIcon,
  Lock,
  MapPin,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";

import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { titles } from "./utils/constant";
import { generateIntialValues } from "./utils/function";

/* ================= SECTION CARD ================= */
const SectionCard = ({ title, icon, children, color }: any) => {
  const bg = useColorModeValue("white", "gray.800");

  const colorMap: any = {
    blue: { icon: "blue.500", text: "blue.600", bg: "blue.50" },
    green: { icon: "green.500", text: "green.600", bg: "green.50" },
    purple: { icon: "purple.500", text: "purple.600", bg: "purple.50" },
    orange: { icon: "orange.500", text: "orange.600", bg: "orange.50" },
    pink: { icon: "pink.500", text: "pink.600", bg: "pink.50" },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <Box
      p={4}
      borderRadius="xl"
      bg={bg}
      boxShadow="md"
      border="1px solid"
      borderColor="gray.200"
    >
      <Flex align="center" mb={3} gap={2}>
        <Box p={2} borderRadius="md" bg={theme.bg}>
          <Icon as={icon} color={theme.icon} />
        </Box>
        <Text fontSize="lg" fontWeight="bold" color={theme.text}>
          {title}
        </Text>
      </Flex>
      {children}
    </Box>
  );
};

/* ================= MAIN FORM ================= */
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
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(generateIntialValues(initialData));
    }
  }, [initialData]);

  /* ✅ SAFE IMAGE PREVIEW */
  useEffect(() => {
    if (formData?.pic?.file && formData.pic.file instanceof File) {
      const url = URL.createObjectURL(formData.pic.file);
      setPreview(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [formData?.pic?.file]);

  const validationSchema = Yup.object({
    title: Yup.mixed().required("Title is required"),
    name: Yup.string().required("Name is required"),
    username: Yup.string().email().trim().lowercase().required("Email is required"),
    bio: Yup.string().required("Bio is required"),
    phoneNumber: Yup.string().required("Phone is required"),
    password: !isEdit
      ? Yup.string().min(6).required()
      : Yup.string().optional(),
    confirmPassword: !isEdit
      ? Yup.string().oneOf([Yup.ref("password"), null])
      : Yup.string().optional(),
  });

  if (!isOpen) return null;

  return (
    <Formik
      initialValues={formData}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({
        values,
        handleChange,
        handleSubmit,
        setFieldValue,
      }: any) => {
        /* 🔥 handle preview based on current formik values */
        useEffect(() => {
          if (values?.pic?.file && values.pic.file instanceof File) {
            const url = URL.createObjectURL(values.pic.file);
            setPreview(url);

            return () => URL.revokeObjectURL(url);
          } else {
            setPreview(null);
          }
        }, [values?.pic?.file]);

        return (
          <FormikForm onSubmit={handleSubmit}>
            <Grid gap={6}>
              
              {/* IMAGE */}
              <SectionCard title="Profile Image" icon={ImageIcon} color="pink">
                {preview ? (
                  <Flex direction="column" gap={4}>
                    <Box
                      borderRadius="lg"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="gray.200"
                      maxW="200px"
                    >
                      <img
                        src={preview}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    </Box>

                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() =>
                        setFieldValue("pic", {
                          ...values.pic,
                          file: null,
                          isDeleted: 1,
                        })
                      }
                    >
                      Remove Image
                    </Button>
                  </Flex>
                ) : (
                  <CustomInput
                    type="file-drag"
                    name="pic"
                    accept="image/*"
                    onChange={(e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFieldValue("pic", {
                          ...values.pic,
                          file,
                          isAdd: 1,
                        });
                      }
                    }}
                  />
                )}
              </SectionCard>

              {/* PERSONAL */}
              <SectionCard title="Personal Information" icon={User} color="blue">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <CustomInput
                    label="Title"
                    name="title"
                    type="select"
                    options={titles}
                    value={values.title}
                    onChange={(e: any) => setFieldValue("title", e)}
                  />

                  <CustomInput
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                  />

                  <CustomInput
                    label="Email"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                  />

                  <CustomInput
                    label="Phone"
                    name="phoneNumber"
                    value={values.phoneNumber}
                    onChange={handleChange}
                  />

                  <CustomInput
                    label="Code"
                    name="code"
                    value={values.code}
                    onChange={handleChange}
                  />

                  <CustomInput
                    label="Profile Link"
                    name="link"
                    value={values.link}
                    onChange={handleChange}
                  />
                </SimpleGrid>
              </SectionCard>

              {/* BIO */}
              <SectionCard title="Bio" icon={FileText} color="purple">
                <CustomInput
                  name="bio"
                  placeholder="Enter Bio"
                  type="textarea"
                  value={values.bio}
                  onChange={handleChange}
                />
              </SectionCard>

              {/* ADDRESS */}
              <SectionCard title="Address" icon={MapPin} color="orange">
                <CustomInput
                  name="address"
                  type="textarea"
                  placeholder="Admin Address"
                  value={values.address}
                  onChange={handleChange}
                />
              </SectionCard>

              {/* AUTH */}
              {!isEdit && (
                <SectionCard title="Authentication" icon={Lock} color="green">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <CustomInput
                      label="Password"
                      name="password"
                      type="password"
                      value={values.password}
                      onChange={handleChange}
                    />
                    <CustomInput
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                    />
                  </SimpleGrid>
                </SectionCard>
              )}

              {/* ACTIONS */}
              <Flex justify="flex-end" gap={4} pt={4}>
                <Button variant="outline" colorScheme="red" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={isLoading}
                  isDisabled={!selectedCompany?._id}
                >
                  {isEdit ? "Update Admin" : "Create Admin"}
                </Button>
              </Flex>
            </Grid>
          </FormikForm>
        );
      }}
    </Formik>
  );
};

export default Form;