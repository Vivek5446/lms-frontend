"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  SimpleGrid,
  useToast,
  Spinner,
  Center,
  Badge,
  HStack,
  Icon,
  Flex,
  useColorModeValue
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiClock, FiFileText, FiChevronRight, FiShield } from "react-icons/fi";
import { useDevToolsBlocker } from "../../hooks/useDevToolsBlocker";

export default function LearnerQuizListPage() {
  useDevToolsBlocker();
  
  const router = useRouter();
  const toast = useToast();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBorderColor = useColorModeValue("gray.300", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const badgeBg = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("/quiz");
        const activeQuizzes = (response.data.data.data || []).filter((q: any) => q.isActive);
        setQuizzes(activeQuizzes);
      } catch (error: any) {
        toast({ title: "Failed to load quizzes", status: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [toast]);

  if (loading) {
    return (
      <Center h="100vh" bg={bg}>
        <Spinner size="md" color="#FFFFFF" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bg} py={12} color={textColor} fontFamily="Inter, sans-serif">
      <Container maxW="full" px={{ base: 4, md: 8, xl: 12 }}>
        <Box mb={10} borderBottomWidth="1px" borderColor={borderColor} pb={6}>
          <Heading size="lg" mb={2} fontWeight="600" letterSpacing="tight" color={textColor}>
            Assessments
          </Heading>
          <Text color={mutedText} fontSize="sm">
            Select an assessment below to test your knowledge.
          </Text>
        </Box>

        {quizzes.length === 0 ? (
          <Center h="30vh" bg={cardBg} rounded="md" borderWidth="1px" borderColor={borderColor}>
            <Flex direction="column" align="center" gap={3}>
              <Icon as={FiFileText} boxSize={6} color="#444" />
              <Text color={mutedText} fontSize="sm">No assessments available right now.</Text>
            </Flex>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {quizzes.map((quiz) => (
              <Box
                key={quiz._id}
                bg={cardBg}
                p={5}
                rounded="md"
                borderWidth="1px"
                borderColor={borderColor}
                display="flex"
                flexDirection="column"
                transition="all 0.2s"
                _hover={{ borderColor: hoverBorderColor, cursor: "pointer", bg: hoverBg }}
                onClick={() => router.push(`/quiz/take?id=${quiz._id}`)}
              >
                <HStack justify="space-between" mb={3}>
                  <Badge 
                    bg={badgeBg} 
                    color={mutedText}
                    rounded="sm" 
                    px={2} 
                    py={0.5}
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                  >
                    {quiz.visibility}
                  </Badge>
                  
                  <HStack spacing={3}>
                    {quiz.settings?.timerType === "OVERALL" && quiz.settings.overallTimeLimitMinutes > 0 && (
                      <Flex align="center" color={mutedText} fontSize="xs">
                        <Icon as={FiClock} mr={1} /> {quiz.settings.overallTimeLimitMinutes}m
                      </Flex>
                    )}
                    {(quiz.settings?.security?.disableCopyPaste) && (
                      <Flex align="center" color="#FF453A" fontSize="xs">
                        <Icon as={FiShield} mr={1} /> Proctored
                      </Flex>
                    )}
                  </HStack>
                </HStack>

                <Heading size="sm" mb={2} fontWeight="600" color={textColor} lineHeight="1.4">
                  {quiz.title}
                </Heading>

                <Text color={mutedText} mb={6} noOfLines={2} fontSize="sm" flex="1" lineHeight="1.5">
                  {quiz.description || "Take this assessment to test your understanding."}
                </Text>

                <HStack justify="space-between" align="center" mt="auto" pt={4} borderTopWidth="1px" borderColor={borderColor}>
                  <Text fontSize="xs" color={mutedText} fontWeight="500">
                    {quiz.questionCount || 0} Questions
                  </Text>
                  
                  <HStack spacing={1} color={textColor} fontSize="sm" fontWeight="600">
                    <Text>Start</Text>
                    <Icon as={FiChevronRight} />
                  </HStack>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}
