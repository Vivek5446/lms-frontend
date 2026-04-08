"use client";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  CircularProgress,
  CircularProgressLabel,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { BookOpen, CheckCircle, Clock, GraduationCap, LayoutGrid, TrendingUp } from "lucide-react";
import ScormQuizReviewContent from "./ScormQuizReviewContent";

// ─── Types (adapt to your actual store shape) ────────────────────────────────

type LearnerReviewDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  managerStore: any;
  selectedCourse: any;
  selectCourse: (courseId: string) => Promise<void>;
  submitReview: (trackingId: string, interaction: any, evaluation: "correct" | "incorrect") => void | Promise<void>;
  selectedCourseId: string;
  isAnswersLoading: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatScore(score?: number | null) {
  if (score == null || isNaN(score)) return "—";
  return `${Math.round(score)}%`;
}

function formatTime(seconds?: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function getProgressColor(progress: number) {
  if (progress >= 80) return "green";
  if (progress >= 50) return "yellow";
  return "red";
}

function summarizeCourseSections(modules: any[] = []) {
  const sections = modules.flatMap((moduleRecord) => moduleRecord.sections || []);
  const completed = sections.filter((sectionRecord) => {
    const normalizedStatus = String(sectionRecord.lessonStatus || "").toLowerCase();
    return normalizedStatus === "completed" || normalizedStatus === "passed";
  }).length;

  return {
    total: sections.length,
    completed,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.500", "gray.400");
  return (
    <Box bg={bg} borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
      <HStack spacing={2} mb={2}>
        <Box color={accent || muted}>{icon}</Box>
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color={muted} fontWeight="600">
          {label}
        </Text>
      </HStack>
      <Text fontSize="lg" fontWeight="bold" color={accent}>
        {value}
      </Text>
    </Box>
  );
}

function ProgressRing({ value }: { value: number }) {
  const color = getProgressColor(value);
  return (
    <CircularProgress value={value} color={`${color}.400`} trackColor="gray.100" size="52px" thickness="8px">
      <CircularProgressLabel fontSize="10px" fontWeight="bold">
        {Math.round(value)}%
      </CircularProgressLabel>
    </CircularProgress>
  );
}

function SectionRow({ sectionRecord }: { sectionRecord: any }) {
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.500", "gray.400");
  const bg = useColorModeValue("white", "gray.800");
  const statusColor = sectionRecord.lessonStatus?.includes("complete") ? "green" : "gray";

  return (
    <Flex
      align="center"
      gap={4}
      px={4}
      py={3}
      bg={bg}
      borderWidth="1px"
      borderColor={border}
      borderRadius="lg"
    >
      <Box flex="1" minW={0}>
        <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
          {sectionRecord.title}
        </Text>
        <HStack spacing={3} mt={1} flexWrap="wrap">
          <Badge colorScheme={statusColor} fontSize="10px" borderRadius="full" px={2}>
            {sectionRecord.lessonStatus?.replace(/_/g, " ") || "not started"}
          </Badge>
          <Text fontSize="xs" color={muted}>
            Score: {formatScore(sectionRecord.score)}
          </Text>
          <Text fontSize="xs" color={muted}>
            Attempts: {sectionRecord.attempts}
          </Text>
          <Text fontSize="xs" color={muted}>
            Time: {formatTime(sectionRecord.totalTime)}
          </Text>
        </HStack>
      </Box>
      <ProgressRing value={sectionRecord.progress} />
    </Flex>
  );
}

function ModuleAccordionItem({ moduleRecord }: { moduleRecord: any }) {
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.500", "gray.400");
  const headerBg = useColorModeValue("gray.50", "gray.750");

  return (
    <AccordionItem
      borderWidth="1px"
      borderColor={border}
      borderRadius="xl"
      mb={3}
      overflow="hidden"
    >
      <AccordionButton py={4} px={5} bg={headerBg} _hover={{ bg: headerBg }} _expanded={{ bg: headerBg }}>
        <Flex flex="1" align="center" gap={4}>
          <ProgressRing value={moduleRecord.progress} />
          <Box flex="1" textAlign="left">
            <Text fontWeight="semibold" fontSize="sm">
              {moduleRecord.title}
            </Text>
            <HStack spacing={3} mt={1}>
              <Text fontSize="xs" color={muted}>
                Score: {formatScore(moduleRecord.score)}
              </Text>
              <Text fontSize="xs" color={muted}>
                Attempts: {moduleRecord.attempts}
              </Text>
              <Text fontSize="xs" color={muted}>
                {moduleRecord.sections?.length || 0} sections
              </Text>
            </HStack>
          </Box>
          <AccordionIcon color={muted} />
        </Flex>
      </AccordionButton>
      <AccordionPanel p={4}>
        <Stack spacing={2}>
          {moduleRecord.sections?.map((sec: any) => (
            <SectionRow key={sec.sectionId} sectionRecord={sec} />
          ))}
        </Stack>
      </AccordionPanel>
    </AccordionItem>
  );
}

function CourseCard({
  course,
  isActive,
  onSelect,
}: {
  course: any;
  isActive: boolean;
  onSelect: () => void;
}) {
  const border = useColorModeValue("gray.200", "gray.700");
  const activeBg = useColorModeValue("teal.50", "teal.900");
  const bg = useColorModeValue("white", "gray.800");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      borderWidth="2px"
      borderColor={isActive ? "teal.400" : border}
      borderRadius="xl"
      p={4}
      bg={isActive ? activeBg : bg}
      cursor="pointer"
      onClick={onSelect}
      transition="all 0.15s"
      _hover={{ borderColor: "teal.300", shadow: "sm" }}
      position="relative"
    >
      {isActive && (
        <Box
          position="absolute"
          top={3}
          right={3}
          w={2}
          h={2}
          borderRadius="full"
          bg="teal.400"
        />
      )}
      <Flex justify="space-between" align="flex-start" gap={3}>
        <Box flex="1" minW={0}>
          <Text fontWeight="semibold" fontSize="sm" noOfLines={2} mb={2}>
            {course.title}
          </Text>
          <VStack align="stretch" spacing={1}>
            <HStack spacing={2}>
              <Text fontSize="xs" color={muted}>
                Score:
              </Text>
              <Text fontSize="xs" fontWeight="medium">
                {formatScore(course.score)}
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Text fontSize="xs" color={muted}>
                Attempts:
              </Text>
              <Text fontSize="xs" fontWeight="medium">
                {course.attempts}
              </Text>
            </HStack>
            {course.answerSummary && course.answerSummary.pending > 0 && (
              <HStack spacing={2}>
                <Badge colorScheme="orange" fontSize="9px" borderRadius="full" px={2}>
                  {course.answerSummary.pending} pending
                </Badge>
              </HStack>
            )}
          </VStack>
        </Box>
        <ProgressRing value={course.progress} />
      </Flex>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LearnerReviewDrawer({
  isOpen,
  onClose,
  managerStore,
  selectedCourse,
  selectedCourseId,   // ✅ use this for isActive checks — always in sync with the click
  isAnswersLoading,   // ✅ use this for answers-loading state — set before fetch begins
  selectCourse,
  submitReview,
}: LearnerReviewDrawerProps) {
  const muted = useColorModeValue("gray.500", "gray.400");
  const divider = useColorModeValue("gray.100", "gray.700");

  const learner = managerStore.learnerProgress?.learner;
  const summary = managerStore.learnerProgress?.summary;
  const courses = managerStore.learnerProgress?.courses || [];
  const selectedCourseSectionSummary = summarizeCourseSections(selectedCourse?.modules || []);

  // ✅ Combine both loading signals:
  //    isAnswersLoading  → parent set it true the moment user clicked (pre-fetch)
  //    isLearnerAnswersLoading → store's own in-flight flag
  //    This ensures the spinner shows with zero delay on click, no stale data flash.
  const answersLoading = isAnswersLoading || managerStore.isLearnerAnswersLoading;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
      <DrawerOverlay backdropFilter="blur(6px)" bg="blackAlpha.400" />
      <DrawerContent maxW={{ base: "100%", md: "640px", lg: "70vw" }}>
        <DrawerCloseButton top={4} right={4} />

        {/* Header */}
        <DrawerHeader px={6} pt={6} pb={4} borderBottomWidth="1px" borderColor={divider}>
          <HStack spacing={3}>
            <Box p={2} bg="teal.50" borderRadius="lg" color="teal.600">
              <GraduationCap size={20} />
            </Box>
            <Box>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color={muted} fontWeight="600">
                Learner Review
              </Text>
              {learner && (
                <Heading size="md" mt={0.5}>
                  {learner.name}
                </Heading>
              )}
            </Box>
          </HStack>
        </DrawerHeader>

        <DrawerBody px={6} py={5}>
          {managerStore.isLearnerProgressLoading || !managerStore.learnerProgress ? (
            <Flex justify="center" align="center" direction="column" gap={3} py={20}>
              <Spinner size="lg" color="teal.400" />
              <Text color={muted} fontSize="sm">
                Loading learner details…
              </Text>
            </Flex>
          ) : (
            <Stack spacing={7}>
              {/* ── Learner Info ── */}
              <Box>
                <Text color={muted} fontSize="sm">
                  {learner?.email || learner?.username || ""}
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={3} mt={4}>
                  <StatCard
                    icon={<TrendingUp size={14} />}
                    label="Overall"
                    value={`${Math.round(summary.overallProgress)}%`}
                    accent="teal.500"
                  />
                  <StatCard
                    icon={<CheckCircle size={14} />}
                    label="Avg Score"
                    value={formatScore(summary.avgScore)}
                    accent="blue.500"
                  />
                  <StatCard
                    icon={<BookOpen size={14} />}
                    label="Courses"
                    value={summary.courseCount}
                    accent="purple.500"
                  />
                </Grid>
              </Box>

              {/* ── Courses ── */}
              <Box>
                <HStack mb={3}>
                  <LayoutGrid size={15} color="var(--chakra-colors-gray-400)" />
                  <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color={muted}>
                    Courses
                  </Heading>
                </HStack>
                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3}>
                  {courses.map((course: any) => (
                    <CourseCard
                      key={course.courseId}
                      course={course}
                      // ✅ Compare against selectedCourseId (prop) not selectedCourse?.courseId
                      //    selectedCourse is memo-derived and can lag one render behind the click;
                      //    selectedCourseId is set synchronously inside selectCourse before the fetch.
                      isActive={selectedCourseId === course.courseId}
                      onSelect={() => void selectCourse(course.courseId)}
                    />
                  ))}
                </Grid>
              </Box>

              {/* ── Selected Course Detail ── */}
              {selectedCourse && (
                <>
                  {/* Module Breakdown */}
                  <Box>
                    <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
                      <HStack>
                        <Clock size={15} color="var(--chakra-colors-gray-400)" />
                        <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color={muted}>
                          Module Breakdown
                        </Heading>
                      </HStack>
                      <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="xs">
                        {selectedCourse.title}
                      </Badge>
                    </HStack>

                    <Accordion allowMultiple defaultIndex={[0]}>
                      {selectedCourse.modules?.map((mod: any) => (
                        <ModuleAccordionItem key={mod.moduleId} moduleRecord={mod} />
                      ))}
                    </Accordion>
                  </Box>

                  {/* Answers Review */}
                  <Box>
                    <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
                      <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color={muted}>
                        Answers Review
                      </Heading>
                      <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="xs">
                        {selectedCourse.title}
                      </Badge>
                    </HStack>

                    <ScormQuizReviewContent
                      // ✅ Key on selectedCourseId — forces a full unmount+remount when the
                      //    course changes, so the previous course's rendered answers are wiped
                      //    from the DOM instantly on click rather than lingering during the fetch.
                      key={selectedCourseId}
                      sections={managerStore.learnerAnswers}
                      // ✅ Use the combined loading flag so the spinner appears on click,
                      //    not only after the store's own flag catches up.
                      isLoading={answersLoading}
                      mode="manager"
                      progressSummary={{
                        progressPercent: Number(selectedCourse.progress || 0),
                        sectionsCompleted: selectedCourseSectionSummary.completed,
                        totalSections: selectedCourseSectionSummary.total,
                      }}
                      onSaveReview={submitReview}
                      isSubmittingReview={managerStore.isSubmittingReview}
                      emptyState="No SCORM answers have been captured for this course yet."
                    />
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}