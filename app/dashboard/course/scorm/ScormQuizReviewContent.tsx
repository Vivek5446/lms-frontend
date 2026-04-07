"use client";

import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ScormAnswerSectionRecord,
  ScormInteractionReview,
  ScormReviewDraftMap,
  summarizeAnswerSections,
} from "./quizReviewTypes";

type ScormQuizReviewContentProps = {
  sections: ScormAnswerSectionRecord[];
  isLoading?: boolean;
  mode?: "learner" | "manager";
  emptyState?: string;
  reviewDrafts?: ScormReviewDraftMap;
  onReviewChange?: (interactionId: string, field: "marksOverride" | "feedback", value: string) => void;
  onSaveReview?: (trackingId: string, interaction: ScormInteractionReview) => void | Promise<void>;
  isSubmittingReview?: boolean;
  showOnlyReviewed?: boolean;
};

function formatResultLabel(result?: string) {
  const normalized = String(result || "").trim().toLowerCase();
  if (normalized === "correct" || normalized === "passed") {
    return { label: "Correct", colorScheme: "green" as const };
  }

  if (normalized === "incorrect" || normalized === "failed" || normalized === "wrong") {
    return { label: "Incorrect", colorScheme: "red" as const };
  }

  if (!normalized) {
    return { label: "Captured", colorScheme: "gray" as const };
  }

  return { label: normalized.replace(/_/g, " "), colorScheme: "blue" as const };
}

function formatStatusLabel(status?: string) {
  const normalized = String(status || "").trim();
  return normalized ? normalized.replace(/_/g, " ") : "not attempted";
}

function formatResponse(value?: string) {
  const text = String(value || "").trim();
  return text || "No answer captured";
}

function formatCorrectResponses(values?: string[]) {
  const responses = Array.isArray(values) ? values.map((value) => String(value || "").trim()).filter(Boolean) : [];
  return responses.length ? responses.join(", ") : "Not provided";
}

