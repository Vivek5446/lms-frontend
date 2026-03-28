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
  Grid,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiBriefcase, FiGlobe, FiMail, FiPlus, FiSearch, FiShield, FiUsers } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { readFileAsBase64 } from "../../config/utils/utils";
import stores from "../../store/stores";
import CompanyAdminWorkspace from "./component/CompanyAdminWorkspace";
import CompanyForm from "./component/CompanyForm";

const getMonogram = (name?: string) => {
  if (!name?.trim()) return "CO";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const DirectoryPage = observer(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const selectedCompanyId = searchParams.get("company") || "";

  const pageBg = useColorModeValue("#f4f8ff", "gray.900");
  const surfaceBg = useColorModeValue("white", "gray.800");
  const subtleBg = useColorModeValue("blue.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("blue.100", "gray.700");
  const borderHover = useColorModeValue("blue.300", "blue.300");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const accentText = useColorModeValue("blue.700", "blue.200");
  const iconBg = useColorModeValue("blue.100", "blue.900");

  const {
    companyStore: { createCompany, getManagedCompanies, companies },
  } = stores;

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompanyDrawerOpen, setIsCompanyDrawerOpen] = useState(false);

  const refreshCompanies = async () => {
    return getManagedCompanies();
  };

  useEffect(() => {
    refreshCompanies().catch((err: any) => {
      toast({
        title: "Unable to load companies",
        description: err?.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    });
  }, []);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return companies.data || [];
    }

    return (companies.data || []).filter((company: any) =>
      [company.company_name, company.companyCode, company.companyType, company.tenantSlug, company.companyEmail]
        .filter(Boolean)
        .some((value: string) => String(value).toLowerCase().includes(query))
    );
  }, [companies.data, searchQuery]);

  const totals = useMemo(() => {
    const items = companies.data || [];
    return {
      companies: items.length,
      admins: items.reduce((sum: number, item: any) => sum + (item.adminCount || 0), 0),
      activeAdmins: items.reduce((sum: number, item: any) => sum + (item.activeAdminCount || 0), 0),
    };
  }, [companies.data]);

  const selectedCompany = useMemo(
    () => (companies.data || []).find((company: any) => company._id === selectedCompanyId) || null,
    [companies.data, selectedCompanyId]
  );

  const openCompanyWorkspace = (companyId: string) => {
    router.push(`/dashboard/admins?company=${companyId}`);
  };

  const closeCompanyWorkspace = () => {
    router.push("/dashboard/admins");
  };

  const handleCreateCompany = async (values: any) => {
    try {
      setLoading(true);
      const payload: any = {
        ...values,
        tenantSlug: values.tenantSlug || values.company_name,
      };

      const logoFile = values?.logo?.file;
      if (logoFile && !Array.isArray(logoFile)) {
        const buffer = await readFileAsBase64(logoFile);
        payload.logo = {
          buffer,
          filename: logoFile.name,
          type: logoFile.type,
        };
      } else {
        delete payload.logo;
      }

      const response: any = await createCompany(payload);
      const createdCompany = response?.data?.data;

      await refreshCompanies();
      setIsCompanyDrawerOpen(false);
      toast({
        title: "Company created",
        description: response?.data?.message || `${values.company_name} is ready.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      if (createdCompany?._id) {
        openCompanyWorkspace(createdCompany._id);
      }
    } catch (err: any) {
      toast({
        title: "Failed to create company",
        description: err?.message || "Please review the form and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (selectedCompanyId && companies.loading && !selectedCompany) {
    return (
      <Flex minH="60vh" justify="center" align="center" bg={pageBg}>
        <Spinner size="lg" color="blue.500" />
      </Flex>
    );
  }

  if (selectedCompanyId && selectedCompany) {
    return (
      <CompanyAdminWorkspace
        company={selectedCompany}
        onBack={closeCompanyWorkspace}
        onCompanyRefresh={refreshCompanies}
      />
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 6 }}>
      <Stack spacing={6} maxW="1400px" mx="auto">
        <Box
          bg={surfaceBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="2xl"
          p={{ base: 5, md: 6 }}
          shadow="sm"
        >
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
            <Box maxW="3xl">
              <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1}>
                Superadmin
              </Badge>
              <Text mt={3} fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" color={accentText}>
                Company directory
              </Text>
              <Text mt={2} color={mutedText}>
                Select a company to manage its admins. The company workspace opens in a focused view without using dynamic routes.
              </Text>
            </Box>

            <Button
              colorScheme="blue"
              borderRadius="full"
              leftIcon={<FiPlus />}
              onClick={() => setIsCompanyDrawerOpen(true)}
            >
              Create Company
            </Button>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box bg={subtleBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={4}>
            <HStack justify="space-between">
              <Box>
                <Text fontSize="sm" color={mutedText}>Companies</Text>
                <Text mt={1} fontSize="2xl" fontWeight="800">{totals.companies}</Text>
              </Box>
              <Box bg={iconBg} color={accentText} p={3} borderRadius="xl">
                <FiBriefcase />
              </Box>
            </HStack>
          </Box>
          <Box bg={subtleBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={4}>
            <HStack justify="space-between">
              <Box>
                <Text fontSize="sm" color={mutedText}>Total Admins</Text>
                <Text mt={1} fontSize="2xl" fontWeight="800">{totals.admins}</Text>
              </Box>
              <Box bg={iconBg} color={accentText} p={3} borderRadius="xl">
                <FiUsers />
              </Box>
            </HStack>
          </Box>
          <Box bg={subtleBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" p={4}>
            <HStack justify="space-between">
              <Box>
                <Text fontSize="sm" color={mutedText}>Active Admins</Text>
                <Text mt={1} fontSize="2xl" fontWeight="800">{totals.activeAdmins}</Text>
              </Box>
              <Box bg={iconBg} color={accentText} p={3} borderRadius="xl">
                <FiShield />
              </Box>
            </HStack>
          </Box>
        </SimpleGrid>

        <Box
          bg={surfaceBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="2xl"
          p={{ base: 4, md: 5 }}
          shadow="sm"
        >
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap" mb={5}>
            <Box>
              <Text fontSize="xl" fontWeight="700">Companies</Text>
              <Text mt={1} color={mutedText}>
                Pick one company to open its admin workspace.
              </Text>
            </Box>

            <InputGroup maxW={{ base: "100%", md: "320px" }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="#94a3b8" />
              </InputLeftElement>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, code, tenant..."
                borderRadius="full"
                borderColor={borderColor}
                _focus={{ borderColor: "blue.300", boxShadow: "0 0 0 1px #93c5fd" }}
              />
            </InputGroup>
          </Flex>

          {companies.loading ? (
            <Flex py={14} justify="center">
              <Spinner size="lg" color="blue.500" />
            </Flex>
          ) : filteredCompanies.length ? (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={5}>
              {filteredCompanies.map((company: any) => (
                <Box
                  key={company._id}
                  bg={surfaceBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  p={5}
                  shadow="sm"
                  transition="all 0.2s ease"
                  _hover={{ borderColor: borderHover, boxShadow: "md" }}
                >
                  <HStack justify="space-between" align="start" spacing={4}>
                    <HStack align="start" spacing={4}>
                      <Flex
                        w="52px"
                        h="52px"
                        borderRadius="xl"
                        align="center"
                        justify="center"
                        bg={iconBg}
                        color={accentText}
                        overflow="hidden"
                        fontWeight="800"
                      >
                        {company?.logo?.url ? (
                          <img
                            src={company.logo.url}
                            alt={company.company_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          getMonogram(company.company_name)
                        )}
                      </Flex>
                      <Box>
                        <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1}>
                          {company.companyType}
                        </Badge>
                        <Text mt={3} fontSize="lg" fontWeight="700">
                          {company.company_name}
                        </Text>
                        <Text fontSize="sm" color={mutedText}>
                          {company.companyCode || "--"}
                        </Text>
                      </Box>
                    </HStack>

                    <Box color={mutedText}>
                      <FiArrowRight />
                    </Box>
                  </HStack>

                  <Stack spacing={3} mt={5}>
                    <HStack spacing={2} color={mutedText}>
                      <FiGlobe />
                      <Text fontSize="sm" noOfLines={1}>
                        {company.tenantUrl || company.tenantSlug || "--"}
                      </Text>
                    </HStack>
                    <HStack spacing={2} color={mutedText}>
                      <FiMail />
                      <Text fontSize="sm" noOfLines={1}>
                        {company.companyEmail || company.mobileNo || "No primary contact"}
                      </Text>
                    </HStack>
                  </Stack>

                  <SimpleGrid columns={2} spacing={3} mt={5}>
                    <Box bg={subtleBg} borderRadius="xl" p={3}>
                      <Text fontSize="xs" color={mutedText} textTransform="uppercase" fontWeight="700">
                        Admins
                      </Text>
                      <Text mt={1} fontSize="xl" fontWeight="800">
                        {company.adminCount || 0}
                      </Text>
                    </Box>
                    <Box bg={subtleBg} borderRadius="xl" p={3}>
                      <Text fontSize="xs" color={mutedText} textTransform="uppercase" fontWeight="700">
                        Active
                      </Text>
                      <Text mt={1} fontSize="xl" fontWeight="800">
                        {company.activeAdminCount || 0}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <Button
                    mt={5}
                    w="full"
                    colorScheme="blue"
                    variant="outline"
                    borderRadius="full"
                    rightIcon={<FiArrowRight />}
                    onClick={() => openCompanyWorkspace(company._id)}
                  >
                    Open Admins
                  </Button>
                </Box>
              ))}
            </Grid>
          ) : (
            <Box border="1px dashed" borderColor={borderColor} borderRadius="2xl" p={10} textAlign="center">
              <Text fontWeight="700" fontSize="lg">
                No matching companies
              </Text>
              <Text mt={2} color={mutedText}>
                Try a different search or create a new company.
              </Text>
            </Box>
          )}
        </Box>
      </Stack>

      <Drawer
        size="lg"
        isOpen={isCompanyDrawerOpen}
        placement="right"
        onClose={() => setIsCompanyDrawerOpen(false)}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create Company</DrawerHeader>
          <DrawerBody pb={6}>
            <CompanyForm
              onSubmit={handleCreateCompany}
              onClose={() => setIsCompanyDrawerOpen(false)}
              isLoading={loading}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
});

export default DirectoryPage;
