"use client";

import CustomInput from "@/app/component/config/component/customInput/CustomInput";
import ScormQuizReviewContent from "@/app/dashboard/course/scorm/ScormQuizReviewContent";
import {
  ScormAnswerSectionRecord,
  ScormInteractionReview,
} from "@/app/dashboard/course/scorm/quizReviewTypes";
import stores from "@/app/store/stores";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Progress,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure
} from "@chakra-ui/react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Eye,
  Filter,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import {
  EMPTY_LEARNER_RESULTS_FILTERS,
  LearnerCourseDetail,
  LearnerResultDetail,
  LearnerResultOption,
  LearnerResultRow,
  LearnerResultsFilters,
  LearnerUserResultRow,
} from "./types";

type Props = {
  role: "superadmin" | "admin" | "departmenthead";
  showHeader?: boolean;
};

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}

function statusMeta(status: string) {
  switch (status) {
    case "completed":
    case "passed":
      return { label: status === "passed" ? "Passed" : "Completed", color: "green" };
    case "failed":
      return { label: "Failed", color: "red" };
    case "incomplete":
    case "browsed":
    case "in_progress":
      return { label: "In progress", color: "blue" };
    case "not_available":
      return { label: "Not graded", color: "gray" };
    case "not_attempted":
    case "not attempted":
      return { label: "Not started", color: "gray" };
    default:
      return { label: "Not started", color: "gray" };
  }
}

function formatPercent(value?: number | null) {
  return value === null || value === undefined || Number.isNaN(Number(value))
    ? "N/A"
    : `${Math.round(Number(value))}%`;
}

function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options?: LearnerResultOption[];
  onChange: (value: string) => void;
}) {
  return (
    <CustomInput
      type="select"
      name={placeholder}
      label={placeholder}
      value={value ? options?.find((o) => o.value === value) || null : null}
      onChange={(selected: any) => onChange(selected ? selected.value : "")}
      options={options || []}
      placeholder={placeholder}
      isClear={true}
    />
  );
}

