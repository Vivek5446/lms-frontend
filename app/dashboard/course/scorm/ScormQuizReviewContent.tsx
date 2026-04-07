"use client";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { AlertCircle, CheckCircle2, Layers3, Trophy, XCircle } from "lucide-react";
import {
  formatQuestionTitle,
  getEffectiveInteractionResult,
  groupAnswerSections,
  isReviewableInteraction,
  ScormAnswerSectionRecord,
  ScormInteractionReview,
  ScormReviewEvaluation,
  summarizeAnswerSections,
} from "./quizReviewTypes";

type ScormQuizReviewContentProps = {
  sections: ScormAnswerSectionRecord[];
  isLoading?: boolean;
  mode?: "learner" | "manager";
  emptyState?: string;
  onSaveReview?: (
    trackingId: string,
    interaction: ScormInteractionReview,
    evaluation: ScormReviewEvaluation
  ) => void | Promise<void>;
  isSubmittingReview?: boolean;
  showOnlyReviewed?: boolean;
  progressSummary?: {
    progressPercent?: number | null;
    sectionsCompleted?: number | null;
    totalSections?: number | null;
  };
};

function formatResponse(value?: string) {
  const text = String(value || "").trim();
  return text || "No answer captured";
}

function getCorrectResponses(values?: string[]) {
  return Array.isArray(values)
    ? values.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
}

type StatusMeta = {
  label: string;
  colorScheme: "green" | "red" | "orange" | "gray";
  icon: React.ReactNode;
  borderColor: string;
};

function getInteractionStatusMeta(interaction: ScormInteractionReview): StatusMeta {
  const reviewable = isReviewableInteraction(interaction);
  const effectiveResult = getEffectiveInteractionResult(interaction);

  if (reviewable) {
    if (interaction.review?.status === "reviewed" && interaction.review?.evaluation === "correct") {
      return {
        label: "Marked Correct",
        colorScheme: "green",
        icon: <CheckCircle2 size={15} />,
        borderColor: "green.300",
      };
    }

    if (interaction.review?.status === "reviewed" && interaction.review?.evaluation === "incorrect") {
      return {
        label: "Marked Incorrect",
        colorScheme: "red",
        icon: <XCircle size={15} />,
        borderColor: "red.300",
      };
    }

    return {
      label: "Pending Review",
      colorScheme: "orange",
      icon: <AlertCircle size={15} />,
      borderColor: "orange.300",
    };
  }

  if (effectiveResult === "correct" || effectiveResult === "passed") {
    return {
      label: "Correct",
      colorScheme: "green",
      icon: <CheckCircle2 size={15} />,
      borderColor: "green.300",
    };
  }

  if (effectiveResult === "incorrect" || effectiveResult === "failed" || effectiveResult === "wrong") {
    return {
      label: "Incorrect",
      colorScheme: "red",
      icon: <XCircle size={15} />,
      borderColor: "red.300",
    };
  }

  return {
    label: "Submitted",
    colorScheme: "gray",
    icon: <AlertCircle size={15} />,
    borderColor: "gray.300",
  };
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}) {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box bg={bg} borderWidth="1px" borderColor={accent || border} borderRadius="2xl" p={4}>
      <HStack spacing={2} color={accent || muted}>
        {icon}
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" fontWeight="600">
          {label}
        </Text>
      </HStack>
      <Text mt={2} fontSize="xl" fontWeight="bold">
        {value}
      </Text>
    </Box>
  );
}

function AnswerBlock({ label, value }: { label: string; value: string }) {
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box bg={bg} borderWidth="1px" borderColor={border} borderRadius="xl" p={3}>
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color={muted} fontWeight="600" mb={1}>
        {label}
      </Text>
      <Text fontSize="sm">{value}</Text>
    </Box>
  );
}

function ReviewStatusBlock({ interaction }: { interaction: ScormInteractionReview }) {
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.500", "gray.400");

  if (!isReviewableInteraction(interaction)) {
    return null;
  }

  const reviewed = interaction.review?.status === "reviewed";
  const evaluationLabel =
    interaction.review?.evaluation === "correct"
      ? "Marked Correct"
      : interaction.review?.evaluation === "incorrect"
        ? "Marked Incorrect"
        : "Pending Review";

  return (
    <Box bg={bg} borderWidth="1px" borderColor={border} borderRadius="xl" p={3}>
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color={muted} fontWeight="600" mb={1}>
        Status
      </Text>
      <Text fontSize="sm">{reviewed ? evaluationLabel : "Pending Review"}</Text>
      {reviewed && interaction.review?.marks !== null && interaction.review?.marks !== undefined ? (
        <Text mt={2} fontSize="sm" fontWeight="semibold">
          Marks: {interaction.review.marks}
        </Text>
      ) : null}
    </Box>
  );
}

