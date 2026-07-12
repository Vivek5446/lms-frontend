"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  HStack,
  Spinner,
  Center,
  useToast
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaClipboardList } from "react-icons/fa";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import QuizSettingsForm from "../components/QuizSettingsForm";
import QuestionBuilder from "../components/QuestionBuilder";

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const quizId = params.id as string;
  const initialTab = searchParams.get("tab") as "settings" | "questions" | null;
  
  const [activeTab, setActiveTab] = useState<"settings" | "questions">(initialTab || "settings");
  const [quizData, setQuizData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.900", "white");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");

  useEffect(() => {
    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  const fetchQuizDetails = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(`/quiz/${quizId}`);
      setQuizData(response.data.data);
    } catch (error: any) {
      toast({ title: "Failed to load quiz", status: "error" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleQuizSaved = () => {
    // If settings were updated, just refresh data or notify
    fetchQuizDetails();
  };

  if (isFetching) {
    return <Center h="100dvh" bg="transparent"><Spinner size="xl" color="blue.500" /></Center>;
  }

  if (!quizData) {
    return <Center h="100dvh" bg="transparent"><Text>Quiz not found.</Text></Center>;
  }

  return (
    <Box minH="100dvh" bg="transparent" px={{ base: 3, md: 6 }} py={{ base: 3, md: 6 }}>
      <Stack spacing={{ base: 4, md: 6 }}>
        <Button variant="ghost" leftIcon={<FiArrowLeft />} alignSelf="flex-start" onClick={() => router.push("/dashboard/quiz")}>
          Back to Dashboard
        </Button>
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded={{ base: "2xl", md: "3xl" }} p={{ base: 4, md: 6 }} shadow="sm" overflow="hidden" position="relative">
          <Box position="absolute" insetX={0} top={0} h="1" bgGradient="linear(to-r, blue.400, purple.500, pink.400)" />
          <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "stretch", lg: "center" }} gap={{ base: 4, md: 6 }}>
            <Box minW={0}>
              <Heading size={{ base: "md", md: "lg" }} color={headingColor} letterSpacing="-0.04em">
                Edit Quiz: {quizData.title}
              </Heading>
              <Text mt={1} fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor}>Manage your assessment</Text>
            </Box>
            <HStack spacing={4}>
              <Button variant={activeTab === "settings" ? "solid" : "outline"} colorScheme="blue" leftIcon={<FiSettings />} onClick={() => setActiveTab("settings")}>
                Quiz Settings
              </Button>
              <Button 
                variant={activeTab === "questions" ? "solid" : "outline"} 
                colorScheme="blue" leftIcon={<FaClipboardList />} 
                onClick={() => setActiveTab("questions")}
              >
                Questions
              </Button>
            </HStack>
          </Flex>
        </Box>

        {activeTab === "settings" ? (
          <QuizSettingsForm initialData={quizData} onSaved={handleQuizSaved} />
        ) : (
          <QuestionBuilder quizId={quizId} initialQuestions={quizData.questions} />
        )}
      </Stack>
    </Box>
  );
}
