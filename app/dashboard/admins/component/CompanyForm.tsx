"use client";

import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Icon,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import {
  Building2,
  Globe,
  MapPin
} from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";

import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { SITE_URL } from "../../../config/utils/variables";

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
      p={5}
      borderRadius="xl"
      bg={bg}
      boxShadow="md"
      border="1px solid"
      borderColor="gray.200"
    >
      <Flex align="center" mb={4} gap={2}>
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

/* ================= UTILS ================= */
const slugifyTenant = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const buildTenantPreview = (slug: string, customDomain?: string) => {
  if (customDomain?.trim()) {
    const normalized = customDomain.trim().replace(/^https?:\/\//, "");
    return `https://${normalized}`;
  }

  const siteUrl = SITE_URL || "http://localhost:3000";

  try {
    const parsed = new URL(siteUrl);
    return `${parsed.protocol}//${slug}.${parsed.hostname}`;
  } catch {
    return slug ? `https://${slug}.localhost` : "";
  }
};

/* ================= INITIAL ================= */
export const companyInitialValues = {
  company_name: "",
  companyCode: "",
  companyType: "company",
  tenantSlug: "",
  customDomain: "",
  companyEmail: "",
  managerLevels: 3,
  mobileNo: "",
  workNo: "",
  webLink: "",
  bio: "",
  verified_email_allowed: false,
  logo: { file: null },
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

/* ================= FORM ================= */
const CompanyForm = ({ onSubmit, onClose, isLoading }: any) => {
  const [preview, setPreview] = useState<string | null>(null);

  /* ✅ SAFE PREVIEW */
  const handlePreview = (file: any) => {
    if (file && file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  };

  const validationSchema = Yup.object({
    company_name: Yup.string().required(),
    companyCode: Yup.string().required(),
    companyEmail: Yup.string().email().required(),
    managerLevels: Yup.number().min(1).max(20).required(),
    mobileNo: Yup.string().required(),
    bio: Yup.string().required(),
  });

  return (
    <Formik
      initialValues={companyInitialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleSubmit, setFieldValue }: any) => {
        useEffect(() => {
          handlePreview(values?.logo?.file);
        }, [values?.logo?.file]);

        const address = values.addressInfo?.[0] || {};
        const slug = slugifyTenant(values.tenantSlug || values.company_name || "");
        const previewUrl = buildTenantPreview(slug, values.customDomain);

        return (
          <FormikForm onSubmit={handleSubmit}>
            <Flex direction="column" gap={6}>

              {/* TENANT */}
              <SectionCard title="Tenant Configuration" icon={Globe} color="purple">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <CustomInput
                    label="Company Name"
                    name="company_name"
                    value={values.company_name}
                    onChange={(e: any) => {
                      handleChange(e);
                      if (!values.tenantSlug)
                        setFieldValue("tenantSlug", slugifyTenant(e.target.value));
                    }}
                  />
                  <CustomInput
                    label="Company Code"
                    name="companyCode"
                    value={values.companyCode}
                    onChange={handleChange}
                  />
                  <CustomInput
                    label="Tenant Slug"
                    name="tenantSlug"
                    value={values.tenantSlug}
                    onChange={(e: any) =>
                      setFieldValue("tenantSlug", slugifyTenant(e.target.value))
                    }
                  />
                  <CustomInput
                    label="Custom Domain"
                    name="customDomain"
                    value={values.customDomain}
                    onChange={handleChange}
                  />
                  <CustomInput
                    label="Manager Levels"
                    name="managerLevels"
                    type="number"
                    value={values.managerLevels}
                    onChange={handleChange}
                  />
                </SimpleGrid>

                <Flex mt={4} gap={3} align="center">
                  <Text fontSize="sm">Preview:</Text>
                  <Badge colorScheme="purple">{previewUrl || "—"}</Badge>
                  <Badge colorScheme="blue">{values.managerLevels || 3} levels</Badge>
                </Flex>
              </SectionCard>

              {/* PROFILE */}
              <SectionCard title="Company Profile" icon={Building2} color="blue">
                {preview ? (
                  <Flex direction="column" gap={3}>
                    <Box
                      w="120px"
                      h="120px"
                      borderRadius="lg"
                      overflow="hidden"
                      border="1px solid"
                    >
                      <img
                        src={preview}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>

                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() =>
                        setFieldValue("logo", { file: null })
                      }
                    >
                      Remove Logo
                    </Button>
                  </Flex>
                ) : (
                  <CustomInput
                    type="file-drag"
                    name="logo"
                    accept="image/*"
                    onChange={(e: any) => {
                      const file = e.target.files?.[0];
                      if (file) setFieldValue("logo", { file });
                    }}
                  />
                )}

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  <CustomInput
                    label="Company Email"
                    name="companyEmail"
                    value={values.companyEmail}
                    onChange={handleChange}
                  />
                  <CustomInput
                    label="Primary Phone"
                    name="mobileNo"
                    value={values.mobileNo}
                    onChange={handleChange}
                  />
                  <CustomInput
                    label="Website"
                    name="webLink"
                    value={values.webLink}
                    onChange={handleChange}
                  />
                </SimpleGrid>

                <Box mt={4}>
                  <CustomInput
                    label="Description"
                    name="bio"
                    type="textarea"
                    value={values.bio}
                    onChange={handleChange}
                  />
                </Box>
              </SectionCard>

              {/* ADDRESS */}
              <SectionCard title="Address" icon={MapPin} color="orange">
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <GridItem colSpan={2}>
                    <CustomInput
                      label="Street"
                      name="street"
                      value={address.address}
                      onChange={(e: any) =>
                        setFieldValue("addressInfo[0].address", e.target.value)
                      }
                    />
                  </GridItem>

                  <CustomInput
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={(e: any) =>
                      setFieldValue("addressInfo[0].city", e.target.value)
                    }
                  />
                  <CustomInput
                    label="State"
                    name="state"
                    value={address.state}
                    onChange={(e: any) =>
                      setFieldValue("addressInfo[0].state", e.target.value)
                    }
                  />
                  <CustomInput
                    label="Country"
                    name="country"
                    value={address.country}
                    onChange={(e: any) =>
                      setFieldValue("addressInfo[0].country", e.target.value)
                    }
                  />
                  <CustomInput
                    label="Pin Code"
                    name="pinCode"
                    value={address.pinCode}
                    onChange={(e: any) =>
                      setFieldValue("addressInfo[0].pinCode", e.target.value)
                    }
                  />
                </Grid>
              </SectionCard>

              <Divider />

              {/* ACTIONS */}
              <Flex justify="flex-end" gap={4}>
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