function ManagerEvaluationPanel({
  interaction,
  trackingId,
  onSaveReview,
  isSubmittingReview,
}: {
  interaction: ScormInteractionReview;
  trackingId: string;
  onSaveReview?: (
    trackingId: string,
    interaction: ScormInteractionReview,
    evaluation: ScormReviewEvaluation
  ) => void | Promise<void>;
  isSubmittingReview?: boolean;
}) {
  const border = useColorModeValue("gray.200", "gray.700");
  const bg = useColorModeValue("white", "gray.800");

  if (!isReviewableInteraction(interaction)) {
    return null;
  }

  return (
    <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={4} bg={bg}>
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color="gray.500" fontWeight="600" mb={3}>
        Evaluation
      </Text>
      <HStack spacing={3} flexWrap="wrap">
        <Button
          colorScheme="green"
          variant={interaction.review?.evaluation === "correct" ? "solid" : "outline"}
          borderRadius="lg"
          leftIcon={<CheckCircle2 size={14} />}
          onClick={() => onSaveReview?.(trackingId, interaction, "correct")}
          isLoading={isSubmittingReview}
        >
          Mark Correct
        </Button>
        <Button
          colorScheme="red"
          variant={interaction.review?.evaluation === "incorrect" ? "solid" : "outline"}
          borderRadius="lg"
          leftIcon={<XCircle size={14} />}
          onClick={() => onSaveReview?.(trackingId, interaction, "incorrect")}
          isLoading={isSubmittingReview}
        >
          Mark Incorrect
        </Button>
      </HStack>
    </Box>
  );
}

function LoadingState() {
  return (
    <Stack spacing={4}>
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
        {[0, 1, 2].map((item) => (
          <Box key={item} borderWidth="1px" borderRadius="2xl" p={4}>
            <Skeleton height="10px" width="90px" />
            <Skeleton mt={3} height="24px" width="80px" />
          </Box>
        ))}
      </SimpleGrid>
      {[0, 1].map((item) => (
        <Box key={item} borderWidth="1px" borderRadius="2xl" p={4}>
          <Skeleton height="16px" width="180px" />
          <Skeleton mt={4} height="14px" width="100%" />
          <Skeleton mt={2} height="14px" width="88%" />
          <Skeleton mt={2} height="14px" width="92%" />
        </Box>
      ))}
    </Stack>
  );
}