function LearnerResultsFiltersPanel({
  role,
  value,
  options,
  isLoading,
  onChange,
  onApply,
  onClear,
  onRefresh,
}: {
  role: "superadmin" | "admin" | "departmenthead";
  value: LearnerResultsFilters;
  options: {
    companies?: LearnerResultOption[];
    departments?: LearnerResultOption[];
    courses?: LearnerResultOption[];
    batches?: LearnerResultOption[];
    users?: LearnerResultOption[];
    
  };
  isLoading: boolean;
  onChange: (next: LearnerResultsFilters) => void;
  onApply: () => void;
  onClear: () => void;
  onRefresh: () => void;
}) {
  const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();
  const { isOpen: isDesktopOpen, onToggle: onDesktopToggle } = useDisclosure({ defaultIsOpen: false });
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const headingColor = useColorModeValue("gray.900", "white");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const isMobile =
    useBreakpointValue({
      base: true,
      xl: false,
    }) ?? true;
  const activeCount = Object.entries(value).filter(([key, filterValue]) => key !== "companyId" && Boolean(filterValue)).length;

  const update = (key: keyof LearnerResultsFilters, nextValue: string) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  const fields = (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "repeat(3, minmax(0, 1fr))",
      }}
      gap={3}
      sx={{
        "& label": {
          fontSize: "12px",
          fontWeight: "700",
        },
      }}
    >
      <Box gridColumn={{ base: "auto", md: "1 / -1" }}>
        <CustomInput
          type="text"
          name="search"
          label="Search"
          placeholder="Search learner, course, batch..."
          value={value.search}
          onChange={(event: any) => update("search", event.target.value)}
        />
      </Box>

      {role !== "departmenthead" ? (
        <FilterSelect
          value={value.departmentId}
          placeholder="All departments"
          options={options.departments}
          onChange={(nextValue) => update("departmentId", nextValue)}
        />
      ) : null}

      <FilterSelect
        value={value.courseId}
        placeholder="All courses"
        options={options.courses}
        onChange={(nextValue) => update("courseId", nextValue)}
      />

      <FilterSelect
        value={value.batchId}
        placeholder="All batches"
        options={options.batches}
        onChange={(nextValue) => update("batchId", nextValue)}
      />

      <FilterSelect
        value={value.userId}
        placeholder="All learners"
        options={options.users}
        onChange={(nextValue) => update("userId", nextValue)}
      />

      <FilterSelect
        value={value.completionStatus}
        placeholder="Any completion"
        options={[
          { value: "completed", label: "Completed" },
          { value: "in_progress", label: "In progress" },
          { value: "not_started", label: "Not started" },
        ]}
        onChange={(nextValue) => update("completionStatus", nextValue)}
      />

      <FilterSelect
        value={value.courseStatus}
        placeholder="Any course status"
        options={[
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
        ]}
        onChange={(nextValue) => update("courseStatus", nextValue)}
      />

      <FilterSelect
        value={value.passFail}
        placeholder="Any result"
        options={[
          { value: "passed", label: "Passed" },
          { value: "failed", label: "Failed" },
          { value: "not_available", label: "Not graded" },
        ]}
        onChange={(nextValue) => update("passFail", nextValue)}
      />

      <FilterSelect
        value={value.activityStatus}
        placeholder="Any activity"
        options={[
          { value: "active", label: "Active learners" },
          { value: "inactive", label: "Inactive learners" },
        ]}
        onChange={(nextValue) => update("activityStatus", nextValue)}
      />

      <CustomInput
        type="date"
        name="from"
        label="From date"
        value={value.from}
        onChange={(event: any) => update("from", event.target.value)}
      />

      <CustomInput
        type="date"
        name="to"
        label="To date"
        value={value.to}
        onChange={(event: any) => update("to", event.target.value)}
      />
    </Grid>
  );

  const actions = (
    <HStack w="100%" spacing={3} justify={{ base: "space-between", md: "flex-end" }}>
      <Button
        flex={{ base: 1, md: "none" }}
        variant="outline"
        size={{ base: "lg", md: "md" }}
        borderRadius="xl"
        onClick={onClear}
        isDisabled={!activeCount || isLoading}
        leftIcon={<RotateCcw size={18} />}
      >
        Clear
      </Button>
      <Button
        flex={{ base: 1, md: "none" }}
        colorScheme="purple"
        size={{ base: "lg", md: "md" }}
        borderRadius="xl"
        isLoading={isLoading}
        loadingText="Applying"
        onClick={() => {
          onApply();
          onMobileClose();
        }}
      >
        Apply filters
      </Button>
      <Button
        flex={{ base: 1, md: "none" }}
        size={{ base: "lg", md: "md" }}
        variant="ghost"
        leftIcon={<RefreshCw size={16} />}
        isLoading={isLoading}
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </HStack>
  );

  return (
    <>
      <Box
        bg={panelBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        p={4}
        boxShadow="sm"
        mb={4}
      >
        <HStack justify="space-between" cursor="pointer" onClick={onDesktopToggle} userSelect="none">
          <HStack spacing={2}>
            <Icon as={SlidersHorizontal} color="purple.500" boxSize={4} />
            <Text fontSize="sm" fontWeight="semibold" color={headingColor}>
              Filters
            </Text>
            {activeCount > 0 ? (
              <Badge colorScheme="purple" borderRadius="full">
                {activeCount}
              </Badge>
            ) : null}
          </HStack>

          {isMobile ? (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Filter size={15} />}
              onClick={(event) => {
                event.stopPropagation();
                onMobileOpen();
              }}
            >
              Filters
            </Button>
          ) : (
            <Icon as={isDesktopOpen ? ChevronUp : ChevronDown} color="gray.500" boxSize={5} />
          )}
        </HStack>

        <Box display={{ base: "none", xl: "block" }}>
          <Collapse in={isDesktopOpen} animateOpacity>
            <Box mt={4} pt={4} borderTopWidth="1px" borderColor={borderColor}>
              {fields}
              <HStack justify="flex-end" mt={3}>
                {actions}
              </HStack>
            </Box>
          </Collapse>
        </Box>
      </Box>

      <Drawer isOpen={isMobileOpen} placement="bottom" onClose={onMobileClose} size="full">
        <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <DrawerContent borderTopRadius="none" h="100vh" bg={panelBg}>
          <Box
            position="sticky"
            top={0}
            zIndex={10}
            bg={panelBg}
            borderBottomWidth="1px"
            borderColor={borderColor}
            px={{ base: 5, md: 8 }}
            pt={{ base: 6, md: 10 }}
            pb={{ base: 4, md: 6 }}
          >
            <HStack spacing={4} align="center">
              <IconButton
                aria-label="Close"
                icon={<ArrowLeft size={17} />}
                onClick={onMobileClose}
                variant="solid"
                borderRadius="full"
                w={{ base: "36px", md: "42px" }}
                h={{ base: "36px", md: "42px" }}
              />
              <Box>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" color={headingColor}>
                  Filters
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color={mutedColor} fontWeight="600" mt={0.5}>
                  Refine learner progress
                </Text>
              </Box>
            </HStack>
          </Box>

          <DrawerBody px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
            <Box maxW="800px" mx="auto">
              {fields}
            </Box>
          </DrawerBody>

          <Box
            position="sticky"
            bottom={0}
            zIndex={10}
            bg={panelBg}
            borderTopWidth="1px"
            borderColor={borderColor}
            px={{ base: 5, md: 8 }}
            py={{ base: 4, md: 6 }}
          >
            <Box maxW="800px" mx="auto">
              {actions}
            </Box>
          </Box>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ElementType;
  color: string;
}) {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  return (
    <Box bg={bg} borderWidth="1px" borderColor={border} borderRadius="xl" p={3.5} boxShadow="sm">
      <Flex justify="space-between" gap={3}>
        <Box minW={0}>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            {label}
          </Text>
          <Text mt={1} fontSize="xl" fontWeight="800">
            {value}
          </Text>
          <Text mt={1} fontSize="xs" color="gray.500" noOfLines={1}>
            {helper}
          </Text>
        </Box>
        <Flex
          boxSize="34px"
          borderRadius="lg"
          align="center"
          justify="center"
          bg={`${color}.50`}
          color={`${color}.600`}
          flexShrink={0}
        >
          <Icon as={icon} boxSize={4} />
        </Flex>
      </Flex>
    </Box>
  );
}

