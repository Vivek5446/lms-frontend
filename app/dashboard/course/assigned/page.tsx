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
  Input,
  Select,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
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
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const surfaceBg = useColorModeValue("gray.50", "gray.700");
  const [courseFilter, setCourseFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [defaultCourseId, setDefaultCourseId] = useState("");

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
    courseStore.fetchCourses().catch(() => undefined);
    courseStore.fetchAccessibleCourses().catch(() => undefined);
  }, []);

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

  const companyAssignedCourseIds = useMemo(
    () =>
      new Set(
        rows
          .filter((row) => row.assignmentType === "company" && row.status !== "expired")
          .map((row) => row.courseId)
          .filter(Boolean)
      ),
    [rows]
  );

  const accessibleCourseMap = useMemo(
    () => new Map((courseStore.accessibleCourses || []).map((course) => [course._id, course])),
    [courseStore.accessibleCourses]
  );

  const filteredLibraryCourses = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    return (courseStore.courses || []).filter((course) => {
      const matchesQuery =
        !query ||
        `${course.title} ${course.status} ${course.curriculum?.totalModules || ""}`.toLowerCase().includes(query);
      return matchesQuery;
    });
  }, [courseStore.courses, librarySearch]);

  const openAssignModal = (courseId = "") => {
    setDefaultCourseId(courseId);
    setIsAssignModalOpen(true);
  };

  return (
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <Box bg={cardBg} borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow="sm">
          <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} wrap="wrap">
            <Box>
              <Heading size="md">Assigned Courses</Heading>
              <Text mt={2} color={textColor}>
                Review what is already assigned to {activeCompany?.company_name || "the selected company"} and assign new courses from the full library without leaving this workspace.
              </Text>
            </Box>
            <Button colorScheme="blue" onClick={() => openAssignModal()} isDisabled={!companyId && isSuperadmin}>
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
          <Tabs colorScheme="blue" variant="soft-rounded">
            <TabList>
              <Tab>Assigned</Tab>
              <Tab>All Courses</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0} pt={6}>
                <Stack spacing={6}>
                  <Box bg={cardBg} borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow="sm">
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

                  <Box bg={cardBg} borderWidth="1px" borderRadius="2xl" p={{ base: 4, md: 5 }} boxShadow="sm" overflowX="auto">
                    {courseStore.isAssignedCoursesLoading ? (
                      <HStack justify="center" py={16}>
                        <Spinner />
                        <Text color={textColor}>Loading assigned courses...</Text>
                      </HStack>
                    ) : filteredRows.length === 0 ? (
                      <Alert status="info" borderRadius="xl">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>No assignments found</AlertTitle>
                          <AlertDescription>
                            Try a different filter or assign a new course for this company.
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
                </Stack>
              </TabPanel>

              <TabPanel px={0} pt={6}>
                <Stack spacing={6}>
                  <Box bg={cardBg} borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow="sm">
                    <FormControl maxW={{ base: "full", md: "360px" }}>
                      <FormLabel>Search course library</FormLabel>
                      <Input
                        value={librarySearch}
                        onChange={(event) => setLibrarySearch(event.target.value)}
                        placeholder="Search by course title or status"
                      />
                    </FormControl>
                  </Box>

                  <Box bg={cardBg} borderWidth="1px" borderRadius="2xl" p={{ base: 4, md: 5 }} boxShadow="sm" overflowX="auto">
                    {courseStore.isLoading || courseStore.isAccessLoading ? (
                      <HStack justify="center" py={16}>
                        <Spinner />
                        <Text color={textColor}>Loading course library...</Text>
                      </HStack>
                    ) : filteredLibraryCourses.length === 0 ? (
                      <Alert status="info" borderRadius="xl">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>No courses found</AlertTitle>
                          <AlertDescription>
                            Try a different search to browse the full library.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    ) : (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Course</Th>
                            <Th>Status</Th>
                            <Th>Company Access</Th>
                            <Th>Assignment Rights</Th>
                            <Th textAlign="right">Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredLibraryCourses.map((course) => {
                            const accessibleCourse = accessibleCourseMap.get(course._id);
                            const canAssignBase = isSuperadmin ? Boolean(companyId) : Boolean(accessibleCourse?.access?.canAssign);
                            const canAssign = canAssignBase && course.status === "published";
                            const isAssignedToCompany = companyAssignedCourseIds.has(course._id);

                            return (
                              <Tr key={course._id}>
                                <Td>
                                  <Stack spacing={1}>
                                    <Text fontWeight="semibold">{course.title}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                      {course.curriculum?.totalModules || 0} modules
                                    </Text>
                                  </Stack>
                                </Td>
                                <Td>
                                  <Badge colorScheme={course.status === "published" ? "green" : "gray"} borderRadius="full" px={3} py={1}>
                                    {course.status}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge colorScheme={isAssignedToCompany ? "purple" : "gray"} borderRadius="full" px={3} py={1}>
                                    {isAssignedToCompany ? "Assigned to company" : "Not assigned"}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge colorScheme={canAssign ? "blue" : "gray"} borderRadius="full" px={3} py={1}>
                                    {canAssign ? "Can assign" : "No assign access"}
                                  </Badge>
                                </Td>
                                <Td textAlign="right">
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => openAssignModal(course._id)}
                                    isDisabled={!canAssign}
                                  >
                                    Assign course
                                  </Button>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    )}
                  </Box>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Stack>

      <AssignCourseModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setDefaultCourseId("");
        }}
        defaultCourseId={defaultCourseId}
        fixedCompanyId={companyId}
        onAssigned={async () => {
          if (!companyId && isSuperadmin) {
            return;
          }

          await Promise.all([
            courseStore.fetchAssignedCourseAccesses({
              companyId: companyId || undefined,
            }),
            courseStore.fetchAccessibleCourses(),
          ]);
        }}
      />
    </Box>
  );
});

export default AssignedCoursesPage;
