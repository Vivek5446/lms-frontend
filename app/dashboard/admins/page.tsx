"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBriefcase,
  FiGlobe,
  FiLayers,
  FiMail,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiShield,
  FiUsers,
} from "react-icons/fi";
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

  // Modern Color Palette Definitions
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const surfaceBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const headingText = useColorModeValue("gray.800", "white");

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
      [
        company.company_name,
        company.companyCode,
        company.companyType,
        company.tenantSlug,
        company.companyEmail,
        company.addressInfo?.[0]?.city,
      ]
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
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
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
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 2 }} transition="all 0.3s ease">
      <Stack spacing={8} maxW="1400px" mx="auto">
        
        {/* Simple Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" color={headingText}>
            Directory
          </Text>
          <Button
            size="md"
            colorScheme="blue"
            bg="blue.600"
            _hover={{ bg: "blue.700", transform: "translateY(-1px)", shadow: "md" }}
            _active={{ transform: "translateY(0)" }}
            borderRadius="full"
            leftIcon={<FiPlus />}
            onClick={() => setIsCompanyDrawerOpen(true)}
            transition="all 0.2s"
          >
            Create Company
          </Button>
        </Flex>

        {/* Colorful Stat Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box
            bg={surfaceBg}
            border="1px solid"
            borderColor={useColorModeValue("blue.100", "blue.900")}
            borderRadius="2xl"
            p={5}
            shadow="sm"
            _hover={{ shadow: "md", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <HStack justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight="600" color={mutedText} textTransform="uppercase" letterSpacing="wider">
                  Total Organizations
                </Text>
                <Text mt={2} fontSize="3xl" fontWeight="900" color={headingText}>
                  {totals.companies}
                </Text>
              </Box>
              <Flex bg={useColorModeValue("blue.50", "blue.900")} color={useColorModeValue("blue.500", "blue.200")} p={4} borderRadius="2xl">
                <Icon as={FiBriefcase} boxSize={6} />
              </Flex>
            </HStack>
          </Box>

          <Box
            bg={surfaceBg}
            border="1px solid"
            borderColor={useColorModeValue("purple.100", "purple.900")}
            borderRadius="2xl"
            p={5}
            shadow="sm"
            _hover={{ shadow: "md", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <HStack justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight="600" color={mutedText} textTransform="uppercase" letterSpacing="wider">
                  System Admins
                </Text>
                <Text mt={2} fontSize="3xl" fontWeight="900" color={headingText}>
                  {totals.admins}
                </Text>
              </Box>
              <Flex bg={useColorModeValue("purple.50", "purple.900")} color={useColorModeValue("purple.500", "purple.200")} p={4} borderRadius="2xl">
                <Icon as={FiUsers} boxSize={6} />
              </Flex>
            </HStack>
          </Box>

          <Box
            bg={surfaceBg}
            border="1px solid"
            borderColor={useColorModeValue("teal.100", "teal.900")}
            borderRadius="2xl"
            p={5}
            shadow="sm"
            _hover={{ shadow: "md", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <HStack justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight="600" color={mutedText} textTransform="uppercase" letterSpacing="wider">
                  Active Admins
                </Text>
                <Text mt={2} fontSize="3xl" fontWeight="900" color={headingText}>
                  {totals.activeAdmins}
                </Text>
              </Box>
              <Flex bg={useColorModeValue("teal.50", "teal.900")} color={useColorModeValue("teal.500", "teal.200")} p={4} borderRadius="2xl">
                <Icon as={FiShield} boxSize={6} />
              </Flex>
            </HStack>
          </Box>
        </SimpleGrid>

        {/* Directory Section */}
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
            <InputGroup maxW={{ base: "100%", md: "400px" }} size="lg">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations..."
                borderRadius="full"
                bg={surfaceBg}
                border="1px solid"
                borderColor={borderColor}
                _hover={{ borderColor: "blue.300" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3b82f6" }}
                transition="all 0.2s"
              />
            </InputGroup>
          </Flex>

          {companies.loading ? (
            <Flex py={20} justify="center" align="center" direction="column" gap={4}>
              <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
              <Text color={mutedText} fontWeight="500">Loading directory...</Text>
            </Flex>
          ) : filteredCompanies.length ? (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={6}>
              {filteredCompanies.map((company: any) => {
                const locationStr = company.addressInfo?.[0]
                  ? [company.addressInfo[0].city, company.addressInfo[0].country]
                      .filter(Boolean)
                      .join(", ")
                  : "Location not set";

                return (
                  <Box
                    key={company._id}
                    role="group"
                    bg={surfaceBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    p={6}
                    shadow="sm"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      borderColor: "blue.300",
                      boxShadow: "xl",
                      transform: "translateY(-4px)",
                    }}
                    cursor="pointer"
                    onClick={() => openCompanyWorkspace(company._id)}
                    display="flex"
                    flexDirection="column"
                  >
                    <HStack align="start" justify="space-between" mb={3}>
                      <HStack align="center" spacing={4}>
                        <Avatar
                          size="md"
                          name={company.company_name}
                          src={company?.logo?.url}
                          bgGradient="linear(to-br, blue.400, teal.400)"
                          color="white"
                          fontWeight="bold"
                          borderRadius="xl"
                        />
                        <Box>
                          <Tooltip label={company.company_name} placement="top" hasArrow>
                            <Text fontSize="lg" fontWeight="800" color={headingText} noOfLines={1}>
                              {company.company_name}
                            </Text>
                          </Tooltip>
                          <HStack spacing={2} mt={1}>
                            <Badge
                              colorScheme={company.companyType === "school" ? "purple" : "blue"}
                              variant="subtle"
                              borderRadius="md"
                              px={2}
                              textTransform="capitalize"
                            >
                              {company.companyType || "Standard"}
                            </Badge>
                            <Text fontSize="xs" color={mutedText} fontWeight="600">
                              #{company.companyCode || "--"}
                            </Text>
                          </HStack>
                        </Box>
                      </HStack>

                      {/* Status Indicator */}
                      <Tooltip label={company.is_active ? "Active" : "Inactive"} placement="top" hasArrow>
                        <Box
                          w={3}
                          h={3}
                          borderRadius="full"
                          bg={company.is_active ? "green.400" : "red.400"}
                          boxShadow={company.is_active ? "0 0 8px rgba(72, 187, 120, 0.6)" : "none"}
                        />
                      </Tooltip>
                    </HStack>

                    <Divider my={4} borderColor={borderColor} />

                    <VStack spacing={3} align="start" mb={6} flex="1">
                      <HStack spacing={3} color={mutedText} w="full">
                        <Icon as={FiMapPin} color="gray.400" />
                        <Text fontSize="sm" fontWeight="500" noOfLines={1} textTransform="capitalize">
                          {locationStr}
                        </Text>
                      </HStack>

                      <HStack spacing={3} color={mutedText} w="full">
                        <Icon as={FiGlobe} color="gray.400" />
                        <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                          {company.tenantUrl || company.customDomain || company.tenantSlug || "No domain set"}
                        </Text>
                      </HStack>

                      <HStack spacing={3} color={mutedText} w="full">
                        <Icon as={FiMail} color="gray.400" />
                        <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                          {company.companyEmail || company.mobileNo || "No contact info"}
                        </Text>
                      </HStack>
                      
                      {company.departments && company.departments.length > 0 && (
                        <HStack spacing={3} color={mutedText} w="full">
                           <Icon as={FiLayers} color="gray.400" />
                           <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                             {company.departments.length} Department{company.departments.length > 1 ? 's' : ''}
                           </Text>
                        </HStack>
                      )}
                    </VStack>

                    <HStack
                      justify="space-between"
                      align="center"
                      mt="auto"
                      pt={3}
                      borderTop="1px solid"
                      borderColor="transparent"
                      _groupHover={{ borderColor: useColorModeValue("gray.100", "gray.700") }}
                      transition="all 0.2s"
                    >
                      <Text fontSize="sm" fontWeight="600" color="blue.500">
                        Open Workspace
                      </Text>
                      <Flex
                        w="32px"
                        h="32px"
                        borderRadius="full"
                        bg={useColorModeValue("blue.50", "blue.900")}
                        align="center"
                        justify="center"
                        color="blue.500"
                        transition="all 0.3s"
                        _groupHover={{ bg: "blue.500", color: "white", transform: "translateX(4px)" }}
                      >
                        <Icon as={FiArrowRight} />
                      </Flex>
                    </HStack>
                  </Box>
                );
              })}
            </Grid>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              bg={surfaceBg}
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="3xl"
              p={12}
              textAlign="center"
            >
              <Flex
                w="64px"
                h="64px"
                bg={useColorModeValue("blue.50", "blue.900")}
                color="blue.500"
                borderRadius="full"
                align="center"
                justify="center"
                mb={4}
              >
                <Icon as={FiSearch} boxSize={8} />
              </Flex>
              <Text fontWeight="800" fontSize="xl" color={headingText}>
                No organizations found
              </Text>
              <Text mt={2} color={mutedText} maxW="sm">
                We couldn't find any organizations matching your current search criteria. Try a different keyword.
              </Text>
              <Button
                mt={6}
                colorScheme="blue"
                variant="outline"
                borderRadius="full"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </Flex>
          )}
        </VStack>
      </Stack>

      <Drawer
        size="xl"
        isOpen={isCompanyDrawerOpen}
        placement="right"
        onClose={() => setIsCompanyDrawerOpen(false)}
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent borderLeftRadius={{ base: "none", md: "2xl" }}>
          <DrawerCloseButton top={4} right={4} />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} py={5}>
            <Text fontSize="2xl" fontWeight="800">Create New Company</Text>
          </DrawerHeader>
          <DrawerBody pb={6} pt={6}>
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