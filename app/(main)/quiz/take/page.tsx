"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Spinner,
  Center,
  Icon,
  Badge,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { FiClock, FiCheckCircle, FiXCircle, FiShield } from "react-icons/fi";
import { useDevToolsBlocker } from "../../../hooks/useDevToolsBlocker";

export default function TakeQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const quizId = searchParams.get('id');

  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Game States
  const [gameState, setGameState] = useState<"PRE_START" | "ACTIVE" | "SUBMITTING" | "COMPLETED">("PRE_START");

  // Active State
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [resultData, setResultData] = useState<any>(null);

  // --- EXACT MICROSOFT FORMS THEME COLORS (BUT WITH OUR APP'S BLUE THEME) ---
  const pageBg = useColorModeValue("#F3F2F1", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const primaryColor = useColorModeValue("blue.600", "blue.400"); // Our app's theme color
  const headingColor = useColorModeValue("gray.900", "white"); // Fixed: Title is now on cardBg
  const textColor = useColorModeValue("#323130", "gray.200"); 
  const mutedText = useColorModeValue("#605E5C", "gray.400"); 
  const borderColor = useColorModeValue("#EDEBE9", "gray.700");

  useEffect(() => {
    if (!quizId) {
      router.replace("/quiz");
      return;
    }

    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/quiz/${quizId}`);
        const data = response.data.data;
        if (data.settings?.shuffleQuestions) {
          data.questions = data.questions.sort(() => Math.random() - 0.5);
        }
        setQuizData(data);

        // Auto-resume
        const saved = sessionStorage.getItem(`quiz_progress_${quizId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.endTime) {
            const remainingSeconds = Math.floor((parsed.endTime - Date.now()) / 1000);
            setTimeLeft(remainingSeconds > 0 ? remainingSeconds : 0);
          }
          setGameState("ACTIVE");
        }
      } catch (error: any) {
        toast({ title: "Failed to load quiz", status: "error" });
        router.replace("/quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, router, toast]);

  useEffect(() => {
    if (gameState === "ACTIVE" && quizId) {
      let endTime = null;
      const existing = sessionStorage.getItem(`quiz_progress_${quizId}`);
      if (existing) {
        try { endTime = JSON.parse(existing).endTime; } catch(e) {}
      }
      if (!endTime && timeLeft !== null) {
        endTime = Date.now() + (timeLeft * 1000);
      }
      sessionStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify({
        answers,
        endTime
      }));
    }
  }, [answers, timeLeft, gameState, quizId]);

  const handleSubmitQuiz = useCallback(async () => {
    if (gameState === "SUBMITTING" || gameState === "COMPLETED") return;

    // Check if all questions are answered
    if (quizData && Object.keys(answers).length < quizData.questions.length && timeLeft !== 0) {
      toast({ title: "Please answer all required questions.", status: "warning" });
      return;
    }

    setGameState("SUBMITTING");

    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch (e) {}
    }

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
        questionId,
        selectedOptionIds
      }));

      const response = await axios.post(`/quiz/${quizId}/submit`, {
        answers: formattedAnswers,
        timeTakenSeconds: quizData?.settings?.timerType === "OVERALL" 
          ? (quizData.settings.overallTimeLimitMinutes * 60) - (timeLeft || 0) 
          : 0
      });

      sessionStorage.removeItem(`quiz_progress_${quizId}`);
      setResultData(response.data.data);
      setGameState("COMPLETED");
    } catch (error: any) {
      toast({ title: error.response?.data?.message || "Failed to submit quiz", status: "error" });
      setGameState("PRE_START"); 
    }
  }, [answers, quizId, quizData, timeLeft, gameState, toast]);

  // Handle Timer
  useEffect(() => {
    if (gameState !== "ACTIVE" || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);
    return () => clearInterval(timerId);
  }, [gameState, timeLeft, handleSubmitQuiz]);

  useDevToolsBlocker(handleSubmitQuiz);

  // STRICT SECURITY MEASURES
  useEffect(() => {
    if (!quizData) return;

    const handleVisibilityChange = () => {
      if (document.hidden && gameState === "ACTIVE") {
        const newCount = (parseInt(sessionStorage.getItem(`ts_${quizId}`) || "0")) + 1;
        sessionStorage.setItem(`ts_${quizId}`, newCount.toString());
        const maxAllowed = quizData.settings?.security?.maxTabSwitchesAllowed || 3;
        
        if (newCount > maxAllowed) {
          handleSubmitQuiz();
        } else {
          toast({
            title: "Security Warning",
            description: `Tab switch detected. (${newCount}/${maxAllowed})`,
            status: "warning",
            position: "top"
          });
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameState === "ACTIVE") {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    const blockRefreshKeys = (e: KeyboardEvent) => {
      if (gameState === "ACTIVE") {
        if (
          e.key === 'F5' || 
          (e.ctrlKey && (e.key === 'r' || e.key === 'R' || e.key === 't' || e.key === 'T' || e.key === 'n' || e.key === 'N'))
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", blockRefreshKeys, { capture: true });
    
    if (quizData.settings?.security?.disableCopyPaste) {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", blockRefreshKeys, { capture: true });
      document.body.style.userSelect = "auto";
      document.body.style.webkitUserSelect = "auto";
    };
  }, [gameState, quizData, handleSubmitQuiz, toast, quizId]);

  const startQuiz = async () => {
    if (quizData?.settings?.security?.enforceFullScreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        toast({ title: "Fullscreen Required", status: "warning" });
        return;
      }
    }
    if (quizData?.settings?.timerType === "OVERALL" && quizData.settings.overallTimeLimitMinutes > 0) {
      setTimeLeft(quizData.settings.overallTimeLimitMinutes * 60);
    }
    setGameState("ACTIVE");
  };

  const handleOptionChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: [value] }));
  };

  if (loading) {
    return (
      <Center h="100vh" bg={pageBg}>
        <Spinner size="lg" color={primaryColor} />
      </Center>
    );
  }
  if (!quizData) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Box minH="100vh" bg={pageBg} color={textColor} fontFamily="'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif" py={{ base: 4, md: 8 }}>
      
      {/* Timer floating at top right if active */}
      {(gameState === "ACTIVE" || gameState === "SUBMITTING") && timeLeft !== null && (
        <Box position="fixed" top={4} right={4} zIndex={100}>
          <Badge colorScheme={timeLeft < 60 ? "red" : "gray"} px={4} py={2} rounded="md" fontSize="md" shadow="sm" bg="white" color={timeLeft < 60 ? "red.600" : "gray.700"}>
            <HStack><Icon as={FiClock} /><Text>{formatTime(timeLeft)}</Text></HStack>
          </Badge>
        </Box>
      )}

      <Container maxW="3xl">
        
        {/* ================= PRE-START ================= */}
        {gameState === "PRE_START" && (
          <Box bg={cardBg} shadow="md" borderRadius="sm" overflow="hidden">
            {/* THEME HEADER */}
            <Box bg={primaryColor} p={{ base: 6, md: 10 }}>
              <Heading size="xl" color={headingColor} fontWeight="400" lineHeight="1.3" mb={4}>
                {quizData.title}
              </Heading>
              <Text color="whiteAlpha.900" fontSize="md">
                {quizData.description}
              </Text>
            </Box>
            
            <Box p={{ base: 6, md: 10 }}>
              <VStack align="start" spacing={3} mb={8} color={textColor} fontSize="sm">
                <Text>Hi, when you submit this form, the owner will be able to see your name and email address.</Text>
                <Text color="red.600" fontWeight="600">* Required</Text>
              </VStack>

              <VStack align="start" spacing={4} mb={10} color={mutedText} fontSize="sm" bg={useColorModeValue("gray.50", "gray.750")} p={4} rounded="md" borderWidth="1px" borderColor={borderColor}>
                <Flex align="center">
                  <Icon as={FiCheckCircle} mr={3} color={primaryColor} boxSize={5} />
                  <Text>Total Questions: <b>{quizData.questions.length}</b></Text>
                </Flex>
                <Flex align="center">
                  <Icon as={FiCheckCircle} mr={3} color={primaryColor} boxSize={5} />
                  <Text>Passing Criteria: <b>{quizData.settings?.passingPercentage || 70}%</b></Text>
                </Flex>
                {quizData.settings?.timerType === "OVERALL" && (
                  <Flex align="center">
                    <Icon as={FiClock} mr={3} color={primaryColor} boxSize={5} />
                    <Text>Time Limit: <b>{quizData.settings.overallTimeLimitMinutes} minutes</b></Text>
                  </Flex>
                )}
                {(quizData.settings?.security?.disableCopyPaste) && (
                  <Flex align="center">
                    <Icon as={FiShield} mr={3} color="red.500" boxSize={5} />
                    <Text>Proctored: <b>Strict Security Enabled</b></Text>
                  </Flex>
                )}
              </VStack>

              <Button
                size="md"
                bg={primaryColor}
                color="white"
                _hover={{ bg: "blue.700" }}
                rounded="sm"
                fontWeight="500"
                px={8}
                onClick={startQuiz}
                isDisabled={quizData.questions.length === 0}
              >
                Submit to start
              </Button>
            </Box>
          </Box>
        )}

        {/* ================= ACTIVE (SINGLE SCROLLING FORM) ================= */}
        {(gameState === "ACTIVE" || gameState === "SUBMITTING") && (
          <VStack spacing={6} align="stretch" pb={16}>
             {/* THEME HEADER */}
             <Box bg={cardBg} shadow="sm" borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
               <Box h="10px" bg={primaryColor} w="full" />
               <Box p={{ base: 6, md: 10 }}>
                 <Heading size="xl" color={headingColor} fontWeight="600" lineHeight="1.4" mb={3} letterSpacing="tight">
                   {quizData.title}
                 </Heading>
                 <Text color={mutedText} fontSize="md" mb={6} lineHeight="1.6">
                   {quizData.description}
                 </Text>
                 <Text color="red.500" fontSize="sm" fontWeight="600" textTransform="uppercase" letterSpacing="wider">* Required</Text>
               </Box>
            </Box>

            {quizData.questions.map((question: any, index: number) => (
              <Box key={question._id} bg={cardBg} p={{ base: 6, md: 8 }} shadow="sm" borderRadius="xl" borderWidth="1px" borderColor={borderColor} transition="all 0.2s" _hover={{ shadow: "md" }}>
                <Heading size="md" mb={6} lineHeight="1.6" color={textColor} fontWeight="600">
                  {index + 1}. {question.question} <Text as="span" color="red.500">*</Text>
                </Heading>

                <RadioGroup 
                  value={answers[question._id]?.[0] || ""} 
                  onChange={(val) => handleOptionChange(question._id, val)}
                >
                  <Stack spacing={3}>
                    {question.answers.map((opt: any) => {
                      const isSelected = answers[question._id]?.[0] === opt._id;
                      return (
                        <Box 
                          key={opt._id}
                          as="label"
                          display="flex"
                          alignItems="center"
                          p={4}
                          borderWidth="1px"
                          borderColor={isSelected ? primaryColor : borderColor}
                          bg={isSelected ? useColorModeValue("blue.50", "rgba(66, 153, 225, 0.1)") : "transparent"}
                          borderRadius="lg"
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ borderColor: isSelected ? primaryColor : useColorModeValue("gray.300", "gray.600"), bg: isSelected ? undefined : useColorModeValue("gray.50", "gray.750") }}
                        >
                          <Radio 
                            value={opt._id} 
                            colorScheme="blue"
                            size="lg"
                            mr={4}
                          />
                          <Text mt="-0.5" color={isSelected ? primaryColor : textColor} fontSize="md" fontWeight={isSelected ? "500" : "400"}>
                            {opt.answer}
                          </Text>
                        </Box>
                      );
                    })}
                  </Stack>
                </RadioGroup>
              </Box>
            ))}

            <Box mt={6} display="flex" justifyContent="flex-start">
              <Button 
                bg={primaryColor} 
                color="white" 
                _hover={{ bg: "blue.700", transform: "translateY(-1px)", shadow: "md" }} 
                _active={{ transform: "translateY(0)" }}
                onClick={handleSubmitQuiz} 
                isLoading={gameState === "SUBMITTING"} 
                rounded="lg" 
                px={12}
                py={6}
                size="lg"
                fontWeight="600"
                transition="all 0.2s"
              >
                Submit Assessment
              </Button>
            </Box>
          </VStack>
        )}

        {/* ================= COMPLETED ================= */}
        {gameState === "COMPLETED" && (
          <Box bg={cardBg} borderRadius="sm" shadow="md" overflow="hidden">
            <Box bg={primaryColor} p={{ base: 6, md: 10 }}>
              <Heading size="xl" color="white" fontWeight="400" lineHeight="1.3">
                {quizData.title}
              </Heading>
            </Box>
            
            <Box p={{ base: 6, md: 10 }} textAlign="left">
              <Heading size="lg" color={textColor} mb={6} fontWeight="500">
                Thanks!
              </Heading>
              <Text color={textColor} fontSize="md" mb={8}>
                Your response was submitted.
              </Text>
              
              <Box bg={useColorModeValue("gray.50", "gray.750")} p={6} rounded="md" borderWidth="1px" borderColor={borderColor} mb={8}>
                <Text color={textColor} fontSize="lg" fontWeight="600" mb={2}>
                  Score: {resultData.score} / {resultData.totalScore}
                </Text>
                <Text color={mutedText} fontSize="sm">
                  ({resultData.percentage?.toFixed(1)}%)
                </Text>
              </Box>
              
              <Button size="md" bg={primaryColor} color="white" _hover={{ bg: "blue.700" }} rounded="sm" onClick={() => router.replace("/quiz")}>
                Return home
              </Button>
            </Box>
          </Box>
        )}

      </Container>
    </Box>
  );
}
