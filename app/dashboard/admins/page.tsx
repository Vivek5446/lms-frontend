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
  Heading,
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
import { useCallback, useEffect, useMemo, useState } from "react";
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
  FiArrowLeft,
} from "react-icons/fi";
import { readFileAsBase64 } from "../../config/utils/utils";
import PermissionGate from "@/app/component/common/PermissionGate";
import { getApiErrorMessage } from "../../config/utils/apiError";
import stores from "../../store/stores";
import CompanyAdminWorkspace from "./component/CompanyAdminWorkspace";
import CompanyForm from "./component/CompanyForm";
import StatCard from "../../component/common/StatCard/StatCard";
import CustomInput from "../../component/config/component/customInput/CustomInput";

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
  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();
  const selectedCompanyId = searchParams.get("company") || "";

  // Modern Color Palette Definitions
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const surfaceBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const headingText = useColorModeValue("gray.800", "white");
  const showToast = useCallback(
    (options: any) =>
      toast({
        position: "top-right",
        isClosable: true,
        ...options,
      }),
    [toast]
  );

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
      showToast({
        title: "Unable to load companies",
        description: getApiErrorMessage(err),
        status: "error",
        duration: 4000,
      });
    });
  }, [showToast]);

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
      showToast({
        title: "Company created",
        description: response?.data?.message || `${values.company_name} is ready.`,
        status: "success",
        duration: 4000,
      });

      if (createdCompany?._id) {
        openCompanyWorkspace(createdCompany._id);
      }
    } catch (err: any) {
      showToast({
        title: "Failed to create company",
        description: getApiErrorMessage(err, "Please review the form and try again."),
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (selectedCompanyId && companies.loading && !selectedCompany) {
    return (
      <Flex minH="60vh" justify="center" align="center" bg="transparent">
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
    <PermissionGate
      allowed={role === "superadmin"}
      title="Companies module is restricted"
      description="Only Super Admins can access company management."
      fallbackHref="/dashboard"
    >
      <Box minH="100vh" bg="transparent" p={{ base: 3, md: 0 }} transition="all 0.3s ease">
      <Stack spacing={4} maxW="1600px" mx="auto">
        
        {/* Elegant Header Section */}
        <Box bg={surfaceBg} borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")} rounded={{ base: "xl", md: "2xl" }} px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }} shadow="sm">
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
            <HStack spacing={{ base: 3, md: 4 }} align="center">
              <Box 
                as="button"
                onClick={() => window.history.back()}
                color={useColorModeValue("gray.500", "gray.400")}
                bg={useColorModeValue("gray.100", "whiteAlpha.100")}
                w={{ base: "36px", md: "40px" }} h={{ base: "36px", md: "40px" }}
                rounded="full"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.200"), color: useColorModeValue("#6269FF", "#9F7AEA"), transform: "translateX(-3px)" }}
                transition="all 0.2s"
              >
                <FiArrowLeft size={18} />
              </Box>
              <Box display={{ base: "none", md: "flex" }} p={{ base: 2.5, md: 3 }} bgGradient={useColorModeValue("linear(to-br, #6269FF, #8A2BE2)", "linear(to-br, #805AD5, #D53F8C)")} rounded="full" alignItems="center" justifyContent="center" boxShadow="0 4px 15px rgba(98,105,255,0.4)" border="1px solid" borderColor="rgba(255,255,255,0.2)">
                <Icon as={FiBriefcase} boxSize={{ base: 4, md: 5 }} color="white" />
              </Box>
              <Box>
                <Heading size={{ base: "sm", md: "lg" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2" textTransform="uppercase">
                  <Box as="span" color={useColorModeValue("gray.900", "white")}>COMPANY </Box>
                  <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
                    DIRECTORY
                  </Box>
                </Heading>
                <Text mt={1} fontSize={{ base: "2xs", md: "xs" }} color="gray.500" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" noOfLines={1}>
                  Manage and oversee all organizations in your ecosystem
                </Text>
              </Box>
            </HStack>
          <Button
            size="lg"
            colorScheme="blue"
            bgGradient="linear(to-r, blue.500, teal.500)"
            _hover={{ 
              bgGradient: "linear(to-r, blue.600, teal.600)",
              transform: "translateY(-2px)",
              shadow: "xl"
            }}
            _active={{ transform: "translateY(0)" }}
            borderRadius="full"
            leftIcon={<FiPlus />}
            onClick={() => setIsCompanyDrawerOpen(true)}
            transition="all 0.2s"
            shadow="md"
          >
            New Company
          </Button>
        </Flex>
        </Box>

        {/* Modern Glassmorphic Stat Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
          <StatCard
            label="TOTAL ORGANIZATIONS"
            value={totals.companies}
            icon={FiBriefcase}
            colorScheme="blue"
          />
          <StatCard
            label="SYSTEM ADMINS"
            value={totals.admins}
            icon={FiUsers}
            colorScheme="purple"
          />
          <StatCard
            label="ACTIVE ADMINS"
            value={totals.activeAdmins}
            icon={FiShield}
            colorScheme="teal"
          />
        </SimpleGrid>

        {/* Directory Section */}
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
            <Box maxW={{ base: "100%", md: "400px" }} w="full">
              <CustomInput
                name="search"
                type="text"
                placeholder="Search by name, code, location..."
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                icon={FiSearch}
              />
            </Box>
            <Badge 
              bg={useColorModeValue("blue.50", "rgba(59,130,246,0.15)")} 
              color="blue.500" 
              px={4} 
              py={2} 
              borderRadius="full" 
              fontSize="sm" 
              fontWeight="700"
              textTransform="none"
              letterSpacing="normal"
              shadow="sm"
            >
              {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'} found
            </Badge>
          </Flex>

          {companies.loading ? (
            <Flex py={20} justify="center" align="center" direction="column" gap={4}>
              <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
              <Text color={mutedText} fontWeight="500">Loading directory...</Text>
            </Flex>
          ) : filteredCompanies.length ? (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={8}>
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
                    bg={useColorModeValue("white", "gray.800")}
                    borderWidth="1px"
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    borderRadius="2xl"
                    overflow="hidden"
                    shadow="sm"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      borderColor: "blue.300",
                      boxShadow: "md",
                      transform: "translateY(-4px)",
                    }}
                    cursor="pointer"
                    onClick={() => openCompanyWorkspace(company._id)}
                    position="relative"
                  >
                    {/* Subtle gradient overlay on hover */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="4px"
                      bgGradient="linear(to-r, blue.400, teal.400)"
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.2s"
                    />
                    
                    <Box p={6}>
                      <HStack align="start" justify="space-between" mb={4}>
                        <HStack align="center" spacing={4}>
                          <Avatar
                            size="md"
                            name={company.company_name}
                            src={company?.logo?.url}
                            bgGradient="linear(to-br, blue.500, teal.500)"
                            color="white"
                            fontWeight="bold"
                            borderRadius="xl"
                            shadow="sm"
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
                                variant="solid"
                                borderRadius="full"
                                px={2}
                                textTransform="capitalize"
                                fontSize="xs"
                              >
                                {company.companyType || "Standard"}
                              </Badge>
                              <Text fontSize="xs" color={mutedText} fontWeight="600">
                                #{company.companyCode || "--"}
                              </Text>
                            </HStack>
                          </Box>
                        </HStack>

                        <Tooltip label={company.is_active ? "Active" : "Inactive"} placement="top" hasArrow>
                          <Box
                            w={2.5}
                            h={2.5}
                            borderRadius="full"
                            bg={company.is_active ? "green.400" : "red.400"}
                            boxShadow={company.is_active ? "0 0 8px rgba(72, 187, 120, 0.6)" : "none"}
                            animation={company.is_active ? "pulse 2s infinite" : "none"}
                          />
                        </Tooltip>
                      </HStack>

                      <Divider my={4} borderColor={borderColor} />

                      <VStack spacing={3} align="start" mb={6} flex="1">
                        <HStack spacing={3} color={mutedText} w="full">
                          <Icon as={FiMapPin} color="gray.400" boxSize="14px" />
                          <Text fontSize="sm" fontWeight="500" noOfLines={1} textTransform="capitalize">
                            {locationStr}
                          </Text>
                        </HStack>

                        <HStack spacing={3} color={mutedText} w="full">
                          <Icon as={FiGlobe} color="gray.400" boxSize="14px" />
                          <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                            {company.tenantUrl || company.customDomain || company.tenantSlug || "No domain set"}
                          </Text>
                        </HStack>

                        <HStack spacing={3} color={mutedText} w="full">
                          <Icon as={FiMail} color="gray.400" boxSize="14px" />
                          <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                            {company.companyEmail || company.mobileNo || "No contact info"}
                          </Text>
                        </HStack>
                        
                        {company.departments && company.departments.length > 0 && (
                          <HStack spacing={3} color={mutedText} w="full">
                            <Icon as={FiLayers} color="gray.400" boxSize="14px" />
                            <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                              {company.departments.length} Department{company.departments.length > 1 ? 's' : ''}
                            </Text>
                          </HStack>
                        )}
                      </VStack>

                      <Button
                        variant="ghost"
                        rightIcon={<FiArrowRight />}
                        size="sm"
                        colorScheme="blue"
                        borderRadius="full"
                        w="full"
                        justifyContent="space-between"
                        px={4}
                        _groupHover={{ bg: "blue.50", color: "blue.600" }}
                      >
                        Open Workspace
                      </Button>
                    </Box>
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
              minH="400px"
            >
              <Flex
                w="80px"
                h="80px"
                bg="blue.50"
                color="blue.500"
                borderRadius="full"
                align="center"
                justify="center"
                mb={6}
              >
                <Icon as={FiSearch} boxSize={10} />
              </Flex>
              <Text fontWeight="800" fontSize="2xl" color={headingText}>
                No organizations found
              </Text>
              <Text mt={3} color={mutedText} maxW="md">
                We couldn't find any organizations matching your current search criteria. Try adjusting your search or clear the filter.
              </Text>
              <Button
                mt={8}
                colorScheme="blue"
                variant="outline"
                borderRadius="full"
                onClick={() => setSearchQuery("")}
                leftIcon={<FiSearch />}
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
        <DrawerOverlay backdropFilter="blur(8px)" bg="blackAlpha.300" />
        <DrawerContent borderLeftRadius={{ base: "none", md: "3xl" }} shadow="2xl">
          <DrawerCloseButton top={4} right={4} size="lg" />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} py={6} px={8}>
            <Text fontSize="2xl" fontWeight="800" bgGradient="linear(to-r, blue.500, teal.500)" bgClip="text">
              Create New Company
            </Text>
            <Text fontSize="sm" color={mutedText} mt={1}>
              Fill in the details to register a new organization
            </Text>
          </DrawerHeader>
          <DrawerBody pb={8} pt={6} px={8}>
            <CompanyForm
              onSubmit={handleCreateCompany}
              onClose={() => setIsCompanyDrawerOpen(false)}
              isLoading={loading}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Add subtle animation keyframes */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </Box>
    </PermissionGate>
  );
});

export default DirectoryPage;
