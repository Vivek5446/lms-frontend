"use client";

import CourseMultiSelectInput from "@/app/dashboard/course/components/CourseMultiSelectInput";
import {
  batchStore,
  type BatchDetailsItem,
  type BatchUploadPreviewData,
} from "@/app/store/batchStore/batchStore";
import { courseStore } from "@/app/store/courseStore/courseStore";
import stores from "@/app/store/stores";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  SlideFade,
  Stack,
  Step,
  StepDescription,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useToast,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiFileText,
  FiSearch,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";

const STEPS = [
  { title: "Batch Details", description: "Name and schedule" },
  { title: "Audience Setup", description: "Manual or spreadsheet" },
];

const SURFACE_PROPS = {
  bg: "white",
  borderWidth: "1px",
  borderColor: "gray.200",
  borderRadius: "18px",
};

const focusRing = {
  borderColor: "blue.500",
  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
};

type CreationMode = "manual" | "upload";

type BatchCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
  onCreated?: () => void | Promise<void>;
  mode?: "create" | "edit";
  initialBatch?: BatchDetailsItem | null;
  initialStep?: number;
};

const SectionHeader = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) => (
  <Stack spacing={1.5}>
    {eyebrow ? (
      <Text
        color="blue.600"
        fontSize="xs"
        fontWeight="800"
        textTransform="uppercase"
        letterSpacing="0.08em"
      >
        {eyebrow}
      </Text>
    ) : null}
    <Text
      color="gray.950"
      fontSize={{ base: "lg", md: "xl" }}
      fontWeight="800"
      letterSpacing="-0.03em"
      lineHeight="1.15"
    >
      {title}
    </Text>
    {description ? (
      <Text color="gray.500" fontSize="sm" lineHeight="1.6">
        {description}
      </Text>
    ) : null}
  </Stack>
);

const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <Flex
    align="center"
    justify="center"
    minH="180px"
    p={6}
    borderWidth="1px"
    borderStyle="dashed"
    borderColor="gray.300"
    borderRadius="16px"
    bg="gray.50"
    textAlign="center"
  >
    <Stack align="center" spacing={3} maxW="360px">
      <Flex
        align="center"
        justify="center"
        boxSize="40px"
        borderRadius="14px"
        bg="white"
        color="gray.400"
      >
        <Icon as={icon} boxSize={5} />
      </Flex>
      <Text color="gray.900" fontWeight="700">
        {title}
      </Text>
      <Text color="gray.500" fontSize="sm" lineHeight="1.6">
        {description}
      </Text>
    </Stack>
  </Flex>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <Box p={4} borderWidth="1px" borderColor="gray.200" borderRadius="14px" bg="gray.50">
    <Text
      fontSize="xs"
      fontWeight="800"
      letterSpacing="0.08em"
      textTransform="uppercase"
      color="gray.500"
      mb={2}
    >
      {label}
    </Text>
    <Text color="gray.950" fontSize="md" fontWeight="800" lineHeight="1.3">
      {value}
    </Text>
  </Box>
);

