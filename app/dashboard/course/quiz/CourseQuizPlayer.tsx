"use client";

import { CourseQuizForLearner } from "@/app/store/courseStore/courseStore";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useTheme,
  useToast,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  PartyPopper,
  Send,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CourseQuizPlayerProps {
  quiz: CourseQuizForLearner;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (
    answers: Array<{ questionId: string; selectedOptionId: string }>,
  ) => Promise<any>;
}

const MotionBox = motion(Box);

export default function CourseQuizPlayer({
  quiz,
  isSubmitting = false,
  onClose,
  onSubmit,
}: CourseQuizPlayerProps) {
  const toast = useToast();
  const theme = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState(quiz.attempt || null);

  useEffect(() => {
    const previousAnswers = quiz.attempt?.answers || [];

    setAnswers(
      Object.fromEntries(
        previousAnswers.map((answer) => [
          answer.questionId,
          answer.selectedOptionId,
        ]),
      ),
    );
    setCurrentIndex(0);
    setResult(quiz.attempt || null);
  }, [quiz.quizId, quiz.attempt?._id]);

  const brandScale = (theme.colors?.brand || {}) as Record<number, string>;
  const brand50 = brandScale[50] || "#EFF6FF";
  const brand100 = brandScale[100] || "#DBEAFE";
  const brand200 = brandScale[200] || "#BFDBFE";
  const brand500 = brandScale[500] || "#2563EB";
  const brand700 = brandScale[700] || "#1D4ED8";

  const overlayBg = useColorModeValue(
    "rgba(15, 23, 42, 0.68)",
    "rgba(2, 6, 23, 0.84)",
  );
  const shellBg = useColorModeValue(
    "rgba(255,255,255,0.98)",
    "rgba(15,23,42,0.98)",
  );
  const surfaceBg = useColorModeValue("white", "gray.800");
  const mutedSurfaceBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.900", "white");
  const textMuted = useColorModeValue("gray.600", "gray.300");
  const footerBg = useColorModeValue(
    "rgba(255,255,255,0.96)",
    "rgba(15,23,42,0.96)",
  );
  const progressTrackBg = useColorModeValue("gray.100", "whiteAlpha.200");
  const questionBadgeBg = useColorModeValue(brand50, "whiteAlpha.100");
  const questionBadgeText = useColorModeValue(brand700, "white");

  const answeredCount = quiz.questions.filter(
    (question) => answers[question.questionId],
  ).length;
  const unansweredCount = Math.max(quiz.questions.length - answeredCount, 0);
  const progressPercent = quiz.questions.length
    ? Math.round((answeredCount / quiz.questions.length) * 100)
    : 0;
  const currentQuestion = quiz.questions[currentIndex];
  const currentAnswerId = currentQuestion
    ? answers[currentQuestion.questionId]
    : "";
  const isCompleted = Boolean(result);

  const answerReviewMap = useMemo(
    () =>
      new Map(
        (result?.answers || []).map((answer) => [answer.questionId, answer]),
      ),
    [result?.answers],
  );

  const chooseAnswer = (optionId: string) => {
    if (!currentQuestion) return;

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.questionId]: optionId,
    }));
  };

  const goToNextQuestion = () => {
    setCurrentIndex((index) => Math.min(quiz.questions.length - 1, index + 1));
  };

  const submitQuiz = async () => {
    const unansweredIndex = quiz.questions.findIndex(
      (question) => !answers[question.questionId],
    );

    if (unansweredIndex >= 0) {
      setCurrentIndex(unansweredIndex);
      toast({
        title: "Complete every question",
        description: "We moved you to the first unanswered question.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = quiz.questions.map((question) => ({
      questionId: question.questionId,
      selectedOptionId: answers[question.questionId],
    }));

    const response = await onSubmit(payload);
    setResult(response?.attempt || null);
  };

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1500}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: 2, sm: 3, md: 5 }}
      bg={overlayBg}
      sx={{ overscrollBehavior: "contain" }}
    >
      <MotionBox
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 14 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        position="relative"
        display="grid"
        gridTemplateRows="auto minmax(0, 1fr) auto"
        w="full"
        maxW="920px"
        h={{ base: "calc(100dvh - 16px)", md: "min(780px, calc(100dvh - 40px))" }}
        maxH="calc(100dvh - 16px)"
        overflow="hidden"
        bg={shellBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius={{ base: "20px", md: "28px" }}
        boxShadow="0 28px 90px rgba(15, 23, 42, 0.38)"
        backdropFilter="blur(18px)"
      >
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          bg={`radial-gradient(circle at top left, ${brand100} 0%, transparent 31%), radial-gradient(circle at bottom right, ${brand200} 0%, transparent 25%)`}
          opacity={0.55}
        />

        {/* Compact header */}
        <Box
          position="relative"
          zIndex={1}
          px={{ base: 3, md: 5 }}
          pt={{ base: 3, md: 4 }}
          pb={{ base: 2.5, md: 3.5 }}
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          <Flex align="flex-start" justify="space-between" gap={3}>
            <Box minW={0} flex="1">
              <HStack spacing={2} mb={1.5} flexWrap="wrap">
                <Badge
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  bg={brand500}
                  color="white"
                  fontSize="10px"
                >
                  {quiz.scope === "final"
                    ? "Final Quiz"
                    : quiz.moduleTitle || "Module Quiz"}
                </Badge>
                <Badge
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  bg={questionBadgeBg}
                  color={questionBadgeText}
                  fontSize="10px"
                >
                  {quiz.totalMarks} marks
                </Badge>
                <Text fontSize="xs" color={textMuted} fontWeight="700">
                  {quiz.questions.length} questions
                </Text>
              </HStack>

              <Text
                noOfLines={1}
                color={textColor}
                fontSize={{ base: "md", md: "xl" }}
                fontWeight="900"
              >
                {quiz.title}
              </Text>
            </Box>

            <Button
              onClick={onClose}
              aria-label="Close quiz"
              variant="ghost"
              size="sm"
              minW="36px"
              h="36px"
              p={0}
              borderRadius="full"
            >
              <X size={18} />
            </Button>
          </Flex>

          <Flex mt={3} align="center" gap={3}>
            <Progress
              flex="1"
              value={isCompleted ? 100 : progressPercent}
              colorScheme="brand"
              h="7px"
              bg={progressTrackBg}
              borderRadius="full"
              sx={{ "& > div": { transition: "width 0.25s ease" } }}
            />
            <Text
              flexShrink={0}
              fontSize="xs"
              color={textMuted}
              fontWeight="800"
            >
              {isCompleted
                ? "Complete"
                : `${answeredCount}/${quiz.questions.length}`}
            </Text>
          </Flex>

          {!isCompleted && (
            <HStack
              mt={3}
              spacing={2}
              overflowX="auto"
              pb={1}
              sx={{
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { height: "4px" },
                "&::-webkit-scrollbar-thumb": {
                  background: borderColor,
                  borderRadius: "999px",
                },
              }}
            >
              {quiz.questions.map((question, index) => {
                const isCurrent = index === currentIndex;
                const isAnswered = Boolean(answers[question.questionId]);

                return (
                  <MotionBox
                    key={question.questionId}
                    as="button"
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setCurrentIndex(index)}
                    flex="0 0 auto"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w="34px"
                    h="34px"
                    borderRadius="12px"
                    borderWidth="1px"
                    borderColor={
                      isCurrent ? brand500 : isAnswered ? brand200 : borderColor
                    }
                    bg={
                      isCurrent ? brand500 : isAnswered ? brand50 : surfaceBg
                    }
                    color={isCurrent ? "white" : textColor}
                    fontSize="xs"
                    fontWeight="900"
                    boxShadow={isCurrent ? `0 8px 20px ${brand100}` : "none"}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    {isAnswered && !isCurrent ? <Check size={14} /> : index + 1}
                  </MotionBox>
                );
              })}
            </HStack>
          )}
        </Box>

        {/* Scrollable content */}
        <Box
          position="relative"
          zIndex={1}
          minH={0}
          overflowY="auto"
          px={{ base: 3, md: 5 }}
          py={{ base: 3, md: 4 }}
          sx={{
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              background: borderColor,
              borderRadius: "999px",
            },
          }}
        >
          {isCompleted && result ? (
            <Stack spacing={{ base: 3, md: 4 }}>
              <Box
                borderWidth="1px"
                borderColor={brand200}
                bg={`linear-gradient(135deg, ${brand50}, ${surfaceBg})`}
                borderRadius={{ base: "18px", md: "22px" }}
                p={{ base: 4, md: 5 }}
              >
                <Flex
                  align={{ base: "flex-start", sm: "center" }}
                  justify="space-between"
                  gap={3}
                  direction={{ base: "column", sm: "row" }}
                >
                  <HStack spacing={3} align="flex-start">
                    <Flex
                      align="center"
                      justify="center"
                      w="42px"
                      h="42px"
                      flexShrink={0}
                      borderRadius="14px"
                      bg={brand500}
                      color="white"
                    >
                      <PartyPopper size={20} />
                    </Flex>
                    <Box>
                      <Text color={textColor} fontSize="lg" fontWeight="900">
                        Quiz completed!
                      </Text>
                      <Text mt={0.5} color={textMuted} fontSize="sm">
                        You scored {result.score}/{result.maxScore} with {Math.round(result.percentage)}% accuracy.
                      </Text>
                    </Box>
                  </HStack>

                  <HStack
                    w={{ base: "full", sm: "auto" }}
                    px={3}
                    py={2}
                    borderWidth="1px"
                    borderColor={brand200}
                    bg={surfaceBg}
                    borderRadius="14px"
                  >
                    <Trophy size={17} />
                    <Text fontSize="sm" color={textColor} fontWeight="900">
                      Attempt #{result.attemptNumber}
                    </Text>
                  </HStack>
                </Flex>
              </Box>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2.5}>
                {[
                  ["Score", `${result.score}/${result.maxScore}`],
                  ["Correct", result.correctCount],
                  ["Incorrect", result.incorrectCount],
                  ["Accuracy", `${Math.round(result.percentage)}%`],
                ].map(([label, value]) => (
                  <Box
                    key={String(label)}
                    borderWidth="1px"
                    borderColor={borderColor}
                    bg={surfaceBg}
                    borderRadius="16px"
                    p={{ base: 3, md: 4 }}
                  >
                    <Text
                      color={textMuted}
                      fontSize="10px"
                      fontWeight="800"
                      textTransform="uppercase"
                    >
                      {label}
                    </Text>
                    <Text
                      mt={1}
                      color={questionBadgeText}
                      fontSize={{ base: "lg", md: "xl" }}
                      fontWeight="900"
                    >
                      {value}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>

              <Stack spacing={2.5}>
                {quiz.questions.map((question, index) => {
                  const review = answerReviewMap.get(question.questionId);

                  return (
                    <Box
                      key={question.questionId}
                      borderWidth="1px"
                      borderColor={borderColor}
                      bg={surfaceBg}
                      borderRadius="18px"
                      p={{ base: 3.5, md: 4 }}
                    >
                      <Flex align="flex-start" justify="space-between" gap={3}>
                        <Box minW={0}>
                          <Text
                            color={textMuted}
                            fontSize="10px"
                            fontWeight="800"
                            textTransform="uppercase"
                          >
                            Question {index + 1}
                          </Text>
                          <Text mt={1} color={textColor} fontSize="sm" fontWeight="800">
                            {question.question}
                          </Text>
                        </Box>
                        <Badge
                          flexShrink={0}
                          px={2.5}
                          py={1}
                          borderRadius="full"
                          bg={review?.isCorrect ? "green.100" : "red.100"}
                          color={review?.isCorrect ? "green.700" : "red.700"}
                        >
                          {review?.marksAwarded || 0}/{review?.maxMarks || question.marks}
                        </Badge>
                      </Flex>

                      <SimpleGrid mt={3} columns={{ base: 1, sm: 2 }} spacing={2}>
                        <Box
                          p={3}
                          borderRadius="14px"
                          bg={review?.isCorrect ? "green.50" : "red.50"}
                        >
                          <Text color={textMuted} fontSize="10px" fontWeight="800">
                            YOUR ANSWER
                          </Text>
                          <Text mt={1} color="gray.800" fontSize="sm">
                            {review?.selectedAnswerText || "No answer"}
                          </Text>
                        </Box>
                        <Box p={3} borderRadius="14px" bg={brand50}>
                          <Text color={textMuted} fontSize="10px" fontWeight="800">
                            CORRECT ANSWER
                          </Text>
                          <Text mt={1} color="gray.800" fontSize="sm">
                            {review?.correctAnswerText || "Not available"}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  );
                })}
              </Stack>
            </Stack>
          ) : currentQuestion ? (
            <AnimatePresence mode="wait">
              <MotionBox
                key={currentQuestion.questionId}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.16 }}
              >
                <Stack spacing={{ base: 3, md: 4 }}>
                  <Flex align="center" justify="space-between" gap={3}>
                    <HStack spacing={2.5}>
                      <Flex
                        align="center"
                        justify="center"
                        w="36px"
                        h="36px"
                        borderRadius="12px"
                        bg={questionBadgeBg}
                        color={questionBadgeText}
                      >
                        <Sparkles size={17} />
                      </Flex>
                      <Box>
                        <Text
                          color={textMuted}
                          fontSize="10px"
                          fontWeight="800"
                          textTransform="uppercase"
                          letterSpacing="0.1em"
                        >
                          Question {currentIndex + 1} of {quiz.questions.length}
                        </Text>
                        <Text color={textColor} fontSize="sm" fontWeight="900">
                          {currentQuestion.marks} mark{currentQuestion.marks === 1 ? "" : "s"}
                        </Text>
                      </Box>
                    </HStack>

                    <Badge
                      px={2.5}
                      py={1}
                      borderRadius="full"
                      bg={currentAnswerId ? brand50 : mutedSurfaceBg}
                      color={currentAnswerId ? questionBadgeText : textMuted}
                      fontSize="10px"
                    >
                      {currentAnswerId ? "Answer selected" : "Choose one"}
                    </Badge>
                  </Flex>

                  <Box
                    borderWidth="1px"
                    borderColor={borderColor}
                    bg={surfaceBg}
                    borderRadius={{ base: "18px", md: "22px" }}
                    p={{ base: 4, md: 5 }}
                  >
                    <Text
                      color={textColor}
                      fontSize={{ base: "md", md: "xl" }}
                      lineHeight="1.45"
                      fontWeight="900"
                    >
                      {currentQuestion.question}
                    </Text>
                    <Text mt={1.5} color={textMuted} fontSize="xs">
                      Tap an option below. You can change it before submitting.
                    </Text>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2.5}>
                    {currentQuestion.options.map((option) => {
                      const isSelected = currentAnswerId === option.optionId;

                      return (
                        <MotionBox
                          key={option.optionId}
                          as="button"
                          type="button"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => chooseAnswer(option.optionId)}
                          position="relative"
                          w="full"
                          minH={{ base: "72px", md: "82px" }}
                          p={{ base: 3, md: 3.5 }}
                          overflow="hidden"
                          textAlign="left"
                          borderWidth="1px"
                          borderColor={isSelected ? brand500 : borderColor}
                          bg={isSelected ? brand50 : surfaceBg}
                          borderRadius="18px"
                          boxShadow={
                            isSelected
                              ? `0 12px 30px ${brand100}`
                              : "0 5px 16px rgba(15, 23, 42, 0.04)"
                          }
                          _focusVisible={{
                            outline: "2px solid",
                            outlineColor: brand500,
                            outlineOffset: "2px",
                          }}
                        >
                          {isSelected && (
                            <Box
                              position="absolute"
                              top="-18px"
                              right="-18px"
                              w="58px"
                              h="58px"
                              borderRadius="full"
                              bg={brand100}
                              opacity={0.75}
                            />
                          )}

                          <Flex position="relative" align="flex-start" gap={3}>
                            <Flex
                              align="center"
                              justify="center"
                              w="34px"
                              h="34px"
                              flexShrink={0}
                              borderRadius="11px"
                              bg={isSelected ? brand500 : mutedSurfaceBg}
                              color={isSelected ? "white" : textMuted}
                            >
                              {isSelected ? (
                                <CheckCircle2 size={17} />
                              ) : (
                                <Circle size={16} />
                              )}
                            </Flex>

                            <Box minW={0} flex="1">
                              <Text
                                color={isSelected ? questionBadgeText : textMuted}
                                fontSize="10px"
                                fontWeight="900"
                                textTransform="uppercase"
                                letterSpacing="0.1em"
                              >
                                {option.label}
                              </Text>
                              <Text
                                mt={1}
                                color={textColor}
                                fontSize="sm"
                                lineHeight="1.45"
                                fontWeight={isSelected ? "700" : "500"}
                              >
                                {option.text}
                              </Text>
                            </Box>
                          </Flex>
                        </MotionBox>
                      );
                    })}
                  </SimpleGrid>
                </Stack>
              </MotionBox>
            </AnimatePresence>
          ) : null}
        </Box>

        {/* Always visible footer */}
        <Box
          position="relative"
          zIndex={2}
          px={{ base: 3, md: 5 }}
          py={{ base: 2.5, md: 3 }}
          borderTopWidth="1px"
          borderColor={borderColor}
          bg={footerBg}
          backdropFilter="blur(12px)"
          pb={{ base: "max(10px, env(safe-area-inset-bottom))", md: 3 }}
        >
          <Flex align="center" justify="space-between" gap={2}>
            <Button
              variant="outline"
              size={{ base: "sm", md: "md" }}
              h={{ base: "38px", md: "42px" }}
              px={{ base: 3, md: 4 }}
              borderRadius="full"
              leftIcon={<ArrowLeft size={15} />}
              isDisabled={isCompleted || currentIndex <= 0}
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            >
              <Box as="span" display={{ base: "none", sm: "inline" }}>
                Previous
              </Box>
              <Box as="span" display={{ base: "inline", sm: "none" }}>
                Back
              </Box>
            </Button>

            {!isCompleted && (
              <Text
                display={{ base: "none", sm: "block" }}
                color={textMuted}
                fontSize="xs"
                fontWeight="800"
              >
                {unansweredCount === 0
                  ? "All questions answered"
                  : `${unansweredCount} remaining`}
              </Text>
            )}

            {!isCompleted && currentIndex < quiz.questions.length - 1 ? (
              <Button
                colorScheme="brand"
                size={{ base: "sm", md: "md" }}
                h={{ base: "38px", md: "42px" }}
                px={{ base: 4, md: 5 }}
                borderRadius="full"
                rightIcon={<ArrowRight size={15} />}
                onClick={goToNextQuestion}
              >
                Next
              </Button>
            ) : !isCompleted ? (
              <Button
                colorScheme="brand"
                size={{ base: "sm", md: "md" }}
                h={{ base: "38px", md: "42px" }}
                px={{ base: 4, md: 5 }}
                borderRadius="full"
                rightIcon={<Send size={15} />}
                isLoading={isSubmitting}
                loadingText="Submitting"
                onClick={submitQuiz}
              >
                Submit quiz
              </Button>
            ) : (
              <Button
                colorScheme="brand"
                size={{ base: "sm", md: "md" }}
                h={{ base: "38px", md: "42px" }}
                px={{ base: 4, md: 5 }}
                borderRadius="full"
                onClick={onClose}
              >
                Back to course
              </Button>
            )}
          </Flex>
        </Box>
      </MotionBox>
    </Box>
  );
}