function InsightList({
  title,
  rows,
  value,
  empty,
}: {
  title: string;
  rows?: LearnerResultRow[];
  value: (row: LearnerResultRow) => string;
  empty: string;
}) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  return (
    <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={3.5}>
      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em">
        {title}
      </Text>
      {(rows || []).length ? (
        <Stack spacing={2.5} mt={3}>
          {(rows || []).slice(0, 3).map((row, index) => (
            <Flex
              key={`${title}-${row.enrollmentId}`}
              justify="space-between"
              gap={3}
              pb={index === Math.min(rows?.length || 0, 3) - 1 ? 0 : 2.5}
              borderBottomWidth={index === Math.min(rows?.length || 0, 3) - 1 ? "0" : "1px"}
              borderColor={borderColor}
            >
              <Box minW={0}>
                <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{row.learner.name}</Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>{row.course.title}</Text>
              </Box>
              <Badge alignSelf="center" borderRadius="full" colorScheme="purple">
                {value(row)}
              </Badge>
            </Flex>
          ))}
        </Stack>
      ) : (
        <Text mt={3} fontSize="xs" color="gray.500">{empty}</Text>
      )}
    </Box>
  );
}

function formatOptionAnswer(
  labelValue?: string,
  textValue?: string | null,
  fallbackValue?: string
) {
  const label = String(labelValue || "").trim();
  const text = String(textValue || "").trim();
  const fallback = String(fallbackValue || "").trim();

  if (label && text && label.toLowerCase() !== text.toLowerCase()) {
    return `${label}. ${text}`;
  }

  return text || label || fallback || "Not answered";
}

