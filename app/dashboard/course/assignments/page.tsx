"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
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
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import stores from "@/app/store/stores";
import { courseStore } from "@/app/store/courseStore/courseStore";
import PermissionGate from "@/app/component/common/PermissionGate";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";

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

function getStatusColor(status: string) {
  if (status === "expired") {
    return "red";
  }

  if (status === "expiring_soon") {
    return "orange";
  }

  return "green";
}

const CourseAssignmentsAuditPage = observer(() => {
  const { auth, companyStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const canViewCourses = hasPermission(auth.user, PERMISSION_KEYS.VIEW_COURSES);
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const surfaceBg = useColorModeValue("gray.50", "gray.700");
  const companyId = isSuperadmin ? companyStore.getActiveCompanyId() : auth.company;
  const [courseFilter, setCourseFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  useEffect(() => {
    if (isSuperadmin) {
      companyStore.getManagedCompanies().catch(() => undefined);
    }
  }, [companyStore, isSuperadmin]);

  useEffect(() => {
    if (!companyId && isSuperadmin) {
      return;
    }

    courseStore.fetchCourseAssignmentAudit({
      companyId: companyId || undefined,
      courseId: courseFilter || undefined,
      userId: userFilter || undefined,
    }).catch(() => undefined);
  }, [companyId, courseFilter, isSuperadmin, userFilter]);

  const rows = courseStore.courseAssignmentAudit || [];
  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row) => {
      if (row.course?._id && row.course?.title) {
        map.set(row.course._id, row.course.title);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [rows]);

  const userOptions = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row) => {
      if (row.user?._id) {
        map.set(row.user._id, row.user.name || row.user.email || row.user.username || "User");
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [rows]);

  return (
    <PermissionGate
      allowed={canViewCourses}
      title="Assignments audit is disabled"
      description="This account does not currently have access to course assignment records."
      fallbackHref="/dashboard/profile"
    >
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <Box bg={cardBg} borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow="sm">
          <Heading size="md">Assignment Audit</Heading>
          <Text mt={2} color={textColor}>
            Trace direct and batch-based course assignments for the active company context.
          </Text>
        </Box>

        {!companyId && isSuperadmin ? (
          <Alert status="info" borderRadius="xl">
            <AlertIcon />
            <Box>
              <AlertTitle>Select a company</AlertTitle>
              <AlertDescription>
                Use the header company selector to load assignment activity for a company.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <>
            <Box bg={cardBg} borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow="sm">
              <HStack gap={4} align="end" flexWrap="wrap">
                <FormControl maxW={{ base: "full", md: "260px" }}>
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
                <FormControl maxW={{ base: "full", md: "260px" }}>
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
              </HStack>
            </Box>

            <Box bg={cardBg} borderWidth="1px" borderRadius="2xl" p={{ base: 4, md: 5 }} boxShadow="sm" overflowX="auto">
              {courseStore.isCourseAssignmentAuditLoading ? (
                <HStack justify="center" py={16}>
                  <Spinner />
                  <Text color={textColor}>Loading assignment audit...</Text>
                </HStack>
              ) : rows.length === 0 ? (
                <Alert status="info" borderRadius="xl">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>No assignment records found</AlertTitle>
                    <AlertDescription>
                      Adjust the filters or assign courses to start building the audit trail.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>User</Th>
                      <Th>Course</Th>
                      <Th>Source</Th>
                      <Th>Valid Till</Th>
                      <Th>Status</Th>
                      <Th>Assigned By</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.map((row) => (
                      <Tr key={row._id}>
                        <Td>
                          <Stack spacing={1}>
                            <Text fontWeight="semibold">{row.user?.name || row.user?.email || row.user?.username || "User"}</Text>
                            <Text color="gray.500" fontSize="sm">{row.user?.department || "No department"}</Text>
                          </Stack>
                        </Td>
                        <Td fontWeight="semibold">{row.course?.title || "Course"}</Td>
                        <Td>
                          <Badge colorScheme={row.source === "batch" ? "purple" : "green"} borderRadius="full" px={3} py={1}>
                            {row.source === "batch" ? `From Batch${row.batchName ? `: ${row.batchName}` : ""}` : "Direct Assignment"}
                          </Badge>
                        </Td>
                        <Td>{formatDate(row.validTill)}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(row.status)} borderRadius="full" px={3} py={1}>
                            {row.status === "expiring_soon" ? "Expiring soon" : row.isExpired ? "Expired" : "Active"}
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
    </Box>
    </PermissionGate>
  );
});

export default CourseAssignmentsAuditPage;
