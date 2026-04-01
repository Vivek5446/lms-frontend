"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import stores from "@/app/store/stores";
import { courseStore } from "@/app/store/courseStore/courseStore";

function formatPerson(person: any) {
  return person?.name || person?.email || person?.username || "Super Admin";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return date.toLocaleDateString();
}

const CourseAssignmentWorkspace = observer(() => {
  const toast = useToast();
  const { auth } = stores;
  const [activeCourseId, setActiveCourseId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [departmentName, setDepartmentName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [lastResult, setLastResult] = useState<{ successCount: number; failedEntries: any[] } | null>(null);

  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isDepartmentHead = role === "departmenthead";
  const departments =
    isDepartmentHead
      ? [auth.user?.department].filter(Boolean)
      : auth.user?.companyDetails?.departments || [];

  const courses = useMemo(
    () => (courseStore.accessibleCourses || []).filter((course) => course.access?.canAssign),
    [courseStore.accessibleCourses]
  );
  const activeCourse = courses.find((course) => course._id === activeCourseId) || courses[0] || null;

  useEffect(() => {
    courseStore.fetchAccessibleCourses().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!activeCourseId && courses.length) {
      setActiveCourseId(courses[0]._id);
    }
  }, [activeCourseId, courses]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!userSearch.trim()) {
        setUserResults([]);
        return;
      }

      try {
        const response = await auth.getCompanyUsers({
          searchValue: userSearch.trim(),
        });
        setUserResults(response || []);
      } catch (error) {
        setUserResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [auth, userSearch]);

  useEffect(() => {
    if (isDepartmentHead && auth.user?.department) {
      setDepartmentName(auth.user.department);
    }
  }, [auth.user?.department, isDepartmentHead]);

  const toggleSelectedUser = (user: any) => {
    setSelectedUsers((current) => {
      const exists = current.some((item) => item._id === user._id);
      if (exists) {
        return current.filter((item) => item._id !== user._id);
      }

      return [...current, user];
    });
  };

  const resetSubmissionState = () => {
    setSelectedUsers([]);
    setUserSearch("");
    setUserResults([]);
    setCsvFile(null);
  };

  const handleUsersAssign = async () => {
    if (!activeCourse || !selectedUsers.length) {
      return;
    }

    try {
      const response = await courseStore.assignCourse({
        courseId: activeCourse._id,
        assignmentType: "users",
        userIds: selectedUsers.map((user) => user._id),
        dueDate: dueDate || null,
      });

      setLastResult(response?.data || null);
      toast({
        title: "Assignments processed",
        description: `${response?.data?.successCount || 0} users were newly enrolled.`,
        status: "success",
        duration: 4000,
      });
      resetSubmissionState();
    } catch (err: any) {
      toast({
        title: "Unable to assign course",
        description: err?.message || err?.error || "Please try again.",
        status: "error",
        duration: 4500,
      });
    }
  };

  const handleDepartmentAssign = async () => {
    if (!activeCourse || !departmentName) {
      return;
    }

    try {
      const response = await courseStore.assignCourse({
        courseId: activeCourse._id,
        assignmentType: "department",
        departmentName,
        dueDate: dueDate || null,
      });

      setLastResult(response?.data || null);
      toast({
        title: "Department assignment processed",
        description: `${response?.data?.successCount || 0} users were newly enrolled.`,
        status: "success",
        duration: 4000,
      });
    } catch (err: any) {
      toast({
        title: "Unable to assign department",
        description: err?.message || err?.error || "Please try again.",
        status: "error",
        duration: 4500,
      });
    }
  };

  const handleCsvAssign = async () => {
    if (!activeCourse || !csvFile) {
      return;
    }

    try {
      const response = await courseStore.assignCourseByCsv({
        courseId: activeCourse._id,
        file: csvFile,
        dueDate: dueDate || null,
      });

      setLastResult(response?.data || null);
      toast({
        title: "CSV assignment processed",
        description: `${response?.data?.successCount || 0} users were newly enrolled.`,
        status: "success",
        duration: 4000,
      });
    } catch (err: any) {
      toast({
        title: "Unable to process CSV",
        description: err?.message || err?.error || "Please try again.",
        status: "error",
        duration: 4500,
      });
    }
  };

  if (!["admin", "departmenthead"].includes(role)) {
    return (
      <Alert status="warning" borderRadius="xl">
        <AlertIcon />
        <Box>
          <AlertTitle>Assignment workspace unavailable</AlertTitle>
          <AlertDescription>
            Only admins and department heads can enroll learners into accessible courses.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Stack spacing={6}>
      <Box bg="white" borderRadius="2xl" borderWidth="1px" p={{ base: 5, md: 6 }} boxShadow="sm">
        <Heading size="md">Assign Accessible Courses</Heading>
        <Text mt={2} color="gray.600">
          Work only with courses already granted by a superadmin, then enroll users in the allowed scope.
        </Text>
      </Box>

      {courseStore.isAccessLoading ? (
        <HStack justify="center" py={20}>
          <Spinner />
          <Text color="gray.600">Loading accessible courses...</Text>
        </HStack>
      ) : courses.length === 0 ? (
        <Alert status="info" borderRadius="xl">
          <AlertIcon />
          <Box>
            <AlertTitle>No assignable courses</AlertTitle>
            <AlertDescription>
              You can view granted courses, but none of them currently allow further assignment.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6} alignItems="start">
          <VStack align="stretch" spacing={4}>
            {courses.map((course) => {
              const isActive = course._id === activeCourse?._id;
              return (
                <Box
                  key={course._id}
                  borderWidth="1px"
                  borderColor={isActive ? "blue.300" : "gray.200"}
                  bg={isActive ? "blue.50" : "white"}
                  borderRadius="2xl"
                  p={5}
                  cursor="pointer"
                  onClick={() => setActiveCourseId(course._id)}
                >
                  <HStack justify="space-between" align="start" spacing={4}>
                    <Box>
                      <Text fontWeight="semibold" fontSize="lg">
                        {course.title}
                      </Text>
                      <Text mt={1} color="gray.600" fontSize="sm">
                        {course.description?.text || "No description available."}
                      </Text>
                    </Box>
                    <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                      {course.status}
                    </Badge>
                  </HStack>

                  <HStack mt={4} spacing={2} flexWrap="wrap">
                    {course.access.matchedScopes.map((scope) => (
                      <Badge key={scope._id} colorScheme="purple" variant="subtle" borderRadius="full" px={3} py={1}>
                        {scope.label}
                      </Badge>
                    ))}
                  </HStack>

                  <Text mt={3} color="gray.600" fontSize="sm">
                    {course.access.matchedScopes
                      .map((scope) => `Assigned by Super Admin: ${formatPerson(scope.grantedBy)}`)
                      .join(" • ")}
                  </Text>
                </Box>
              );
            })}
          </VStack>

          {activeCourse ? (
            <Box bg="white" borderRadius="2xl" borderWidth="1px" p={{ base: 5, md: 6 }} boxShadow="sm">
              <Heading size="md">{activeCourse.title}</Heading>
              <HStack mt={3} spacing={2} flexWrap="wrap">
                {activeCourse.access.matchedScopes.map((scope) => (
                  <Badge key={scope._id} colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1}>
                    {scope.label}
                  </Badge>
                ))}
              </HStack>

              <FormControl mt={5}>
                <FormLabel>Due date</FormLabel>
                <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
              </FormControl>

              <Tabs mt={6} variant="soft-rounded" colorScheme="blue">
                <TabList>
                  <Tab>Assign users</Tab>
                  <Tab>Assign department</Tab>
                  <Tab>CSV upload</Tab>
                </TabList>

                <TabPanels mt={4}>
                  <TabPanel px={0}>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Search users</FormLabel>
                        <Input
                          value={userSearch}
                          onChange={(event) => setUserSearch(event.target.value)}
                          placeholder="Search by name, email, code, or department"
                        />
                      </FormControl>

                      <Box borderWidth="1px" borderRadius="xl" p={3} minH="240px">
                        {userResults.length === 0 ? (
                          <Text color="gray.500" fontSize="sm">
                            Search for users in your scope, then select one or more learners.
                          </Text>
                        ) : (
                          <VStack align="stretch" spacing={3}>
                            {userResults.map((row: any) => {
                              const user = row.user || row;
                              const isSelected = selectedUsers.some((item) => item._id === user._id);

                              return (
                                <Box
                                  key={user._id}
                                  borderWidth="1px"
                                  borderRadius="lg"
                                  borderColor={isSelected ? "blue.300" : "gray.200"}
                                  bg={isSelected ? "blue.50" : "white"}
                                  p={3}
                                  cursor="pointer"
                                  onClick={() => toggleSelectedUser(user)}
                                >
                                  <HStack justify="space-between" align="start">
                                    <Box>
                                      <Text fontWeight="semibold">{user.name || user.email}</Text>
                                      <Text color="gray.600" fontSize="sm">
                                        {user.email || user.username}
                                      </Text>
                                    </Box>
                                    <Badge colorScheme={isSelected ? "blue" : "gray"}>
                                      {user.department || "No department"}
                                    </Badge>
                                  </HStack>
                                </Box>
                              );
                            })}
                          </VStack>
                        )}
                      </Box>

                      <Box borderWidth="1px" borderRadius="xl" p={4}>
                        <Text fontWeight="semibold">Assignment summary</Text>
                        <Text mt={2} color="gray.600" fontSize="sm">
                          {selectedUsers.length} user{selectedUsers.length === 1 ? "" : "s"} selected. Due date:{" "}
                          {formatDate(dueDate)}.
                        </Text>
                      </Box>

                      <Button colorScheme="blue" onClick={handleUsersAssign} isLoading={courseStore.isAssignmentSubmitting}>
                        Confirm user assignment
                      </Button>
                    </Stack>
                  </TabPanel>

                  <TabPanel px={0}>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Department</FormLabel>
                        <Select
                          value={departmentName}
                          onChange={(event) => setDepartmentName(event.target.value)}
                          isDisabled={isDepartmentHead}
                        >
                          <option value="">Select department</option>
                          {departments.map((department: string) => (
                            <option key={department} value={department}>
                              {department}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <Box borderWidth="1px" borderRadius="xl" p={4}>
                        <Text fontWeight="semibold">Assignment summary</Text>
                        <Text mt={2} color="gray.600" fontSize="sm">
                          Department: {departmentName || "Not selected"}. Due date: {formatDate(dueDate)}.
                        </Text>
                      </Box>

                      <Button colorScheme="blue" onClick={handleDepartmentAssign} isLoading={courseStore.isAssignmentSubmitting}>
                        Confirm department assignment
                      </Button>
                    </Stack>
                  </TabPanel>

                  <TabPanel px={0}>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>CSV file</FormLabel>
                        <Input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
                          p={1.5}
                        />
                      </FormControl>

                      <Text color="gray.600" fontSize="sm">
                        Include at least one of these columns: <strong>userId</strong>, <strong>email</strong>, or{" "}
                        <strong>code</strong>.
                      </Text>

                      <Box borderWidth="1px" borderRadius="xl" p={4}>
                        <Text fontWeight="semibold">Assignment summary</Text>
                        <Text mt={2} color="gray.600" fontSize="sm">
                          File: {csvFile?.name || "No file selected"}. Due date: {formatDate(dueDate)}.
                        </Text>
                      </Box>

                      <Button colorScheme="blue" onClick={handleCsvAssign} isLoading={courseStore.isAssignmentSubmitting}>
                        Process CSV assignment
                      </Button>
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {lastResult ? (
                <>
                  <Divider my={6} />
                  <Box borderWidth="1px" borderRadius="xl" p={4} bg="gray.50">
                    <Text fontWeight="semibold">Latest result</Text>
                    <Text mt={2} color="gray.700">
                      {lastResult.successCount} successful assignment{lastResult.successCount === 1 ? "" : "s"}.
                    </Text>
                    {lastResult.failedEntries?.length ? (
                      <VStack align="stretch" spacing={2} mt={3}>
                        {lastResult.failedEntries.slice(0, 6).map((entry, index) => (
                          <Text key={`${entry.userId || entry.email || entry.rowNumber}-${index}`} fontSize="sm" color="orange.700">
                            {entry.email || entry.reference || entry.userId || `Row ${entry.rowNumber}`}: {entry.reason}
                          </Text>
                        ))}
                      </VStack>
                    ) : null}
                  </Box>
                </>
              ) : null}
            </Box>
          ) : null}
        </SimpleGrid>
      )}
    </Stack>
  );
});

export default CourseAssignmentWorkspace;