function ManualQuizAnswerDetails({
  sections,
}: {
  sections: ScormAnswerSectionRecord[];
}) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const surfaceBg = useColorModeValue("white", "gray.800");
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const correctBg = useColorModeValue("green.50", "green.900");
  const headerBg = useColorModeValue("purple.50", "whiteAlpha.100");

  if (!sections.length) return null;

  return (
    <Accordion allowMultiple>
      <Stack spacing={2}>
        {sections.map((section) => (
          <AccordionItem
            key={section._id}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            overflow="hidden"
          >
            <AccordionButton bg={headerBg} px={3} py={2.5} _hover={{ bg: headerBg }}>
              <Flex flex="1" justify="space-between" gap={3} align="center" minW={0}>
                <Box textAlign="left" minW={0}>
                  <HStack spacing={2}>
                    <Badge colorScheme="purple" borderRadius="full">Manual Quiz</Badge>
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                      {section.sectionTitle || "Course quiz"}
                    </Text>
                  </HStack>
                  <Text mt={0.5} fontSize="xs" color="gray.500" noOfLines={1}>
                    {section.moduleTitle || "Course level"} | Attempt #{section.attempts} | {section.interactions.length} questions
                  </Text>
                </Box>
                <HStack flexShrink={0}>
                  <Text fontSize="xs" fontWeight="bold">
                    {section.awardedMarks || 0}/{section.possibleMarks || 0}
                  </Text>
                  <AccordionIcon />
                </HStack>
              </Flex>
            </AccordionButton>

            <AccordionPanel p={2.5}>
              <Stack spacing={2}>
                {(section.interactions || []).map((interaction: ScormInteractionReview, index) => {
                  const isCorrect =
                    interaction.result === "correct" ||
                    interaction.review?.evaluation === "correct";
                  const selectedAnswer = formatOptionAnswer(
                    interaction.learnerResponse,
                    interaction.learnerResponseText,
                    interaction.learnerResponseRaw
                  );
                  const correctAnswer = formatOptionAnswer(
                    interaction.correctResponses?.[0],
                    interaction.correctResponseTexts?.[0],
                    interaction.correctResponsesRaw?.[0]
                  );
                  const marks = Number(interaction.review?.marks || 0);
                  const maxMarks = Number(interaction.maxMarks || 0);

                  return (
                    <Box
                      key={interaction.uniqueKey || interaction._id}
                      bg={surfaceBg}
                      borderWidth="1px"
                      borderColor={isCorrect ? "green.200" : "red.200"}
                      borderRadius="lg"
                      p={3}
                    >
                      <Flex justify="space-between" gap={2} align="flex-start">
                        <Box minW={0}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                            Question {index + 1}
                          </Text>
                          <Text mt={1} fontSize="sm" fontWeight="semibold">
                            {interaction.questionPrompt || interaction.questionTitle || interaction.question || `Question ${index + 1}`}
                          </Text>
                        </Box>
                        <Badge colorScheme={isCorrect ? "green" : "red"} borderRadius="full" flexShrink={0}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      </Flex>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} mt={2}>
                        <Box bg={selectedBg} borderRadius="md" px={2.5} py={2}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                            Selected
                          </Text>
                          <Text mt={0.5} fontSize="xs">{selectedAnswer}</Text>
                        </Box>
                        <Box bg={correctBg} borderRadius="md" px={2.5} py={2}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
                            Correct answer
                          </Text>
                          <Text mt={0.5} fontSize="xs">{correctAnswer}</Text>
                        </Box>
                      </SimpleGrid>

                      <Text mt={2} fontSize="2xs" color="gray.500" fontWeight="semibold">
                        Marks {marks}/{maxMarks}
                      </Text>
                    </Box>
                  );
                })}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Stack>
    </Accordion>
  );
}

function selectAnswerSections(
  sections: ScormAnswerSectionRecord[],
  source: "manual" | "scorm"
) {
  return sections
    .map((section) => ({
      ...section,
      interactions: (section.interactions || []).filter((interaction) =>
        source === "manual"
          ? interaction.source === "course_quiz"
          : interaction.source !== "course_quiz"
      ),
    }))
    .filter((section) => section.interactions.length > 0);
}

const LearnerResultsWorkspace = observer(({ role, showHeader = true }: Props) => {
  const {
    dashboardStore: {
      learnerResults,
      learnerResultsLoading,
      learnerResultsError,
      learnerResultDetail,
      learnerResultDetailLoading,
      fetchLearnerResults,
      fetchLearnerResultDetail,
      clearLearnerResultDetail,
    },
    companyStore,
  } = stores;
  const [filters, setFilters] = useState<LearnerResultsFilters>(EMPTY_LEARNER_RESULTS_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<LearnerResultsFilters>(
    EMPTY_LEARNER_RESULTS_FILTERS
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortBy, setSortBy] = useState("lastActivity");
  const [sortOrder, setSortOrder] = useState("desc");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedBg = useColorModeValue("gray.50", "gray.900");
  const scopedCompanyId = role === "superadmin" ? companyStore.getActiveCompanyId() : "";

  const params = useMemo(
    () => {
      const filteredParams = Object.fromEntries(
        Object.entries(appliedFilters).filter(([key, value]) => Boolean(value) && key !== "companyId")
      );
      return {
        ...filteredParams,
        ...(role === "superadmin" && scopedCompanyId ? { companyId: scopedCompanyId } : {}),
        page: String(page),
        limit: String(pageSize),
        sortBy,
        sortOrder,
      };
    },
    [appliedFilters, page, pageSize, role, scopedCompanyId, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchLearnerResults(params).catch(() => undefined);
  }, [fetchLearnerResults, params]);

  useEffect(() => {
    if (role === "superadmin" && !companyStore.companies.data?.length) {
      companyStore.getManagedCompanies().catch(() => undefined);
    }
  }, [companyStore, role]);

  useEffect(() => {
    if (role !== "superadmin") return;

    const resetScopedFields = (current: LearnerResultsFilters) => ({
      ...current,
      departmentId: "",
      courseId: "",
      batchId: "",
      userId: "",
    });

    setFilters((current) => resetScopedFields(current));
    setAppliedFilters((current) => resetScopedFields(current));
    setPage(1);
  }, [role, scopedCompanyId]);

  const updateFilter = (key: keyof LearnerResultsFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const openDetail = async (row: LearnerUserResultRow) => {
    clearLearnerResultDetail();
    onOpen();
    await fetchLearnerResultDetail(
      row.userId,
      role === "superadmin" && scopedCompanyId ? { companyId: scopedCompanyId } : {}
    ).catch(() => undefined);
  };

  const closeDetail = () => {
    onClose();
    clearLearnerResultDetail();
  };

  const summary = learnerResults?.summary;
  const options = learnerResults?.filterOptions || {};
  const rows = learnerResults?.results || [];
  const pagination = learnerResults?.pagination;
  const passTotal = Number(summary?.passed || 0) + Number(summary?.failed || 0);
  const passRate = passTotal ? Math.round((Number(summary?.passed || 0) / passTotal) * 100) : 0;

  return (
    <Box
      bg={panelBg}
      p={{ base: 3, md: 2.5, xl: 4 }}
    >
      <LearnerResultsFiltersPanel
        role={role}
        value={filters}
        options={options}
        isLoading={learnerResultsLoading}
        onChange={setFilters}
        onApply={() => {
          setAppliedFilters(filters);
          setPage(1);
        }}
        onClear={() => {
          setFilters(EMPTY_LEARNER_RESULTS_FILTERS);
          setAppliedFilters(EMPTY_LEARNER_RESULTS_FILTERS);
          setPage(1);
        }}
        onRefresh={() => {
          fetchLearnerResults(params).catch(() => undefined);
        }}
      />

      <Flex justify="space-between" align="center" mb={4} gap={2} wrap="wrap">
        <HStack>
          <Select
            size="xs"
            borderRadius="lg"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setPage(1);
            }}
            bg={panelBg}
            w="150px"
          >
            <option value="lastActivity">Last activity</option>
            <option value="submissionDate">Submission date</option>
            <option value="averageScore">Average score</option>
            <option value="averageProgress">Average progress</option>
            <option value="totalCourses">Total courses</option>
            <option value="completedCourses">Completed courses</option>
            <option value="completionDate">Completion date</option>
            <option value="learnerName">Learner name</option>
          </Select>
          <Select
            size="xs"
            borderRadius="lg"
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value);
              setPage(1);
            }}
            bg={panelBg}
            w="110px"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
        </HStack>
      </Flex>

      {learnerResultsError ? (
        <Alert status="error" borderRadius="xl" mb={4} py={2}>
          <AlertIcon />
          <Text fontSize="sm">{learnerResultsError}</Text>
        </Alert>
      ) : null}

      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} spacing={2.5} mb={4}>
        <SummaryCard
          label="Learners"
          value={summary?.totalUsers ?? summary?.totalResults ?? 0}
          helper={`${summary?.totalCourses || 0} enrolled courses`}
          icon={Users}
          color="purple"
        />
        <SummaryCard
          label="Average progress"
          value={summary?.averageProgress === null || summary?.averageProgress === undefined ? "N/A" : `${Math.round(summary.averageProgress)}%`}
          helper={`${summary?.completedCourses ?? summary?.completed ?? 0} completed courses`}
          icon={BarChart3}
          color="blue"
        />
        <SummaryCard
          label="Average score"
          value={summary?.averageScore === null || summary?.averageScore === undefined ? "N/A" : `${Math.round(summary.averageScore)}%`}
          helper="Across graded attempts"
          icon={Target}
          color="pink"
        />
        <SummaryCard
          label="Passed"
          value={summary?.passed || 0}
          helper={`${passRate}% of graded courses`}
          icon={CheckCircle2}
          color="green"
        />
        <SummaryCard
          label="Failed"
          value={summary?.failed || 0}
          helper="May need follow-up"
          icon={XCircle}
          color="red"
        />
        <SummaryCard
          label="In progress"
          value={summary?.inProgressCourses || 0}
          helper={`${summary?.notStartedCourses || 0} not started`}
          icon={ClipboardCheck}
          color="orange"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "repeat(3, minmax(0, 1fr))" }} gap={3} mb={4}>
        <InsightList
          title="Recent submissions"
          rows={summary?.recentSubmissions}
          value={(row) => `${row.answerCount} answers`}
          empty="No submitted answers are available yet."
        />
        <InsightList
          title="Low score learners"
          rows={summary?.lowScoreLearners}
          value={(row) => `${Math.round(row.score || 0)}%`}
          empty="No learners currently fall below 60%."
        />
        <InsightList
          title="Recently completed"
          rows={summary?.recentlyCompleted}
          value={(row) => formatDate(row.completionDate).split(",")[0]}
          empty="No recent course completions are available."
        />
      </Grid>

      {learnerResultsLoading && !learnerResults ? (
        <Stack spacing={2}>
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} height="54px" borderRadius="lg" />
          ))}
        </Stack>
      ) : rows.length ? (
        <>
          <TableContainer display={{ base: "none", md: "block" }}>
        <Table size="sm">
  <Thead>
    <Tr>
      <Th pl={0}>Learner</Th>
      {role === "superadmin" ? <Th>Company</Th> : null}
      <Th>Total</Th>
      <Th>Completed</Th>
      <Th>In Progress</Th>
      <Th>Not Started</Th>
      <Th pr={0} />
    </Tr>
  </Thead>
  <Tbody>
    {rows.map((row) => {
      return (
        <Tr key={row.userId}>
          <Td pl={0}>
            <HStack>
              <Avatar size="xs" name={row.learner.name} />
              <Box minW={0}>
                <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                  {row.learner.name}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {row.learner.email || row.learner.mobileNumber || "No contact details"}
                </Text>
                <Text fontSize="xs" color="gray.400" noOfLines={1}>
                  {row.learner.department}
                </Text>
              </Box>
            </HStack>
          </Td>
          {role === "superadmin" ? (
            <Td>
              <Text fontSize="sm" noOfLines={1}>
                {row.company.name}
              </Text>
            </Td>
          ) : null}
          <Td>
            <Badge colorScheme="purple" borderRadius="full">
              {row.totalCourses} total
            </Badge>
          </Td>
          <Td>
            <Badge colorScheme="green" borderRadius="full">
              {row.completedCourses} completed
            </Badge>
          </Td>
          <Td>
            <Badge colorScheme="blue" borderRadius="full">
              {row.inProgressCourses} in progress
            </Badge>
          </Td>
          <Td>
            <Badge colorScheme="gray" borderRadius="full">
              {row.notStartedCourses} not started
            </Badge>
          </Td>
          <Td pr={0} textAlign="right">
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<Eye size={13} />}
              onClick={() => void openDetail(row)}
            >
              Review
            </Button>
          </Td>
        </Tr>
      );
    })}
  </Tbody>
