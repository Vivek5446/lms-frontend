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
    <Box bg="transparent" p={{ base: 3, md: 0 }}>
      <Stack spacing={4}>
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded={{ base: "xl", md: "2xl" }} px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }} shadow="sm">
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
            
            <HStack spacing={2} align="center">
              <Box 
                as="button"
                onClick={() => router.push("/dashboard/quiz")}
                color={secondaryTextColor}
                bg={useColorModeValue("gray.100", "whiteAlpha.100")}
                w="36px" h="36px"
                rounded="full"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.200"), color: "#6269FF", transform: "translateX(-3px)" }}
                transition="all 0.2s"
              >
                <FiArrowLeft size={18} />
              </Box>
              <Box maxW="full" overflow="hidden">
                <Heading size={{ base: "sm", md: "lg" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2" textTransform="uppercase" isTruncated>
                  <Box as="span" color={headingColor}>EDIT </Box>
                  <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
                    {quizData.title}
                  </Box>
                </Heading>
                <Text mt={1} fontSize={{ base: "2xs", md: "xs" }} fontWeight="700" color={secondaryTextColor} letterSpacing="0.1em" textTransform="uppercase" noOfLines={1}>
                  Manage your assessment
                </Text>
              </Box>
            </HStack>

            <HStack spacing={3} w={{ base: "full", md: "auto" }}>
              <Button 
                variant={activeTab === "settings" ? "solid" : "outline"} 
                bgGradient={activeTab === "settings" ? "linear(to-r, #6269FF, #4F46E5)" : undefined}
                color={activeTab === "settings" ? "white" : secondaryTextColor}
                borderColor={activeTab === "settings" ? "transparent" : borderColor}
                leftIcon={<FiSettings />} 
                rounded="lg"
                size={{ base: "sm", md: "md" }}
                flex={{ base: 1, md: "none" }}
                px={{ base: 4, md: 6 }}
                fontWeight="800"
                onClick={() => setActiveTab("settings")}
                _hover={activeTab === "settings" ? { transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(98,105,255,0.4)" } : { bg: useColorModeValue("gray.50", "whiteAlpha.100") }}
                transition="all 0.2s"
              >
                Settings
              </Button>
              <Button 
                variant={activeTab === "questions" ? "solid" : "outline"} 
                bgGradient={activeTab === "questions" ? "linear(to-r, #6269FF, #4F46E5)" : undefined}
                color={activeTab === "questions" ? "white" : secondaryTextColor}
                borderColor={activeTab === "questions" ? "transparent" : borderColor}
                leftIcon={<FaClipboardList />} 
                rounded="lg"
                size={{ base: "sm", md: "md" }}
                flex={{ base: 1, md: "none" }}
                px={{ base: 4, md: 6 }}
                fontWeight="800"
                onClick={() => setActiveTab("questions")}
                _hover={activeTab === "questions" ? { transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(98,105,255,0.4)" } : { bg: useColorModeValue("gray.50", "whiteAlpha.100") }}
                transition="all 0.2s"
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
