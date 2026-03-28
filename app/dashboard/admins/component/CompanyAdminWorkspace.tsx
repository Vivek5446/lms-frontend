"use client";

import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiArrowLeft, FiGlobe, FiMail, FiMapPin, FiPlus, FiShield, FiUsers } from "react-icons/fi";
import { replaceLabelValueObjects } from "../../../config/utils/function";
import { readFileAsBase64 } from "../../../config/utils/utils";
import stores from "../../../store/stores";
import Form from "./Form";
import UserTable from "./users/UserTable";
import DeleteData from "./users/component/DeleteUser";
import { initialValues } from "./utils/constant";

const SummaryCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  const surfaceBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("blue.100", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  return (
    <Box bg={surfaceBg} border="1px solid" borderColor={borderColor} borderRadius="xl" p={4}>
      <Text fontSize="xs" fontWeight="700" color={mutedText} textTransform="uppercase" letterSpacing="0.08em">
        {label}
      </Text>
      <Text mt={2} fontSize="2xl" fontWeight="800">
        {value}
      </Text>
    </Box>
  );
};

const DetailItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) => {
  const mutedText = useColorModeValue("gray.600", "gray.400");

  return (
    <HStack align="start" spacing={3}>
      <Box color={mutedText} mt={0.5}>
        {icon}
      </Box>
      <Box>
        <Text fontSize="xs" fontWeight="700" color={mutedText} textTransform="uppercase" letterSpacing="0.08em">
          {label}
        </Text>
        <Text mt={1} fontSize="sm" fontWeight="500">
          {value || "--"}
        </Text>
      </Box>
    </HStack>
  );
};