const ModeCard = ({
  title,
  description,
  icon,
  isSelected,
  onClick,
}: {
  title: string;
  description: string;
  icon: any;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <Box
    as="button"
    type="button"
    onClick={onClick}
    textAlign="left"
    w="full"
    p={4}
    borderWidth="1px"
    borderColor={isSelected ? "blue.400" : "gray.200"}
    bg={isSelected ? "blue.50" : "white"}
    borderRadius="16px"
    transition="all 0.18s ease"
    _hover={{ borderColor: isSelected ? "blue.500" : "gray.300", bg: isSelected ? "blue.50" : "gray.50" }}
    _focusVisible={focusRing}
  >
    <Stack spacing={3}>
      <HStack justify="space-between" align="start">
        <Flex
          align="center"
          justify="center"
          boxSize="40px"
          borderRadius="14px"
          bg={isSelected ? "blue.500" : "gray.100"}
          color={isSelected ? "white" : "gray.600"}
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
        <Flex
          align="center"
          justify="center"
          boxSize="24px"
          borderRadius="full"
          borderWidth="1px"
          borderColor={isSelected ? "blue.500" : "gray.300"}
          bg={isSelected ? "blue.500" : "white"}
          color="white"
        >
          {isSelected ? <Icon as={FiCheck} boxSize={3.5} /> : null}
        </Flex>
      </HStack>
      <Box>
        <Text color="gray.950" fontWeight="800" fontSize="sm">
          {title}
        </Text>
        <Text color="gray.500" fontSize="sm" mt={1} lineHeight="1.6">
          {description}
        </Text>
      </Box>
    </Stack>
  </Box>
);

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

function formatDate(value?: string | null) {
  if (!value) {
    return "Open ended";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Open ended";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
    const { auth, companyStore } = stores;
    const isEditMode = mode === "edit";

    const [step, setStep] = useState(Math.min(initialStep, 1));
    const [creationMode, setCreationMode] = useState<CreationMode>("manual");
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [courseSearch, setCourseSearch] = useState("");
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<BatchUploadPreviewData | null>(null);
    const managedCompanies = companyStore.companies.data || [];
    const selectedCompany =
      managedCompanies.find((company: any) => company?._id === companyId) ||
      auth.user?.companyDetails ||
      null;
    const isCompanyInactive = Boolean(companyId && selectedCompany?.is_active === false);
    const companyName = selectedCompany?.company_name || "this company";
    const inactiveCompanyMessage = `${companyName} is inactive. Batch creation and updates are disabled until the company is reactivated.`;

    const companyAssignedCourseIds = useMemo(
      () =>
        Array.from(
          new Set(
            (courseStore.assignedCourseAccesses || [])
              .filter(
                (access) =>
                  access.assignmentType === "company" && access.status !== "expired"
              )
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
      const courseMap = new Map(
        (courseStore.courses || []).map((course) => [course._id, course])
      );
      const existingCourseMap = new Map(
        (initialBatch?.courses || []).map((course) => [course._id, course])
      );
      const scopedCourses = companyAssignedCourseIds
        .map((courseId) => {
          const existingCourse = existingCourseMap.get(courseId);
          return (
            courseMap.get(courseId) ||
            existingCourse || {
              _id: courseId,
              title: companyAssignedCourseMap.get(courseId) || "Assigned course",
              description: { text: "" },
            }
          );
        })
        .filter(Boolean);

      const missingExistingCourses = (initialBatch?.courses || [])
        .filter(
          (course) =>
            selectedCourseIds.includes(course._id) &&
            !companyAssignedCourseIds.includes(course._id)
        )
        .map((course) => ({
          ...course,
          description: {
            text:
              course.description?.text ||
              "This course is no longer assigned to the company. Remove it before saving this batch.",
          },
        }));

      return [...scopedCourses, ...missingExistingCourses].filter(
        (course, index, courses) =>
          courses.findIndex((item) => item._id === course._id) === index
      );
    }, [companyAssignedCourseIds, companyAssignedCourseMap, courseStore.courses, initialBatch?.courses, selectedCourseIds]);

    const selectedCourses = useMemo(() => {
      const byId = new Map(availableCourses.map((course) => [course._id, course]));
      return selectedCourseIds.map((courseId) => byId.get(courseId)).filter(Boolean);
    }, [availableCourses, selectedCourseIds]);

    const invalidSelectedCourses = useMemo(
      () =>
        selectedCourses.filter(
          (course: any) => !companyAssignedCourseIds.includes(course._id)
        ),
      [companyAssignedCourseIds, selectedCourses]
    );

    const manualCanSubmit =
      selectedCourseIds.length > 0 &&
      selectedUsers.length > 0 &&
      invalidSelectedCourses.length === 0 &&
      !isCompanyInactive;

    const uploadCanSubmit = Boolean(
      uploadPreview?.courseCount && uploadPreview?.matchedCount && !isCompanyInactive
    );

    const normalizeForOpen = (batch: BatchDetailsItem | null, nextStep = 0) => {
      setStep(Math.min(nextStep, 1));
      setCreationMode("manual");
      setName(batch?.name || "");
      setStartDate(toDateInputValue(batch?.startDate));
      setEndDate(toDateInputValue(batch?.endDate));
      setCourseSearch("");
      setSelectedCourseIds((batch?.courses || []).map((course) => course._id));
      setUserSearch("");
      setUserResults([]);
      setSelectedUsers(batch?.users || []);
      setUploadFile(null);
      setUploadPreview(null);
    };

    const reset = () => {
      setStep(Math.min(initialStep, 1));
      setCreationMode("manual");
      setName("");
      setStartDate("");
      setEndDate("");
      setCourseSearch("");
      setSelectedCourseIds([]);
      setUserSearch("");
      setUserResults([]);
      setSelectedUsers([]);
      setUploadFile(null);
      setUploadPreview(null);
    };

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      if (isEditMode) {
        normalizeForOpen(initialBatch, initialStep);
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
      if (!isOpen || creationMode !== "manual") {
        setUserResults([]);
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
    }, [auth, companyId, creationMode, isOpen, userSearch]);

    const handleModeChange = (nextMode: CreationMode) => {
      setCreationMode(nextMode);
      if (nextMode === "manual") {
        setUploadFile(null);
        setUploadPreview(null);
        return;
      }

      setCourseSearch("");
      setSelectedCourseIds([]);
      setUserSearch("");
      setUserResults([]);
      setSelectedUsers([]);
    };

    const handleClose = () => {
      reset();
      onClose();
    };

    const toggleUser = (user: any) => {
      setSelectedUsers((current) => {
        const exists = current.some((item) => item._id === user._id);
        if (exists) {
          return current.filter((item) => item._id !== user._id);
        }
        return [...current, user];
      });
    };

    const handleValidateUpload = async () => {
      if (!uploadFile) {
        return;
      }

      if (isCompanyInactive) {
        toast({
          title: "Company is inactive",
          description: inactiveCompanyMessage,
          status: "warning",
          duration: 4500,
          position: "top-right",
          isClosable: true,
        });
        return;
      }

      try {
        const response = await batchStore.previewBatchUpload({
          file: uploadFile,
          companyId: companyId || undefined,
        });

        const preview = response?.data || null;
        setUploadPreview(preview);

        toast({
          title: preview?.summary?.validRows ? "Workbook reviewed" : "No valid data found",
          description: preview?.summary?.validRows
            ? `${preview.summary.validCourseRows} valid course${preview.summary.validCourseRows === 1 ? "" : "s"} and ${preview.summary.validUserRows} valid user${preview.summary.validUserRows === 1 ? "" : "s"} identified.`
            : "No batchable courses or users were found in the uploaded workbook.",
          status: preview?.summary?.validRows ? "success" : "warning",
          duration: 4000,
          position: "top-right",
          isClosable: true,
        });
      } catch (err: any) {
        setUploadPreview(null);
        toast({
          title: "Validation failed",
          description:
            err?.message ||
            err?.error ||
            "Unable to validate the uploaded spreadsheet.",
          status: "error",
          duration: 4500,
          position: "top-right",
          isClosable: true,
        });
      }
    };

    const handleSubmit = async () => {
      const isUploadMode = creationMode === "upload" && !isEditMode;

      if (isUploadMode && !uploadCanSubmit) {
        return;
      }

      if (!isUploadMode && !manualCanSubmit) {
        return;
      }

      if (isCompanyInactive) {
        toast({
          title: "Company is inactive",
          description: inactiveCompanyMessage,
          status: "warning",
          duration: 4500,
          position: "top-right",
          isClosable: true,
        });
        return;
      }

      try {
        const response =
          isEditMode && initialBatch?._id
            ? await batchStore.updateBatch(initialBatch._id, {
                name: name.trim(),
                courseIds: selectedCourseIds,
                userIds: selectedUsers.map((user) => user._id),
                startDate: new Date(startDate).toISOString(),
                endDate: endDate ? new Date(endDate).toISOString() : null,
              })
            : await batchStore.createBatch({
                name: name.trim(),
                companyId: companyId || undefined,
                courseIds: isUploadMode ? [] : selectedCourseIds,
                userIds: isUploadMode ? [] : selectedUsers.map((user) => user._id),
                startDate: new Date(startDate).toISOString(),
                endDate: endDate ? new Date(endDate).toISOString() : null,
                file: isUploadMode ? uploadFile : null,
              });

        toast({
          title: isEditMode ? "Batch updated" : "Batch created",
          description:
            response?.message ||
            (isEditMode
              ? "The batch has been updated successfully."
              : "The batch has been created successfully."),
          status: "success",
          duration: 4000,
          position: "top-right",
          isClosable: true,
        });

        if (onCreated) {
          await onCreated();
        }

        handleClose();
      } catch (err: any) {
        toast({
          title: isEditMode ? "Unable to update batch" : "Unable to create batch",
          description: err?.message || err?.error || "Please try again.",
          status: "error",
          duration: 4500,
          position: "top-right",
          isClosable: true,
        });
      }
    };

    const canContinueFromDetails =
      Boolean(name.trim() && startDate) && (!endDate || endDate >= startDate);

    const actionLabel = isEditMode
      ? "Save Batch"
      : creationMode === "upload"
        ? uploadPreview?.failedCount
          ? "Create Batch With Valid Data"
          : "Create Batch"
        : "Create Batch";

    return (
      <Drawer isOpen={isOpen} placement="right" size="full" onClose={handleClose}>
        <DrawerOverlay backdropFilter="blur(6px)" />
        <DrawerContent bg="gray.50" maxW={{md:"70vw"}}>
          <DrawerCloseButton mt={2} />
          <DrawerHeader pb={0}>
            <Stack spacing={5}>
              <SectionHeader
                eyebrow={isEditMode ? "Edit Batch" : "Create Batch"}
                title={isEditMode ? "Update batch setup" : "Create a batch in two simple steps"}
                description="Define the batch basics first, then choose whether you want to build it manually or from a validated spreadsheet."
              />
              <Stepper index={step} size="sm" colorScheme="blue">
                {STEPS.map((item) => (
                  <Step key={item.title}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepNumber />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    <Box flexShrink="0">
                      <StepTitle>{item.title}</StepTitle>
                      <StepDescription>{item.description}</StepDescription>
                    </Box>
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </Stack>
          </DrawerHeader>

          <DrawerBody py={5}>
            <SlideFade in offsetY="8px">
              <Stack spacing={4}>
                {isCompanyInactive ? (
                  <Alert
                    status="warning"
                    borderRadius="16px"
                    bg="orange.50"
                    color="orange.900"
                    borderWidth="1px"
                    borderColor="orange.200"
                    alignItems="start"
                  >
                    <AlertIcon color="orange.500" mt={1} />
                    <Box>
                      <AlertTitle fontSize="sm">Company is inactive</AlertTitle>
                      <AlertDescription fontSize="sm" mt={1} lineHeight="1.6">
                        {inactiveCompanyMessage}
                      </AlertDescription>
                    </Box>
                  </Alert>
                ) : null}
                {step === 0 ? (
                  <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                    <Stack spacing={5}>
                      <SectionHeader
                        eyebrow="Step 1"
                        title="Set the batch details"
                        description="Start with the essentials so the batch is clearly named and scheduled."
                      />

                      <Stack spacing={4}>
                        <Box>
                          <Text fontSize="sm" fontWeight="700" color="gray.700" mb={2}>
                            Batch Name
                          </Text>
                          <Input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Q3 onboarding cohort"
                            bg="white"
                            borderRadius="14px"
                            borderColor="gray.200"
                            h="44px"
                            _focus={focusRing}
                          />
                        </Box>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box>
                            <Text fontSize="sm" fontWeight="700" color="gray.700" mb={2}>
                              Start Date
                            </Text>
                            <Input
                              type="date"
                              value={startDate}
                              onChange={(event) => setStartDate(event.target.value)}
                              bg="white"
                              borderRadius="14px"
                              borderColor="gray.200"
                              h="44px"
                              _focus={focusRing}
                            />
                          </Box>

                          <Box>
                            <Text fontSize="sm" fontWeight="700" color="gray.700" mb={2}>
                              End Date
                            </Text>
                            <Input
                              type="date"
                              value={endDate}
                              min={startDate || undefined}
                              onChange={(event) => setEndDate(event.target.value)}
                              bg="white"
                              borderRadius="14px"
                              borderColor="gray.200"
                              h="44px"
                              _focus={focusRing}
                            />
                          </Box>
                        </SimpleGrid>

                        {endDate && startDate && endDate < startDate ? (
                          <Alert status="warning" borderRadius="14px">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Check the schedule</AlertTitle>
                              <AlertDescription fontSize="sm">
                                End date must be later than start date.
                              </AlertDescription>
                            </Box>
                          </Alert>
                        ) : null}
                      </Stack>
                    </Stack>
                  </Box>
                ) : null}

                {step === 1 ? (
                  <Stack spacing={4}>
                    {!isEditMode ? (
                      <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                        <Stack spacing={4}>
                          <SectionHeader
                            eyebrow="Step 2"
                            title="Choose how you want to build the batch"
                            description="Pick the workflow that fits this batch best. You can either configure it manually or upload a validated sheet."
                          />
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                            <ModeCard
                              title="Manual Selection"
                              description="Choose the company-assigned courses and search learners manually before creating the batch."
                              icon={FiUsers}
                              isSelected={creationMode === "manual"}
                              onClick={() => handleModeChange("manual")}
                            />
                            <ModeCard
                              title="Excel Upload"
                              description="Upload a spreadsheet with courseCode and learner identifiers, validate it, then create the batch from the valid rows."
                              icon={FiUploadCloud}
                              isSelected={creationMode === "upload"}
                              onClick={() => handleModeChange("upload")}
                            />
                          </SimpleGrid>
                        </Stack>
                      </Box>
                    ) : null}

                    {creationMode === "manual" || isEditMode ? (
                      <Grid
                        templateColumns={{ base: "1fr", xl: "minmax(0, 1.1fr) minmax(340px, 0.9fr)" }}
                        gap={4}
                        alignItems="start"
                      >
                        <Stack spacing={4}>
                          <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                            <Stack spacing={4}>
                              <SectionHeader
                                eyebrow="Courses"
                                title="Select the batch courses"
                                description="Only courses already assigned to the selected company can be added to this batch."
                              />

                              {!companyAssignedCourseIds.length ? (
                                <Alert status="warning" borderRadius="14px">
                                  <AlertIcon />
                                  <Box>
                                    <AlertTitle fontSize="sm">No assigned courses available</AlertTitle>
                                    <AlertDescription fontSize="sm">
                                      Assign at least one course to this company before creating a batch.
                                    </AlertDescription>
                                  </Box>
                                </Alert>
                              ) : null}

                              {invalidSelectedCourses.length ? (
                                <Alert status="warning" borderRadius="14px">
                                  <AlertIcon />
                                  <Box>
                                    <AlertTitle fontSize="sm">Some selected courses are no longer valid</AlertTitle>
                                    <AlertDescription fontSize="sm">
                                      Remove the outdated course assignments before saving this batch again.
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
                                label="Batch courses"
                                helperText="Every learner in the batch will receive all selected courses."
                                emptyStateText="No company-assigned courses match this search."
                              />
                            </Stack>
                          </Box>

                          <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                            <Stack spacing={4}>
                              <SectionHeader
                                eyebrow="Learners"
                                title="Search and select learners"
                                description="Add the learners who should belong to this batch."
                              />

                              <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                  <Icon as={FiSearch} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  value={userSearch}
                                  onChange={(event) => setUserSearch(event.target.value)}
                                  placeholder="Search by name, email, code, or department"
                                  bg="white"
                                  borderRadius="13px"
                                  borderColor="gray.200"
                                  h="42px"
                                  _focus={focusRing}
                                />
                              </InputGroup>

                              <Box
                                borderWidth="1px"
                                borderColor="gray.200"
                                borderRadius="16px"
                                overflow="hidden"
                                bg="white"
                                maxH="340px"
                                overflowY="auto"
                              >
                                {userResults.length === 0 ? (
                                  <Box p={6}>
                                    <Text color="gray.400" fontSize="sm" textAlign="center">
                                      Search results will appear here.
                                    </Text>
                                  </Box>
                                ) : (
                                  <VStack align="stretch" spacing={0} divider={<Divider />}>
                                    {userResults.map((row: any) => {
                                      const user = row.user || row;
                                      const isSelected = selectedUsers.some(
                                        (item) => item._id === user._id
                                      );

                                      return (
                                        <HStack
                                          key={user._id}
                                          p={3.5}
                                          cursor="pointer"
                                          bg={isSelected ? "blue.50" : "white"}
                                          _hover={{ bg: isSelected ? "blue.100" : "gray.50" }}
                                          onClick={() => toggleUser(user)}
                                          justify="space-between"
                                        >
                                          <HStack spacing={3} minW={0}>
                                            <Avatar
                                              size="sm"
                                              name={user.name || user.email}
                                              src={user.profilePicture}
                                            />
                                            <Box minW={0}>
                                              <Text fontSize="sm" fontWeight="700" color="gray.950" noOfLines={1}>
                                                {user.name || "Unnamed user"}
                                              </Text>
                                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                {user.email || user.username}
                                              </Text>
                                            </Box>
                                          </HStack>
                                          {isSelected ? (
                                            <Icon as={FiCheckCircle} color="blue.500" flexShrink={0} />
                                          ) : null}
                                        </HStack>
                                      );
                                    })}
                                  </VStack>
                                )}
                              </Box>
                            </Stack>
                          </Box>
                        </Stack>

                        <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                          <Stack spacing={5}>
                            <SectionHeader
                              eyebrow="Review"
                              title="Review before creating"
                              description="This summary shows exactly what will be included in the batch."
                            />

                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                              <StatCard label="Courses" value={`${selectedCourseIds.length}`} />
                              <StatCard label="Learners" value={`${selectedUsers.length}`} />
                            </SimpleGrid>

                            <Box>
                              <Text
                                fontSize="xs"
                                fontWeight="800"
                                letterSpacing="0.08em"
                                textTransform="uppercase"
                                color="gray.500"
                                mb={3}
                              >
                                Selected Courses
                              </Text>
                              {selectedCourses.length ? (
                                <Wrap spacing={2}>
                                  {selectedCourses.map((course: any) => (
                                    <WrapItem key={course._id}>
                                      <Tag borderRadius="full" colorScheme="blue" variant="subtle" px={3} py={2}>
                                        <HStack spacing={2}>
                                          <Icon as={FiBookOpen} boxSize={3.5} />
                                          <TagLabel fontWeight="700">{course.title}</TagLabel>
                                        </HStack>
                                      </Tag>
                                    </WrapItem>
                                  ))}
                                </Wrap>
                              ) : (
                                <EmptyState
                                  icon={FiBookOpen}
                                  title="No courses selected"
                                  description="Select one or more courses to prepare this batch."
                                />
                              )}
                            </Box>

                            <Box>
                              <Text
                                fontSize="xs"
                                fontWeight="800"
                                letterSpacing="0.08em"
                                textTransform="uppercase"
                                color="gray.500"
                                mb={3}
                              >
                                Selected Learners
                              </Text>
                              {selectedUsers.length ? (
                                <Wrap spacing={2}>
                                  {selectedUsers.map((user) => (
                                    <WrapItem key={user._id}>
                                      <Tag size="lg" borderRadius="full" variant="subtle" colorScheme="blue" pl={1} pr={3} py={1.5}>
                                        <Avatar size="xs" name={user.name || user.email} src={user.profilePicture} mr={2} />
                                        <TagLabel fontWeight="700" fontSize="sm">
                                          {user.name || user.email}
                                        </TagLabel>
                                        <TagCloseButton onClick={() => toggleUser(user)} ml={2} />
                                      </Tag>
                                    </WrapItem>
                                  ))}
                                </Wrap>
                              ) : (
                                <EmptyState
                                  icon={FiUsers}
                                  title="No learners selected"
                                  description="Search and pick the learners you want to add to this batch."
                                />
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      </Grid>
                    ) : null}

                    {creationMode === "upload" && !isEditMode ? (
                      <Stack spacing={4}>
                        <Grid
                          templateColumns={{ base: "1fr", xl: "minmax(0, 0.95fr) minmax(360px, 1.05fr)" }}
                          gap={4}
                          alignItems="start"
                        >
                          <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                            <Stack spacing={4}>
                              <SectionHeader
                                eyebrow="Spreadsheet Upload"
                                title="Upload and validate your workbook"
                                description="Use one XLSX workbook with separate Courses and Users sheets so both lists can be checked independently."
                              />

                              <Alert status="info" borderRadius="14px" alignItems="start" bg="blue.50" borderWidth="1px" borderColor="blue.100">
                                <AlertIcon mt={1} color="blue.500" />
                                <Box>
                                  <AlertTitle fontSize="sm">Workbook structure</AlertTitle>
                                  <AlertDescription fontSize="sm" mt={2} lineHeight="1.6">
                                    Add a <strong>Courses</strong> sheet with <strong>courseCode</strong>, and a <strong>Users</strong> sheet with
                                    <strong> email</strong>, <strong>employeeId</strong>, <strong>code</strong>, or <strong>userId</strong>.
                                  </AlertDescription>
                                </Box>
                              </Alert>

                              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                <Box p={4} borderWidth="1px" borderColor="gray.200" borderRadius="14px" bg="gray.50">
                                  <Text fontSize="xs" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase" color="gray.500" mb={2}>
                                    Sheet 1
                                  </Text>
                                  <Text color="gray.900" fontWeight="700" fontSize="sm">
                                    Courses
                                  </Text>
                                  <Text color="gray.500" fontSize="sm" mt={1}>
                                    One column: <strong>courseCode</strong>
                                  </Text>
                                </Box>
                                <Box p={4} borderWidth="1px" borderColor="gray.200" borderRadius="14px" bg="gray.50">
                                  <Text fontSize="xs" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase" color="gray.500" mb={2}>
                                    Sheet 2
                                  </Text>
                                  <Text color="gray.900" fontWeight="700" fontSize="sm">
                                    Users
                                  </Text>
                                  <Text color="gray.500" fontSize="sm" mt={1}>
                                    Use <strong>email</strong> or <strong>employeeId/code</strong>
                                  </Text>
                                </Box>
                              </SimpleGrid>

                              <Box
                                as="label"
                                htmlFor="batch-upload-file"
                                cursor="pointer"
                                display="block"
                                p={4}
                                bg={uploadFile ? "blue.50" : "gray.50"}
                                borderWidth="1px"
                                borderStyle="dashed"
                                borderColor={uploadFile ? "blue.300" : "gray.300"}
                                borderRadius="16px"
                                _hover={{ bg: uploadFile ? "blue.100" : "gray.100" }}
                              >
                                <Input
                                  id="batch-upload-file"
                                  type="file"
                                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                  display="none"
                                  onChange={(event) => {
                                    setUploadFile(event.target.files?.[0] || null);
                                    setUploadPreview(null);
                                  }}
                                />
                                <HStack justify="space-between" spacing={3}>
                                  <HStack spacing={3} minW={0}>
                                    <Flex
                                      align="center"
                                      justify="center"
                                      boxSize="40px"
                                      borderRadius="14px"
                                      bg="white"
                                      color="blue.600"
                                      flexShrink={0}
                                    >
                                      <Icon as={FiUploadCloud} boxSize={5} />
                                    </Flex>
                                    <Box minW={0}>
                                      <Text fontSize="sm" fontWeight="800" color="gray.900" noOfLines={1}>
                                        {uploadFile ? uploadFile.name : "Choose Excel workbook (.xlsx)"}
                                      </Text>
                                      <Text fontSize="xs" color="gray.500" mt={0.5}>
                                        CSV and legacy `.xls` files are not supported in this flow.
                                      </Text>
                                    </Box>
                                  </HStack>
                                  <Badge colorScheme={uploadFile ? "blue" : "gray"} variant="subtle" borderRadius="full" px={3} py={1} textTransform="none">
                                    Browse
                                  </Badge>
                                </HStack>
                              </Box>

                              <Button
                                colorScheme="blue"
                                variant="outline"
                                onClick={handleValidateUpload}
                                isDisabled={!uploadFile || !companyId || isCompanyInactive}
                                isLoading={batchStore.isPreviewSubmitting}
                                h="42px"
                                borderRadius="14px"
                              >
                                Validate Workbook
                              </Button>

                              {uploadPreview ? (
                                <Alert
                                  status={uploadPreview.summary.validRows ? "success" : "warning"}
                                  borderRadius="14px"
                                  alignItems="start"
                                  bg={uploadPreview.summary.validRows ? "green.50" : "orange.50"}
                                  borderWidth="1px"
                                  borderColor={uploadPreview.summary.validRows ? "green.100" : "orange.200"}
                                >
                                  <AlertIcon mt={1} color={uploadPreview.summary.validRows ? "green.500" : "orange.500"} />
                                  <Box>
                                    <AlertTitle fontSize="sm">Upload summary</AlertTitle>
                                    <AlertDescription fontSize="sm" mt={2} lineHeight="1.6">
                                      {uploadPreview.summary.validRows
                                        ? `Validated ${uploadPreview.summary.validCourseRows} course${uploadPreview.summary.validCourseRows === 1 ? "" : "s"} and ${uploadPreview.summary.validUserRows} user${uploadPreview.summary.validUserRows === 1 ? "" : "s"}, with ${uploadPreview.summary.failedRows} issue${uploadPreview.summary.failedRows === 1 ? "" : "s"} to review.`
                                        : "No valid courses or users were found in the uploaded workbook."}
                                    </AlertDescription>
                                  </Box>
                                </Alert>
                              ) : null}
                            </Stack>
                          </Box>

                          <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                            <Stack spacing={5}>
                              <SectionHeader
                                eyebrow="Review"
                                title="What this upload will create"
                                description="Review the validated course list, learner list, and batch outcome before confirming."
                              />

                              {uploadPreview ? (
                                <>
                                  <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={3}>
                                    <StatCard label="Course Rows" value={`${uploadPreview.summary.courseRows}`} />
                                    <StatCard label="User Rows" value={`${uploadPreview.summary.userRows}`} />
                                    <StatCard label="Total Rows" value={`${uploadPreview.summary.totalRows}`} />
                                    <StatCard label="Valid Courses" value={`${uploadPreview.summary.validCourseRows}`} />
                                    <StatCard label="Valid Users" value={`${uploadPreview.summary.validUserRows}`} />
                                    <StatCard label="Failed Rows" value={`${uploadPreview.summary.failedRows}`} />
                                  </SimpleGrid>

                                  <Alert status="info" borderRadius="14px" alignItems="start" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                                    <AlertIcon mt={1} color="blue.500" />
                                    <Box>
                                      <AlertTitle fontSize="sm">Batch behavior</AlertTitle>
                                      <AlertDescription fontSize="sm" mt={2} lineHeight="1.6">
                                        This batch will be created with <strong>{uploadPreview.courseCount}</strong> unique course{uploadPreview.courseCount === 1 ? "" : "s"} and <strong>{uploadPreview.matchedCount}</strong> unique learner{uploadPreview.matchedCount === 1 ? "" : "s"}. Each learner in the batch will receive all valid courses included in this upload.
                                      </AlertDescription>
                                    </Box>
                                  </Alert>

                                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                    <StatCard label="Batch Courses" value={`${uploadPreview.courseCount}`} />
                                    <StatCard label="Batch Learners" value={`${uploadPreview.matchedCount}`} />
                                  </SimpleGrid>
                                </>
                              ) : (
                                <EmptyState
                                  icon={FiFileText}
                                  title="No upload review yet"
                                  description="Upload a workbook and validate it to review the final course list, learner list, and any sheet-level issues."
                                />
                              )}
                            </Stack>
                          </Box>
                        </Grid>

                        {uploadPreview ? (
                          <Grid templateColumns={{ base: "1fr", xl: "1.05fr 0.95fr" }} gap={4} alignItems="start">
                            <Stack spacing={4}>
                              <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                                <Stack spacing={4}>
                                  <SectionHeader
                                    eyebrow="Selected Courses"
                                    title={`Validated courses (${uploadPreview.matchedCourses.length})`}
                                    description="These are the courses that will be assigned to everyone in this batch."
                                  />

                                  {uploadPreview.matchedCourses.length ? (
                                    <Stack spacing={3} maxH="420px" overflowY="auto" pr={1}>
                                      {uploadPreview.matchedCourses.map((course) => (
                                        <Box key={course.courseId} borderWidth="1px" borderColor="gray.200" borderRadius="14px" p={4}>
                                          <HStack justify="space-between" align="start" gap={3}>
                                            <Stack spacing={1} minW={0}>
                                              <Text fontWeight="800" color="gray.950">
                                                {course.title}
                                              </Text>
                                              <Badge alignSelf="start" colorScheme="blue" variant="subtle" borderRadius="full" px={2.5} py={1} textTransform="none">
                                                {course.courseCode}
                                              </Badge>
                                            </Stack>
                                            <Icon as={FiCheckCircle} color="green.500" boxSize={5} flexShrink={0} />
                                          </HStack>
                                        </Box>
                                      ))}
                                    </Stack>
                                  ) : (
                                    <EmptyState
                                      icon={FiBookOpen}
                                      title="No valid courses"
                                      description="No courses from the workbook passed validation."
                                    />
                                  )}
                                </Stack>
                              </Box>

                              <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                                <Stack spacing={4}>
                                  <SectionHeader
                                    eyebrow="Selected Users"
                                    title={`Validated learners (${uploadPreview.matchedUsers.length})`}
                                    description="Every learner listed here will receive all valid batch courses after confirmation."
                                  />

                                  {uploadPreview.matchedUsers.length ? (
                                    <Stack spacing={3} maxH="420px" overflowY="auto" pr={1}>
                                      {uploadPreview.matchedUsers.map((user) => (
                                        <HStack
                                          key={user._id}
                                          p={4}
                                          borderWidth="1px"
                                          borderColor="gray.200"
                                          borderRadius="14px"
                                          justify="space-between"
                                          align="start"
                                          gap={3}
                                        >
                                          <HStack spacing={3} minW={0} align="start">
                                            <Avatar size="sm" name={user.name || user.email || user.username} />
                                            <Stack spacing={1} minW={0}>
                                              <Text fontWeight="800" color="gray.950" noOfLines={1}>
                                                {user.name || user.email || "Unnamed user"}
                                              </Text>
                                              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                                {user.email || user.username || user.code || "No identifier available"}
                                              </Text>
                                              {user.department ? (
                                                <Badge alignSelf="start" colorScheme="gray" variant="subtle" borderRadius="full" px={2.5} py={1} textTransform="none">
                                                  {user.department}
                                                </Badge>
                                              ) : null}
                                            </Stack>
                                          </HStack>
                                          {user.code ? (
                                            <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2.5} py={1} textTransform="none">
                                              {user.code}
                                            </Badge>
                                          ) : null}
                                        </HStack>
                                      ))}
                                    </Stack>
                                  ) : (
                                    <EmptyState
                                      icon={FiUsers}
                                      title="No valid learners"
                                      description="No users from the workbook passed validation."
                                    />
                                  )}
                                </Stack>
                              </Box>
                            </Stack>

                            <Box {...SURFACE_PROPS} p={{ base: 4, md: 5 }}>
                              <Stack spacing={4}>
                                <SectionHeader
                                  eyebrow="Validation Errors"
                                  title={`Review issues (${uploadPreview.failedCount})`}
                                  description="Courses and users are validated independently, so only the invalid entries below will be skipped."
                                />

                                {uploadPreview.courseErrors.length || uploadPreview.userErrors.length ? (
                                  <Stack spacing={4} maxH="720px" overflowY="auto" pr={1}>
                                    <Box>
                                      <Text fontSize="xs" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase" color="gray.500" mb={3}>
                                        Invalid Courses
                                      </Text>
                                      {uploadPreview.courseErrors.length ? (
                                        <Stack spacing={3}>
                                          {uploadPreview.courseErrors.map((entry, index) => (
                                            <Box key={`${entry.rowNumber || entry.courseCode}-${index}`} borderWidth="1px" borderColor="orange.200" borderRadius="14px" p={4} bg="orange.50">
                                              <Stack spacing={1.5}>
                                                <HStack spacing={2} flexWrap="wrap">
                                                  {entry.rowNumber ? (
                                                    <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2.5} py={1} textTransform="none">
                                                      Row {entry.rowNumber}
                                                    </Badge>
                                                  ) : null}
                                                  {entry.courseCode ? (
                                                    <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2.5} py={1} textTransform="none">
                                                      {entry.courseCode}
                                                    </Badge>
                                                  ) : null}
                                                </HStack>
                                                <Text fontWeight="800" color="orange.900">
                                                  {entry.reason}
                                                </Text>
                                                <Text fontSize="sm" color="orange.800">
                                                  {entry.courseCode || entry.courseId || "Course reference missing"}
                                                </Text>
                                              </Stack>
                                            </Box>
                                          ))}
                                        </Stack>
                                      ) : (
                                        <EmptyState
                                          icon={FiCheckCircle}
                                          title="No course issues"
                                          description="All course entries were validated successfully."
                                        />
                                      )}
                                    </Box>

                                    <Divider />

                                    <Box>
                                      <Text fontSize="xs" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase" color="gray.500" mb={3}>
                                        Invalid Users
                                      </Text>
                                      {uploadPreview.userErrors.length ? (
                                        <Stack spacing={3}>
                                          {uploadPreview.userErrors.map((entry, index) => (
                                            <Box key={`${entry.rowNumber || entry.email || entry.employeeId || entry.userId}-${index}`} borderWidth="1px" borderColor="orange.200" borderRadius="14px" p={4} bg="orange.50">
                                              <Stack spacing={1.5}>
                                                <HStack spacing={2} flexWrap="wrap">
                                                  {entry.rowNumber ? (
                                                    <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2.5} py={1} textTransform="none">
                                                      Row {entry.rowNumber}
                                                    </Badge>
                                                  ) : null}
                                                  {entry.email ? (
                                                    <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2.5} py={1} textTransform="none">
                                                      {entry.email}
                                                    </Badge>
                                                  ) : null}
                                                  {!entry.email && entry.employeeId ? (
                                                    <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2.5} py={1} textTransform="none">
                                                      {entry.employeeId}
                                                    </Badge>
                                                  ) : null}
                                                </HStack>
                                                <Text fontWeight="800" color="orange.900">
                                                  {entry.reason}
                                                </Text>
                                                <Text fontSize="sm" color="orange.800">
                                                  {entry.email || entry.employeeId || entry.userId || "User reference missing"}
                                                </Text>
                                              </Stack>
                                            </Box>
                                          ))}
                                        </Stack>
                                      ) : (
                                        <EmptyState
                                          icon={FiCheckCircle}
                                          title="No user issues"
                                          description="All user entries were validated successfully."
                                        />
                                      )}
                                    </Box>
                                  </Stack>
                                ) : (
                                  <EmptyState
                                    icon={FiCheckCircle}
                                    title="No validation errors"
                                    description="All uploaded course and user entries were validated successfully."
                                  />
                                )}
                              </Stack>
                            </Box>
                          </Grid>
                        ) : null}
                      </Stack>
                    ) : null}
                  </Stack>
                ) : null}
              </Stack>
            </SlideFade>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" borderColor="gray.200" p={{ base: 4, md: 5 }} bg="white">
            <Flex
              direction={{ base: "column-reverse", sm: "row" }}
              justify="space-between"
              align={{ base: "stretch", sm: "center" }}
              gap={3}
              w="full"
            >
              <Button
                h="42px"
                borderRadius="13px"
                variant="ghost"
                colorScheme="gray"
                onClick={() => (step === 0 ? handleClose() : setStep(0))}
              >
                {step === 0 ? "Cancel" : "Back"}
              </Button>

              {step === 0 ? (
                <Button
                  h="42px"
                  borderRadius="13px"
                  colorScheme="blue"
                  onClick={() => setStep(1)}
                  isDisabled={!canContinueFromDetails}
                  px={8}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  h="42px"
                  borderRadius="13px"
                  colorScheme="blue"
                  onClick={handleSubmit}
                  isLoading={batchStore.isSubmitting}
                  isDisabled={
                    isCompanyInactive ||
                    (creationMode === "upload" && !isEditMode ? !uploadCanSubmit : !manualCanSubmit)
                  }
                  px={8}
                >
                  {actionLabel}
                </Button>
              )}
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

export default BatchCreationModal;
