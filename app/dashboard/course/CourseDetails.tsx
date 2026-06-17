"use client";

import ScormQuizReviewContent from "@/app/dashboard/course/scorm/ScormQuizReviewContent";
import {
  clampLearningProgress,
  getLearningProgressState,
  getLearningStatusMeta,
} from "@/app/dashboard/course/scorm/progressPresentation";
import {
  estimateCompletedSections,
  ScormAnswerSectionRecord,
  summarizeAnswerSections,
} from "@/app/dashboard/course/scorm/quizReviewTypes";
import {
  buildCourseAssetUrl,
  buildLaunchSection,
  CourseLaunchSection,
  deriveModuleId,
  deriveSectionId,
  getFirstPlayableLaunchSection,
  isScormLaunchSection,
  preloadCourseAsset,
} from "@/app/dashboard/course/scorm/sectionTracking";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Progress,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Download,
  ExternalLink,
  FileBox,
  FileText,
  GraduationCap,
  Layers,
  PlayCircle,
  Rocket,
  Star,
  Users,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CourseQuizForLearner } from "@/app/store/courseStore/courseStore";

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);

function normalizeMaterials(materials: any) {
  return Array.isArray(materials) ? materials.filter(Boolean) : [];
}

function getStartLearningLabel(launchSection: CourseLaunchSection | null, fallbackPath?: string | null) {
  if (launchSection?.contentKind === "video") {
    return "Watch Lesson";
  }

  if (launchSection?.contentKind === "document") {
    return "Open Lesson";
  }

  if (launchSection && isScormLaunchSection(launchSection)) {
    return "Start SCORM";
  }

  if (fallbackPath) {
    return "Start Learning";
  }

  return "No lesson asset";
}

function getSectionActionLabel(launchSection: CourseLaunchSection | null, status?: string | null, progress?: number | null) {
  if (!launchSection) {
    return "Lesson unavailable";
  }

  const state = getLearningProgressState(status, progress);
  if (state === "completed") {
    if (launchSection.contentKind === "video") {
      return "Rewatch video";
    }

    if (launchSection.contentKind === "document") {
      return "Reopen document";
    }

    return "Review lesson";
  }

  if (state === "in_progress") {
    if (launchSection.contentKind === "video") {
      return "Resume video";
    }

    if (launchSection.contentKind === "document") {
      return "Continue document";
    }

    return "Continue lesson";
  }

  if (launchSection.contentKind === "video") {
    return "Start video";
  }

  if (launchSection.contentKind === "document") {
    return "Open document";
  }

  return "Start lesson";
}

function getSectionTypeLabel(contentKind?: string | null) {
  const normalizedKind = String(contentKind || "").trim().toLowerCase();

  if (normalizedKind === "video") {
    return "VIDEO";
  }

  if (normalizedKind === "document") {
    return "DOCUMENT";
  }

  if (normalizedKind === "scorm" || normalizedKind === "zip") {
    return "SCORM";
  }

  return normalizedKind ? normalizedKind.toUpperCase() : "";
}

function formatAccessLabel(value?: string | null) {
  if (!value) {
    return "No expiry";
  }

  const accessDate = new Date(value);
  if (Number.isNaN(accessDate.getTime())) {
    return "No expiry";
  }

  return accessDate.toLocaleDateString();
}

interface CourseDetailsProps {
  course: any;
  onBack: () => void;
  onLaunchSection: (launchSection: CourseLaunchSection) => void;
  onAssignCourse?: (course: any) => void;
  learnerAnswers?: ScormAnswerSectionRecord[];
  isLearnerAnswersLoading?: boolean;
  courseQuizzes?: CourseQuizForLearner[];
  isCourseQuizzesLoading?: boolean;
  onTakeQuiz?: (quiz: CourseQuizForLearner) => void;
  onDownloadCertificate?: (courseId: string) => void;
  isCertificateDownloading?: boolean;
}