const CompanyAdminWorkspace = ({
  company,
  onBack,
  onCompanyRefresh,
}: {
  company: any;
  onBack: () => void;
  onCompanyRefresh: () => Promise<any>;
}) => {
  const toast = useToast();
  const pageBg = useColorModeValue("#f4f8ff", "gray.900");
  const surfaceBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("blue.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("blue.100", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  const {
    userStore: { createAdmin, updateUser },
  } = stores;

  const [adminRefreshKey, setAdminRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerState, setDrawerState] = useState<any>({
    type: "admin-add",
    isOpen: false,
    data: null,
  });

  const refreshAll = async () => {
    await onCompanyRefresh();
    setAdminRefreshKey((prev) => prev + 1);
  };

  const handleAddSubmit = async (formData: any) => {
    try {
      setLoading(true);
      const values = { ...formData };

      if (values.pic?.file) {
        const buffer = await readFileAsBase64(values.pic.file);
        values.pic = {
          buffer,
          filename: values.pic.file.name,
          type: values.pic.file.type,
          isAdd: values.pic.isAdd || 1,
        };
      }

      const profileDetails = Object.fromEntries(
        Object.entries(values).filter(([key]) => !["pic", "confirmPassword"].includes(key))
      );

      const payload = replaceLabelValueObjects({
        ...values,
        company: company._id,
        title: values.title,
        profileDetails,
      });

      await createAdmin(payload);
      await refreshAll();
      setDrawerState({ type: "admin-add", isOpen: false, data: null });

      toast({
        title: "Admin added",
        description: `${formData.name} now belongs to ${company.company_name}.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Failed to create admin",
        description: err?.message || "Please review the admin details and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    try {
      setLoading(true);
      const formData: any = { ...values, company: company._id };

      if (formData?.pic?.file && formData?.pic?.isAdd) {
        const buffer = await readFileAsBase64(formData?.pic?.file);
        formData.pic = {
          buffer,
          filename: formData?.pic?.file?.name,
          type: formData?.pic?.file?.type,
          isDeleted: formData?.pic?.isDeleted || 0,
          isAdd: formData?.pic?.isAdd || 0,
        };
      } else if (formData?.pic?.isDeleted) {
        formData.pic = {
          isDeleted: formData?.pic?.isDeleted || 0,
          isAdd: formData?.pic?.isAdd || 0,
        };
      }

      await updateUser({
        ...values,
        company: company._id,
        pic: formData?.pic,
        title: formData?.title?.label || formData?.title || initialValues.title.label,
        profileDetails: { ...formData },
      });

      await refreshAll();
      setDrawerState({ type: "admin-add", isOpen: false, data: null });

      toast({
        title: "Admin updated",
        description: `${formData.name} has been updated successfully.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Failed to update admin",
        description: err?.message || "Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRefresh = () => {
    refreshAll().catch(() => null);
  };

  const addressText = company?.addressInfo?.[0]
    ? [
        company.addressInfo[0].address,
        company.addressInfo[0].city,
        company.addressInfo[0].state,
        company.addressInfo[0].country,
        company.addressInfo[0].pinCode,
      ]
        .filter(Boolean)
        .join(", ")
    : "--";

  return (
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 6 }}>
      <Stack spacing={6} maxW="1400px" mx="auto">
        <Box bg={surfaceBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={{ base: 5, md: 6 }}>
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
            <Box>
              <Button
                variant="ghost"
                colorScheme="blue"
                leftIcon={<FiArrowLeft />}
                px={0}
                mb={3}
                onClick={onBack}
                _hover={{ bg: "transparent", textDecoration: "underline" }}
              >
                Back to Companies
              </Button>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
                {company?.company_name}
              </Text>
              <Text mt={2} color={mutedText}>
                Manage admins for this company in one focused workspace.
              </Text>
            </Box>

            <HStack spacing={3} wrap="wrap">
              <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1}>
                {company?.companyType || "Company"}
              </Badge>
              <Button
                colorScheme="blue"
                borderRadius="full"
                leftIcon={<FiPlus />}
                onClick={() => setDrawerState({ type: "admin-add", isOpen: true, data: null })}
              >
                Add Admin
              </Button>
            </HStack>
          </Flex>
        </Box>

        <Box bg={surfaceBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" overflow="hidden">
          <Flex
            px={{ base: 4, md: 6 }}
            py={4}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            gap={4}
            wrap="wrap"
            borderBottom="1px solid"
            borderColor={borderColor}
            bg={subtleBg}
          >
            <Box>
              <Text fontSize="xl" fontWeight="700">
                Admins
              </Text>
              <Text mt={1} color={mutedText}>
                Create, edit, and review all admins under this company.
              </Text>
            </Box>
            <HStack spacing={3}>
              <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                {company?.adminCount || 0} total
              </Badge>
              <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                {company?.activeAdminCount || 0} active
              </Badge>
            </HStack>
          </Flex>

          <UserTable
            key={`${company._id}-${adminRefreshKey}`}
            companyId={company._id}
            companyName={company.company_name}
            onAdd={() => setDrawerState({ type: "admin-add", isOpen: true, data: null })}
            onEdit={(entry: any) =>
              setDrawerState({
                type: "admin-edit",
                isOpen: true,
                data: { ...entry, ...entry?.profileDetails?.personalInfo },
              })
            }
            onDelete={(entry: any) =>
              setDrawerState({ type: "delete", isOpen: true, data: entry })
            }
            showAddButton={false}
          />
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <SummaryCard label="Company Code" value={company?.companyCode || "--"} />
          <SummaryCard label="Tenant Slug" value={company?.tenantSlug || "--"} />
          <SummaryCard label="Tenant URL" value={company?.tenantUrl || "--"} />
        </SimpleGrid>

        <Box bg={surfaceBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={{ base: 4, md: 6 }}>
          <Text fontSize="lg" fontWeight="700">
            Company Details
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>
            <DetailItem
              label="Primary Contact"
              value={company?.companyEmail || company?.mobileNo || "--"}
              icon={<FiMail size={16} />}
            />
            <DetailItem
              label="Address"
              value={addressText}
              icon={<FiMapPin size={16} />}
            />
            <DetailItem
              label="Website"
              value={company?.webLink || "--"}
              icon={<FiGlobe size={16} />}
            />
            <DetailItem
              label="Status"
              value={`${company?.activeAdminCount || 0} active admins out of ${company?.adminCount || 0}`}
              icon={<FiUsers size={16} />}
            />
            <DetailItem
              label="Tenant Access"
              value={company?.tenantUrl || company?.tenantSlug || "--"}
              icon={<FiShield size={16} />}
            />
          </SimpleGrid>
        </Box>
      </Stack>

      <Drawer
        size="xl"
        isOpen={
          drawerState.isOpen &&
          (drawerState.type === "admin-add" || drawerState.type === "admin-edit")
        }
        placement="right"
        onClose={() => setDrawerState({ type: "admin-add", isOpen: false, data: null })}
      >
        <DrawerOverlay />
        <DrawerContent bg={surfaceBg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor={borderColor}>
            {drawerState.type === "admin-edit" ? "Edit Admin" : "Add Admin"}
          </DrawerHeader>
          <DrawerBody p={6}>
            <Form
              initialData={
                drawerState.type === "admin-edit"
                  ? { ...initialValues, ...drawerState.data }
                  : initialValues
              }
              onSubmit={drawerState.type === "admin-edit" ? handleEditSubmit : handleAddSubmit}
              isOpen={drawerState.isOpen}
              onClose={() => setDrawerState({ type: "admin-add", isOpen: false, data: null })}
              isEdit={drawerState.type === "admin-edit"}
              isLoading={loading}
              selectedCompany={company}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {drawerState.type === "delete" && drawerState.isOpen ? (
        <DeleteData
          getData={handleDeleteRefresh}
          data={drawerState.data}
          isOpen={drawerState.isOpen}
          onClose={() => setDrawerState({ type: "admin-add", isOpen: false, data: null })}
        />
      ) : null}
    </Box>
  );
};

export default CompanyAdminWorkspace;
 