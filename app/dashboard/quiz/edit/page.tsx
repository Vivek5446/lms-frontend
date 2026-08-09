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
  useToast,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  SimpleGrid,
  IconButton,
  Icon,
  Divider
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaClipboardList, FaPalette, FaImage } from "react-icons/fa";
import { FiSettings, FiArrowLeft, FiCheck } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import QuizSettingsForm from "../components/QuizSettingsForm";
import QuestionBuilder from "../components/QuestionBuilder";
import QuizPreview from "../components/QuizPreview";

export default function EditQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const quizId = searchParams.get('id') as string;
  const initialTab = searchParams.get("tab") as "settings" | "questions" | "preview" | null;
  
  const [activeTab, setActiveTab] = useState<"settings" | "questions" | "preview">(initialTab || "settings");
  const [quizData, setQuizData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const { isOpen: isThemeOpen, onOpen: onThemeOpen, onClose: onThemeClose } = useDisclosure();
  const [activeTheme, setActiveTheme] = useState("#0078D4");

  useEffect(() => {
    if (quizData?.theme?.primaryColor) {
      setActiveTheme(quizData.theme.primaryColor);
    }
  }, [quizData]);

  const PRESET_THEMES = [
    "#0078D4", // Microsoft Blue
    "#107C41", // Excel Green
    "#D83B01", // Office Orange
    "#E3008C", // Magenta
    "#5C2D91", // Teams Purple
    "#00B7C3", // Cyan
    "#00188F", // Dark Blue
    "#FFB900", // Yellow
    "#A4262C", // Red
    "#8764B8", // Soft Purple
    "#498205", // Soft Green
    "#008272"  // Teal
  ];

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

  const handleThemeChange = async (color: string) => {
    setActiveTheme(color);
    setQuizData({ ...quizData, theme: { ...quizData.theme, primaryColor: color } });
    try {
      await axios.put(`/quiz/${quizId}`, { theme: { primaryColor: color } });
      toast({ title: "Theme updated", status: "success", duration: 2000 });
    } catch (e) {
      toast({ title: "Failed to update theme", status: "error" });
    }
  };

  if (isFetching) {
    return <Center h="100dvh" bg="transparent"><Spinner size="xl" color="blue.500" /></Center>;
  }

  if (!quizData) {
    return <Center h="100dvh" bg="transparent"><Text>Quiz not found.</Text></Center>;
  }

  return (
    <Box bg="transparent">
      <Drawer isOpen={isThemeOpen} placement="right" onClose={onThemeClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Theme Ideas</DrawerHeader>
          <DrawerBody>
            <Heading size="sm" mb={4} color={secondaryTextColor}>Solid Colors</Heading>
            <SimpleGrid columns={4} spacing={4} mb={8}>
              {PRESET_THEMES.map((color) => (
                <Box 
                  key={color}
                  w="100%" 
                  h="60px" 
                  bg={color} 
                  rounded="md" 
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={activeTheme === color ? "3px" : "1px"}
                  borderColor={activeTheme === color ? "blue.400" : "transparent"}
                  onClick={() => handleThemeChange(color)}
                  _hover={{ opacity: 0.8 }}
                >
                  {activeTheme === color && <Icon as={FiCheck} color="white" boxSize={6} />}
                </Box>
              ))}
            </SimpleGrid>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Premium Navigation Bar (Clean White) */}
      <Box w="full" bg={useColorModeValue("white", "gray.800")} h="56px" px={6} display="flex" alignItems="center" justifyContent="space-between" position="sticky" top={0} zIndex={50} shadow="sm" borderBottomWidth="1px" borderColor={borderColor}>
        <HStack spacing={4} align="center">
          <Box 
            as="button"
            onClick={() => router.push("/dashboard/quiz")}
            color={secondaryTextColor}
            bg={useColorModeValue("gray.100", "whiteAlpha.100")}
            w="32px" h="32px"
            rounded="full"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.200"), color: "#6269FF", transform: "translateX(-3px)" }}
            transition="all 0.2s"
          >
            <FiArrowLeft size={16} />
          </Box>
          <HStack spacing={3} align="center">
            <Box 
              p={1.5} 
              bgGradient="linear(to-br, #6269FF, #8A2BE2)" 
              rounded="md" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              boxShadow="sm"
            >
              <Icon as={FaClipboardList} boxSize={3.5} color="white" />
            </Box>
            <Text fontSize="md" fontWeight="700" letterSpacing="tight" color={headingColor} isTruncated maxW="300px">
              {quizData.title}
            </Text>
          </HStack>
        </HStack>

        {/* Centered Modern Pill Tabs (Vercel/Apple Style) */}
        <HStack 
          spacing={1} 
          position="absolute" 
          left="50%" 
          transform="translateX(-50%)" 
          bg={useColorModeValue("gray.100", "gray.700")} 
          p={1} 
          rounded="full"
        >
          <Flex 
            alignItems="center" justify="center" px={4} py={1.5} rounded="full" cursor="pointer" 
            onClick={() => setActiveTab("questions")} 
            bg={activeTab === "questions" ? useColorModeValue("white", "gray.800") : "transparent"}
            color={activeTab === "questions" ? useColorModeValue("gray.900", "white") : useColorModeValue("gray.600", "gray.400")}
            fontWeight={activeTab === "questions" ? "700" : "600"}
            shadow={activeTab === "questions" ? "sm" : "none"}
            transition="all 0.2s"
            _hover={activeTab !== "questions" ? { color: useColorModeValue("gray.900", "white") } : {}}
          >
            <Text fontSize="sm">Questions</Text>
          </Flex>

          <Flex 
            alignItems="center" justify="center" px={4} py={1.5} rounded="full" cursor="pointer" 
            onClick={() => setActiveTab("settings")} 
            bg={activeTab === "settings" ? useColorModeValue("white", "gray.800") : "transparent"}
            color={activeTab === "settings" ? useColorModeValue("gray.900", "white") : useColorModeValue("gray.600", "gray.400")}
            fontWeight={activeTab === "settings" ? "700" : "600"}
            shadow={activeTab === "settings" ? "sm" : "none"}
            transition="all 0.2s"
            _hover={activeTab !== "settings" ? { color: useColorModeValue("gray.900", "white") } : {}}
          >
            <Text fontSize="sm">Settings</Text>
          </Flex>

          <Flex 
            alignItems="center" justify="center" px={4} py={1.5} rounded="full" cursor="pointer" 
            onClick={() => setActiveTab("preview")} 
            bg={activeTab === "preview" ? useColorModeValue("white", "gray.800") : "transparent"}
            color={activeTab === "preview" ? useColorModeValue("gray.900", "white") : useColorModeValue("gray.600", "gray.400")}
            fontWeight={activeTab === "preview" ? "700" : "600"}
            shadow={activeTab === "preview" ? "sm" : "none"}
            transition="all 0.2s"
            _hover={activeTab !== "preview" ? { color: useColorModeValue("gray.900", "white") } : {}}
          >
            <Text fontSize="sm">Preview</Text>
          </Flex>
        </HStack>

        <HStack spacing={3} align="center">
          <IconButton
            aria-label="Theme"
            icon={<FaPalette size={16} />}
            variant="ghost"
            color={secondaryTextColor}
            onClick={onThemeOpen}
            _hover={{ bg: useColorModeValue("gray.100", "gray.700"), color: activeTheme }}
            size="sm"
          />
          <Button bg={activeTheme} color="white" fontWeight="600" px={6} size="sm" _hover={{ opacity: 0.9 }}>Send</Button>
        </HStack>
      </Box>

      {/* Main Content Area */}
      <Box position="relative" minH="calc(100vh - 72px)" bg={useColorModeValue("gray.100", "gray.900")}>
        {/* Themed Background Top Banner */}
        <Box position="absolute" top={0} left={0} w="full" h="100%" bg={activeTheme} opacity={0.08} zIndex={0} />

        {/* Main Form Container */}
        <Box position="relative" zIndex={1} w="full" px={{ base: 4, md: 8 }} pt={10} pb={20}>
            
        {activeTab === "settings" ? (
          <QuizSettingsForm initialData={quizData} onSaved={handleQuizSaved} />
        ) : activeTab === "questions" ? (
          <QuestionBuilder quizId={quizId} initialQuestions={quizData.questions || []} themeColor={activeTheme} quizTitle={quizData.title} quizDescription={quizData.description} />
        ) : (
          <QuizPreview quizData={quizData} themeColor={activeTheme} />
        )}
        </Box>
      </Box>
    </Box>
  );
}
