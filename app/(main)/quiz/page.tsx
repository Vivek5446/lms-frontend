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
  VStack,
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
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")} pb={20} color={textColor} fontFamily="'Inter', sans-serif">
      {/* Hero Header Area */}
      <Box 
        pt={6} 
        pb={16} 
        position="relative" 
        overflow="hidden"
        bg={useColorModeValue("blue.50", "gray.900")}
      >
        {/* Abstract Background Elements */}
        <Box position="absolute" top="-10%" right="10%" boxSize="400px" bgGradient="linear(to-tr, blue.400, purple.400)" opacity={useColorModeValue(0.15, 0.2)} rounded="full" filter="blur(60px)" />
        <Box position="absolute" bottom="-20%" left="5%" boxSize="300px" bgGradient="linear(to-tr, teal.400, blue.300)" opacity={useColorModeValue(0.15, 0.2)} rounded="full" filter="blur(60px)" />
        
        <Container maxW="full" px={{ base: 4, md: 8, xl: 12 }} position="relative" zIndex={1}>
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
            <VStack align="flex-start" spacing={3} maxW="2xl">
              <Badge 
                bg={useColorModeValue("white", "gray.800")} 
                color="blue.500" 
                px={3} py={1} 
                rounded="full" 
                fontWeight="800" 
                letterSpacing="widest"
                shadow="sm"
                border="1px solid"
                borderColor={useColorModeValue("blue.100", "blue.900")}
                fontSize="2xs"
              >
                ASSESSMENTS DASHBOARD
              </Badge>
              <Heading 
                size="xl" 
                fontWeight="900" 
                letterSpacing="tight" 
                lineHeight="1.2"
                bgGradient="linear(to-r, blue.600, purple.600)"
                _dark={{ bgGradient: "linear(to-r, blue.300, purple.300)" }}
                bgClip="text"
              >
                Unlock Your Potential
              </Heading>
              <Text color={mutedText} fontSize="md" lineHeight="1.5" fontWeight="500">
                Choose an assessment below to challenge yourself, master new skills, and track your progress on your learning journey.
              </Text>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxW="full" px={{ base: 4, md: 8, xl: 12 }} mt={-8} position="relative" zIndex={2}>
        {quizzes.length === 0 ? (
          <Center h="40vh" bg={useColorModeValue("white", "gray.800")} rounded="3xl" shadow="lg" borderWidth="1px" borderColor={borderColor}>
            <VStack spacing={5}>
              <Center boxSize={20} bg={useColorModeValue("gray.50", "gray.700")} rounded="full" shadow="inner">
                <Icon as={FiFileText} boxSize={10} color={mutedText} />
              </Center>
              <Text color={mutedText} fontSize="xl" fontWeight="600">No assessments available right now.</Text>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {quizzes.map((quiz) => (
              <Box
                key={quiz._id}
                bg={useColorModeValue("white", "gray.800")}
                p={7}
                rounded="3xl"
                shadow="lg"
                borderWidth="1px"
                borderColor={borderColor}
                display="flex"
                flexDirection="column"
                transition="all 0.4s cubic-bezier(.08,.52,.52,1)"
                _hover={{ 
                  borderColor: useColorModeValue("blue.300", "blue.500"), 
                  cursor: "pointer", 
                  transform: "translateY(-6px) scale(1.01)",
                  shadow: "2xl"
                }}
                onClick={() => router.push(`/quiz/take?id=${quiz._id}`)}
                position="relative"
                overflow="hidden"
              >
                {/* Glossy Overlay */}
                <Box position="absolute" top={0} right={0} left={0} h="100px" bgGradient="linear(to-b, whiteAlpha.600, transparent)" _dark={{ bgGradient: "linear(to-b, whiteAlpha.50, transparent)" }} pointerEvents="none" />
                
                {/* Top Theme Accent Bar */}
                <Box position="absolute" top={0} left={0} right={0} h="6px" bg={quiz.theme?.primaryColor || "blue.500"} />

                <HStack justify="space-between" mb={5} mt={2} position="relative" zIndex={1}>
                  <Badge 
                    bg={useColorModeValue("blue.50", "blue.900")}
                    color={useColorModeValue("blue.600", "blue.200")}
                    rounded="full" 
                    px={3} 
                    py={1.5}
                    fontSize="xs"
                    fontWeight="800"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    {quiz.visibility}
                  </Badge>
                  
                  <HStack spacing={4}>
                    {quiz.settings?.timerType === "OVERALL" && quiz.settings.overallTimeLimitMinutes > 0 && (
                      <Flex align="center" color={mutedText} fontSize="xs" fontWeight="700">
                        <Icon as={FiClock} mr={1.5} color="orange.400" boxSize={4} /> {quiz.settings.overallTimeLimitMinutes}m
                      </Flex>
                    )}
                    {quiz.settings?.timerType === "PER_QUESTION" && quiz.settings.perQuestionTimeLimitSeconds > 0 && (
                      <Flex align="center" color={mutedText} fontSize="xs" fontWeight="700">
                        <Icon as={FiClock} mr={1.5} color="orange.400" boxSize={4} /> {quiz.settings.perQuestionTimeLimitSeconds}s/Q
                      </Flex>
                    )}
                    {(quiz.settings?.security?.disableCopyPaste || quiz.settings?.security?.enforceFullScreen) && (
                      <Flex align="center" color="red.500" fontSize="xs" fontWeight="700">
                        <Icon as={FiShield} mr={1.5} boxSize={4} /> Proctored
                      </Flex>
                    )}
                  </HStack>
                </HStack>

                <Heading size="md" mb={4} fontWeight="800" color={textColor} lineHeight="1.4" letterSpacing="tight" position="relative" zIndex={1}>
                  {quiz.title}
                </Heading>

                <Text color={mutedText} mb={10} noOfLines={3} fontSize="md" flex="1" lineHeight="1.7" position="relative" zIndex={1}>
                  {quiz.description || "Take this assessment to test your understanding, solidify your concepts, and evaluate your knowledge."}
                </Text>

                <HStack justify="space-between" align="center" mt="auto" pt={5} borderTopWidth="1px" borderColor={borderColor} position="relative" zIndex={1}>
                  <Flex align="center" color={mutedText}>
                    <Center boxSize={8} bg={useColorModeValue("gray.50", "gray.700")} rounded="md" mr={3}>
                       <Icon as={FiFileText} boxSize={4} color="blue.500" />
                    </Center>
                    <Text fontSize="sm" fontWeight="700">
                      {quiz.questionCount || 0} Questions
                    </Text>
                  </Flex>
                  
                  <Button 
                    colorScheme="blue" 
                    variant="solid"
                    size="md" 
                    rightIcon={<FiChevronRight />}
                    fontWeight="800"
                    rounded="xl"
                    px={6}
                    shadow="md"
                    _hover={{ transform: "translateX(4px)", shadow: "lg" }}
                    transition="all 0.3s"
                  >
                    Start
                  </Button>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}
