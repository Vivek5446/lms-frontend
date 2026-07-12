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
  useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { FaClipboardList } from "react-icons/fa";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import QuizSettingsForm from "../components/QuizSettingsForm";

export default function CreateQuizPage() {
  const router = useRouter();
  const toast = useToast();
  
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.900", "white");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");

  const handleQuizSaved = (newQuizId: string) => {
    // Redirect to the edit view so they can add questions
    router.push(`/dashboard/quiz/${newQuizId}?tab=questions`);
  };

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
                Create New Quiz
              </Heading>
              <Text mt={1} fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor}>Build your assessment questions and settings</Text>
            </Box>
            <HStack spacing={4}>
              <Button variant="solid" colorScheme="blue" leftIcon={<FiSettings />}>
                Quiz Settings
              </Button>
              <Button 
                variant="outline" 
                colorScheme="blue" leftIcon={<FaClipboardList />} 
                onClick={() => {
                  toast({ title: "Save quiz settings first", status: "info", duration: 3000 });
                }}
              >
                Questions
              </Button>
            </HStack>
          </Flex>
        </Box>

        <QuizSettingsForm onSaved={handleQuizSaved} />
      </Stack>
    </Box>
  );
}
