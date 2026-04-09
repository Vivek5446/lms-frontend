"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Stack,
  Step,
  StepDescription,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
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
import { FiUploadCloud, FiUsers } from "react-icons/fi";
import stores from "@/app/store/stores";
import { batchStore, type BatchDetailsItem } from "@/app/store/batchStore/batchStore";
import { courseStore } from "@/app/store/courseStore/courseStore";
import CourseMultiSelectInput from "@/app/dashboard/course/components/CourseMultiSelectInput";

const STEPS = [
  { title: "Batch info", description: "Name and duration" },
  { title: "Courses", description: "Search and select courses" },
  { title: "Users", description: "Search users or upload CSV" },
  { title: "Review", description: "Confirm the batch" },
];

type BatchCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
  onCreated?: () => void | Promise<void>;
  mode?: "create" | "edit";
  initialBatch?: BatchDetailsItem | null;
  initialStep?: number;
};

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

const BatchCreationModal = observer(
  ({
    isOpen,
    onClose,
    companyId = "",
    onCreated,
    mode = "create",
    initialBatch = null,
    initialStep = 0,
  }: BatchCreationModalProps) => {
    const toast = useToast();
    const { auth } = stores;
    const isEditMode = mode === "edit";

    const [step, setStep] = useState(initialStep);
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [courseSearch, setCourseSearch] = useState("");
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [csvFile, setCsvFile] = useState<File | null>(null);

    const companyAssignedCourseIds = useMemo(
      () =>
        Array.from(
          new Set(
            (courseStore.assignedCourseAccesses || [])
              .filter((access) => access.assignmentType === "company" && access.status !== "expired")
              .map((access) => access.courseId)
              .filter(Boolean)
          )
        ),
      [courseStore.assignedCourseAccesses]
    );

    const companyAssignedCourseMap = useMemo(
      () =>
        new Map(
          (courseStore.assignedCourseAccesses || [])
            .filter((access) => access.assignmentType === "company" && access.courseId)
            .map((access) => [access.courseId, access.courseName])
        ),
      [courseStore.assignedCourseAccesses]
    );

    const availableCourses = useMemo<any[]>(() => {
      const courseMap = new Map((courseStore.courses || []).map((course) => [course._id, course]));
      const existingCourseMap = new Map((initialBatch?.courses || []).map((course) => [course._id, course]));
      const scopedCourses = companyAssignedCourseIds.map((courseId) => {
        const existingCourse = existingCourseMap.get(courseId);
        return (
          courseMap.get(courseId) ||
          existingCourse || {
            _id: courseId,
            title: companyAssignedCourseMap.get(courseId) || "Assigned course",
            description: existingCourse?.description || { text: "" },
          }
        );
      });

      const missingExistingCourses = (initialBatch?.courses || [])
        .filter((course) => selectedCourseIds.includes(course._id) && !companyAssignedCourseIds.includes(course._id))
        .map((course) => ({
          ...course,
          description: {
            text:
              course.description?.text ||
              "This course is no longer assigned to the company. Remove it before saving this batch.",
          },
        }));

      return [...scopedCourses, ...missingExistingCourses].filter(
        (course, index, courses) => courses.findIndex((item) => item._id === course._id) === index
      );
    }, [companyAssignedCourseIds, companyAssignedCourseMap, courseStore.courses, initialBatch?.courses, selectedCourseIds]);

    const selectedCourses = useMemo(() => {
      const availableById = new Map(availableCourses.map((course) => [course._id, course]));
      const existingCourses = initialBatch?.courses || [];

      return selectedCourseIds
        .map((courseId) => availableById.get(courseId) || existingCourses.find((course) => course._id === courseId))
        .filter(Boolean);
    }, [availableCourses, initialBatch?.courses, selectedCourseIds]);

    const invalidSelectedCourses = useMemo(
      () => selectedCourses.filter((course: any) => !companyAssignedCourseIds.includes(course._id)),
      [companyAssignedCourseIds, selectedCourses]
    );

    const hydrateFromBatch = (batch: BatchDetailsItem | null, nextStep = 0) => {
      setStep(nextStep);
      setName(batch?.name || "");
      setStartDate(toDateInputValue(batch?.startDate));
      setEndDate(toDateInputValue(batch?.endDate));
      setCourseSearch("");
      setSelectedCourseIds((batch?.courses || []).map((course) => course._id));
      setUserSearch("");
      setUserResults([]);
      setSelectedUsers(batch?.users || []);
      setCsvFile(null);
    };

    const reset = () => {
      setStep(initialStep);
      setName("");
      setStartDate("");
      setEndDate("");
      setCourseSearch("");
      setSelectedCourseIds([]);
      setUserSearch("");
      setUserResults([]);
      setSelectedUsers([]);
      setCsvFile(null);
    };

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      if (isEditMode) {
        hydrateFromBatch(initialBatch, initialStep);
      } else {
        reset();
      }

      courseStore.fetchCourses().catch(() => undefined);
      if (companyId) {
        courseStore
          .fetchAssignedCourseAccesses({
            companyId,
            assignmentType: "company",
          })
          .catch(() => undefined);
      }
    }, [companyId, initialBatch, initialStep, isEditMode, isOpen]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      const timeoutId = setTimeout(async () => {
        if (!userSearch.trim()) {
          setUserResults([]);
          return;
        }

        try {
          const response = await auth.getCompanyUsers({
            searchValue: userSearch.trim(),
            ...(companyId ? { companyId } : {}),
          });
          setUserResults(response || []);
        } catch (error) {
          setUserResults([]);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }, [auth, companyId, isOpen, userSearch]);

    const canContinue = useMemo(() => {
      if (step === 0) {
        return Boolean(name.trim() && startDate);
      }

      if (step === 1) {
        return selectedCourseIds.length > 0 && invalidSelectedCourses.length === 0;
      }

      if (step === 2) {
        return selectedUsers.length > 0 || Boolean(csvFile);
      }

      return true;
    }, [csvFile, invalidSelectedCourses.length, name, selectedCourseIds.length, selectedUsers.length, startDate, step]);

    const toggleUser = (user: any) => {
      setSelectedUsers((current) => {
        const exists = current.some((item) => item._id === user._id);
        if (exists) {
          return current.filter((item) => item._id !== user._id);
        }

        return [...current, user];
      });
    };

    const handleClose = () => {
      if (!isEditMode) {
        reset();
      }
      onClose();
    };

    const handleSubmit = async () => {
      try {
        const response = isEditMode && initialBatch?._id
          ? await batchStore.updateBatch(initialBatch._id, {
              name: name.trim(),
              courseIds: selectedCourseIds,
              userIds: selectedUsers.map((user) => user._id),
              startDate: new Date(startDate).toISOString(),
              endDate: endDate ? new Date(endDate).toISOString() : null,
              file: csvFile,
            })
          : await batchStore.createBatch({
              name: name.trim(),
              companyId: companyId || undefined,
              courseIds: selectedCourseIds,
              userIds: selectedUsers.map((user) => user._id),
              startDate: new Date(startDate).toISOString(),
              endDate: endDate ? new Date(endDate).toISOString() : null,
              file: csvFile,
            });

        toast({
          title: isEditMode ? "Batch updated" : "Batch created",
          description:
            response?.message ||
            (isEditMode ? "The batch has been updated successfully." : "The batch has been created successfully."),
          status: "success",
          duration: 4000,
        });

        if (onCreated) {
          await onCreated();
        }

        if (!isEditMode) {
          reset();
        }
        onClose();
      } catch (err: any) {
        toast({
          title: isEditMode ? "Unable to update batch" : "Unable to create batch",
          description: err?.message || err?.error || "Please try again.",
          status: "error",
          duration: 4500,
        });
      }
    };

    return (
      <Drawer isOpen={isOpen} placement="right" size="xl" onClose={handleClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{isEditMode ? "Edit Batch" : "Create Batch"}</DrawerHeader>

          <DrawerBody>
            <Stack spacing={6}>
              <Stepper index={step} size="sm">
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
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Batch name</FormLabel>
                    <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Quarterly onboarding cohort" />
                  </FormControl>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Start date</FormLabel>
                      <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End date</FormLabel>
                      <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                    </FormControl>
                  </SimpleGrid>
                </Stack>
              ) : null}

              {step === 1 ? (
                <Stack spacing={4}>
                  {!companyAssignedCourseIds.length ? (
                    <Alert status="warning" borderRadius="2xl">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>No company-assigned courses available</AlertTitle>
                        <AlertDescription>
                          Assign the course to this company first, then it will become available for batch creation.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  ) : null}

                  {invalidSelectedCourses.length ? (
                    <Alert status="warning" borderRadius="2xl">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Some saved courses are no longer valid for this company</AlertTitle>
                        <AlertDescription>
                          Remove {invalidSelectedCourses.length === 1 ? "this course" : "these courses"} before saving the batch again.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  ) : null}

                  <CourseMultiSelectInput
                    courses={availableCourses}
                    selectedCourseIds={selectedCourseIds}
                    onSelectionChange={setSelectedCourseIds}
                    searchValue={courseSearch}
                    onSearchChange={setCourseSearch}
                    label="Select courses"
                    helperText="Only courses already assigned to this company can be bundled into a batch."
                    emptyStateText="No company-assigned courses match this search."
                  />
                </Stack>
              ) : null}

              {step === 2 ? (
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
                            <TagCloseButton onClick={() => toggleUser(user)} />
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
                        Search for users, select one or more learners, and optionally combine that with a CSV upload.
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
                              borderColor={isSelected ? "blue.300" : "gray.200"}
                              bg={isSelected ? "blue.50" : "white"}
                              borderRadius="2xl"
                              p={4}
                              cursor="pointer"
                              onClick={() => toggleUser(user)}
                            >
                              <HStack justify="space-between" align="start" spacing={4}>
                                <HStack align="start" spacing={3}>
                                  <Box borderRadius="xl" bg={isSelected ? "blue.600" : "gray.100"} color={isSelected ? "white" : "gray.700"} p={2.5}>
                                    <Icon as={FiUsers} boxSize={4} />
                                  </Box>
                                  <Box>
                                    <Text fontWeight="semibold">{user.name || user.email}</Text>
                                    <Text color="gray.600" fontSize="sm">
                                      {user.email || user.username}
                                    </Text>
                                  </Box>
                                </HStack>
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

                  <Alert status="info" borderRadius="2xl">
                    <AlertIcon />
                    <Box>
                      <AlertTitle display="inline-flex" alignItems="center" gap={2}>
                        <Icon as={FiUploadCloud} />
                        Email-based upload
                      </AlertTitle>
                      <AlertDescription>
                        Upload a CSV with an <strong>email</strong> column. Existing users in the selected company will be merged into this batch.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </Stack>
              ) : null}

              {step === 3 ? (
                <Stack spacing={4}>
                  <Box borderWidth="1px" borderRadius="3xl" p={5}>
                    <Text fontWeight="semibold" fontSize="lg">
                      Batch summary
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Name
                        </Text>
                        <Text fontWeight="medium">{name || "Not set"}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Duration
                        </Text>
                        <Text fontWeight="medium">
                          {startDate ? new Date(startDate).toLocaleDateString() : "Not set"}
                          {endDate ? ` - ${new Date(endDate).toLocaleDateString()}` : " - Open ended"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Courses
                        </Text>
                        <Text fontWeight="medium">{selectedCourses.length} selected</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Users
                        </Text>
                        <Text fontWeight="medium">
                          {selectedUsers.length} selected
                          {csvFile ? ` + CSV (${csvFile.name})` : ""}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Wrap spacing={2} mt={5}>
                      {selectedCourses.map((course: any) => (
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
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <HStack justify="space-between" w="full">
              <Button variant="outline" onClick={() => (step === 0 ? (isEditMode ? handleClose() : reset()) : setStep((current) => current - 1))}>
                {step === 0 ? (isEditMode ? "Close" : "Reset") : "Back"}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button colorScheme="blue" onClick={() => setStep((current) => current + 1)} isDisabled={!canContinue}>
                  Continue
                </Button>
              ) : (
                <Button colorScheme="blue" onClick={handleSubmit} isLoading={batchStore.isSubmitting}>
                  {isEditMode ? "Save changes" : "Create batch"}
                </Button>
              )}
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

export default BatchCreationModal;
