"use client";

import {
  Box,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  Divider,
  Center,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { departmentStore } from "@/app/store/departmentStore/departmentStore";
import stores from "@/app/store/stores";
import PermissionGate from "@/app/component/common/PermissionGate";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";
import DepartmentTable from "./DepartmentTable";
import { FiBriefcase, FiGrid } from "react-icons/fi";

const DepartmentsPage = observer(() => {
  const { auth, companyStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const canViewDepartments = hasPermission(auth.user, PERMISSION_KEYS.VIEW_DEPARTMENTS);
  
  // Colors
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const dividerColor = useColorModeValue("gray.200", "gray.700");

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

  return (
    <PermissionGate
      allowed={canViewDepartments}
      title="Departments module is disabled"
      description="This account does not currently have access to departments."
      fallbackHref="/dashboard/profile"
    >
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 8 }}>
      <Stack spacing={8}>
        
        {/* NEW MINIMALIST HEADER SECTION */}
        <Flex 
          align="flex-end" 
          justify="space-between" 
          wrap="wrap" 
          pb={4} 
          borderBottom="1px solid" 
          borderColor={dividerColor}
        >
          {/* <Box>
            <Heading size="lg" fontWeight="700" letterSpacing="tight">
              Departments
            </Heading>
            <Text fontSize="md" color={secondaryTextColor} mt={1}>
              Structure and management for <b>{activeCompany?.company_name || "ABC"}</b>
            </Text>
          </Box> */}

          {/* Inline Stats */}
          <Flex align="center" gap={8} mt={{ base: 4, md: 0 }}>
            {/* Total Departments Stat */}
            <Flex align="center" gap={3}>
              <Center p={2} bg="blue.50" borderRadius="md">
                <Icon as={FiGrid} color="blue.500" boxSize={5} />
              </Center>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                  Total
                </Text>
                <Text fontSize="xl" fontWeight="700" lineHeight="1">
                  {totalDepartments}
                </Text>
              </Box>
            </Flex>

            <Center height="30px">
              <Divider orientation="vertical" />
            </Center>

            {/* Company Info Stat */}
            <Flex align="center" gap={3}>
              <Center p={2} bg="purple.50" borderRadius="md">
                <Icon as={FiBriefcase} color="purple.500" boxSize={5} />
              </Center>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                  Company
                </Text>
                <Text fontSize="xl" fontWeight="700" lineHeight="1">
                  {activeCompany?.company_name || "ABC"}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>

        {/* TABLE SECTION */}
        <Box>
          <DepartmentTable
            key={companyId || "no-company"}
            companyId={companyId || undefined}
            companyName={activeCompany?.company_name}
          />
        </Box>
      </Stack>
    </Box>
    </PermissionGate>
  );
});

export default DepartmentsPage;
