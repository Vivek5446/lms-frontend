"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { departmentStore } from "@/app/store/departmentStore/departmentStore";
import stores from "@/app/store/stores";
import DepartmentTable from "./DepartmentTable";

const DepartmentsPage = observer(() => {
  const { auth, companyStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

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
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderRadius="2xl"
          p={{ base: 5, md: 6 }}
          boxShadow="sm"
        >
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            gap={4}
            wrap="wrap"
          >
            <Box>
              <Heading size="md">Departments</Heading>
              <Text mt={2} color={textColor} maxW="3xl">
                Review the department structure for{" "}
                {activeCompany?.company_name || "the selected company"}. The
                header company selector controls this workspace for superadmins.
              </Text>
            </Box>
            {activeCompany?.company_name ? (
              <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                {activeCompany.company_name}
              </Badge>
            ) : null}
          </Flex>
        </Box>

        {!companyId && isSuperadmin ? (
          <Alert status="info" borderRadius="xl">
            <AlertIcon />
            <Box>
              <AlertTitle>Select a company</AlertTitle>
              <AlertDescription>
                Use the global company selector in the header to load
                departments for a company.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderRadius="2xl"
                p={5}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel>Total Departments</StatLabel>
                  <StatNumber>
                    {departmentStore.isLoading ? "..." : totalDepartments}
                  </StatNumber>
                </Stat>
              </Box>
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderRadius="2xl"
                p={5}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel>Company</StatLabel>
                  <StatNumber fontSize="xl">
                    {activeCompany?.company_name || "Not selected"}
                  </StatNumber>
                </Stat>
              </Box>
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderRadius="2xl"
                p={5}
                boxShadow="sm"
              >
                <Stat>
                  <StatLabel>Context</StatLabel>
                  <StatNumber fontSize="xl">
                    {isSuperadmin ? "Cross-company view" : "Restricted scope"}
                  </StatNumber>
                </Stat>
              </Box>
            </SimpleGrid>

            <DepartmentTable
              key={companyId || "no-company"}
              companyId={companyId || undefined}
              companyName={activeCompany?.company_name}
            />
          </>
        )}
      </Stack>
    </Box>
  );
});

export default DepartmentsPage;
