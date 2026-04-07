"use client";

import { isManagerRole } from "@/app/config/utils/roleAccess";
import ScormQuizReviewContent from "@/app/dashboard/course/scorm/ScormQuizReviewContent";
import { ScormInteractionReview, ScormReviewDraftMap } from "@/app/dashboard/course/scorm/quizReviewTypes";
import { managerStore } from "@/app/store/managerStore/managerStore";
import stores from "@/app/store/stores";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
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
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";

function getProgressColor(progress: number) {
  if (progress >= 100) {
    return "green";
  }

  if (progress > 0) {
    return "yellow";
  }

  return "red";
}

function formatScore(score?: number | null) {
  if (score === null || score === undefined) {
    return "N/A";
  }

  return `${Math.round(score * 100) / 100}`;
}

function formatTime(value?: string | null) {
  return value || "00:00:00";
}

function averageNumbers(values: number[]) {
  if (!values.length) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 100) / 100;
}

function averageNullableNumbers(values: Array<number | null | undefined>) {
  const numericValues = values.filter((value): value is number => Number.isFinite(value));
  if (!numericValues.length) {
    return null;
  }

  return averageNumbers(numericValues);
}

const ManagerLearningBoard = observer(() => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();
  const isManagerUser = isManagerRole(role);
  const [selectedLearnerId, setSelectedLearnerId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState<ScormReviewDraftMap>({});

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const metricBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const activeCourseBg = useColorModeValue("teal.50", "teal.900");

  useEffect(() => {
    if (!isManagerUser) {
      return;
    }

    managerStore.fetchManagedLearners().catch(() => undefined);
  }, [isManagerUser]);

  const selectedCourse = useMemo(() => {
    const courses = managerStore.learnerProgress?.courses || [];
    return courses.find((course) => course.courseId === selectedCourseId) || courses[0] || null;
  }, [selectedCourseId, managerStore.learnerProgress?.courses]);

  const openLearner = async (learnerId: string) => {
    setSelectedLearnerId(learnerId);
    setSelectedCourseId("");
    setReviewDrafts({});
    onOpen();

    try {
      const learnerProgress = await managerStore.fetchLearnerProgress(learnerId);
      const initialCourseId = learnerProgress?.courses?.[0]?.courseId || "";
      setSelectedCourseId(initialCourseId);

      if (initialCourseId) {
        await managerStore.fetchLearnerAnswers(learnerId, initialCourseId);
      }
    } catch (error: any) {
      toast({
        title: "Unable to load learner details",
        description: error?.message || error?.error || "Please try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const selectCourse = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setReviewDrafts({});

    if (!selectedLearnerId) {
      return;
    }

    try {
      await managerStore.fetchLearnerAnswers(selectedLearnerId, courseId);
    } catch (error: any) {
      toast({
        title: "Unable to load answers",
        description: error?.message || error?.error || "Please try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const handleCloseDrawer = () => {
    setSelectedLearnerId("");
    setSelectedCourseId("");
    setReviewDrafts({});
    managerStore.clearLearnerState();
    onClose();
  };

  const handleReviewChange = (interactionId: string, field: "marksOverride" | "feedback", value: string) => {
    setReviewDrafts((current) => ({
      ...current,
      [interactionId]: {
        marksOverride: current[interactionId]?.marksOverride ?? "",
        feedback: current[interactionId]?.feedback ?? "",
        [field]: value,
      },
    }));
  };

  const submitReview = async (trackingId: string, interaction: ScormInteractionReview) => {
    const draft = reviewDrafts[interaction._id] || {
      marksOverride:
        interaction.review?.marksOverride !== null && interaction.review?.marksOverride !== undefined
          ? String(interaction.review.marksOverride)
          : "",
      feedback: interaction.review?.feedback || "",
    };
    const marksOverride =
      draft.marksOverride.trim() === "" ? null : Number(draft.marksOverride);

    if (marksOverride !== null && (!Number.isFinite(marksOverride) || marksOverride < 0)) {
      toast({
        title: "Enter valid marks",
        description: "Marks override must be a non-negative number.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await managerStore.reviewAnswer({
        trackingId,
        interactionId: interaction._id,
        marksOverride,
        feedback: draft.feedback,
      });
      toast({
        title: "Review saved",
        description: "The learner can now see the updated feedback in quiz review.",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Unable to save review",
        description: error?.message || error?.error || "Please try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  if (!isManagerUser) {
    return (
      <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 6 }}>
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="3xl" p={8}>
          <Heading size="md">Manager workspace is available to manager roles only</Heading>
          <Text mt={3} color={mutedText}>
            This page is meant for manager and L1/L2 manager users who review learner progress and answer submissions.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg}>
      <Stack spacing={6}>
        <Box
          borderRadius="3xl"
          px={{ base: 5, md: 8 }}
          py={{ base: 6, md: 8 }}
          bg="linear-gradient(135deg, #052e16 0%, #0f766e 52%, #dcfce7 100%)"
          color="white"
        >
          <Grid templateColumns={{ base: "1fr", lg: "1.4fr 0.9fr" }} gap={6}>
            <Box>
              <Badge bg="whiteAlpha.300" color="white" borderRadius="full" px={3} py={1}>
                Team Review
              </Badge>
              <Heading mt={4} size="lg">
                Track learner progress, scores, and answer reviews from one place
              </Heading>
              <Text mt={3} color="whiteAlpha.900" maxW="2xl">
                Open a learner to inspect course progress at the module and section level, review captured quiz
                answers, and save marks plus feedback question by question.
              </Text>
            </Box>

            <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={3}>
              <Box bg="whiteAlpha.220" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="2xl" p={4}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em" color="whiteAlpha.800">
                  Learners
                </Text>
                <Text mt={2} fontSize="2xl" fontWeight="bold">
                  {managerStore.learners.length}
                </Text>
              </Box>
              <Box bg="whiteAlpha.220" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="2xl" p={4}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em" color="whiteAlpha.800">
                  Avg Progress
                </Text>
                <Text mt={2} fontSize="2xl" fontWeight="bold">
                  {Math.round(
                    averageNumbers(managerStore.learners.map((learner) => Number(learner.overallProgress || 0)))
                  )}
                  %
                </Text>
              </Box>
              <Box bg="whiteAlpha.220" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="2xl" p={4}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em" color="whiteAlpha.800">
                  Avg Score
                </Text>
                <Text mt={2} fontSize="2xl" fontWeight="bold">
                  {formatScore(averageNullableNumbers(managerStore.learners.map((learner) => learner.avgScore)))}
                </Text>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {managerStore.isLearnersLoading ? (
          <HStack justify="center" py={20}>
            <Spinner />
            <Text color={mutedText}>Loading assigned learners...</Text>
          </HStack>
        ) : managerStore.learners.length === 0 ? (
          <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="3xl" p={8}>
            <Heading size="md">No assigned learners yet</Heading>
            <Text mt={3} color={mutedText}>
              Learners will appear here when they are assigned to you through the manager hierarchy.
            </Text>
          </Box>
        ) : (
          <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="3xl" overflow="hidden">
            <TableContainer>
              <Table variant="simple">
                <Thead bg={metricBg}>
                  <Tr>
                    <Th>Learner</Th>
                    <Th>Department</Th>
                    <Th isNumeric>Progress</Th>
                    <Th isNumeric>Avg Score</Th>
                    <Th isNumeric>Courses</Th>
                    <Th />
                  </Tr>
                </Thead>
                <Tbody>
                  {managerStore.learners.map((learner) => (
                    <Tr key={learner._id}>
                      <Td>
                        <Text fontWeight="semibold">{learner.name}</Text>
                        <Text mt={1} fontSize="sm" color={mutedText}>
                          {learner.email || learner.username || "Learner account"}
                        </Text>
                      </Td>
                      <Td>
                        {learner.department ? (
                          <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                            {learner.department}
                          </Badge>
                        ) : (
                          <Text color={mutedText}>Unassigned</Text>
                        )}
                      </Td>
                      <Td isNumeric>
                        <HStack justify="flex-end" spacing={3}>
                          <CircularProgress
                            value={learner.overallProgress}
                            color={`${getProgressColor(learner.overallProgress)}.400`}
                            size="54px"
                            thickness="10px"
                          >
                            <CircularProgressLabel fontSize="xs" fontWeight="bold">
                              {Math.round(learner.overallProgress)}%
                            </CircularProgressLabel>
                          </CircularProgress>
                        </HStack>
                      </Td>
                      <Td isNumeric>{formatScore(learner.avgScore)}</Td>
                      <Td isNumeric>
                        {learner.completedCourses}/{learner.courseCount}
                      </Td>
                      <Td textAlign="right">
                        <Button colorScheme="teal" borderRadius="xl" onClick={() => openLearner(learner._id)}>
                          View Answers
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Stack>

      <Drawer isOpen={isOpen} placement="right" onClose={handleCloseDrawer} size="2xl">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Learner Review</DrawerHeader>
          <DrawerBody py={6}>
            {managerStore.isLearnerProgressLoading || !managerStore.learnerProgress ? (
              <HStack justify="center" py={20}>
                <Spinner />
                <Text color={mutedText}>Loading learner details...</Text>
              </HStack>
            ) : (
              <Stack spacing={6}>
                <Box borderWidth="1px" borderColor={borderColor} borderRadius="3xl" p={5}>
                  <Heading size="md">{managerStore.learnerProgress.learner.name}</Heading>
                  <Text mt={1} color={mutedText}>
                    {managerStore.learnerProgress.learner.email || managerStore.learnerProgress.learner.username || ""}
                  </Text>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(3, minmax(0, 1fr))" }} gap={3} mt={5}>
                    <Box borderRadius="2xl" bg={metricBg} p={3}>
                      <Text fontSize="xs" textTransform="uppercase" color={mutedText}>
                        Overall progress
                      </Text>
                      <Text mt={2} fontWeight="bold">
                        {Math.round(managerStore.learnerProgress.summary.overallProgress)}%
                      </Text>
                    </Box>
                    <Box borderRadius="2xl" bg={metricBg} p={3}>
                      <Text fontSize="xs" textTransform="uppercase" color={mutedText}>
                        Avg score
                      </Text>
                      <Text mt={2} fontWeight="bold">
                        {formatScore(managerStore.learnerProgress.summary.avgScore)}
                      </Text>
                    </Box>
                    <Box borderRadius="2xl" bg={metricBg} p={3}>
                      <Text fontSize="xs" textTransform="uppercase" color={mutedText}>
                        Courses
                      </Text>
                      <Text mt={2} fontWeight="bold">
                        {managerStore.learnerProgress.summary.courseCount}
                      </Text>
                    </Box>
                  </Grid>
                </Box>

                <Box>
                  <Heading size="sm" mb={3}>
                    Courses
                  </Heading>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }} gap={4}>
                    {managerStore.learnerProgress.courses.map((course) => {
                      const isActive = selectedCourse?.courseId === course.courseId;
                      return (
                        <Box
                          key={course.courseId}
                          borderWidth="1px"
                          borderColor={isActive ? "teal.400" : borderColor}
                          borderRadius="3xl"
                          p={4}
                          bg={isActive ? activeCourseBg : cardBg}
                          cursor="pointer"
                          onClick={() => void selectCourse(course.courseId)}
                        >
                          <Flex justify="space-between" align="start" gap={4}>
                            <Box flex="1">
                              <Text fontWeight="bold">{course.title}</Text>
                              <Text mt={1} color={mutedText} fontSize="sm">
                                Attempts {course.attempts} | Score {formatScore(course.score)}
                              </Text>
                              <Text mt={1} color={mutedText} fontSize="sm">
                                Answers {course.answerSummary?.reviewed || 0} reviewed / {course.answerSummary?.pending || 0} pending
                              </Text>
                            </Box>

                            <CircularProgress
                              value={course.progress}
                              color={`${getProgressColor(course.progress)}.400`}
                              size="64px"
                              thickness="10px"
                            >
                              <CircularProgressLabel fontSize="xs" fontWeight="bold">
                                {Math.round(course.progress)}%
                              </CircularProgressLabel>
                            </CircularProgress>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Grid>
                </Box>

                {selectedCourse ? (
                  <>
                    <Box>
                      <Heading size="sm" mb={3}>
                        Module Breakdown
                      </Heading>
                      <Accordion allowMultiple defaultIndex={[0]}>
                        {selectedCourse.modules.map((moduleRecord) => (
                          <AccordionItem key={moduleRecord.moduleId} borderWidth="1px" borderColor={borderColor} borderRadius="2xl" mb={3}>
                            <h2>
                              <AccordionButton py={4}>
                                <Flex flex="1" justify="space-between" align="center" gap={4}>
                                  <Box textAlign="left">
                                    <Text fontWeight="semibold">{moduleRecord.title}</Text>
                                    <Text mt={1} fontSize="sm" color={mutedText}>
                                      Score {formatScore(moduleRecord.score)} | Attempts {moduleRecord.attempts}
                                    </Text>
                                  </Box>
                                  <HStack spacing={4}>
                                    <CircularProgress
                                      value={moduleRecord.progress}
                                      color={`${getProgressColor(moduleRecord.progress)}.400`}
                                      size="56px"
                                      thickness="10px"
                                    >
                                      <CircularProgressLabel fontSize="xs" fontWeight="bold">
                                        {Math.round(moduleRecord.progress)}%
                                      </CircularProgressLabel>
                                    </CircularProgress>
                                    <AccordionIcon />
                                  </HStack>
                                </Flex>
                              </AccordionButton>
                            </h2>
                            <AccordionPanel pt={0} pb={5}>
                              <Stack spacing={3}>
                                {moduleRecord.sections.map((sectionRecord) => (
                                  <Flex
                                    key={sectionRecord.sectionId}
                                    justify="space-between"
                                    align="center"
                                    gap={4}
                                    p={4}
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    borderRadius="2xl"
                                  >
                                    <Box flex="1">
                                      <Text fontWeight="medium">{sectionRecord.title}</Text>
                                      <Text mt={1} fontSize="sm" color={mutedText}>
                                        {sectionRecord.lessonStatus.replace(/_/g, " ")} | Time {formatTime(sectionRecord.totalTime)}
                                      </Text>
                                      <Text mt={1} fontSize="sm" color={mutedText}>
                                        Score {formatScore(sectionRecord.score)} | Attempts {sectionRecord.attempts}
                                      </Text>
                                    </Box>

                                    <CircularProgress
                                      value={sectionRecord.progress}
                                      color={`${getProgressColor(sectionRecord.progress)}.400`}
                                      size="54px"
                                      thickness="10px"
                                    >
                                      <CircularProgressLabel fontSize="xs" fontWeight="bold">
                                        {Math.round(sectionRecord.progress)}%
                                      </CircularProgressLabel>
                                    </CircularProgress>
                                  </Flex>
                                ))}
                              </Stack>
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </Box>

                    <Box>
                      <Flex justify="space-between" align="center" gap={3} mb={3} wrap="wrap">
                        <Heading size="sm">Answers Review</Heading>
                        <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                          {selectedCourse.title}
                        </Badge>
                      </Flex>

                      <ScormQuizReviewContent
                        sections={managerStore.learnerAnswers}
                        isLoading={managerStore.isLearnerAnswersLoading}
                        mode="manager"
                        reviewDrafts={reviewDrafts}
                        onReviewChange={handleReviewChange}
                        onSaveReview={submitReview}
                        isSubmittingReview={managerStore.isSubmittingReview}
                        emptyState="No SCORM answers have been captured for this course yet."
                      />
                    </Box>
                  </>
                ) : null}
              </Stack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
});

export default ManagerLearningBoard;
