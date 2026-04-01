"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import stores from "@/app/store/stores";
import { courseStore } from "@/app/store/courseStore/courseStore";
import AssignCourseModal from "../components/AssignCourseModal";

function getStatusColor(status: string) {
  if (status === "expired") {
    return "red";
  }

  if (status === "expiring_soon") {
    return "orange";
  }

  return "green";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No expiry";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No expiry";
  }

  return date.toLocaleDateString();
}

const AssignedCoursesPage = observer(() => {
  const { auth, companyStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const [courseFilter, setCourseFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const companyId = companyStore.getActiveCompanyId();
  const companies = companyStore.companies.data || [];
  const activeCompany = companies.find((company: any) => company._id === companyId) || auth.user?.companyDetails || null;

  useEffect(() => {
    if (isSuperadmin) {
      companyStore.getManagedCompanies().catch(() => undefined);
    } else {
      companyStore.initializeCompanyContext();
    }
  }, [companyStore, isSuperadmin]);

  useEffect(() => {
    if (!companyId && isSuperadmin) {
      return;
    }

    courseStore.fetchAssignedCourseAccesses({
      companyId: companyId || undefined,
    }).catch(() => undefined);
  }, [companyId, isSuperadmin]);

  const rows = courseStore.assignedCourseAccesses || [];
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (courseFilter && row.courseId !== courseFilter) {
        return false;
      }

      if (departmentFilter && row.department?._id !== departmentFilter) {
        return false;
      }

      if (userFilter && row.user?._id !== userFilter) {
        return false;
      }

      return true;
    });
  }, [courseFilter, departmentFilter, rows, userFilter]);

  const courseOptions = useMemo(() => {
    const uniqueMap = new Map<string, string>();
    rows.forEach((row) => {
      if (row.courseId && row.courseName) {
        uniqueMap.set(row.courseId, row.courseName);
      }
    });
    return Array.from(uniqueMap.entries()).map(([value, label]) => ({ value, label }));
  }, [rows]);

  const departmentOptions = useMemo(() => {
    const uniqueMap = new Map<string, string>();
    rows.forEach((row) => {
      if (row.department?._id) {
        uniqueMap.set(row.department._id, row.department.title || row.department.code || "Department");
      }
    });
    return Array.from(uniqueMap.entries()).map(([value, label]) => ({ value, label }));
  }, [rows]);

  const userOptions = useMemo(() => {
    const uniqueMap = new Map<string, string>();
    rows.forEach((row) => {
      if (row.user?._id) {
        uniqueMap.set(row.user._id, row.user.name || row.user.email || row.user.username || "User");
      }
    });
    return Array.from(uniqueMap.entries()).map(([value, label]) => ({ value, label }));
  }, [rows]);

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <Box bg="white" borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow="sm">
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
            <Box>
              <Heading size="md">Assigned Courses</Heading>
              <Text mt={2} color="gray.600">
                Review company-wide, department, and user-specific course assignments for{" "}
                {activeCompany?.company_name || "the selected company"}.
              </Text>
            </Box>
            <Button colorScheme="blue" onClick={() => setIsAssignModalOpen(true)} isDisabled={!companyId && isSuperadmin}>
              Assign New Course
            </Button>
          </Flex>
        </Box>

        {!companyId && isSuperadmin ? (
          <Alert status="info" borderRadius="xl">
            <AlertIcon />
            <Box>
              <AlertTitle>Select a company</AlertTitle>
              <AlertDescription>
                Use the header company selector to load assignments for a specific company.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <>
            <Box bg="white" borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow="sm">
              <Flex gap={4} wrap="wrap">
                <FormControl maxW={{ base: "full", md: "240px" }}>
                  <FormLabel>Course</FormLabel>
                  <Select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
                    <option value="">All courses</option>
                    {courseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl maxW={{ base: "full", md: "220px" }}>
                  <FormLabel>Department</FormLabel>
                  <Select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                    <option value="">All departments</option>
                    {departmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl maxW={{ base: "full", md: "240px" }}>
                  <FormLabel>User</FormLabel>
                  <Select value={userFilter} onChange={(event) => setUserFilter(event.target.value)}>
                    <option value="">All users</option>
                    {userOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Flex>
            </Box>

            <Box bg="white" borderWidth="1px" borderRadius="2xl" p={{ base: 4, md: 5 }} boxShadow="sm" overflowX="auto">
              {courseStore.isAssignedCoursesLoading ? (
                <HStack justify="center" py={16}>
                  <Spinner />
                  <Text color="gray.600">Loading assigned courses...</Text>
                </HStack>
              ) : filteredRows.length === 0 ? (
                <Alert status="info" borderRadius="xl">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>No assignments found</AlertTitle>
                    <AlertDescription>
                      Try a different filter or create a new assignment for this company.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Course Name</Th>
                      <Th>Assigned To</Th>
                      <Th>Assignment Type</Th>
                      <Th>Valid Till</Th>
                      <Th>Status</Th>
                      <Th>Assigned By</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRows.map((row) => (
                      <Tr key={row._id}>
                        <Td fontWeight="semibold">{row.courseName}</Td>
                        <Td>
                          <Stack spacing={1}>
                            <Text>{row.assignedTo}</Text>
                            {row.department?.title ? (
                              <Text fontSize="sm" color="gray.500">
                                {row.department.title}
                              </Text>
                            ) : null}
                          </Stack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              row.assignmentType === "company"
                                ? "purple"
                                : row.assignmentType === "department"
                                  ? "blue"
                                  : "orange"
                            }
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            {row.assignmentType === "company"
                              ? "Company-wide"
                              : row.assignmentType === "department"
                                ? "Department"
                                : "User-specific"}
                          </Badge>
                        </Td>
                        <Td>{formatDate(row.validTill)}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(row.status)} borderRadius="full" px={3} py={1}>
                            {row.status === "expiring_soon" ? "Expiring soon" : row.status}
                          </Badge>
                        </Td>
                        <Td>{row.assignedBy?.name || row.assignedBy?.email || row.assignedBy?.username || "System"}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </>
        )}
      </Stack>

      <AssignCourseModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        fixedCompanyId={companyId}
        onAssigned={async () => {
          if (!companyId && isSuperadmin) {
            return;
          }

          await courseStore.fetchAssignedCourseAccesses({
            companyId: companyId || undefined,
          });
        }}
      />
    </Box>
  );
});

export default AssignedCoursesPage;
