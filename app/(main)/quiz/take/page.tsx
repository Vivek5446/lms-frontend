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
  Input,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { FiClock, FiCheckCircle, FiXCircle, FiShield, FiUploadCloud, FiVideo, FiStar, FiAward, FiArrowLeft } from "react-icons/fi";
import { useDevToolsBlocker } from "../../../hooks/useDevToolsBlocker";

export default function TakeQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const quizId = searchParams.get('id');

  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Game States
  const [gameState, setGameState] = useState<"LOCKED" | "PRE_START" | "ACTIVE" | "SUBMITTING" | "COMPLETED" | "REVIEW">("PRE_START");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Active State
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [resultData, setResultData] = useState<any>(null);
  const [showScoreBox, setShowScoreBox] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // --- APP THEME COLORS ---
  const pageBg = useColorModeValue("linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", "gray.900"); 
  const cardBg = useColorModeValue("white", "gray.800");
  const defaultPrimary = useColorModeValue("blue.600", "blue.400"); 
  const primaryColor = quizData?.theme?.primaryColor || defaultPrimary;
  const headingColor = useColorModeValue("gray.900", "white"); 
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
        
        let processedQuestions = data.questions;
        
        if (data.settings?.shuffleQuestions) {
          processedQuestions = processedQuestions.sort(() => Math.random() - 0.5);
        }

        if (data.settings?.shuffleOptions) {
          processedQuestions = processedQuestions.map((q: any) => {
            if (q.answers && Array.isArray(q.answers)) {
              return { ...q, answers: [...q.answers].sort(() => Math.random() - 0.5) };
            }
            return q;
          });
        }

        data.questions = processedQuestions;
        setQuizData(data);

        // Determine initial game state based on settings
        if (data.settings?.requiresPassword) {
          setGameState("LOCKED");
        } else {
          setGameState("PRE_START");
        }

        // Auto-resume if active session exists
        const saved = sessionStorage.getItem(`quiz_progress_${quizId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.endTime) {
            const remainingSeconds = Math.floor((parsed.endTime - Date.now()) / 1000);
            setTimeLeft(remainingSeconds > 0 ? remainingSeconds : 0);
          }
          if (!data.settings?.requiresPassword) {
            setGameState("ACTIVE");
          }
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

  const handleSubmitQuiz = useCallback(async (force: boolean = false) => {
    if (gameState === "SUBMITTING" || gameState === "COMPLETED") return;

    // Check if all REQUIRED questions are answered (skip this check on force/auto-submit)
    if (!force && quizData && timeLeft !== 0) {
      const requiredQuestions = quizData.questions.filter((q: any) => q.isRequired !== false);
      const unansweredRequired = requiredQuestions.filter((q: any) => {
        const ans = answers[q._id];
        return !ans || (Array.isArray(ans) && ans.length === 0);
      });
      if (unansweredRequired.length > 0) {
        toast({ title: "Please answer all required questions.", status: "warning" });
        return;
      }
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
        password: passwordInput,
        timeTakenSeconds: quizData?.settings?.timerType === "OVERALL" 
          ? (quizData.settings.overallTimeLimitMinutes * 60) - (timeLeft || 0) 
          : 0
      });

      sessionStorage.removeItem(`quiz_progress_${quizId}`);
      if (Array.isArray(response.data.data?.reviewQuestions)) {
        const reviewMap = new Map(
          response.data.data.reviewQuestions.map((question: any) => [String(question.questionId), question]),
        );
        setQuizData((current: any) => ({
          ...current,
          questions: (current?.questions || []).map((question: any) => {
            const reviewQuestion: any = reviewMap.get(String(question._id));
            const answerMap = new Map<string, any>(
              (reviewQuestion?.answers || []).map((answer: any) => [String(answer.optionId), answer]),
            );
            return {
              ...question,
              explanation: reviewQuestion?.explanation || "",
              answers: (question.answers || []).map((answer: any) => ({
                ...answer,
                ...(answerMap.get(String(answer._id)) || {}),
              })),
            };
          }),
        }));
      }
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
      if (quizData?.settings?.timerType === "PER_QUESTION") {
        if (currentQuestionIndex < quizData.questions.length - 1) {
          handleNextQuestion();
        } else {
          handleSubmitQuiz();
        }
      } else {
        handleSubmitQuiz();
      }
      return;
    }
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);
    return () => clearInterval(timerId);
  }, [gameState, timeLeft, currentQuestionIndex, quizData]);

  const handleNextQuestion = useCallback(() => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      if (quizData.settings?.timerType === "PER_QUESTION" && quizData.settings.perQuestionTimeLimitSeconds > 0) {
        setTimeLeft(quizData.settings.perQuestionTimeLimitSeconds);
      }
    }
  }, [quizData, currentQuestionIndex]);

  const handlePrevQuestion = useCallback(() => {
    if (quizData && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      if (quizData.settings?.timerType === "PER_QUESTION" && quizData.settings.perQuestionTimeLimitSeconds > 0) {
        setTimeLeft(quizData.settings.perQuestionTimeLimitSeconds);
      }
    }
  }, [quizData, currentQuestionIndex]);

  useDevToolsBlocker(() => handleSubmitQuiz(true));

  // STRICT SECURITY MEASURES
  useEffect(() => {
    if (!quizData) return;

    const handleVisibilityChange = () => {
      if (document.hidden && gameState === "ACTIVE") {
        const newCount = (parseInt(sessionStorage.getItem(`ts_${quizId}`) || "0")) + 1;
        sessionStorage.setItem(`ts_${quizId}`, newCount.toString());
        const maxAllowed = quizData.settings?.security?.maxTabSwitchesAllowed || 3;
        
        if (newCount > maxAllowed) {
          handleSubmitQuiz(true);
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

    const handleFullscreenChange = () => {
      if (gameState === "ACTIVE" && quizData.settings?.security?.enforceFullScreen) {
        if (!document.fullscreenElement) {
          toast({
            title: "Security Violation",
            description: "You exited Full Screen mode. Your quiz is being submitted automatically.",
            status: "error",
            duration: 7000,
            isClosable: true,
          });
          handleSubmitQuiz(true);
        }
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
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", blockRefreshKeys, { capture: true });
    
    if (quizData.settings?.security?.disableCopyPaste) {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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
    } else if (quizData?.settings?.timerType === "PER_QUESTION" && quizData.settings.perQuestionTimeLimitSeconds > 0) {
      setTimeLeft(quizData.settings.perQuestionTimeLimitSeconds);
    }
    setGameState("ACTIVE");
  };

  const handleOptionChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: [value] }));
  };

  const handleMultiOptionChange = (questionId: string, value: string, isChecked: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (isChecked) {
        return { ...prev, [questionId]: [...current, value] };
      } else {
        return { ...prev, [questionId]: current.filter(v => v !== value) };
      }
    });
  };

  const handleArrayOptionChange = (questionId: string, index: number, value: string) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      const updated = [...current];
      updated[index] = value;
      return { ...prev, [questionId]: updated };
    });
  };

  const handleFileUpload = (questionId: string, fileName: string) => {
    // Mocking file upload by just saving the file name
    setAnswers(prev => ({ ...prev, [questionId]: [fileName] }));
  };

  const handleUnlock = async () => {
    try {
      await axios.post(`/quiz/${quizId}/verify-password`, { password: passwordInput });
      setGameState("PRE_START");
      setPasswordError("");
    } catch (error: any) {
      setPasswordError(error?.response?.data?.message || "Incorrect password");
    }
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

  // Check Availability Dates & Attempts
  const now = new Date().getTime();
  let availabilityMessage = null;
  
  const maxAttempts = quizData.settings?.maxAttempts || 1;
  if (quizData.userAttemptsCount >= maxAttempts) {
    availabilityMessage = `You have reached the maximum number of attempts (${maxAttempts}) for this quiz.`;
  } else if (!quizData.isActive) {
    availabilityMessage = "This quiz is currently inactive.";
  } else if (quizData.settings?.availability?.startDate && now < new Date(quizData.settings.availability.startDate).getTime()) {
    availabilityMessage = `This quiz will open on ${new Date(quizData.settings.availability.startDate).toLocaleString()}`;
  } else if (quizData.settings?.availability?.endDate && now > new Date(quizData.settings.availability.endDate).getTime()) {
    availabilityMessage = `This quiz closed on ${new Date(quizData.settings.availability.endDate).toLocaleString()}`;
  }

  const renderQuestion = (question: any, index: number, isPaginated: boolean = false) => (
    <Box key={question._id} p={{ base: 6, md: 10 }}>
      {isPaginated && (
        <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
          <Text color={mutedText} fontWeight="600" fontSize="sm" textTransform="uppercase" letterSpacing="wider">
            Question {index + 1} of {quizData?.questions?.length}
          </Text>
          <Text color={mutedText} fontWeight="medium" fontSize="sm">{question.points || 1} Point(s)</Text>
        </Box>
      )}
      
      <Heading size="md" mb={6} lineHeight="1.5" color={textColor} fontWeight="400">
        {!isPaginated && `${index + 1}. `}{question.questionType === "fill_in_blanks" ? "Fill in the blanks below:" : question.question} {question.isRequired !== false && <Text as="span" color="red.500">*</Text>}
      </Heading>

      {/* Render Question Inputs Based on Type */}
      
      {question.questionType === "fill_in_blanks" && (
        <Box lineHeight="2.5" fontSize="lg" color={textColor} mt={4}>
          {question.question.split(/(\[.*?\])/).map((part: string, i: number) => {
            if (part.startsWith("[") && part.endsWith("]")) {
              const blankIndex = Math.floor(i / 2);
              return (
                <Input 
                  key={i} 
                  display="inline-block" 
                  w="150px" 
                  mx={2} 
                  size="sm" 
                  bg={useColorModeValue("white", "gray.900")} 
                  borderColor={primaryColor} 
                  value={answers[question._id]?.[blankIndex] || ""}
                  onChange={(e) => handleArrayOptionChange(question._id, blankIndex, e.target.value)}
                />
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </Box>
      )}

      {(question.questionType === "image" || question.questionType === "video") && (
        <Flex direction="column" align="center" justify="center" p={10} borderStyle="dashed" borderWidth="2px" borderColor={borderColor} rounded="xl" bg={useColorModeValue("gray.50", "gray.800")} mt={4}>
          <Icon as={question.questionType === "image" ? FiUploadCloud : FiVideo} boxSize={10} color={mutedText} mb={4} />
          <Button 
            colorScheme="blue" 
            variant={answers[question._id]?.[0] ? "solid" : "outline"}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = question.questionType === "image" ? "image/*" : "video/*";
              input.onchange = (e: any) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(question._id, e.target.files[0].name);
                }
              };
              input.click();
            }}
          >
            {answers[question._id]?.[0] ? `Uploaded: ${answers[question._id][0]}` : (question.questionType === "image" ? "Upload Image" : "Record / Upload Video")}
          </Button>
        </Flex>
      )}

      {question.questionType === "matching" && (
        <VStack spacing={4} align="stretch" mt={4}>
          {question.answers?.map((ans: any, aIdx: number) => (
            <HStack key={aIdx} spacing={4}>
              <Box flex={1} p={3} bg={useColorModeValue("gray.50", "gray.750")} rounded="md" borderWidth="1px" borderColor={borderColor}>
                <Text fontWeight="medium" color={textColor}>{ans.answer}</Text>
              </Box>
              <Select 
                flex={1} 
                placeholder="Select match..." 
                bg={useColorModeValue("white", "gray.800")}
                value={answers[question._id]?.[aIdx] || ""}
                onChange={(e) => handleArrayOptionChange(question._id, aIdx, e.target.value)}
              >
                {question.answers?.map((matchOpt: any, mIdx: number) => (
                  <option key={mIdx} value={matchOpt.matrixMatchId}>{matchOpt.matrixMatchId}</option>
                ))}
              </Select>
            </HStack>
          ))}
        </VStack>
      )}

      {question.questionType === "matrix" && (
        <Box overflowX="auto" mt={4}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th></Th>
                {question.matrixColumns?.map((col: any, cIdx: number) => (
                  <Th key={cIdx} textAlign="center">{col.text}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {question.answers?.map((ans: any, aIdx: number) => (
                <Tr key={aIdx}>
                  <Td fontWeight="medium">{ans.answer}</Td>
                  {question.matrixColumns?.map((col: any, cIdx: number) => (
                    <Td key={cIdx} textAlign="center">
                      <Radio 
                        name={`matrix-${question._id}-${aIdx}`} 
                        colorScheme="blue" 
                        isChecked={answers[question._id]?.[aIdx] === col.text}
                        onChange={() => handleArrayOptionChange(question._id, aIdx, col.text)}
                      />
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {question.questionType === "sequence" && (
        <VStack spacing={3} align="stretch" mt={4}>
          {question.answers?.map((ans: any, aIdx: number) => (
            <HStack key={aIdx} p={3} bg={useColorModeValue("gray.50", "gray.750")} rounded="md" borderWidth="1px" borderColor={borderColor}>
              <Select 
                w="80px" 
                size="sm"
                value={answers[question._id]?.[aIdx] || ""}
                onChange={(e) => handleArrayOptionChange(question._id, aIdx, e.target.value)}
              >
                <option value="">--</option>
                {question.answers?.map((_: any, sIdx: number) => (
                  <option key={sIdx} value={String(sIdx + 1)}>{sIdx + 1}</option>
                ))}
              </Select>
              <Text ml={2} fontWeight="medium" color={textColor}>{ans.answer}</Text>
            </HStack>
          ))}
        </VStack>
      )}

      {(question.questionType === "choice" || !question.questionType) && (
        question.isMultipleChoice ? (
          <Stack spacing={4} mt={4}>
            {question.answers?.map((opt: any) => {
              const isSelected = answers[question._id]?.includes(opt._id);
              return (
                <Box 
                  key={opt._id}
                  as="label"
                  display="flex"
                  alignItems="center"
                  cursor="pointer"
                  transition="all 0.1s"
                  opacity={isSelected ? 1 : 0.9}
                  _hover={{ opacity: 1 }}
                >
                  <Checkbox 
                    colorScheme="blue" 
                    size="lg" 
                    mr={4}
                    isChecked={isSelected}
                    onChange={(e) => handleMultiOptionChange(question._id, opt._id, e.target.checked)}
                  />
                  <Text mt="-0.5" color={textColor} fontSize="md" fontWeight={isSelected ? "500" : "400"}>
                    {opt.answer}
                  </Text>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <RadioGroup 
            value={answers[question._id]?.[0] || ""} 
            onChange={(val) => handleOptionChange(question._id, val)}
            mt={4}
          >
            <Stack spacing={4}>
              {question.answers?.map((opt: any) => {
                const isSelected = answers[question._id]?.[0] === opt._id;
                return (
                  <Box 
                    key={opt._id}
                    as="label"
                    display="flex"
                    alignItems="center"
                    cursor="pointer"
                    transition="all 0.1s"
                    opacity={isSelected ? 1 : 0.9}
                    _hover={{ opacity: 1 }}
                  >
                    <Radio 
                      value={opt._id} 
                      colorScheme="blue"
                      size="lg"
                      mr={4}
                    />
                    <Text mt="-0.5" color={textColor} fontSize="md" fontWeight={isSelected ? "500" : "400"}>
                      {opt.answer}
                    </Text>
                  </Box>
                );
              })}
            </Stack>
          </RadioGroup>
        )
      )}

      {question.questionType === "text_input" && (
        <Input 
          mt={4}
          placeholder="Enter your answer" 
          size="lg" 
          bg={useColorModeValue("white", "gray.900")} 
          value={answers[question._id]?.[0] || ""}
          onChange={(e) => handleOptionChange(question._id, e.target.value)}
        />
      )}

      {question.questionType === "date" && (
        <Input 
          mt={4}
          type="date"
          size="lg" 
          maxW="300px"
          bg={useColorModeValue("white", "gray.900")} 
          value={answers[question._id]?.[0] || ""}
          onChange={(e) => handleOptionChange(question._id, e.target.value)}
        />
      )}

      {question.questionType === "rating" && (
        <Stack direction="row" spacing={2} mt={4}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              as={FiStar}
              boxSize={8}
              color={parseInt(answers[question._id]?.[0] || "0") >= star ? "yellow.400" : "#CBD5E0"}
              fill={parseInt(answers[question._id]?.[0] || "0") >= star ? "yellow.400" : "transparent"}
              cursor="pointer"
              onClick={() => handleOptionChange(question._id, String(star))}
              transition="all 0.2s"
              _hover={{ transform: "scale(1.1)" }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );

  return (
    <Box minH="calc(100vh - 70px)" bg={pageBg} color={textColor} fontFamily="'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif" pt={{ base: 2, md: 6 }} pb={12}>
      
      <Container maxW="100%" px={{ base: 0, sm: 4, md: 8, xl: 16 }} py={0}>

        {/* ================= UNAVAILABLE ================= */}
        {availabilityMessage && gameState !== "ACTIVE" && gameState !== "SUBMITTING" && gameState !== "COMPLETED" && (
           <Center minH="70vh" px={4} py={8}>
              <Box w="full" maxW="md" bg={cardBg} shadow="2xl" borderRadius="3xl" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
                <Box bg={primaryColor} p={{ base: 8, md: 10 }} textAlign="center" position="relative" overflow="hidden">
                   <Box position="absolute" top="-20%" right="-5%" opacity={0.15}>
                      <Icon as={FiClock} boxSize="180px" color="white" />
                   </Box>
                   <VStack spacing={4} position="relative" zIndex={1}>
                     <Center boxSize={20} bg="whiteAlpha.200" rounded="full" backdropFilter="blur(10px)" shadow="inner">
                       <Icon as={FiClock} boxSize={10} color="white" />
                     </Center>
                     <Heading size="xl" color="white" fontWeight="800" lineHeight="1.2" letterSpacing="tight">{quizData.title}</Heading>
                     <Badge bg="whiteAlpha.300" color="white" fontSize="sm" px={4} py={1.5} rounded="full" textTransform="uppercase" letterSpacing="widest" borderWidth="0px" shadow="sm">
                       Quiz Unavailable
                     </Badge>
                   </VStack>
                </Box>

                <Box p={{ base: 8, md: 10 }} bg={useColorModeValue("white", "gray.800")}>
                  <VStack spacing={6} align="stretch">
                    <Box textAlign="center">
                      <Text color={mutedText} fontSize="md" lineHeight="1.6" fontWeight="500">
                        {availabilityMessage}
                      </Text>
                    </Box>
                    
                    <Center pt={2}>
                      <Button 
                        size="md" 
                        w="full"
                        h="52px"
                        bg={useColorModeValue("gray.900", "white")}
                        color={useColorModeValue("white", "gray.900")}
                        leftIcon={<FiArrowLeft />} 
                        onClick={() => router.push('/quiz')}
                        rounded="xl"
                        px={8}
                        _hover={{ transform: "translateY(-2px)", shadow: "lg", bg: useColorModeValue("gray.800", "gray.100") }}
                        transition="all 0.2s"
                        fontWeight="700"
                      >
                         Return to Dashboard
                      </Button>
                    </Center>
                  </VStack>
                </Box>
              </Box>
           </Center>
        )}

        {/* ================= LOCKED (PASSWORD) ================= */}
        {!availabilityMessage && gameState === "LOCKED" && (
           <Center minH="70vh" px={4} py={8}>
              <Box w="full" maxW="md" bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
                <Box bg={primaryColor} p={{ base: 6, md: 8 }} textAlign="center" position="relative" overflow="hidden">
                   <Box position="absolute" top="-10%" right="-5%" opacity={0.15}>
                      <Icon as={FiShield} boxSize="150px" color="white" />
                   </Box>
                   <VStack spacing={3} position="relative" zIndex={1}>
                     <Center boxSize={16} bg="whiteAlpha.200" rounded="full" backdropFilter="blur(10px)">
                       <Icon as={FiShield} boxSize={8} color="white" />
                     </Center>
                     <Heading size="lg" color="white" fontWeight="800" lineHeight="1.2">{quizData.title}</Heading>
                   </VStack>
                </Box>

                <Box p={{ base: 6, md: 8 }} bg={useColorModeValue("white", "gray.800")}>
                  <VStack spacing={5} align="stretch">
                    <Box textAlign="center" mb={1}>
                      <Heading size="sm" color={headingColor} fontWeight="700" mb={1}>Restricted Access</Heading>
                      <Text color={mutedText} fontSize="sm">This quiz is protected by a password. Please enter it below to continue.</Text>
                    </Box>
                    
                    <VStack spacing={4}>
                      <Input 
                        type="password" 
                        placeholder="Enter password to unlock" 
                        size="md" 
                        height="52px"
                        fontSize="md"
                        rounded="xl"
                        bg={useColorModeValue("gray.50", "gray.900")}
                        borderWidth="2px"
                        _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                        value={passwordInput} 
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          setPasswordError("");
                        }} 
                        isInvalid={!!passwordError}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUnlock();
                        }}
                      />
                      {passwordError && (
                        <Flex align="center" color="red.500" fontSize="sm" w="full" bg={useColorModeValue("red.50", "red.900")} p={3} rounded="md">
                           <Icon as={FiXCircle} mr={2} />
                           <Text fontWeight="600">{passwordError}</Text>
                        </Flex>
                      )}
                      <Button 
                        size="md" 
                        w="full" 
                        height="52px" 
                        bg={primaryColor} 
                        color="white" 
                        rounded="xl" 
                        fontSize="md" 
                        fontWeight="700"
                        _hover={{ bg: "blue.700", transform: "translateY(-2px)", shadow: "lg" }}
                        transition="all 0.2s"
                        onClick={handleUnlock}
                      >
                         Unlock Assessment
                      </Button>
                    </VStack>
                    
                    <Center pt={2}>
                      <Button size="sm" variant="ghost" color={mutedText} leftIcon={<FiArrowLeft />} onClick={() => router.push('/quiz')}>
                        Back to Dashboard
                      </Button>
                    </Center>
                  </VStack>
                </Box>
              </Box>
           </Center>
        )}
        
        {/* ================= PRE-START ================= */}
        {!availabilityMessage && gameState === "PRE_START" && (
          <Box bg={cardBg} shadow="md" borderRadius="2xl" overflow="hidden" borderWidth="0px" transition="all 0.3s">
            {/* THEME HEADER */}
            <Box h="12px" bg={primaryColor} w="full" />
            
            <Box p={{ base: 4, md: 6 }}>
              <Heading size="xl" color={headingColor} fontWeight="700" lineHeight="1.2" mb={2} letterSpacing="tight">
                {quizData.title}
              </Heading>
              
              {quizData.description && (
                <Text color={mutedText} fontSize="lg" mb={8} lineHeight="1.6">
                  {quizData.description}
                </Text>
              )}

              <Box bg={useColorModeValue("gray.50", "gray.750")} p={6} rounded="xl" mb={8} borderWidth="1px" borderColor={borderColor}>
                <VStack align="stretch" spacing={4}>
                  <HStack color={textColor}>
                    <Icon as={FiCheckCircle} color="blue.500" boxSize={5} />
                    <Text fontWeight="medium">Total Questions: <Text as="span" fontWeight="bold">{quizData.questions?.length}</Text></Text>
                  </HStack>
                  <HStack color={textColor}>
                    <Icon as={FiCheckCircle} color="blue.500" boxSize={5} />
                    <Text fontWeight="medium">Passing Criteria: <Text as="span" fontWeight="bold">{quizData.settings?.passingPercentage || 0}%</Text></Text>
                  </HStack>
                  {quizData.settings?.maxAttempts > 1 && (
                    <HStack color={textColor}>
                      <Icon as={FiCheckCircle} color="blue.500" boxSize={5} />
                      <Text fontWeight="medium">Allowed Attempts: <Text as="span" fontWeight="bold">{quizData.settings.maxAttempts}</Text></Text>
                    </HStack>
                  )}
                  {quizData.settings?.timerType !== "NONE" && (
                    <HStack color={textColor}>
                      <Icon as={FiClock} color="blue.500" boxSize={5} />
                      <Text fontWeight="medium">
                        Time Limit: <Text as="span" fontWeight="bold">
                          {quizData.settings?.timerType === "OVERALL" ? `${quizData.settings.overallTimeLimitMinutes} Minutes (Total)` : `${quizData.settings.perQuestionTimeLimitSeconds} Seconds (Per Question)`}
                        </Text>
                      </Text>
                    </HStack>
                  )}
                  {quizData.settings?.security?.requirePassword && (
                    <HStack color={textColor}>
                      <Icon as={FiShield} color="orange.500" boxSize={5} />
                      <Text fontWeight="medium">Security: <Text as="span" fontWeight="bold">Password Protected</Text></Text>
                    </HStack>
                  )}
                  {quizData.settings?.security?.disableCopyPaste && (
                    <HStack color={textColor}>
                      <Icon as={FiShield} color="red.500" boxSize={5} />
                      <Text fontWeight="medium">Anti-Cheating: <Text as="span" fontWeight="bold">Copy-Paste Disabled</Text></Text>
                    </HStack>
                  )}
                  {quizData.settings?.security?.enforceFullScreen && (
                    <HStack color={textColor}>
                      <Icon as={FiShield} color="red.500" boxSize={5} />
                      <Text fontWeight="medium">Proctored: <Text as="span" fontWeight="bold">Full Screen Enforced (Auto-submits on exit)</Text></Text>
                    </HStack>
                  )}
                  <HStack color={textColor}>
                    <Icon as={FiCheckCircle} color="blue.500" boxSize={5} />
                    <Text fontWeight="medium">Results: <Text as="span" fontWeight="bold">{quizData.settings?.showResultsImmediately !== false ? "Shown Immediately" : "Hidden by Instructor"}</Text></Text>
                  </HStack>
                </VStack>
              </Box>
              
              <Box mt={8} mb={6} p={4} bg={useColorModeValue("blue.50", "blue.900")} rounded="lg" borderWidth="1px" borderColor={useColorModeValue("blue.200", "blue.700")}>
                <Checkbox 
                  colorScheme="blue" 
                  size="lg" 
                  isChecked={policyAccepted} 
                  onChange={(e) => setPolicyAccepted(e.target.checked)}
                >
                  <Text fontSize="sm" fontWeight="600" color={useColorModeValue("blue.800", "blue.100")}>
                    I have read and understood all the policies and rules mentioned above.
                  </Text>
                </Checkbox>
              </Box>

              <Text color={mutedText} fontSize="sm" mb={6}>
                Hi, when you submit this form, the owner will be able to see your name and email address. 
                <Text as="span" color="red.500" fontWeight="bold" ml={1}>* Required</Text>
              </Text>

              <Button 
                bg={primaryColor} 
                color="white"
                size="lg" 
                px={12} 
                py={7}
                w={{ base: "100%", sm: "auto" }}
                fontSize="lg"
                fontWeight="bold"
                rounded="xl"
                _hover={{ bg: "blue.700", transform: "translateY(-2px)", shadow: "lg" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                onClick={startQuiz}
                isDisabled={quizData.questions.length === 0 || !policyAccepted}
              >
                Start Assessment
              </Button>
            </Box>
          </Box>
        )}

        {/* ================= ACTIVE QUIZ ================= */}
        {(gameState === "ACTIVE" || gameState === "SUBMITTING") && quizData && (
          <Box bg={cardBg} shadow="lg" borderRadius="sm" overflow="hidden">
            {/* THEME HEADER */}
             <Box bg={primaryColor} p={{ base: 4, md: 6 }}>
                 <Flex justify="space-between" align="flex-start" direction={{ base: "column", md: "row" }} mb={2}>
                   <Heading size="lg" color="white" fontWeight="500" lineHeight="1.2" mb={{ base: 2, md: 0 }}>
                     {quizData.title}
                   </Heading>
                   {timeLeft !== null && (
                     <Badge colorScheme={timeLeft < 60 ? "red" : "blackAlpha"} px={4} py={2} rounded="md" fontSize="lg" color={timeLeft < 60 ? "red.100" : "white"} bg="blackAlpha.300" borderWidth="0px">
                       <HStack spacing={3}>
                         <Icon as={FiClock} boxSize={5} />
                         <Text fontWeight="bold">{formatTime(timeLeft)}</Text>
                         {quizData?.settings?.timerType === "PER_QUESTION" && <Text fontSize="xs" ml={1} textTransform="none" fontWeight="normal">(per Q)</Text>}
                       </HStack>
                     </Badge>
                   )}
                 </Flex>
                 
                 {quizData.description && (
                   <Text color="whiteAlpha.900" fontSize="sm" mb={2} lineHeight="1.6">
                     {quizData.description}
                   </Text>
                 )}
                 <Text color="white" fontSize="sm" fontWeight="600" textTransform="uppercase" opacity={0.8}>* REQUIRED</Text>
            </Box>

            {/* Questions - Render based on mode (Paginated vs Scroll) */}
            {quizData.settings?.timerType === "PER_QUESTION" ? (
              // PER QUESTION (PAGINATED VIEW)
              <Box>
                {renderQuestion(quizData.questions[currentQuestionIndex], currentQuestionIndex, true)}

                <Box bg={useColorModeValue("gray.50", "gray.800")} borderTopWidth="1px" borderColor={borderColor} p={8} display="flex" justifyContent="space-between" alignItems="center">
                  <Button 
                    variant="ghost" 
                    size="md"
                    px={8}
                    colorScheme="gray"
                    onClick={handlePrevQuestion}
                    isDisabled={currentQuestionIndex === 0 || quizData.settings?.timerType === "PER_QUESTION"} // Forced disable for per-question
                    display={quizData.settings?.timerType === "PER_QUESTION" ? "none" : "flex"}
                  >
                    Back
                  </Button>
                  
                  {currentQuestionIndex < quizData.questions.length - 1 ? (
                    <Button bg={primaryColor} color="white" _hover={{ opacity: 0.85 }} size="md" px={10} onClick={handleNextQuestion} ml="auto">
                      Next
                    </Button>
                  ) : (
                    <Button bg={primaryColor} color="white" _hover={{ opacity: 0.85 }} size="md" px={10} onClick={() => handleSubmitQuiz()} isLoading={gameState === "SUBMITTING"} ml="auto">
                      Submit
                    </Button>
                  )}
                </Box>
              </Box>
            ) : (
              // OVERALL OR NO TIMER (SCROLLING VIEW)
              <Box>
                <VStack spacing={0} align="stretch" divider={<Box borderBottomWidth="1px" borderColor={borderColor} />}>
                  {quizData.questions.map((question: any, index: number) => renderQuestion(question, index))}
                </VStack>

                <Box p={{ base: 6, md: 10 }} bg={useColorModeValue("gray.50", "gray.800")} borderTopWidth="1px" borderColor={borderColor}>
                  <Button 
                    bg={primaryColor} 
                    color="white" 
                    _hover={{ opacity: 0.85, shadow: "md" }} 
                    onClick={() => handleSubmitQuiz()} 
                    isLoading={gameState === "SUBMITTING"} 
                    rounded="md" 
                    px={10}
                    py={6}
                    size="md"
                    fontWeight="600"
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* ================= COMPLETED ================= */}
        {gameState === "COMPLETED" && resultData && (
           <Box maxW="3xl" mx="auto" bg={cardBg} shadow="2xl" borderRadius="2xl" overflow="hidden" borderWidth="0px">
              <Box bg={primaryColor} p={{ base: 6, md: 10 }} textAlign="center" position="relative" overflow="hidden">
                 <Box position="absolute" top="-20%" right="-5%" opacity={0.15}>
                    <Icon as={FiAward} boxSize="180px" color="white" />
                 </Box>
                 <Heading size="xl" color="white" fontWeight="700" position="relative" zIndex={1} lineHeight="1.3">{quizData?.title}</Heading>
              </Box>
              <Box p={{ base: 8, md: 16 }} textAlign="center" bg={useColorModeValue("white", "gray.800")}>
                <VStack spacing={6}>
                  <Center boxSize={20} bg="green.50" rounded="full" shadow="sm">
                    <Icon as={FiCheckCircle} boxSize={10} color="green.500" />
                  </Center>
                  <Heading size="lg" color={headingColor} fontWeight="600">Quiz Completed!</Heading>
                  <Text color={mutedText} fontSize="lg" maxW="md" mx="auto" lineHeight="1.6">
                    Your answers have been submitted successfully. 
                    {quizData?.settings?.showResultsImmediately !== false && " You can check your score now."}
                  </Text>
                  
                  {quizData?.settings?.showResultsImmediately !== false ? (
                    <>
                      {!showScoreBox ? (
                        <Button mt={4} leftIcon={<FiCheckCircle />} onClick={() => setShowScoreBox(true)} size="lg" colorScheme="green" rounded="xl" px={8} shadow="md" _hover={{ transform: "translateY(-2px)", shadow: "lg" }} transition="all 0.2s">
                          View Results
                        </Button>
                      ) : (
                        <Box mt={4} bg={useColorModeValue("green.50", "green.900")} p={8} rounded="2xl" borderWidth="1px" borderColor={useColorModeValue("green.200", "green.700")} w="full" position="relative" overflow="hidden">
                           <Box position="absolute" top={0} left={0} bottom={0} w="6px" bg="green.500" />
                           <VStack spacing={2} align="center">
                             <Text color={useColorModeValue("green.700", "green.200")} fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">Your Final Score</Text>
                             <HStack alignItems="baseline" spacing={2} color={useColorModeValue("green.800", "green.100")}>
                               <Heading size="3xl" fontWeight="900">{resultData.score}</Heading>
                               <Text fontSize="2xl" fontWeight="600">/ {resultData.maxScore}</Text>
                             </HStack>
                             <Badge colorScheme="green" fontSize="md" px={4} py={1} rounded="full" fontWeight="700">
                               {resultData.percentage?.toFixed(1)}%
                             </Badge>
                           </VStack>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box mt={4} p={4} bg={useColorModeValue("orange.50", "orange.900")} rounded="xl" border="1px dashed" borderColor="orange.200">
                      <Text color={useColorModeValue("orange.700", "orange.200")} fontSize="sm" fontWeight="600">
                        Results are hidden by the instructor. You will be notified when they are released.
                      </Text>
                    </Box>
                  )}
                  
                  <Box pt={4} display="flex" flexDir={{ base: "column", sm: "row" }} gap={4} justifyContent="center" w="full">
                    {quizData?.settings?.showResultsImmediately !== false && showScoreBox && (
                      <Button 
                        leftIcon={<FiCheckCircle />} 
                        onClick={() => setGameState("REVIEW")} 
                        size="lg" 
                        colorScheme="blue"
                        rounded="xl"
                        px={8}
                        _hover={{ transform: "translateY(-1px)", shadow: "md" }}
                      >
                         Review Detailed Answers
                      </Button>
                    )}
                    <Button 
                      leftIcon={<FiArrowLeft />} 
                      onClick={() => router.push('/quiz')} 
                      size="lg" 
                      bg={useColorModeValue("gray.100", "gray.700")}
                      color={useColorModeValue("gray.700", "gray.100")}
                      _hover={{ bg: useColorModeValue("gray.200", "gray.600"), transform: "translateY(-1px)", shadow: "md" }}
                      transition="all 0.2s"
                      rounded="xl"
                      px={8}
                    >
                       Return to Dashboard
                    </Button>
                  </Box>
                </VStack>
              </Box>
           </Box>
        )}

        {/* ================= REVIEW QUIZ ================= */}
        {gameState === "REVIEW" && resultData && quizData && (
          <Box maxW="4xl" mx="auto">
            <Box bg={cardBg} shadow="lg" borderRadius="2xl" overflow="hidden" mb={8} p={8} borderWidth="1px" borderColor={borderColor}>
              <HStack justify="space-between" mb={4} flexWrap="wrap">
                <Heading size="lg" color={headingColor}>Detailed Review</Heading>
                <Badge colorScheme={resultData.isPassed ? "green" : "red"} fontSize="lg" px={4} py={2} rounded="full">
                  Score: {resultData.score} / {resultData.maxScore}
                </Badge>
              </HStack>
              <Text color={mutedText} fontSize="lg">Review your answers below. Correct answers are highlighted in green.</Text>
            </Box>

            <VStack spacing={6} align="stretch">
              {quizData.questions.map((question: any, index: number) => {
                const result = resultData.answers.find((a: any) => String(a.question) === String(question._id));
                const isRating = question.questionType === "rating";
                const isCorrect = isRating ? true : result?.isCorrect;
                
                return (
                  <Box key={question._id} bg={cardBg} shadow="sm" borderRadius="2xl" overflow="hidden" borderWidth="2px" borderColor={isRating ? "blue.300" : (isCorrect ? "green.300" : "red.300")}>
                    <Box bg={isRating ? useColorModeValue("blue.50", "rgba(66, 153, 225, 0.1)") : (isCorrect ? useColorModeValue("green.50", "rgba(72, 187, 120, 0.1)") : useColorModeValue("red.50", "rgba(245, 101, 101, 0.1)"))} p={4} display="flex" alignItems="center" gap={3} borderBottomWidth="1px" borderColor={isRating ? "blue.200" : (isCorrect ? "green.200" : "red.200")}>
                       <Icon as={isRating ? FiCheckCircle : (isCorrect ? FiCheckCircle : FiXCircle)} color={isRating ? "blue.500" : (isCorrect ? "green.500" : "red.500")} boxSize={6} />
                       <Heading size="sm" color={isRating ? useColorModeValue("blue.800", "blue.200") : (isCorrect ? useColorModeValue("green.800", "green.200") : useColorModeValue("red.800", "red.200"))}>
                         Question {index + 1} - {isRating ? "Feedback / Unscored" : (isCorrect ? "Correct" : "Incorrect")} ({isRating ? 0 : (result?.pointsEarned || 0)} / {isRating ? 0 : (question.points || 1)} Points)
                       </Heading>
                    </Box>
                    <Box p={6}>
                      <Heading size="md" mb={6} color={textColor} fontWeight="500" lineHeight="1.5">
                        {question.question}
                      </Heading>
                      
                      {/* Show user's selected options */}
                      <Box mb={4} p={5} bg={useColorModeValue("gray.50", "gray.800")} rounded="xl" borderWidth="1px" borderColor={borderColor}>
                        <Text fontSize="xs" fontWeight="700" color={mutedText} mb={3} letterSpacing="wider" textTransform="uppercase">Your Answer:</Text>
                        {(question.questionType === "text_input" || question.questionType === "date" || question.questionType === "rating") ? (
                           <Text fontSize="lg" fontWeight="500" color={textColor}>{result?.selectedOptions?.[0] || "No answer provided"}{question.questionType === "rating" && result?.selectedOptions?.[0] ? " Stars" : ""}</Text>
                        ) : (
                           <VStack align="stretch" spacing={3}>
                             {question.answers.map((opt: any) => {
                               const isSelected = result?.selectedOptions?.includes(opt._id);
                               if (!isSelected) return null;
                               return (
                                 <HStack key={opt._id} bg={useColorModeValue("white", "gray.700")} p={3} rounded="md" borderWidth="1px" borderColor={borderColor}>
                                   <Icon as={FiCheckCircle} color="blue.500" boxSize={5} />
                                   <Text fontWeight="500" color={textColor} fontSize="md">{opt.answer}</Text>
                                 </HStack>
                               );
                             })}
                             {(!result?.selectedOptions || result.selectedOptions.length === 0) && (
                               <Text fontWeight="500" color={mutedText} fontStyle="italic">No answer provided</Text>
                             )}
                           </VStack>
                        )}
                      </Box>

                      {/* Show correct options if wrong */}
                      {!isCorrect && !isRating && (
                        <Box mb={4} p={5} bg={useColorModeValue("green.50", "rgba(72, 187, 120, 0.1)")} rounded="xl" borderLeftWidth="4px" borderColor="green.400">
                          <Text fontSize="xs" fontWeight="700" color={useColorModeValue("green.700", "green.300")} mb={3} letterSpacing="wider" textTransform="uppercase">Correct Answer:</Text>
                          {(question.questionType === "text_input" || question.questionType === "date") ? (
                             <Text fontSize="lg" fontWeight="600" color={useColorModeValue("green.800", "green.200")}>{question.answers.filter((o:any)=>o.correct).map((o:any)=>o.answer).join(" OR ")}</Text>
                          ) : (
                             <VStack align="stretch" spacing={3}>
                               {question.answers.filter((opt: any) => opt.correct).map((opt: any) => (
                                 <HStack key={opt._id} bg={useColorModeValue("white", "transparent")} p={2} rounded="md">
                                   <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                                   <Text fontWeight="600" color={useColorModeValue("green.800", "green.200")} fontSize="md">{opt.answer}</Text>
                                 </HStack>
                               ))}
                             </VStack>
                          )}
                        </Box>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                         <Box mt={6} p={5} bg={useColorModeValue("blue.50", "rgba(66, 153, 225, 0.1)")} rounded="xl" borderLeftWidth="4px" borderColor="blue.400">
                           <Text fontSize="xs" fontWeight="700" color={useColorModeValue("blue.700", "blue.300")} mb={2} letterSpacing="wider" textTransform="uppercase">Explanation:</Text>
                           <Text color={useColorModeValue("blue.900", "blue.100")} fontSize="md" lineHeight="1.6">{question.explanation}</Text>
                         </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </VStack>
            
            <Center pt={10} pb={12}>
              <Button leftIcon={<FiArrowLeft />} onClick={() => router.push('/quiz')} size="lg" colorScheme="blue" rounded="xl" px={10} h={14} _hover={{ transform: "translateY(-2px)", shadow: "lg" }} transition="all 0.2s">
                 Back to Dashboard
              </Button>
            </Center>
          </Box>
        )}

      </Container>
    </Box>
  );
}
