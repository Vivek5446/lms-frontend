"use client";

import PermissionGate from "@/app/component/common/PermissionGate";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";
import { departmentStore } from "@/app/store/departmentStore/departmentStore";
import stores from "@/app/store/stores";
import {
  Box,
  Center,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  HStack,
  Badge,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { FiBriefcase, FiGrid } from "react-icons/fi";
import DepartmentTable from "./DepartmentTable";

const DepartmentsPage = observer(() => {
  const { auth, companyStore } = stores;

  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const canViewDepartments = hasPermission(
    auth.user,
    PERMISSION_KEYS.VIEW_DEPARTMENTS
  );

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.900", "white");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const statLabelColor = useColorModeValue("gray.500", "gray.400");
  const statValueColor = useColorModeValue("gray.900", "white");

  useEffect(() => {
    if (isSuperadmin) {
      companyStore.getManagedCompanies().catch(() => undefined);
      return;
    }

    companyStore.initializeCompanyContext();
  }, [companyStore, isSuperadmin]);

  const companyId = companyStore.getActiveCompanyId();
  const companies = companyStore.companies.data || [];

  const activeCompany =
    companies.find((company: any) => company._id === companyId) ||
    auth.user?.companyDetails ||
    null;

  const totalDepartments =
    departmentStore.activeCompanyId === (companyId || "")
      ? departmentStore.pagination?.total || 0
      : 0;

  const StatCard = ({
    icon,
    label,
    value,
    colorScheme,
  }: {
    icon: any;
    label: string;
    value: string | number;
    colorScheme: "blue" | "purple";
  }) => {
    const iconBg = useColorModeValue(
      `${colorScheme}.50`,
      `${colorScheme}.900`
    );
    const iconColor = useColorModeValue(
      `${colorScheme}.500`,
      `${colorScheme}.300`
    );

    return (
      <Flex
        align="center"
        gap={{ base: 3, md: 4 }}
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        rounded={{ base: "2xl", md: "3xl" }}
        p={{ base: 3, md: 4 }}
        minW={0}
        shadow="sm"
      >
        <Center
          w={{ base: 9, md: 11 }}
          h={{ base: 9, md: 11 }}
          bg={iconBg}
          color={iconColor}
          rounded="xl"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={{ base: 4, md: 5 }} />
        </Center>

        <Box minW={0}>
          <Text
            fontSize={{ base: "2xs", md: "xs" }}
            fontWeight="800"
            color={statLabelColor}
            textTransform="uppercase"
            letterSpacing="wide"
            noOfLines={1}
          >
            {label}
          </Text>

          <Text
            mt={0.5}
            fontSize={{ base: "md", md: "xl" }}
            fontWeight="800"
            color={statValueColor}
            lineHeight="1.15"
            noOfLines={1}
          >
            {value}
          </Text>
        </Box>
      </Flex>
    );
  };

  return (
    <PermissionGate
      allowed={canViewDepartments}
      title="Departments module is disabled"
      description="This account does not currently have access to departments."
      fallbackHref="/dashboard/profile"
    >
      <Box bg="transparent" p={{ base: 3, md: 0 }}>
        <Stack spacing={{ base: 4, md: 6 }}>
          <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded={{ base: "xl", md: "2xl" }} p={{ base: 4, md: 6 }} shadow="sm">
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
              <HStack spacing={4}>
                <Box p={{ base: 2.5, md: 3 }} bgGradient="linear(to-br, #6269FF, #8A2BE2)" rounded="full" display="flex" alignItems="center" justifyContent="center" boxShadow="0 4px 15px rgba(98,105,255,0.4)" border="1px solid" borderColor="rgba(255,255,255,0.2)">
                  <Icon as={FiBriefcase} boxSize={{ base: 4, md: 5 }} color="white" />
                </Box>
                <Box>
                  <Heading size={{ base: "md", md: "lg" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                    <Box as="span" color={useColorModeValue("gray.900", "white")}>DEPARTMENT </Box>
                    <Box as="span" bgGradient="linear(to-r, #6269FF, #8A2BE2)" bgClip="text">
                      MANAGEMENT
                    </Box>
                  </Heading>
                  <Text mt={1} fontSize={{ base: "10px", md: "xs" }} fontWeight="700" color={useColorModeValue("gray.500", "gray.400")} letterSpacing="0.1em" textTransform="uppercase">
                    Structure and management for <Text as="span" color={useColorModeValue("gray.900", "white")}>{activeCompany?.company_name || "selected company"}</Text>
                  </Text>
                </Box>
              </HStack>
              <Badge bg={useColorModeValue("blue.50", "rgba(98,105,255,0.15)")} color="#6269FF" borderRadius="full" px={4} py={2} fontSize="xs" fontWeight="800">
                <Flex align="center" gap={1.5}>
                  <Icon as={FiGrid} boxSize={3.5} />
                  {totalDepartments} DEPARTMENTS
                </Flex>
              </Badge>
            </Flex>
          </Box>

          <DepartmentTable
            key={companyId || "no-company"}
            companyId={companyId || undefined}
            companyName={activeCompany?.company_name}
          />
        </Stack>
      </Box>
    </PermissionGate>
  );
});

export default DepartmentsPage;