</Table>
          </TableContainer>

          <Stack display={{ base: "flex", md: "none" }} spacing={3}>
            {rows.map((row) => {
              return (
                <Box key={row.userId} borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={3}>
                  <Flex justify="space-between" gap={3}>
                    <HStack minW={0}>
                      <Avatar size="sm" name={row.learner.name} />
                      <Box minW={0}>
                        <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{row.learner.name}</Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {row.learner.email || row.learner.mobileNumber || "No contact details"}
                        </Text>
                        <Text fontSize="xs" color="gray.400" noOfLines={1}>{row.learner.department}</Text>
                      </Box>
                    </HStack>
                    <Badge colorScheme={row.learner.isActive ? "green" : "gray"} borderRadius="full" alignSelf="flex-start">
                      {row.learner.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </Flex>
                  <HStack mt={3} spacing={1.5} flexWrap="wrap">
                    <Badge colorScheme="purple" borderRadius="full">{row.totalCourses} total</Badge>
                    <Badge colorScheme="green" borderRadius="full">{row.completedCourses} completed</Badge>
                    <Badge colorScheme="blue" borderRadius="full">{row.inProgressCourses} in progress</Badge>
                    <Badge colorScheme="gray" borderRadius="full">{row.notStartedCourses} not started</Badge>
                  </HStack>
                  <Flex justify="flex-end" align="center" mt={3}>
                    {/*
                    <Text fontSize="xs" color="gray.500">
                      Avg score {row.averageScore === null ? "N/A" : `${Math.round(row.averageScore || 0)}%`} | {row.answerCount} answers
                    </Text>
                    */}
                    {/*
                      Score {row.score === null ? "N/A" : `${Math.round(row.score)}%`} · {row.answerCount} answers
                    */}
                    <Button size="xs" variant="ghost" leftIcon={<Eye size={13} />} onClick={() => void openDetail(row)}>
                      Review
                    </Button>
                  </Flex>
                </Box>
              );
            })}
          </Stack>

          <Flex justify="space-between" align="center" mt={4} gap={3} wrap="wrap">
            <Text fontSize="xs" color="gray.500">
              {pagination?.total || 0} learners
            </Text>
            <HStack>
              <Select
                size="xs"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                borderRadius="lg"
                w="82px"
                aria-label="Rows per page"
              >
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </Select>
              <Button
                size="xs"
                variant="outline"
                leftIcon={<ChevronLeft size={13} />}
                isDisabled={(pagination?.page || 1) <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Text fontSize="xs">
                {pagination?.page || 1}/{pagination?.totalPages || 1}
              </Text>
              <Button
                size="xs"
                variant="outline"
                rightIcon={<ChevronRight size={13} />}
                isDisabled={(pagination?.page || 1) >= (pagination?.totalPages || 1)}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      ) : (
        <Box py={10} textAlign="center" borderWidth="1px" borderColor={borderColor} borderRadius="xl">
          <Text fontSize="sm" fontWeight="semibold">No learner results found</Text>
          <Text mt={1} fontSize="xs" color="gray.500">
            Try clearing filters or wait for learners to begin assigned courses.
          </Text>
        </Box>
      )}

      <LearnerUserDetailDrawer
        detail={learnerResultDetail as LearnerResultDetail | null}
        isLoading={learnerResultDetailLoading}
        isOpen={isOpen}
        onClose={closeDetail}
      />
    </Box>
  );
});

