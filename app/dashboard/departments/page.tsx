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
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import stores from "@/app/store/stores";

const DepartmentsPage = observer(() => {
  const { auth, companyStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";

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
    companies.find((company: any) => company._id === companyId) || auth.user?.companyDetails || null;

  const departments = useMemo(() => {
    const rawDepartments = activeCompany?.departments || [];

    return rawDepartments
      .map((department: any, index: number) => {
        if (typeof department === "string") {
          return {
            id: `${department}-${index}`,
            name: department,
            code: "",
          };
        }

        return {
          id: department?._id || department?.code || department?.title || `department-${index}`,
          name: department?.title || department?.name || department?.label || "Department",
          code: department?.code || "",
        };
      })
      .filter((department: any) => Boolean(department.name));
  }, [activeCompany]);

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <Box bg="white" borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow="sm">
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
            <Box>
              <Heading size="md">Departments</Heading>
              <Text mt={2} color="gray.600" maxW="3xl">
                Review the department structure for {activeCompany?.company_name || "the selected company"}.
                The header company selector controls this workspace for superadmins.
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
                Use the global company selector in the header to load departments for a company.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box bg="white" borderWidth="1px" borderRadius="2xl" p={5} boxShadow="sm">
                <Stat>
                  <StatLabel>Total Departments</StatLabel>
                  <StatNumber>{departments.length}</StatNumber>
                </Stat>
              </Box>
              <Box bg="white" borderWidth="1px" borderRadius="2xl" p={5} boxShadow="sm">
                <Stat>
                  <StatLabel>Company</StatLabel>
                  <StatNumber fontSize="xl">{activeCompany?.company_name || "Not selected"}</StatNumber>
                </Stat>
              </Box>
              <Box bg="white" borderWidth="1px" borderRadius="2xl" p={5} boxShadow="sm">
                <Stat>
                  <StatLabel>Context</StatLabel>
                  <StatNumber fontSize="xl">{isSuperadmin ? "Cross-company view" : "Restricted scope"}</StatNumber>
                </Stat>
              </Box>
            </SimpleGrid>

            <Box bg="white" borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow="sm">
              {departments.length === 0 ? (
                <Alert status="info" borderRadius="xl">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>No departments configured</AlertTitle>
                    <AlertDescription>
                      This company does not have any departments configured yet.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                  {departments.map((department: any) => (
                    <Box
                      key={department.id}
                      borderWidth="1px"
                      borderRadius="xl"
                      p={5}
                      bg="gray.50"
                      transition="all 0.2s"
                      _hover={{ borderColor: "blue.200", bg: "white" }}
                    >
                      <Stack spacing={3}>
                        <Flex justify="space-between" align="center" gap={3}>
                          <Text fontWeight="semibold" fontSize="lg">
                            {department.name}
                          </Text>
                          <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                            Department
                          </Badge>
                        </Flex>
                        <Text color="gray.600" fontSize="sm">
                          {department.code ? `Code: ${department.code}` : "Department code not configured"}
                        </Text>
                      </Stack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
});

export default DepartmentsPage;