export default function ScormQuizReviewContent({
  sections,
  isLoading = false,
  mode = "learner",
  emptyState = "Quiz answers will appear here after the SCORM lesson commits progress.",
  onSaveReview,
  isSubmittingReview = false,
  showOnlyReviewed = false,
  progressSummary,
}: ScormQuizReviewContentProps) {
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.500", "gray.400");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const moduleBg = useColorModeValue("white", "gray.800");

  const moduleGroups = groupAnswerSections(sections, { showOnlyReviewed });
  const visibleSections = moduleGroups.flatMap((moduleGroup) => moduleGroup.sections);
  const summary = summarizeAnswerSections(visibleSections);
  const hasProgressSummary =
    progressSummary?.progressPercent !== null &&
    progressSummary?.progressPercent !== undefined &&
    progressSummary?.sectionsCompleted !== null &&
    progressSummary?.sectionsCompleted !== undefined &&
    progressSummary?.totalSections !== null &&
    progressSummary?.totalSections !== undefined;

  if (isLoading && moduleGroups.length === 0) {
    return <LoadingState />;
  }

  if (moduleGroups.length === 0) {
    return (
      <Box borderWidth="1px" borderColor={border} borderRadius="2xl" p={6} textAlign="center">
        <Text color={muted} fontSize="sm">
          {emptyState}
        </Text>
      </Box>
    );
  }

  return (
    <Stack spacing={5}>
      <SimpleGrid columns={{ base: 1, md: mode === "manager" ? 3 : 2 }} spacing={3}>
        {hasProgressSummary ? (
          <SummaryCard
            label="Course Progress"
            value={`${Math.round(Number(progressSummary?.progressPercent || 0))}%`}
            icon={<Trophy size={14} />}
            accent="blue.400"
          />
        ) : null}
        <SummaryCard
          label="Score"
          value={`${summary.correctCount} / ${summary.totalQuestions}`}
          icon={<Layers3 size={14} />}
          accent="green.400"
        />
        {mode === "manager" ? (
          <SummaryCard
            label="Pending Review"
            value={summary.pending}
            icon={<AlertCircle size={14} />}
            accent="orange.400"
          />
        ) : null}
      </SimpleGrid>

      <Accordion allowMultiple defaultIndex={[0]}>
        {moduleGroups.map((moduleGroup, moduleIndex) => (
          <AccordionItem
            key={moduleGroup.moduleId || `module-${moduleIndex}`}
            borderWidth="1px"
            borderColor={border}
            borderRadius="2xl"
            bg={moduleBg}
            overflow="hidden"
            mb={3}
          >
            <AccordionButton px={5} py={4} _hover={{ bg: "transparent" }}>
              <Flex flex="1" align="center" justify="space-between" gap={4}>
                <Box textAlign="left">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color={muted} fontWeight="600">
                    Module {moduleIndex + 1}
                  </Text>
                  <Text mt={1} fontSize="md" fontWeight="semibold">
                    {moduleGroup.moduleTitle}
                  </Text>
                </Box>
                <HStack spacing={2} flexWrap="wrap" justify="flex-end">
                  <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                    {moduleGroup.sections.length} section{moduleGroup.sections.length !== 1 ? "s" : ""}
                  </Badge>
                  <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} py={1}>
                    Score {moduleGroup.correctCount}/{moduleGroup.totalQuestions}
                  </Badge>
                  <AccordionIcon color={muted} />
                </HStack>
              </Flex>
            </AccordionButton>

            <AccordionPanel px={4} pb={4} pt={0}>
              <Accordion allowMultiple defaultIndex={[0]}>
                {moduleGroup.sections.map((section, sectionIndex) => {
                  const statusValue = String(section.lessonStatus || "").toLowerCase();
                  const sectionStatusColor =
                    statusValue === "completed" || statusValue === "passed"
                      ? "green"
                      : statusValue === "failed"
                        ? "red"
                        : "gray";

                  return (
                    <AccordionItem
                      key={section._id}
                      borderWidth="1px"
                      borderColor={border}
                      borderRadius="xl"
                      bg={sectionBg}
                      overflow="hidden"
                      mb={3}
                    >
                      <AccordionButton px={4} py={3} _hover={{ bg: "transparent" }}>
                        <Flex flex="1" align="center" justify="space-between" gap={4}>
                          <Box textAlign="left">
                            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color={muted} fontWeight="600">
                              Section {sectionIndex + 1}
                            </Text>
                            <Text mt={1} fontWeight="semibold">
                              {section.sectionTitle || section.sectionId}
                            </Text>
                          </Box>
                          <HStack spacing={2} flexWrap="wrap" justify="flex-end">
                            <Badge colorScheme={sectionStatusColor} borderRadius="full" px={3} py={1}>
                              {section.lessonStatus?.replace(/_/g, " ") || "not started"}
                            </Badge>
                            <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1}>
                              Score {section.correctCount}/{section.totalQuestions}
                            </Badge>
                            <AccordionIcon color={muted} />
                          </HStack>
                        </Flex>
                      </AccordionButton>

                      <AccordionPanel px={3} pb={3} pt={0}>
                        <Accordion allowMultiple>
                          {section.interactions.map((interaction, questionIndex) => {
                            const statusMeta = getInteractionStatusMeta(interaction);
                            const questionTitle = formatQuestionTitle(interaction, questionIndex);
                            const correctResponses = getCorrectResponses(interaction.correctResponses);

                            return (
                              <AccordionItem
                                key={interaction.uniqueKey || interaction._id}
                                borderWidth="1px"
                                borderColor={statusMeta.borderColor}
                                borderRadius="xl"
                                bg={moduleBg}
                                overflow="hidden"
                                mb={3}
                              >
                                <AccordionButton px={4} py={3} _hover={{ bg: "transparent" }}>
                                  <Flex flex="1" align="center" justify="space-between" gap={3} minW={0}>
                                    <HStack spacing={3} minW={0} flex="1" align="center">
                                      <Box
                                        color={
                                          statusMeta.colorScheme === "green"
                                            ? "green.500"
                                            : statusMeta.colorScheme === "red"
                                              ? "red.500"
                                              : statusMeta.colorScheme === "orange"
                                                ? "orange.500"
                                                : "gray.400"
                                        }
                                        flexShrink={0}
                                      >
                                        {statusMeta.icon}
                                      </Box>
                                      <Box minW={0}>
                                        <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                                          Q{questionIndex + 1}: {questionTitle}
                                        </Text>
                                      </Box>
                                    </HStack>
                                    <HStack spacing={2} flexShrink={0}>
                                      <Badge colorScheme={statusMeta.colorScheme} borderRadius="full" px={3} py={1}>
                                        {statusMeta.label}
                                      </Badge>
                                      <AccordionIcon color={muted} />
                                    </HStack>
                                  </Flex>
                                </AccordionButton>

                                <AccordionPanel px={4} pb={4} pt={0}>
                                  <Stack spacing={3}>
                                    <Grid
                                      templateColumns={{
                                        base: "1fr",
                                        md: correctResponses.length ? "repeat(2, minmax(0, 1fr))" : "1fr",
                                      }}
                                      gap={3}
                                    >
                                      <AnswerBlock label="Your Answer" value={formatResponse(interaction.learnerResponse)} />
                                      {correctResponses.length ? (
                                        <AnswerBlock
                                          label="Correct Answer"
                                          value={correctResponses.join(", ")}
                                        />
                                      ) : null}
                                    </Grid>

                                    <ReviewStatusBlock interaction={interaction} />

                                    {mode === "manager" ? (
                                      <ManagerEvaluationPanel
                                        interaction={interaction}
                                        trackingId={section._id}
                                        onSaveReview={onSaveReview}
                                        isSubmittingReview={isSubmittingReview}
                                      />
                                    ) : null}
                                  </Stack>
                                </AccordionPanel>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </AccordionPanel>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      {mode === "manager" ? (
        <Text color={muted} fontSize="sm">
          Only subjective or input-style answers need evaluation. Auto-graded answers remain read-only.
        </Text>
      ) : null}
    </Stack>
  );
}