function LearnerCourseAccordion({ course }: { course: LearnerCourseDetail }) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedBg = useColorModeValue("gray.50", "gray.900");
  const surfaceBg = useColorModeValue("white", "gray.800");
  const courseStatus = statusMeta(course.status);
  const result = statusMeta(course.passStatus);
  const manualAnswerSections = selectAnswerSections(course.answerSections || [], "manual");
  const scormAnswerSections = selectAnswerSections(course.answerSections || [], "scorm");
  const manualQuestionCount = manualAnswerSections.reduce((total, section) => total + section.interactions.length, 0);
  const scormQuestionCount = scormAnswerSections.reduce((total, section) => total + section.interactions.length, 0);

  return (
    <AccordionItem borderWidth="1px" borderColor={borderColor} borderRadius="xl" overflow="hidden">
      <AccordionButton px={3.5} py={3} _hover={{ bg: mutedBg }}>
        <Flex flex="1" justify="space-between" align="center" gap={3} minW={0}>
          <Box textAlign="left" minW={0}>
            <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{course.course.title}</Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {course.batches.map((batch) => batch.name).join(", ") || "Direct assignment"} | {course.course.status}
            </Text>
          </Box>
          <HStack flexShrink={0} spacing={1.5}>
            <Badge colorScheme={courseStatus.color} borderRadius="full">{courseStatus.label}</Badge>
            <Badge colorScheme={result.color} borderRadius="full">{result.label}</Badge>
            <AccordionIcon />
          </HStack>
        </Flex>
      </AccordionButton>
      <AccordionPanel px={3} pb={3} pt={0}>
        <Stack spacing={3}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2.5}>
            <SummaryCard label="Progress" value={`${Math.round(course.progressPercent)}%`} helper={`${course.completedSections}/${course.totalSections} sections`} icon={BarChart3} color="blue" />
            <SummaryCard label="Score" value={course.score === null ? "N/A" : `${Math.round(course.score)}%`} helper={course.passThreshold === null ? "No pass threshold" : `Pass at ${Math.round(course.passThreshold)}%`} icon={Target} color="pink" />
            <SummaryCard label="Attempts" value={course.attempts} helper={`${course.quizAttempts} quiz | ${course.scormAttempts} SCORM`} icon={ClipboardCheck} color="purple" />
            <SummaryCard label="Time spent" value={course.timeSpent || "00:00:00"} helper={`Submitted ${formatDate(course.submissionDate)}`} icon={Users} color="teal" />
          </SimpleGrid>

          <Accordion allowMultiple>
            <Stack spacing={2.5}>
              <AccordionItem borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
                <AccordionButton px={3.5} py={3} _hover={{ bg: mutedBg }}>
                  <Flex flex="1" justify="space-between" align="center" gap={3}>
                    <Box textAlign="left">
                      <Text fontSize="sm" fontWeight="bold">Modules and sections</Text>
                      <Text fontSize="xs" color="gray.500">Progress across {course.modules?.length || 0} modules</Text>
                    </Box>
                    <HStack>
                      <Badge colorScheme="blue" borderRadius="full">{course.completedSections}/{course.totalSections}</Badge>
                      <AccordionIcon />
                    </HStack>
                  </Flex>
                </AccordionButton>
                <AccordionPanel px={3} pb={3} pt={0}>
                  <Stack spacing={2}>
                    {(course.modules || []).length ? (
                      course.modules?.map((module) => (
                        <Box key={module.moduleId} bg={mutedBg} borderRadius="lg" px={3} py={2.5}>
                          <Flex justify="space-between" gap={3} align="flex-start">
                            <Box minW={0} flex="1">
                              <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{module.title}</Text>
                              <HStack mt={1} spacing={2} flexWrap="wrap">
                                <Badge colorScheme="blue" borderRadius="full">{module.sectionsCompleted}/{module.sectionCount} sections</Badge>
                                <Badge colorScheme="purple" borderRadius="full">Score {formatPercent(module.score)}</Badge>
                                <Badge colorScheme="gray" borderRadius="full">{module.totalTime || "00:00:00"}</Badge>
                              </HStack>
                            </Box>
                            <Text fontSize="xs" fontWeight="bold" flexShrink={0}>{Math.round(module.progress || 0)}%</Text>
                          </Flex>
                          <Progress mt={2} value={module.progress || 0} size="xs" colorScheme="blue" borderRadius="full" />
                          {(module.sections || []).length ? (
                            <Stack mt={2.5} spacing={2}>
                              {module.sections.map((section) => {
                                const sectionResult = statusMeta(section.lessonStatus);
                                return (
                                  <Box key={section.sectionId} bg={surfaceBg} borderWidth="1px" borderColor={borderColor} borderRadius="md" px={2.5} py={2}>
                                    <Flex justify="space-between" gap={3} align="flex-start">
                                      <Box minW={0}>
                                        <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>{section.title}</Text>
                                        <HStack mt={1} spacing={2} flexWrap="wrap">
                                          <Badge colorScheme={sectionResult.color} borderRadius="full">{sectionResult.label}</Badge>
                                          <Badge colorScheme="gray" borderRadius="full">{section.contentType || "other"}</Badge>
                                          <Text fontSize="2xs" color="gray.500">Attempts {section.attempts || 0}</Text>
                                          <Text fontSize="2xs" color="gray.500">Time {section.totalTime || "00:00:00"}</Text>
                                          <Text fontSize="2xs" color="gray.500">Last {formatDate(section.lastAccessed)}</Text>
                                        </HStack>
                                      </Box>
                                      <Box textAlign="right" flexShrink={0}>
                                        <Text fontSize="2xs" color="gray.500">Score</Text>
                                        <Text fontSize="xs" fontWeight="bold">{formatPercent(section.score)}</Text>
                                      </Box>
                                    </Flex>
                                    <Progress mt={2} value={section.progress || 0} size="xs" colorScheme={section.progress >= 100 ? "green" : "blue"} borderRadius="full" />
                                  </Box>
                                );
                              })}
                            </Stack>
                          ) : null}
                        </Box>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">No module progress has been recorded.</Text>
                    )}
                  </Stack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
                <AccordionButton px={3.5} py={3} _hover={{ bg: mutedBg }}>
                  <Flex flex="1" justify="space-between" align="center" gap={3}>
                    <Box textAlign="left">
                      <Text fontSize="sm" fontWeight="bold">Course creator quizzes</Text>
                      <Text fontSize="xs" color="gray.500">Scores, submitted answers, and marked options</Text>
                    </Box>
                    <HStack>
                      <Badge colorScheme="purple" borderRadius="full">{manualQuestionCount} questions</Badge>
                      <AccordionIcon />
                    </HStack>
                  </Flex>
                </AccordionButton>
                <AccordionPanel px={3} pb={3} pt={0}>
                  {manualAnswerSections.length ? (
                    <ManualQuizAnswerDetails sections={manualAnswerSections} />
                  ) : (course.manualQuizResults || []).length ? (
                    <Stack spacing={2}>
                      {(course.manualQuizResults || []).map((quiz) => (
                        <Flex key={quiz._id} bg={mutedBg} borderRadius="lg" px={3} py={2.5} justify="space-between" gap={3}>
                          <Box minW={0}>
                            <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{quiz.title}</Text>
                            <Text fontSize="xs" color="gray.500">{quiz.moduleTitle || "Course level"} | Attempt #{quiz.attemptNumber} | {formatDate(quiz.submittedAt)}</Text>
                          </Box>
                          <Text fontSize="xs" fontWeight="bold" flexShrink={0}>{quiz.score}/{quiz.maxScore}</Text>
                        </Flex>
                      ))}
                    </Stack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">No course creator quiz attempts are available.</Text>
                  )}
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
                <AccordionButton px={3.5} py={3} _hover={{ bg: mutedBg }}>
                  <Flex flex="1" justify="space-between" align="center" gap={3}>
                    <Box textAlign="left">
                      <Text fontSize="sm" fontWeight="bold">SCORM activity and quiz answers</Text>
                      <Text fontSize="xs" color="gray.500">Recorded SCORM responses, results, and marks</Text>
                    </Box>
                    <HStack>
                      <Badge colorScheme="teal" borderRadius="full">{scormQuestionCount} questions</Badge>
                      <AccordionIcon />
                    </HStack>
                  </Flex>
                </AccordionButton>
                <AccordionPanel px={3} pb={3} pt={0}>
                  <ScormQuizReviewContent
                    sections={scormAnswerSections}
                    mode="learner"
                    compact
                    emptyState="No SCORM quiz answers have been recorded for this learner and course."
                    progressSummary={{
                      progressPercent: course.progressPercent,
                      sectionsCompleted: course.completedSections,
                      totalSections: course.totalSections,
                    }}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Stack>
          </Accordion>
        </Stack>
      </AccordionPanel>
    </AccordionItem>
  );
}