export default function CourseDetails({
  course,
  onBack,
  onLaunchSection,
  onAssignCourse, 
  learnerAnswers = [],
  isLearnerAnswersLoading = false,
  courseQuizzes = [],
  isCourseQuizzesLoading = false,
  onTakeQuiz,
  onDownloadCertificate,
  isCertificateDownloading = false,
}: CourseDetailsProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const isAssignedCourseView = Array.isArray(course.sources);
  const firstPlayableLaunchSection = getFirstPlayableLaunchSection(course);
  const answerSummary = summarizeAnswerSections(learnerAnswers);
  const totalSections = Number(course.curriculum?.totalSections || 0);
  const progressModules = Array.isArray(course.progressModules) ? course.progressModules : [];
  const courseId = String(course._id || course.courseId || "").trim();
  const certificateReason =
    course.certificate?.reason || "Certificate will be available after eligibility is confirmed.";
  const canDownloadCertificate = isAssignedCourseView;
  const shouldShowCertificateStatus = isAssignedCourseView;
  const warmLaunchSection = (launchSection?: CourseLaunchSection | null) => {
    if (launchSection && isScormLaunchSection(launchSection)) {
      void preloadCourseAsset(launchSection.assetPath).catch(() => undefined);
    }
  };

  const moduleProgressMap = useMemo(
    () => new Map<string, any>(progressModules.map((moduleRecord: any) => [moduleRecord.moduleId, moduleRecord])),
    [progressModules]
  );

  const sectionProgressMap = useMemo(() => {
    const nextMap = new Map<string, any>();

    progressModules.forEach((moduleRecord: any) => {
      (moduleRecord.sections || []).forEach((sectionRecord: any) => {
        nextMap.set(sectionRecord.sectionId, sectionRecord);
      });
    });

    return nextMap;
  }, [progressModules]);

  const sectionSummary = useMemo(() => {
    const modules = Array.isArray(course.curriculum?.modules) ? course.curriculum.modules : [];
    let computedTotal = 0;
    let completed = 0;
    let inProgress = 0;

    modules.forEach((moduleRecord: any) => {
      (moduleRecord.sections || []).forEach((sectionRecord: any) => {
        computedTotal += 1;
        const trackingRecord = sectionProgressMap.get(deriveSectionId(moduleRecord, sectionRecord));
        const state = getLearningProgressState(trackingRecord?.lessonStatus, trackingRecord?.progress);

        if (state === "completed") {
          completed += 1;
          return;
        }

        if (state === "in_progress") {
          inProgress += 1;
        }
      });
    });

    return {
      total: computedTotal || totalSections,
      completed,
      inProgress,
      notStarted: Math.max((computedTotal || totalSections) - completed - inProgress, 0),
    };
  }, [course.curriculum?.modules, sectionProgressMap, totalSections]);

  const sectionsCompleted = isAssignedCourseView
    ? sectionSummary.completed
    : estimateCompletedSections(course.progress, totalSections);

  const nextLaunchSection = useMemo(() => {
    const modules = Array.isArray(course.curriculum?.modules) ? course.curriculum.modules : [];
    let firstIncompleteLaunchSection: CourseLaunchSection | null = null;

    for (const moduleRecord of modules) {
      for (const sectionRecord of moduleRecord.sections || []) {
        const launchSection = buildLaunchSection(moduleRecord, sectionRecord);
        if (!launchSection) {
          continue;
        }

        const trackingRecord = sectionProgressMap.get(launchSection.sectionId);
        const state = getLearningProgressState(trackingRecord?.lessonStatus, trackingRecord?.progress);
        if (state === "in_progress") {
          return launchSection;
        }

        if (!firstIncompleteLaunchSection && state !== "completed") {
          firstIncompleteLaunchSection = launchSection;
        }
      }
    }

    return firstIncompleteLaunchSection || firstPlayableLaunchSection;
  }, [course.curriculum?.modules, firstPlayableLaunchSection, sectionProgressMap]);

  const nextLaunchTracking = nextLaunchSection ? sectionProgressMap.get(nextLaunchSection.sectionId) : null;
  const nextLaunchLabel = getSectionActionLabel(
    nextLaunchSection,
    nextLaunchTracking?.lessonStatus,
    nextLaunchTracking?.progress
  );

  // Colors (Chakra + Tailwind friendly)
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const surfaceBg = useColorModeValue("white", "gray.800");
  const mutedSurfaceBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const completedSectionBg = useColorModeValue("green.50", "green.900");
  const completedSectionBorder = useColorModeValue("green.200", "green.700");
  const pendingQuizBg = useColorModeValue("orange.50", "orange.900");
  const quizSidebarBg = useColorModeValue("orange.50", "orange.900");
  const timelineColor = useColorModeValue("gray.100", "gray.700");
  const mutedDotBorder = useColorModeValue("gray.50", "gray.700");
  const accentColor = "blue.500";
  const accentLight = useColorModeValue("blue.50", "blue.900");
  const textMuted = useColorModeValue("gray.500", "gray.400");
  const pendingQuizzes = courseQuizzes.filter((quiz) => !quiz.attempt);
  const completedQuizzes = courseQuizzes.filter((quiz) => quiz.attempt);
  const nextQuiz = pendingQuizzes[0] || courseQuizzes[0] || null;

  const renderQuizCard = (quiz: CourseQuizForLearner) => {
    const completed = Boolean(quiz.attempt);

    return (
      <Flex
        key={quiz.quizId}
        mt={{ base: 3, md: 4 }}
        p={{ base: 3, md: 4 }}
        borderWidth="1px"
        borderColor={completed ? completedSectionBorder : "orange.200"}
        borderRadius="xl"
        bg={completed ? completedSectionBg : pendingQuizBg}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        gap={3}
        direction={{ base: "column", sm: "row" }}
        wrap="wrap"
      >
        <HStack spacing={3} align="start" minW={0}>
          <Box
            w={{ base: 9, md: 10 }}
            h={{ base: 9, md: 10 }}
            borderRadius="xl"
            bg={completed ? "green.500" : "orange.500"}
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={Award} boxSize={5} />
          </Box>
          <Box minW={0}>
            <Text fontWeight="bold" noOfLines={2}>{quiz.title}</Text>
            <Text fontSize="sm" color={textMuted}>
              {quiz.questionCount} question{quiz.questionCount === 1 ? "" : "s"} - {quiz.totalMarks} marks
            </Text>
            {completed ? (
              <Text mt={1} fontSize="sm" fontWeight="semibold" color="green.600">
                Score {quiz.attempt?.score}/{quiz.attempt?.maxScore} ({Math.round(Number(quiz.attempt?.percentage || 0))}%)
              </Text>
            ) : (
              <Text mt={1} fontSize="sm" color="orange.700">
                Required quiz waiting for you
              </Text>
            )}
          </Box>
        </HStack>
        {onTakeQuiz ? (
          <Button
            size="sm"
            colorScheme={completed ? "green" : "orange"}
            borderRadius="full"
            w={{ base: "full", sm: "auto" }}
            onClick={(event) => {
              event.stopPropagation();
              onTakeQuiz(quiz);
            }}
          >
            {completed ? "View Result" : "Take Quiz"}
          </Button>
        ) : null}
      </Flex>
    );
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Sticky Header */}
      <Box
        position="sticky"
        top={0}
        zIndex="sticky"
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        backdropFilter="blur(12px)"
        bg={useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)")}
        px={{ base: 2, md: 6 }}
        py={{ base: 2, md: 3 }}
      >
        <Container maxW="container.2xl" px={{ base: 1, md: 4 }}>
          <Flex align={{ base: "start", md: "center" }} gap={{ base: 2, md: 4 }}>
            <MotionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              variant="ghost"
              rounded="full"
              p={0}
              minW={{ base: "36px", md: "auto" }}
              h={{ base: "36px", md: "40px" }}
              aria-label="Go back"
            >
              <Icon as={ChevronLeft} boxSize={5} />
            </MotionButton>
            <Box minW={0} flex="1">
              <Heading as="h1" size={{ base: "sm", md: "lg" }} fontWeight="bold" noOfLines={{ base: 2, md: 1 }} lineHeight="1.2">
                {course.title}
              </Heading>
              <Flex gap={1.5} mt={1.5} flexWrap="wrap">
                <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                  {course.taxonomy?.level || "Beginner"}
                </Badge>
                {course.assessmentSummary?.outcome === "passed" ? (
                  <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                    Passed
                  </Badge>
                ) : course.assessmentSummary?.outcome === "failed" ? (
                  <Badge colorScheme="red" borderRadius="full" px={3} py={1}>
                    Failed
                  </Badge>
                ) : course.assessmentSummary?.outcome === "pending" ? (
                  <Badge colorScheme="orange" borderRadius="full" px={3} py={1}>
                    Assessment Pending
                  </Badge>
                ) : null}
                {course.taxonomy?.categories?.slice(0, 2).map((cat: string, idx: number) => (
                  <Badge key={idx} colorScheme="gray" variant="subtle" borderRadius="full" px={3} py={1}>
                    {cat}
                  </Badge>
                ))}
              </Flex>
            </Box>
            {onAssignCourse ? (
              <Button
                ml={{ base: 0, md: "auto" }}
                size={{ base: "sm", md: "md" }}
                colorScheme="blue"
                variant="outline"
                borderRadius="full"
                onClick={() => onAssignCourse(course)}
              >
                Assign Course
              </Button>
            ) : null}
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.2xl" py={{ base: 4, md: 8 }} px={{ base: 3, md: 4 }}>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={{ base: 4, md: 8 }}>
          {/* Main content */}
          <Stack spacing={{ base: 4, md: 8 }} minW={0}>
            {/* Overview Card */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card bg={cardBg} shadow="sm" borderRadius={{ base: "xl", md: "2xl" }} borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0} px={{ base: 4, md: 5 }} pt={{ base: 4, md: 5 }}>
                  <Flex align="center" gap={2}>
                    <Icon as={GraduationCap} boxSize={{ base: 5, md: 6 }} color={accentColor} />
                    <Heading size={{ base: "sm", md: "md" }}>About this course</Heading>
                  </Flex>
                </CardHeader>
                <CardBody px={{ base: 4, md: 5 }} py={{ base: 4, md: 5 }}>
                  <Box
                    dangerouslySetInnerHTML={{
                      __html:
                        course.description?.html ||
                        course.description?.text ||
                        "No description provided.",
                    }}
                    className="prose prose-sm max-w-none"
                    color={useColorModeValue("gray.600", "gray.300")}
                  />
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }} mt={{ base: 4, md: 6 }}>
                    <Flex align="center" gap={3} p={3} bg={accentLight} borderRadius="xl">
                      <Icon as={Clock} boxSize={5} color={accentColor} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={textMuted}>
                          Duration
                        </Text>
                        <Text fontWeight="bold">
                          {course.progression?.completionWindowDays || "Self-paced"} days
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap={3} p={3} bg={accentLight} borderRadius="xl">
                      <Icon as={Award} boxSize={5} color={accentColor} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={textMuted}>
                          Certification
                        </Text>
                        <Text fontWeight="bold">
                          {course.progression?.certificateEnabled
                            ? "Certificate included"
                            : "No certificate"}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap={3} p={3} bg={accentLight} borderRadius="xl">
                      <Icon as={Star} boxSize={5} color={accentColor} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={textMuted}>
                          Passing Criteria
                        </Text>
                        <Text fontWeight="bold">
                          {course.assessment?.passingMarks !== null && course.assessment?.passingMarks !== undefined && course.assessment?.totalMarks
                            ? `${course.assessment.passingMarks}/${course.assessment.totalMarks}`
                            : course.assessment?.totalMarks
                              ? `Total ${course.assessment.totalMarks} marks`
                              : "Not configured"}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap={3} p={3} bg={accentLight} borderRadius="xl">
                      <Icon as={CheckCircle} boxSize={5} color={accentColor} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={textMuted}>
                          Assessment Result
                        </Text>
                        <Text fontWeight="bold">
                          {course.assessmentSummary?.outcome === "passed"
                            ? "Passed"
                            : course.assessmentSummary?.outcome === "failed"
                              ? "Failed"
                              : course.assessmentSummary?.outcome === "pending"
                                ? "Awaiting final score"
                                : "Not configured"}
                        </Text>
                      </Box>
                    </Flex>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </MotionBox>

            {/* Curriculum Card - Enhanced Timeline Design */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card bg={cardBg} shadow="sm" borderRadius={{ base: "xl", md: "2xl" }} borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0} px={{ base: 4, md: 5 }} pt={{ base: 4, md: 5 }}>
                  <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
                    <Flex align="center" gap={2} wrap="wrap">
                      <Icon as={Layers} boxSize={{ base: 5, md: 6 }} color={accentColor} />
                      <Heading size={{ base: "sm", md: "md" }}>Course Curriculum</Heading>
                      {isAssignedCourseView ? (
                        <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                          {sectionSummary.completed}/{sectionSummary.total} complete
                        </Badge>
                      ) : null}
                    </Flex>
                    <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                      {course.curriculum?.totalModules} modules {" / "} {course.curriculum?.totalSections} lessons
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody px={{ base: 3, md: 5 }} py={{ base: 4, md: 5 }}>
                  <Accordion allowMultiple defaultIndex={[0]}>
                    {course.curriculum?.modules?.map((mod: any) => {
                      const moduleTracking = moduleProgressMap.get(deriveModuleId(mod));
                      const moduleProgressMeta = getLearningStatusMeta(
                        moduleTracking?.lessonStatus,
                        moduleTracking?.progress
                      );

                      return (
                      <AccordionItem
                        key={mod.order}
                        border="none"
                        mb={{ base: 3, md: 4 }}
                        bg={useColorModeValue("white", "gray.800")}
                        borderRadius={{ base: "xl", md: "2xl" }}
                        borderWidth="1px"
                        borderColor={borderColor}
                        overflow="hidden"
                        shadow="sm"
                      >
                        {({ isExpanded }) => (
                          <>
                            <AccordionButton
                              px={{ base: 3, md: 5 }}
                              py={{ base: 3, md: 4 }}
                              _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                            >
                              <Flex align="center" gap={{ base: 3, md: 4 }} w="full">
                                <Box
                                  w={{ base: 9, md: 10 }}
                                  h={{ base: 9, md: 10 }}
                                  borderRadius="xl"
                                  bg={
                                    isAssignedCourseView && moduleProgressMeta.state === "completed"
                                      ? "green.500"
                                      : isExpanded
                                        ? accentColor
                                        : useColorModeValue("gray.100", "gray.700")
                                  }
                                  color={isAssignedCourseView && moduleProgressMeta.state === "completed" ? "white" : isExpanded ? "white" : textMuted}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontWeight="bold"
                                  transition="all 0.2s"
                                >
                                  {moduleProgressMeta.state === "completed" && isAssignedCourseView ? (
                                    <Icon as={CheckCircle} boxSize={5} />
                                  ) : (
                                    mod.order
                                  )}
                                </Box>
                                <Box flex="1" textAlign="left" minW={0}>
                                  <HStack spacing={2} flexWrap="wrap">
                                    <Text fontWeight="bold" fontSize={{ base: "sm", md: "lg" }} noOfLines={2}>{mod.title}</Text>
                                    {isAssignedCourseView ? (
                                      <Badge colorScheme={moduleProgressMeta.colorScheme} borderRadius="full" px={3} py={1}>
                                        {moduleProgressMeta.label}
                                      </Badge>
                                    ) : null}
                                  </HStack>
                                  <HStack spacing={{ base: 2, md: 3 }} mt={1} flexWrap="wrap">
                                    <Text fontSize="sm" color={textMuted}>
                                      {mod.sections?.length} {mod.sections?.length === 1 ? "lesson" : "lessons"}
                                    </Text>
                                    {isAssignedCourseView && moduleTracking ? (
                                      <>
                                        <Text fontSize="sm" color={textMuted}>
                                          {moduleTracking.sectionsCompleted}/{moduleTracking.sectionCount} complete
                                        </Text>
                                        <Text fontSize="sm" color={textMuted}>
                                          {clampLearningProgress(moduleTracking.progress)}%
                                        </Text>
                                      </>
                                    ) : null}
                                  </HStack>
                                </Box>
                                <AccordionIcon boxSize={6} color={textMuted} />
                              </Flex>
                            </AccordionButton>
                            
                            <AccordionPanel pb={{ base: 4, md: 6 }} pt={2} px={{ base: 3, md: 6 }}>
                              {mod.summary && (
                                <Text fontSize="sm" color={textMuted} mb={{ base: 4, md: 6 }} pl={{ base: 0, md: 14 }}>
                                  {mod.summary}
                                </Text>
                              )}

                              {normalizeMaterials(mod.studyMaterial).length > 0 ? (
                                <Box mb={{ base: 4, md: 6 }} pl={{ base: 0, md: 14 }}>
                                  <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" color={textMuted} mb={3}>
                                    Module Study Material
                                  </Text>
                                  <Stack spacing={2}>
                                    {normalizeMaterials(mod.studyMaterial).map((material: any, materialIndex: number) => {
                                      const materialUrl = buildCourseAssetUrl(String(material?.previewUrl || ""));

                                      return (
                                          <Flex
                                            key={`${mod.order}-module-material-${materialIndex}`}
                                           align={{ base: "stretch", sm: "center" }}
                                            justify="space-between"
                                            gap={3}
                                            direction={{ base: "column", sm: "row" }}
                                          borderWidth="1px"
                                          borderColor={borderColor}
                                          borderRadius="xl"
                                          p={3}
                                          bg={useColorModeValue("gray.50", "gray.800")}
                                        >
                                          <HStack align="start" spacing={3} minW={0}>
                                            <Icon as={FileText} boxSize={4} color={accentColor} mt={0.5} />
                                            <Box minW={0}>
                                              <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                                                {material?.name || `Module PDF ${materialIndex + 1}`}
                                              </Text>
                                              <Text fontSize="xs" color={textMuted}>
                                                PDF handout for this module
                                              </Text>
                                            </Box>
                                          </HStack>
                                          <HStack spacing={2} justify={{ base: "stretch", sm: "flex-end" }} w={{ base: "full", sm: "auto" }}>
                                            <Button
                                              as="a"
                                              href={materialUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              size={{ base: "xs", sm: "sm" }}
                                              flex={{ base: 1, sm: "initial" }}
                                              variant="outline"
                                              borderRadius="full"
                                              leftIcon={<Icon as={ExternalLink} boxSize={3.5} />}
                                            >
                                              Open
                                            </Button>
                                            <Button
                                              as="a"
                                              href={materialUrl}
                                              download
                                              size={{ base: "xs", sm: "sm" }}
                                              flex={{ base: 1, sm: "initial" }}
                                              variant="ghost"
                                              borderRadius="full"
                                              leftIcon={<Icon as={Download} boxSize={3.5} />}
                                            >
                                              Download
                                            </Button>
                                          </HStack>
                                        </Flex>
                                      );
                                    })}
                                  </Stack>
                                </Box>
                              ) : null}
                              
                              {/* Timeline Container */}
                              <Box position="relative" pl={{ base: 0, md: 4 }}>
                                {/* Vertical Timeline Line */}
                                <Box
                                  position="absolute"
                                  left="31px"
                                  top="20px"
                                  bottom="30px"
                                  width="2px"
                                  bg={timelineColor}
                                  zIndex={0}
                                  display={{ base: "none", md: "block" }}
                                />

                                {mod.sections?.map((sec: any, idx: number) => {
                                  const secId = mod.order * 100 + idx;
                                  const launchSection = buildLaunchSection(mod, sec);
                                  const sectionTracking = sectionProgressMap.get(deriveSectionId(mod, sec));
                                  const sectionProgressMeta = getLearningStatusMeta(
                                    sectionTracking?.lessonStatus,
                                    sectionTracking?.progress
                                  );
                                  const isPlayable = Boolean(launchSection);
                                  const isLast = idx === mod.sections.length - 1;
                                  const sectionStudyMaterials = normalizeMaterials(sec.studyMaterial);
                                  const contentKind = String(sec.content?.kind || "").trim().toLowerCase();
                                  const contentTagLabel = getSectionTypeLabel(contentKind);
                                  const actionLabel = getSectionActionLabel(
                                    launchSection,
                                    sectionTracking?.lessonStatus,
                                    sectionTracking?.progress
                                  );
                                  const sectionIcon =
                                    sectionProgressMeta.state === "completed"
                                      ? CheckCircle
                                      : contentKind === "video"
                                        ? Video
                                        : isPlayable
                                          ? PlayCircle
                                          : BookOpen;

                                  return (
                                    <MotionFlex
                                      key={sec.order}
                                      position="relative"
                                      zIndex={1}
                                      align="flex-start"
                                      gap={{ base: 3, md: 4 }}
                                      mb={isLast ? 0 : { base: 3, md: 6 }}
                                      onMouseEnter={() => {
                                        setHoveredSection(secId);
                                        warmLaunchSection(launchSection);
                                      }}
                                      onMouseLeave={() => setHoveredSection(null)}
                                      cursor={isPlayable ? "pointer" : "default"}
                                      onClick={() => {
                                        if (launchSection) {
                                          onLaunchSection(launchSection);
                                        }
                                      }}
                                    >
                                      <Box
                                        w={{ base: 8, md: 10 }}
                                        h={{ base: 8, md: 10 }}
                                        flexShrink={0}
                                        borderRadius="full"
                                        bg={
                                          sectionProgressMeta.state === "completed"
                                            ? "green.500"
                                            : isPlayable
                                              ? surfaceBg
                                              : "transparent"
                                        }
                                        border={{ base: "3px solid", md: "4px solid" }}
                                        borderColor={
                                          sectionProgressMeta.state === "completed"
                                            ? "green.100"
                                            : isPlayable
                                              ? accentLight
                                              : mutedDotBorder
                                        }
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mt={1}
                                        boxShadow={hoveredSection === secId ? "0 0 0 4px var(--chakra-colors-blue-100)" : "none"}
                                        transition="all 0.2s"
                                        zIndex={2}
                                      >
                                        <Icon
                                          as={sectionIcon}
                                          boxSize={{ base: 4, md: 5 }}
                                          color={
                                            sectionProgressMeta.state === "completed"
                                              ? "white"
                                              : isPlayable
                                                ? accentColor
                                                : textMuted
                                          }
                                        />
                                      </Box>

                                      <Box
                                        flex="1"
                                        p={{ base: 3, md: 4 }}
                                        bg={
                                          isAssignedCourseView && sectionProgressMeta.state === "completed"
                                            ? completedSectionBg
                                            : surfaceBg
                                        }
                                        borderWidth="1px"
                                        borderColor={
                                          hoveredSection === secId
                                            ? accentColor
                                            : isAssignedCourseView && sectionProgressMeta.state === "completed"
                                              ? completedSectionBorder
                                              : borderColor
                                        }
                                        borderRadius={{ base: "lg", md: "xl" }}
                                        shadow={hoveredSection === secId ? "md" : "sm"}
                                        transition="all 0.2s"
                                        transform={{ base: "none", md: hoveredSection === secId ? "translateX(4px)" : "translateX(0)" }}
                                      >
                                        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={2}>
                                          <Box flex="1" minW={0}>
                                            <HStack spacing={2} flexWrap="wrap" mb={1}>
                                              <Heading size="sm" fontSize={{ base: "sm", md: "md" }} noOfLines={2}>{sec.title}</Heading>
                                              {isAssignedCourseView ? (
                                                <Badge colorScheme={sectionProgressMeta.colorScheme} borderRadius="full" px={3} py={1}>
                                                  {sectionProgressMeta.label}
                                                </Badge>
                                              ) : null}
                                            </HStack>
                                            {sec.description && (
                                              <Text fontSize="sm" color={textMuted} noOfLines={2}>
                                                {sec.description}
                                              </Text>
                                            )}
                                          </Box>

                                          <HStack spacing={2} align="start" flexWrap="wrap" justify={{ base: "flex-start", md: "flex-end" }}>
                                            {contentTagLabel ? (
                                              <Tag size="sm" variant="subtle" colorScheme="gray" borderRadius="md" mt={1}>
                                                <Icon as={FileBox} boxSize={3} mr={1} />
                                                {contentTagLabel}
                                              </Tag>
                                            ) : null}
                                            {isAssignedCourseView && sectionProgressMeta.state === "completed" ? (
                                              <Badge colorScheme="green" borderRadius="full" px={3} py={1} mt={1}>
                                                Completed
                                              </Badge>
                                            ) : null}
                                          </HStack>
                                        </Flex>

                                        {isAssignedCourseView ? (
                                          <Box mt={{ base: 3, md: 4 }}>
                                            <HStack justify="space-between" mb={2}>
                                              <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" color={textMuted}>
                                                Lesson progress
                                              </Text>
                                              <Text fontSize="sm" fontWeight="semibold">
                                                {sectionProgressMeta.progress}%
                                              </Text>
                                            </HStack>
                                            <Progress
                                              value={sectionProgressMeta.progress}
                                              colorScheme={sectionProgressMeta.colorScheme}
                                              borderRadius="full"
                                              h="10px"
                                              bg={mutedSurfaceBg}
                                            />
                                          </Box>
                                        ) : null}

                                        {sectionStudyMaterials.length > 0 ? (
                                          <Stack spacing={2} mt={{ base: 3, md: 4 }}>
                                            {sectionStudyMaterials.map((material: any, materialIndex: number) => {
                                              const materialUrl = buildCourseAssetUrl(String(material?.previewUrl || ""));

                                              return (
                                                <Flex
                                                  key={`${sec.order}-section-material-${materialIndex}`}
                                                  align={{ base: "stretch", sm: "center" }}
                                                  justify="space-between"
                                                  gap={3}
                                                  direction={{ base: "column", sm: "row" }}
                                                  p={{ base: 2.5, md: 3 }}
                                                  borderRadius="lg"
                                                  borderWidth="1px"
                                                  borderColor={borderColor}
                                                  bg={mutedSurfaceBg}
                                                  onClick={(event) => event.stopPropagation()}
                                                >
                                                  <HStack align="start" spacing={3} minW={0}>
                                                    <Icon as={FileText} boxSize={4} color={accentColor} mt={0.5} />
                                                    <Box minW={0}>
                                                      <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                                                        {material?.name || `Section PDF ${materialIndex + 1}`}
                                                      </Text>
                                                      <Text fontSize="xs" color={textMuted}>
                                                        Study material for this section
                                                      </Text>
                                                    </Box>
                                                  </HStack>
                                                  <HStack spacing={2} justify={{ base: "stretch", sm: "flex-end" }} w={{ base: "full", sm: "auto" }}>
                                                    <Button
                                                      as="a"
                                                      href={materialUrl}
                                                      target="_blank"
                                                      rel="noreferrer"
                                                      size="xs"
                                                      flex={{ base: 1, sm: "initial" }}
                                                      variant="outline"
                                                      borderRadius="full"
                                                      leftIcon={<Icon as={ExternalLink} boxSize={3} />}
                                                    >
                                                      Open
                                                    </Button>
                                                    <Button
                                                      as="a"
                                                      href={materialUrl}
                                                      download
                                                      size="xs"
                                                      flex={{ base: 1, sm: "initial" }}
                                                      variant="ghost"
                                                      borderRadius="full"
                                                      leftIcon={<Icon as={Download} boxSize={3} />}
                                                    >
                                                      Download
                                                    </Button>
                                                  </HStack>
                                                </Flex>
                                              );
                                            })}
                                          </Stack>
                                        ) : null}

                                        {launchSection ? (
                                          <Button
                                            mt={4}
                                            size="sm"
                                            w={{ base: "full", sm: "auto" }}
                                            colorScheme={sectionProgressMeta.colorScheme === "gray" ? "blue" : sectionProgressMeta.colorScheme}
                                            variant={
                                              launchSection.contentKind === "video" || sectionProgressMeta.state === "in_progress"
                                                ? "solid"
                                                : "outline"
                                            }
                                            borderRadius="full"
                                            onMouseEnter={() => warmLaunchSection(launchSection)}
                                            onFocus={() => warmLaunchSection(launchSection)}
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              onLaunchSection(launchSection);
                                            }}
                                            leftIcon={
                                              <Icon as={launchSection.contentKind === "video" ? Video : PlayCircle} boxSize={4} />
                                            }
                                          >
                                            {actionLabel}
                                          </Button>
                                        ) : null}
                                      </Box>
                                    </MotionFlex>
                                  );
                                })}
                              </Box>
                              {courseQuizzes
                                .filter((quiz) => quiz.scope === "module" && quiz.moduleId === deriveModuleId(mod))
                                .map(renderQuizCard)}
                            </AccordionPanel>
                          </>
                        )}
                      </AccordionItem>
                      );
                    })}
                  </Accordion>
                  {courseQuizzes.filter((quiz) => quiz.scope === "final").map(renderQuizCard)}
                </CardBody>
              </Card>
            </MotionBox>

            {/* Quiz Review Card */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18 }}
            >
              <Card bg={cardBg} shadow="sm" borderRadius={{ base: "xl", md: "2xl" }} borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0} px={{ base: 4, md: 5 }} pt={{ base: 4, md: 5 }}>
                  <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                    <Flex align="center" gap={2}>
                      <Icon as={Award} boxSize={{ base: 5, md: 6 }} color={accentColor} />
                      <Heading size={{ base: "sm", md: "md" }}>Quiz Review</Heading>
                    </Flex>
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                        Score {answerSummary.correctCount}/{answerSummary.totalQuestions}
                      </Badge>
                      {courseQuizzes.length > 0 ? (
                        <Badge colorScheme="orange" borderRadius="full" px={3} py={1}>
                          {completedQuizzes.length}/{courseQuizzes.length} course quizzes
                        </Badge>
                      ) : null}
                      {answerSummary.pending > 0 ? (
                        <Badge colorScheme="orange" borderRadius="full" px={3} py={1}>
                          {answerSummary.pending} pending review
                        </Badge>
                      ) : null}
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody px={{ base: 4, md: 5 }} py={{ base: 4, md: 5 }}>
                  <ScormQuizReviewContent
                    sections={learnerAnswers}
                    isLoading={isLearnerAnswersLoading}
                    progressSummary={{
                      progressPercent: Number(course.progress || 0),
                      sectionsCompleted,
                      totalSections,
                    }}
                    emptyState="Your quiz answers will appear here after a SCORM quiz or course quiz is submitted."
                  />
                </CardBody>
              </Card>
            </MotionBox>

            {!isAssignedCourseView ? (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card bg={cardBg} shadow="sm" borderRadius={{ base: "xl", md: "2xl" }} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader pb={0}>
                    <Flex align="center" gap={2}>
                      <Icon as={Users} boxSize={6} color={accentColor} />
                      <Heading size="md">Batch Delivery</Heading>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={4}>
                      <Text color={textMuted}>
                        Courses are now delivered through the dedicated batch module. Create and manage batches from the
                        Batches workspace, then learners will see course access marked with the batch they came from.
                      </Text>
                      <Box
                        p={4}
                        borderWidth="1px"
                        borderRadius="xl"
                        borderColor={borderColor}
                        bg={useColorModeValue("gray.50", "gray.800")}
                      >
                        <HStack spacing={3} align="start">
                          <Icon as={Calendar} boxSize={5} color={accentColor} mt={0.5} />
                          <Box>
                            <Text fontWeight="semibold">Standalone batch management</Text>
                            <Text mt={1} fontSize="sm" color={textMuted}>
                              Use the new batch screens to group users, attach multiple courses, define dates, and track
                              learner progress without mixing batch logic into course setup.
                            </Text>
                          </Box>
                        </HStack>
                      </Box>
                    </Stack>
                  </CardBody>
                </Card>
              </MotionBox>
            ) : null}
          </Stack>

          {/* Sidebar */}
          <Box minW={0}>
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              position={{ base: "static", lg: "sticky" }}
              top="6rem"
            >
              <Card bg={cardBg} shadow="lg" borderRadius={{ base: "xl", md: "2xl" }} borderWidth="1px" borderColor={borderColor} overflow="hidden">
                <Box position="relative">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    h={{ base: "150px", sm: "190px", lg: "240px" }}
                    w="full"
                    objectFit="cover"
                  />
                  {course.commerce?.pricingModel === "free" && (
                    <Badge position="absolute" top={4} right={4} colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                      Free Course
                    </Badge>
                  )}
                </Box>
                <CardBody px={{ base: 4, md: 5 }} py={{ base: 4, md: 5 }}>
                  <VStack spacing={{ base: 4, md: 5 }} align="stretch">
                    <Box textAlign="center" pt={2}>
                      <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" letterSpacing="wide">
                        {isAssignedCourseView ? "Your progress" : "Enrollment Price"}
                      </Text>
                      <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="extrabold" color={accentColor}>
                        {isAssignedCourseView
                          ? `${clampLearningProgress(course.progress)}%`
                          : course.commerce?.pricingModel === "paid"
                            ? `₹${course.commerce.amountInRupees}`
                            : "Free"}
                      </Text>
                      {isAssignedCourseView ? (
                        <Text mt={2} fontSize="sm" color={textMuted}>
                          {sectionSummary.completed} of {sectionSummary.total} lessons completed
                        </Text>
                      ) : null}
                    </Box>

                    {isAssignedCourseView ? (
                      <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={{ base: 3, md: 4 }} bg={mutedSurfaceBg}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="semibold">
                            Course progress
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {clampLearningProgress(course.progress)}%
                          </Text>
                        </HStack>
                        <Progress value={clampLearningProgress(course.progress)} colorScheme="blue" borderRadius="full" h="10px" />
                        <SimpleGrid columns={3} spacing={{ base: 2, md: 3 }} mt={4}>
                          <Box>
                            <Text fontSize="xs" textTransform="uppercase" color={textMuted}>
                              Done
                            </Text>
                            <Text mt={1} fontWeight="bold" color="green.500">
                              {sectionSummary.completed}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" textTransform="uppercase" color={textMuted}>
                              Active
                            </Text>
                            <Text mt={1} fontWeight="bold" color="blue.500">
                              {sectionSummary.inProgress}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" textTransform="uppercase" color={textMuted}>
                              Left
                            </Text>
                            <Text mt={1} fontWeight="bold">
                              {sectionSummary.notStarted}
                            </Text>
                          </Box>
                        </SimpleGrid>
                      </Box>
                    ) : null}

                    {isAssignedCourseView && courseQuizzes.length > 0 ? (
                      <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={{ base: 3, md: 4 }} bg={quizSidebarBg}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="semibold">
                            Required quizzes
                          </Text>
                          <Badge colorScheme={pendingQuizzes.length ? "orange" : "green"} borderRadius="full" px={3} py={1}>
                            {pendingQuizzes.length ? `${pendingQuizzes.length} left` : "Done"}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color={textMuted}>
                          {isCourseQuizzesLoading
                            ? "Loading quiz status..."
                            : `${completedQuizzes.length} of ${courseQuizzes.length} submitted`}
                        </Text>
                        {nextQuiz && onTakeQuiz ? (
                          <Button
                            mt={3}
                            size="sm"
                            colorScheme={pendingQuizzes.length ? "orange" : "green"}
                            borderRadius="full"
                            w="full"
                            onClick={() => onTakeQuiz(nextQuiz)}
                          >
                            {nextQuiz.attempt ? "View quiz result" : "Take next quiz"}
                          </Button>
                        ) : null}
                      </Box>
                    ) : null}

                    <MotionButton
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onMouseEnter={() => {
                        if (nextLaunchSection) {
                          warmLaunchSection(nextLaunchSection);
                        } else if (course.scormFilePath) {
                          void preloadCourseAsset(course.scormFilePath).catch(() => undefined);
                        }
                      }}
                      onFocus={() => {
                        if (nextLaunchSection) {
                          warmLaunchSection(nextLaunchSection);
                        } else if (course.scormFilePath) {
                          void preloadCourseAsset(course.scormFilePath).catch(() => undefined);
                        }
                      }}
                      onClick={() => {
                        if (nextLaunchSection) {
                          onLaunchSection(nextLaunchSection);
                          return;
                        }

                        if (course.scormFilePath) {
                          onLaunchSection({
                            assetPath: course.scormFilePath,
                            contentKind: "scorm",
                            moduleId: "",
                            moduleTitle: "",
                            sectionId: "",
                            sectionTitle: course.title || "Course",
                          });
                        }
                      }}
                      isDisabled={!nextLaunchSection && !course.scormFilePath}
                      colorScheme="blue"
                      size="lg"
                      borderRadius="xl"
                      w="full"
                      leftIcon={<Icon as={Rocket} />}
                      shadow="md"
                    >
                      {isAssignedCourseView
                        ? nextLaunchLabel
                        : getStartLearningLabel(firstPlayableLaunchSection, course.scormFilePath)}
                    </MotionButton>

                    {shouldShowCertificateStatus ? (
                      <Box>
                        <Button
                          w="full"
                          h="44px"
                          variant="outline"
                          colorScheme={canDownloadCertificate ? "green" : "gray"}
                          borderRadius="xl"
                          leftIcon={<Icon as={Award} />}
                          rightIcon={<Icon as={Download} />}
                          isDisabled={!canDownloadCertificate}
                          isLoading={canDownloadCertificate && isCertificateDownloading}
                          onClick={() => {
                            if (canDownloadCertificate && courseId) {
                              onDownloadCertificate?.(courseId);
                            }
                          }}
                        >
                          Download Certificate
                        </Button>
                        {!canDownloadCertificate ? (
                          <Text mt={2} fontSize="xs" color={textMuted} textAlign="center">
                            {certificateReason}
                          </Text>
                        ) : null}
                      </Box>
                    ) : null}

                    {isAssignedCourseView && nextLaunchSection ? (
                      <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={4}>
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color={textMuted} fontWeight="bold">
                          Next up
                        </Text>
                        <Text mt={2} fontWeight="semibold">
                          {nextLaunchSection.sectionTitle}
                        </Text>
                        <Text mt={1} fontSize="sm" color={textMuted}>
                          {nextLaunchTracking
                            ? getLearningStatusMeta(nextLaunchTracking.lessonStatus, nextLaunchTracking.progress).label
                            : "Ready to start"}
                        </Text>
                      </Box>
                    ) : null}

                    <Divider />

                    <VStack spacing={3} align="start" px={2}>
                      {isAssignedCourseView ? (
                        <>
                          <HStack>
                            <Icon as={CheckCircle} boxSize={5} color="green.500" />
                            <Text fontSize="sm" fontWeight="medium">
                              {sectionSummary.completed} lesson{sectionSummary.completed === 1 ? "" : "s"} completed
                            </Text>
                          </HStack>
                          <HStack>
                            <Icon as={Layers} boxSize={5} color="blue.500" />
                            <Text fontSize="sm" fontWeight="medium">
                              {course.curriculum?.totalModules} modules, {course.curriculum?.totalSections} lessons
                            </Text>
                          </HStack>
                          <HStack>
                            <Icon as={Calendar} boxSize={5} color="orange.500" />
                            <Text fontSize="sm" fontWeight="medium">
                              Access ends: {formatAccessLabel(course.validTill)}
                            </Text>
                          </HStack>
                          {course.progression?.certificateEnabled ? (
                            <HStack>
                              <Icon as={Award} boxSize={5} color="purple.500" />
                              <Text fontSize="sm" fontWeight="medium">Certificate available after completion</Text>
                            </HStack>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <HStack>
                            <Icon as={CheckCircle} boxSize={5} color="green.500" />
                            <Text fontSize="sm" fontWeight="medium">Full lifetime access</Text>
                          </HStack>
                          <HStack>
                            <Icon as={Layers} boxSize={5} color="blue.500" />
                            <Text fontSize="sm" fontWeight="medium">{course.curriculum?.totalSections} Interactive modules</Text>
                          </HStack>
                          {course.progression?.certificateEnabled ? (
                            <HStack>
                              <Icon as={Award} boxSize={5} color="purple.500" />
                              <Text fontSize="sm" fontWeight="medium">Certificate of completion</Text>
                            </HStack>
                          ) : null}
                          <HStack>
                            <Icon as={Star} boxSize={5} color="yellow.500" />
                            <Text fontSize="sm" fontWeight="medium">Community support</Text>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
