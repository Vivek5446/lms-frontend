"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Step,
  StepDescription,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import stores from "@/app/store/stores";
import { courseStore } from "@/app/store/courseStore/courseStore";
import CourseMultiSelectInput from "@/app/dashboard/course/components/CourseMultiSelectInput";

const STEPS = [
  { title: "Courses", description: "Select multiple courses" },
  { title: "Target", description: "Choose company, department, or users" },
  { title: "Duration", description: "Set the access window" },
  { title: "Review", description: "Confirm the assignment" },
];

type TargetMode = "users" | "department" | "company";

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

const CourseAssignmentWorkspace = observer(() => {
  const toast = useToast();
  const { auth } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isDepartmentHead = role === "departmenthead";
  const departments =
    isDepartmentHead
      ? [auth.user?.department].filter(Boolean)
      : auth.user?.companyDetails?.departments || [];

  const [step, setStep] = useState(0);
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [targetMode, setTargetMode] = useState<TargetMode>(isDepartmentHead ? "department" : "users");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [departmentName, setDepartmentName] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [noExpiry, setNoExpiry] = useState(true);
  const [validTill, setValidTill] = useState("");
  const [lastResult, setLastResult] = useState<{
    successCount: number;
    failedEntries: any[];
    courseCount?: number;
    hierarchyAccessCreatedCount?: number;
  } | null>(null);

  const assignableCourses = useMemo(
    () => (courseStore.accessibleCourses || []).filter((course) => course.access?.canAssign),
    [courseStore.accessibleCourses]
  );

  const selectedCourses = useMemo(
    () => assignableCourses.filter((course) => selectedCourseIds.includes(course._id)),
    [assignableCourses, selectedCourseIds]
  );

  useEffect(() => {
    courseStore.fetchAccessibleCourses().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (isDepartmentHead && auth.user?.department) {
      setDepartmentName(auth.user.department);
    }
  }, [auth.user?.department, isDepartmentHead]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!userSearch.trim() || targetMode !== "users") {
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
  }, [auth, targetMode, userSearch]);

  const canContinue = useMemo(() => {
    if (step === 0) {
      return selectedCourseIds.length > 0;
    }

    if (step === 1) {
      if (targetMode === "users") {
        return selectedUsers.length > 0 || Boolean(csvFile);
      }

      if (targetMode === "department") {
        return Boolean(departmentName);
      }

      return !isDepartmentHead;
    }

    if (step === 2) {
      return noExpiry || Boolean(validTill);
    }

    return true;
  }, [csvFile, departmentName, isDepartmentHead, noExpiry, selectedCourseIds.length, selectedUsers.length, step, targetMode, validTill]);

  const toggleSelectedUser = (user: any) => {
    setSelectedUsers((current) => {
      const exists = current.some((item) => item._id === user._id);
      if (exists) {
        return current.filter((item) => item._id !== user._id);
      }

      return [...current, user];
    });
  };

  const resetForm = () => {
    setStep(0);
    setCourseSearch("");
    setSelectedCourseIds([]);
    setTargetMode(isDepartmentHead ? "department" : "users");
    setUserSearch("");
    setUserResults([]);
    setSelectedUsers([]);
    setDepartmentName(isDepartmentHead ? auth.user?.department || "" : "");
    setCsvFile(null);
    setNoExpiry(true);
    setValidTill("");
  };

  const handleSubmit = async () => {
    try {
      const assignmentType = targetMode === "users" && csvFile ? "csv" : targetMode;
      const response = await courseStore.assignMultipleCourses({
        courseIds: selectedCourseIds,
        assignmentType,
        userIds: targetMode === "users" ? selectedUsers.map((user) => user._id) : undefined,
        departmentName: targetMode === "department" ? departmentName : undefined,
        companyId: targetMode === "company" ? auth.company : undefined,
        validFrom: new Date().toISOString(),
        validTill: noExpiry ? null : new Date(validTill).toISOString(),
        dueDate: noExpiry ? null : new Date(validTill).toISOString(),
        file: targetMode === "users" ? csvFile : null,
      });

      setLastResult(response?.data || null);
      toast({
        title: "Assignments processed",
        description: `${response?.data?.successCount || 0} course enrollments were created or updated.`,
        status: "success",
        duration: 4000,
      });
      resetForm();
    } catch (err: any) {
      toast({
        title: "Unable to assign courses",
        description: err?.message || err?.error || "Please try again.",
        status: "error",
        duration: 4500,
      });
    }
  };

  if (!["admin", "departmenthead"].includes(role)) {
    return (
      <Alert status="warning" borderRadius="2xl">
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
      <Box
        borderRadius="3xl"
        px={{ base: 5, md: 7 }}
        py={{ base: 6, md: 7 }}
        bg="linear-gradient(135deg, #ffffff 0%, #eff6ff 45%, #f8fafc 100%)"
        borderWidth="1px"
        borderColor="blue.100"
        boxShadow="sm"
      >
        <Heading size="md">Multi-Course Assignment</Heading>
        <Text mt={2} color="gray.600" maxW="3xl">
          Assign multiple courses in one flow. The backend now auto-maintains the company-level hierarchy before department or user delivery, so downstream assignment stays consistent without extra manual steps.
        </Text>
      </Box>

      {courseStore.isAccessLoading ? (
        <HStack justify="center" py={20}>
          <Spinner />
          <Text color="gray.600">Loading assignable courses...</Text>
        </HStack>
      ) : assignableCourses.length === 0 ? (
        <Alert status="info" borderRadius="2xl">
          <AlertIcon />
          <Box>
            <AlertTitle>No assignable courses</AlertTitle>
            <AlertDescription>
              You can only assign courses that were granted by a superadmin and allow further assignment.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <Box bg="white" borderRadius="3xl" borderWidth="1px" p={{ base: 5, md: 6 }} boxShadow="sm">
          <Stepper index={step} size="sm" mb={8}>
            {STEPS.map((item) => (
              <Step key={item.title}>
                <StepIndicator>
                  <StepStatus complete={<StepNumber />} incomplete={<StepNumber />} active={<StepNumber />} />
                </StepIndicator>
                <Box flexShrink="0">
                  <StepTitle>{item.title}</StepTitle>
                  <StepDescription>{item.description}</StepDescription>
                </Box>
                <StepSeparator />
              </Step>
            ))}
          </Stepper>

          {step === 0 ? (
            <CourseMultiSelectInput
              courses={assignableCourses}
              selectedCourseIds={selectedCourseIds}
              onSelectionChange={setSelectedCourseIds}
              searchValue={courseSearch}
              onSearchChange={setCourseSearch}
              label="Select courses"
              helperText="Search, multi-select, and review the chosen courses as chips before moving on."
              emptyStateText="No assignable courses match that search."
            />
          ) : null}

          {step === 1 ? (
            <Stack spacing={5}>
              <FormControl>
                <FormLabel>Assign to</FormLabel>
                <RadioGroup value={targetMode} onChange={(value) => setTargetMode(value as TargetMode)}>
                  <HStack spacing={5} flexWrap="wrap">
                    <Radio value="users">Users</Radio>
                    <Radio value="department">Department</Radio>
                    {!isDepartmentHead ? <Radio value="company">Company</Radio> : null}
                  </HStack>
                </RadioGroup>
              </FormControl>

              {targetMode === "users" ? (
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Search users</FormLabel>
                    <Input
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                      placeholder="Search by name, email, code, or department"
                    />
                  </FormControl>

                  <Wrap spacing={2}>
                    {selectedUsers.length ? (
                      selectedUsers.map((user) => (
                        <WrapItem key={user._id}>
                          <Tag size="lg" borderRadius="full" colorScheme="blue">
                            <TagLabel>{user.name || user.email}</TagLabel>
                            <TagCloseButton onClick={() => toggleSelectedUser(user)} />
                          </Tag>
                        </WrapItem>
                      ))
                    ) : (
                      <Text color="gray.500" fontSize="sm">
                        Selected users will appear here as chips.
                      </Text>
                    )}
                  </Wrap>

                  <Box borderWidth="1px" borderRadius="2xl" p={3} minH="220px">
                    {userResults.length === 0 ? (
                      <Text color="gray.500" fontSize="sm">
                        Search for users and select one or more learners, or use a CSV upload below.
                      </Text>
                    ) : (
                      <Stack spacing={3}>
                        {userResults.map((row: any) => {
                          const user = row.user || row;
                          const isSelected = selectedUsers.some((item) => item._id === user._id);

                          return (
                            <Box
                              key={user._id}
                              borderWidth="1px"
                              borderRadius="2xl"
                              borderColor={isSelected ? "blue.300" : "gray.200"}
                              bg={isSelected ? "blue.50" : "white"}
                              p={4}
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
                                <Badge colorScheme={isSelected ? "blue" : "gray"} borderRadius="full" px={3} py={1}>
                                  {user.department || "No department"}
                                </Badge>
                              </HStack>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>

                  <FormControl>
                    <FormLabel>CSV upload</FormLabel>
                    <Input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
                      p={1.5}
                    />
                  </FormControl>

                  <Text color="gray.600" fontSize="sm">
                    Upload a CSV with an <strong>email</strong> column to assign by email. Existing users only will be processed.
                  </Text>
                </Stack>
              ) : null}

              {targetMode === "department" ? (
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
              ) : null}

              {targetMode === "company" ? (
                <Alert status="info" borderRadius="2xl">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Company-wide assignment</AlertTitle>
                    <AlertDescription>
                      A company-level access record will be created if needed, then all learners in your company will receive the selected courses.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : null}
            </Stack>
          ) : null}

          {step === 2 ? (
            <Stack spacing={4}>
              <Box borderWidth="1px" borderRadius="2xl" p={4}>
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="semibold">No expiry</Text>
                    <Text color="gray.600" fontSize="sm">
                      Keep these assignments active until they are removed or replaced.
                    </Text>
                  </Box>
                  <Switch isChecked={noExpiry} onChange={(event) => setNoExpiry(event.target.checked)} />
                </HStack>
              </Box>

              {!noExpiry ? (
                <FormControl isRequired>
                  <FormLabel>Valid till</FormLabel>
                  <Input type="date" value={validTill} onChange={(event) => setValidTill(event.target.value)} />
                </FormControl>
              ) : null}
            </Stack>
          ) : null}

          {step === 3 ? (
            <Stack spacing={4}>
              <Box borderWidth="1px" borderRadius="3xl" p={5}>
                <Text fontWeight="semibold" fontSize="lg">
                  Assignment summary
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Courses
                    </Text>
                    <Text fontWeight="medium">{selectedCourses.length} selected</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Target
                    </Text>
                    <Text fontWeight="medium">
                      {targetMode === "company"
                        ? "Company-wide"
                        : targetMode === "department"
                          ? departmentName || "Not selected"
                          : csvFile
                            ? `CSV upload: ${csvFile.name}`
                            : `${selectedUsers.length} selected user${selectedUsers.length === 1 ? "" : "s"}`}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Duration
                    </Text>
                    <Text fontWeight="medium">{noExpiry ? "No expiry" : formatDate(validTill)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Hierarchy handling
                    </Text>
                    <Text fontWeight="medium">
                      {targetMode === "company"
                        ? "Creates company-level access before delivery"
                        : targetMode === "department"
                          ? "Auto-creates company access, then department access"
                          : "Auto-creates company access, then direct user enrollment"}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Wrap spacing={2} mt={5}>
                  {selectedCourses.map((course) => (
                    <WrapItem key={course._id}>
                      <Tag borderRadius="full" colorScheme="blue" variant="subtle">
                        <TagLabel>{course.title}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            </Stack>
          ) : null}

          <HStack justify="space-between" mt={8}>
            <Button variant="outline" onClick={() => (step === 0 ? resetForm() : setStep((current) => current - 1))}>
              {step === 0 ? "Reset" : "Back"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button colorScheme="blue" onClick={() => setStep((current) => current + 1)} isDisabled={!canContinue}>
                Continue
              </Button>
            ) : (
              <Button colorScheme="blue" onClick={handleSubmit} isLoading={courseStore.isAssignmentSubmitting}>
                Confirm assignment
              </Button>
            )}
          </HStack>
        </Box>
      )}

      {lastResult ? (
        <Box bg="white" borderRadius="3xl" borderWidth="1px" p={{ base: 5, md: 6 }} boxShadow="sm">
          <Text fontWeight="semibold">Latest assignment result</Text>
          <Text mt={2} color="gray.700">
            {lastResult.successCount} course enrollments were created or updated across{" "}
            {lastResult.courseCount || 0} course{(lastResult.courseCount || 0) === 1 ? "" : "s"}.
          </Text>
          {typeof lastResult.hierarchyAccessCreatedCount === "number" ? (
            <Text mt={2} color="gray.600" fontSize="sm">
              {lastResult.hierarchyAccessCreatedCount} hierarchy access record{lastResult.hierarchyAccessCreatedCount === 1 ? "" : "s"} were auto-created to keep the company-first assignment model intact.
            </Text>
          ) : null}
          {lastResult.failedEntries?.length ? (
            <Stack spacing={2} mt={4}>
              {lastResult.failedEntries.slice(0, 8).map((entry, index) => (
                <Text key={`${entry.userId || entry.email || entry.rowNumber}-${index}`} fontSize="sm" color="orange.700">
                  {entry.email || entry.reference || entry.userId || `Row ${entry.rowNumber}`}: {entry.reason}
                </Text>
              ))}
            </Stack>
          ) : null}
        </Box>
      ) : null}
    </Stack>
  );
});

export default CourseAssignmentWorkspace;