function LearnerUserDetailDrawer({
  detail,
  isLoading,
  isOpen,
  onClose,
}: {
  detail: LearnerResultDetail | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedBg = useColorModeValue("gray.50", "gray.900");

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} pr={12}>
          <Text fontSize="md">Learner progress detail</Text>
          <Text fontSize="xs" color="gray.500" fontWeight="normal">
            Enrolled courses, progress, quiz attempts, and SCORM tracking
          </Text>
        </DrawerHeader>
        <DrawerBody py={5}>
          {isLoading && !detail ? (
            <Stack spacing={4}>
              <Skeleton height="100px" borderRadius="xl" />
              <Skeleton height="180px" borderRadius="xl" />
              <Skeleton height="280px" borderRadius="xl" />
            </Stack>
          ) : detail ? (
            <Stack spacing={5}>
              <Box bg={mutedBg} borderRadius="xl" p={4}>
                <Flex justify="space-between" gap={4} wrap="wrap">
                  <HStack>
                    <Avatar name={detail.learner.name} />
                    <Box>
                      <Text fontWeight="bold">{detail.learner.name}</Text>
                      <Text fontSize="xs" color="gray.500">{detail.learner.email || "No email"}</Text>
                      {detail.learner.mobileNumber ? (
                        <Text fontSize="xs" color="gray.500">{detail.learner.mobileNumber}</Text>
                      ) : null}
                      <Text fontSize="xs" color="gray.500">
                        {detail.company.name} | {detail.learner.department}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack spacing={1.5} flexWrap="wrap" alignSelf="flex-start">
                    <Badge colorScheme="purple" borderRadius="full">{detail.totalCourses} total</Badge>
                    <Badge colorScheme="green" borderRadius="full">{detail.completedCourses} completed</Badge>
                    <Badge colorScheme="blue" borderRadius="full">{detail.inProgressCourses} in progress</Badge>
                    <Badge colorScheme="gray" borderRadius="full">{detail.notStartedCourses} not started</Badge>
                  </HStack>
                </Flex>
              </Box>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2.5}>
                <SummaryCard label="Courses" value={detail.totalCourses} helper={`${detail.completedCourses} completed`} icon={ClipboardCheck} color="purple" />
                <SummaryCard label="Avg progress" value={formatPercent(detail.averageProgress)} helper={`${detail.inProgressCourses} in progress`} icon={BarChart3} color="blue" />
                <SummaryCard label="Avg score" value={formatPercent(detail.averageScore)} helper={`${detail.passed} passed | ${detail.failed} failed`} icon={Target} color="pink" />
                <SummaryCard label="Activity" value={detail.answerCount} helper={`Last ${formatDate(detail.lastActivity)}`} icon={Users} color="teal" />
              </SimpleGrid>

              {(detail.courses || []).length ? (
                <Accordion allowMultiple>
                  <Stack spacing={2.5}>
                    {detail.courses.map((course) => (
                      <LearnerCourseAccordion key={course.enrollmentId} course={course} />
                    ))}
                  </Stack>
                </Accordion>
              ) : (
                <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={4} textAlign="center">
                  <Text fontSize="sm" color="gray.500">No courses are enrolled for this learner yet.</Text>
                </Box>
              )}
            </Stack>
          ) : (
            <Alert status="error" borderRadius="xl">
              <AlertIcon />
              Unable to load this learner detail.
            </Alert>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default LearnerResultsWorkspace;