export default function ScormQuizReviewContent({
  sections,
  isLoading = false,
  mode = "learner",
  emptyState = "Quiz answers will appear here after the SCORM lesson commits progress.",
  reviewDrafts = {},
  onReviewChange,
  onSaveReview,
  isSubmittingReview = false,
  showOnlyReviewed = false,
}: ScormQuizReviewContentProps) {
  const cardBg = useColorModeValue("white", "gray.800");
  const sectionBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const metricBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const reviewedBg = useColorModeValue("green.50", "green.900");
  const pendingBg = useColorModeValue("yellow.50", "yellow.900");

  const visibleSections = sections
    .map((section) => ({
      ...section,
      interactions: showOnlyReviewed
        ? section.interactions.filter(
            (interaction) =>
              interaction.review?.status === "reviewed" ||
              Boolean(interaction.review?.feedback) ||
              interaction.review?.marksOverride !== null && interaction.review?.marksOverride !== undefined
          )
        : section.interactions,
    }))
    .filter((section) => section.interactions.length > 0);
  const summary = summarizeAnswerSections(visibleSections);

  if (isLoading) {
    return (
      <Box borderWidth="1px" borderColor={borderColor} borderRadius="2xl" p={5}>
        <Text color={mutedText}>Loading quiz answers...</Text>
      </Box>
    );
  }

  if (visibleSections.length === 0) {
    return (
      <Box borderWidth="1px" borderColor={borderColor} borderRadius="2xl" p={5}>
        <Text color={mutedText}>{emptyState}</Text>
      </Box>
    );
  }

  return (
    <Stack spacing={5}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
        <Box borderWidth="1px" borderColor={borderColor} borderRadius="2xl" bg={metricBg} p={4}>
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color={mutedText}>
            Score Summary
          </Text>
          <Text mt={2} fontSize="xl" fontWeight="bold">
            {summary.correctCount}/{summary.totalQuestions || 0}
          </Text>
          <Text mt={1} fontSize="sm" color={mutedText}>
            {mode === "learner" ? "You scored" : "Correct responses captured"}
          </Text>
        </Box>
        <Box borderWidth="1px" borderColor={borderColor} borderRadius="2xl" bg={metricBg} p={4}>
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color={mutedText}>
            Pending Review
          </Text>
          <Text mt={2} fontSize="xl" fontWeight="bold">
            {summary.pending}
          </Text>
          <Text mt={1} fontSize="sm" color={mutedText}>
            Interactions without manager review
          </Text>
        </Box>
        <Box borderWidth="1px" borderColor={borderColor} borderRadius="2xl" bg={metricBg} p={4}>
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color={mutedText}>
            Reviewed
          </Text>
          <Text mt={2} fontSize="xl" fontWeight="bold">
            {summary.reviewed}
          </Text>
          <Text mt={1} fontSize="sm" color={mutedText}>
            Questions with saved manager feedback
          </Text>
        </Box>
      </SimpleGrid>

      {visibleSections.map((section) => (
        <Box
          key={section._id}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="3xl"
          bg={sectionBg}
          p={5}
        >
          <Flex justify="space-between" align="start" gap={3} wrap="wrap">
            <Box>
              <HStack spacing={2} flexWrap="wrap">
                {section.courseTitle ? (
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                    {section.courseTitle}
                  </Badge>
                ) : null}
                <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                  {section.moduleTitle || section.moduleId}
                </Badge>
                <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                  {section.sectionTitle || section.sectionId}
                </Badge>
              </HStack>
              <Text mt={3} fontSize="sm" color={mutedText}>
                Status {formatStatusLabel(section.lessonStatus)} | Raw score {section.score ?? "N/A"} | Time {section.totalTime || "00:00:00"}
              </Text>
            </Box>
            <VStack align="end" spacing={2}>
              <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                {section.correctCount}/{section.totalQuestions} correct
              </Badge>
              <Badge colorScheme="yellow" borderRadius="full" px={3} py={1}>
                {section.reviewSummary.reviewed} reviewed / {section.reviewSummary.pending} pending
              </Badge>
            </VStack>
          </Flex>

          <Divider my={5} />

          <Stack spacing={4}>
            {section.interactions.map((interaction, interactionIndex) => {
              const resultMeta = formatResultLabel(interaction.result);
              const draft = reviewDrafts[interaction._id] || {
                marksOverride:
                  interaction.review?.marksOverride !== null && interaction.review?.marksOverride !== undefined
                    ? String(interaction.review.marksOverride)
                    : "",
                feedback: interaction.review?.feedback || "",
              };

              return (
                <Box
                  key={interaction._id || `${section._id}-${interactionIndex}`}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  bg={interaction.review?.status === "reviewed" ? reviewedBg : pendingBg}
                  p={4}
                >
                  <Grid templateColumns={{ base: "1fr", xl: mode === "manager" ? "1.4fr 0.9fr" : "1fr" }} gap={4}>
                    <Box>
                      <Flex justify="space-between" align="start" gap={3} wrap="wrap">
                        <Box>
                          <Text fontWeight="bold">
                            {interaction.question || `Question ${interactionIndex + 1}`}
                          </Text>
                          {interaction.id ? (
                            <Text mt={1} fontSize="sm" color={mutedText}>
                              ID: {interaction.id}
                            </Text>
                          ) : null}
                        </Box>
                        <Badge colorScheme={resultMeta.colorScheme} borderRadius="full" px={3} py={1}>
                          {resultMeta.label}
                        </Badge>
                      </Flex>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt={4}>
                        <Box bg={cardBg} borderRadius="xl" p={3}>
                          <Text fontSize="sm" color={mutedText}>
                            Your Answer
                          </Text>
                          <Text mt={1} fontSize="sm">
                            {formatResponse(interaction.learnerResponse)}
                          </Text>
                        </Box>
                        <Box bg={cardBg} borderRadius="xl" p={3}>
                          <Text fontSize="sm" color={mutedText}>
                            Correct Answer
                          </Text>
                          <Text mt={1} fontSize="sm">
                            {formatCorrectResponses(interaction.correctResponses)}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      {(interaction.time || interaction.latency) ? (
                        <HStack spacing={4} mt={3} color={mutedText} fontSize="sm" flexWrap="wrap">
                          {interaction.time ? <Text>Time {interaction.time}</Text> : null}
                          {interaction.latency ? <Text>Latency {interaction.latency}</Text> : null}
                        </HStack>
                      ) : null}

                      {mode === "learner" && (interaction.review?.feedback || interaction.review?.marksOverride !== null && interaction.review?.marksOverride !== undefined) ? (
                        <Box mt={4} bg={cardBg} borderRadius="xl" p={4}>
                          <Text fontSize="sm" color={mutedText}>
                            Manager Review
                          </Text>
                          {interaction.review?.feedback ? (
                            <Text mt={2} fontSize="sm">
                              {interaction.review.feedback}
                            </Text>
                          ) : null}
                          {interaction.review?.marksOverride !== null && interaction.review?.marksOverride !== undefined ? (
                            <Text mt={2} fontSize="sm" fontWeight="semibold">
                              Marks override: {interaction.review.marksOverride}
                            </Text>
                          ) : null}
                        </Box>
                      ) : null}
                    </Box>

                    {mode === "manager" ? (
                      <VStack align="stretch" spacing={3}>
                        <Badge
                          alignSelf="flex-start"
                          colorScheme={interaction.review?.status === "reviewed" ? "green" : "yellow"}
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {interaction.review?.status === "reviewed" ? "Reviewed" : "Pending review"}
                        </Badge>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Marks override (optional)"
                          value={draft.marksOverride}
                          onChange={(event) => onReviewChange?.(interaction._id, "marksOverride", event.target.value)}
                          bg={cardBg}
                        />
                        <Textarea
                          placeholder="Add manager feedback"
                          value={draft.feedback}
                          onChange={(event) => onReviewChange?.(interaction._id, "feedback", event.target.value)}
                          bg={cardBg}
                          rows={4}
                        />
                        <Button
                          colorScheme="teal"
                          onClick={() => onSaveReview?.(section._id, interaction)}
                          isLoading={isSubmittingReview}
                        >
                          Save review
                        </Button>
                      </VStack>
                    ) : null}
                  </Grid>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
