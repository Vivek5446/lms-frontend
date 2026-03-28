"use client";

import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import ShowFileUploadFile from "../../../component/common/ShowFileUploadFile/ShowFileUploadFile";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { SITE_URL } from "../../../config/utils/variables";

const slugifyTenant = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const buildTenantPreview = (slug: string, customDomain?: string) => {
  if (customDomain?.trim()) {
    const normalized = customDomain.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    return `https://${normalized}`;
  }

  const siteUrl = SITE_URL || "http://localhost:3000";

  try {
    const parsed = new URL(siteUrl);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const port = parsed.port ? `:${parsed.port}` : "";

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${parsed.protocol}//${slug}.localhost${port}`;
    }

    return `${parsed.protocol}//${slug}.${hostname}${port}`;
  } catch {
    return slug ? `https://${slug}.localhost` : "";
  }
};

export const companyInitialValues = {
  company_name: "",
  companyCode: "",
  companyType: "company",
  tenantSlug: "",
  customDomain: "",
  companyEmail: "",
  mobileNo: "",
  workNo: "",
  webLink: "",
  bio: "",
  verified_email_allowed: false,
  logo: { file: [] },
  addressInfo: [
    {
      address: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
    },
  ],
};

const CompanyForm = ({ onSubmit, onClose, isLoading }: any) => {
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");

  const validationSchema = Yup.object({
    company_name: Yup.string().required("Company name is required"),
    companyCode: Yup.string().required("Company code is required"),
    companyType: Yup.string().required("Company type is required"),
    tenantSlug: Yup.string(),
    customDomain: Yup.string().optional(),
    companyEmail: Yup.string().email("Enter a valid email").required("Company email is required"),
    mobileNo: Yup.string().required("Primary phone is required"),
    workNo: Yup.string().optional(),
    webLink: Yup.string().url("Enter a valid URL").optional(),
    bio: Yup.string().required("Company description is required"),
    addressInfo: Yup.array()
      .of(
        Yup.object({
          address: Yup.string().required("Address is required"),
          city: Yup.string().required("City is required"),
          state: Yup.string().required("State is required"),
          country: Yup.string().required("Country is required"),
          pinCode: Yup.string().required("Pin code is required"),
        })
      )
      .min(1),
  });

  return (
    <Formik
      initialValues={companyInitialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleSubmit, setFieldValue, errors, touched }: any) => {
        const address = values.addressInfo?.[0] || {};
        const tenantSlug = slugifyTenant(values.tenantSlug || values.company_name || "");
        const tenantPreview = buildTenantPreview(tenantSlug, values.customDomain);

        return (
          <FormikForm onSubmit={handleSubmit}>
            <Flex direction="column" gap={5}>
              <Box
                p={4}
                borderWidth={1}
                borderRadius="md"
                boxShadow="sm"
                bg={bgBox}
                borderColor={borderColor}
              >
                <Text fontSize="lg" fontWeight="semibold">
                  Tenant Configuration
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Each company gets a dedicated tenant slug and URL for multi-tenant access.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  <CustomInput
                    label="Company Name"
                    name="company_name"
                    placeholder="Acme Learning"
                    value={values.company_name}
                    onChange={(e: any) => {
                      handleChange(e);
                      if (!values.tenantSlug?.trim()) {
                        setFieldValue("tenantSlug", slugifyTenant(e.target.value));
                      }
                    }}
                    error={errors.company_name && touched.company_name}
                    showError={errors.company_name && touched.company_name}
                  />
                  <CustomInput
                    label="Company Code"
                    name="companyCode"
                    placeholder="ACME-001"
                    value={values.companyCode}
                    onChange={handleChange}
                    error={errors.companyCode && touched.companyCode}
                    showError={errors.companyCode && touched.companyCode}
                  />
                  <CustomInput
                    label="Tenant Slug"
                    name="tenantSlug"
                    placeholder="acme-learning"
                    value={values.tenantSlug}
                    onChange={(e: any) => {
                      setFieldValue("tenantSlug", slugifyTenant(e.target.value));
                    }}
                    error={errors.tenantSlug && touched.tenantSlug}
                    showError={errors.tenantSlug && touched.tenantSlug}
                  />
                  <CustomInput
                    label="Custom Domain"
                    name="customDomain"
                    placeholder="portal.acme.com"
                    value={values.customDomain}
                    onChange={handleChange}
                    error={errors.customDomain && touched.customDomain}
                    showError={errors.customDomain && touched.customDomain}
                  />
                </SimpleGrid>

                <Flex mt={4} align="center" gap={3} wrap="wrap">
                  <Text fontSize="sm" fontWeight="medium">
                    Tenant URL Preview
                  </Text>
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                    {tenantPreview || "Add a company name to generate the tenant URL"}
                  </Badge>
                </Flex>
              </Box>

              <Box
                p={4}
                borderWidth={1}
                borderRadius="md"
                boxShadow="sm"
                bg={bgBox}
                borderColor={borderColor}
              >
                <Text fontSize="lg" fontWeight="semibold">
                  Company Profile
                </Text>
                <Box mt={4}>
                  {values?.logo?.file?.length === 0 ? (
                    <CustomInput
                      type="file-drag"
                      name="logo"
                      value={values.logo}
                      isMulti={false}
                      accept="image/*"
                      onChange={(e: any) => {
                        setFieldValue("logo", {
                          ...values.logo,
                          file: e.target.files[0],
                          isAdd: 1,
                        });
                      }}
                      error={errors.logo}
                    />
                  ) : (
                    <Box mt={-2}>
                      <ShowFileUploadFile
                        files={values.logo?.file}
                        removeFile={() => {
                          setFieldValue("logo", {
                            ...values.logo,
                            file: [],
                            isDeleted: 1,
                            isAdd: 0,
                          });
                        }}
                      />
                    </Box>
                  )}
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  <CustomInput
                    label="Company Type"
                    name="companyType"
                    placeholder="company"
                    value={values.companyType}
                    onChange={handleChange}
                    error={errors.companyType && touched.companyType}
                    showError={errors.companyType && touched.companyType}
                  />
                  <CustomInput
                    label="Company Email"
                    name="companyEmail"
                    placeholder="hello@acme.com"
                    value={values.companyEmail}
                    onChange={handleChange}
                    error={errors.companyEmail && touched.companyEmail}
                    showError={errors.companyEmail && touched.companyEmail}
                  />
                  <CustomInput
                    label="Primary Phone"
                    name="mobileNo"
                    placeholder="+91 9876543210"
                    value={values.mobileNo}
                    onChange={handleChange}
                    error={errors.mobileNo && touched.mobileNo}
                    showError={errors.mobileNo && touched.mobileNo}
                  />
                  <CustomInput
                    label="Work Phone"
                    name="workNo"
                    placeholder="01123456789"
                    value={values.workNo}
                    onChange={handleChange}
                    error={errors.workNo && touched.workNo}
                    showError={errors.workNo && touched.workNo}
                  />
                  <CustomInput
                    label="Website"
                    name="webLink"
                    placeholder="https://acme.com"
                    value={values.webLink}
                    onChange={handleChange}
                    error={errors.webLink && touched.webLink}
                    showError={errors.webLink && touched.webLink}
                  />
                  <CustomInput
                    label="Email Verification Required"
                    name="verified_email_allowed"
                    type="switch"
                    value={values.verified_email_allowed}
                    onChange={(e: any) =>
                      setFieldValue("verified_email_allowed", e.target.checked)
                    }
                  />
                </SimpleGrid>

                <Box mt={4}>
                  <CustomInput
                    label="Company Description"
                    name="bio"
                    type="textarea"
                    placeholder="Describe the company and what this tenant is for"
                    value={values.bio}
                    onChange={handleChange}
                    error={errors.bio && touched.bio}
                    showError={errors.bio && touched.bio}
                  />
                </Box>
              </Box>

              <Box
                p={4}
                borderWidth={1}
                borderRadius="md"
                boxShadow="sm"
                bg={bgBox}
                borderColor={borderColor}
              >
                <Text fontSize="lg" fontWeight="semibold">
                  Address
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
                  <GridItem colSpan={2}>
                    <CustomInput
                      label="Street Address"
                      name="addressInfo[0].address"
                      type="textarea"
                      placeholder="Enter address"
                      value={address.address}
                      onChange={(e: any) => setFieldValue("addressInfo[0].address", e.target.value)}
                      error={errors.addressInfo?.[0]?.address && touched.addressInfo?.[0]?.address}
                      showError={errors.addressInfo?.[0]?.address && touched.addressInfo?.[0]?.address}
                    />
                  </GridItem>
                  <CustomInput
                    label="City"
                    name="addressInfo[0].city"
                    placeholder="Enter city"
                    value={address.city}
                    onChange={(e: any) => setFieldValue("addressInfo[0].city", e.target.value)}
                    error={errors.addressInfo?.[0]?.city && touched.addressInfo?.[0]?.city}
                    showError={errors.addressInfo?.[0]?.city && touched.addressInfo?.[0]?.city}
                  />
                  <CustomInput
                    label="State"
                    name="addressInfo[0].state"
                    placeholder="Enter state"
                    value={address.state}
                    onChange={(e: any) => setFieldValue("addressInfo[0].state", e.target.value)}
                    error={errors.addressInfo?.[0]?.state && touched.addressInfo?.[0]?.state}
                    showError={errors.addressInfo?.[0]?.state && touched.addressInfo?.[0]?.state}
                  />
                  <CustomInput
                    label="Country"
                    name="addressInfo[0].country"
                    placeholder="Enter country"
                    value={address.country}
                    onChange={(e: any) => setFieldValue("addressInfo[0].country", e.target.value)}
                    error={errors.addressInfo?.[0]?.country && touched.addressInfo?.[0]?.country}
                    showError={errors.addressInfo?.[0]?.country && touched.addressInfo?.[0]?.country}
                  />
                  <CustomInput
                    label="Pin Code"
                    name="addressInfo[0].pinCode"
                    placeholder="Enter pin code"
                    value={address.pinCode}
                    onChange={(e: any) => setFieldValue("addressInfo[0].pinCode", e.target.value)}
                    error={errors.addressInfo?.[0]?.pinCode && touched.addressInfo?.[0]?.pinCode}
                    showError={errors.addressInfo?.[0]?.pinCode && touched.addressInfo?.[0]?.pinCode}
                  />
                </Grid>
              </Box>

              <Divider />

              <Flex justifyContent="flex-end" gap={4}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" colorScheme="brand" isLoading={isLoading}>
                  Create Company
                </Button>
              </Flex>
            </Flex>
          </FormikForm>
        );
      }}
    </Formik>
  );
};

export default CompanyForm;
