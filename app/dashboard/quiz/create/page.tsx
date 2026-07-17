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
  useToast,
  Icon
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
    <Box bg="transparent" p={{ base: 3, md: 0 }}>
      
      <Stack spacing={4}>
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded={{ base: "xl", md: "2xl" }} px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }} shadow="sm">
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
            
            <HStack spacing={{ base: 3, md: 4 }} align="center">
              <Box 
                as="button"
                onClick={() => router.push("/dashboard/quiz")}
                color={secondaryTextColor}
                bg={useColorModeValue("gray.100", "whiteAlpha.100")}
                w={{ base: "36px", md: "40px" }} h={{ base: "36px", md: "40px" }}
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
              <Box 
                p={{ base: 2.5, md: 3 }} 
                bgGradient="linear(to-br, #6269FF, #8A2BE2)" 
                rounded="full" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                boxShadow="0 4px 15px rgba(98,105,255,0.4)"
                border="1px solid"
                borderColor="rgba(255,255,255,0.2)"
                ml={1}
                mr={2}
              >
                <Icon as={FaClipboardList} boxSize={{ base: 4, md: 5 }} color="white" />
              </Box>
              <Box>
                <Heading size={{ base: "sm", md: "lg" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2" whiteSpace="nowrap">
                  <Box as="span" color={headingColor}>CREATE </Box>
                  <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
                    NEW QUIZ
                  </Box>
                </Heading>
                <Text mt={1} fontSize={{ base: "2xs", md: "xs" }} fontWeight="700" color={secondaryTextColor} letterSpacing="0.1em" textTransform="uppercase" noOfLines={1}>
                  Build your assessment questions and settings
                </Text>
              </Box>
            </HStack>

            <HStack spacing={3} w={{ base: "full", md: "auto" }}>
              <Button 
                variant="solid" 
                bgGradient="linear(to-r, #6269FF, #4F46E5)"
                color="white"
                leftIcon={<FiSettings />}
                rounded="lg"
                size={{ base: "sm", md: "md" }}
                flex={{ base: 1, md: "none" }}
                px={{ base: 4, md: 6 }}
                fontWeight="800"
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(98,105,255,0.4)" }}
                transition="all 0.2s"
              >
                Settings
              </Button>
              <Button 
                variant="outline" 
                color={secondaryTextColor}
                borderColor={borderColor}
                leftIcon={<FaClipboardList />} 
                rounded="lg"
                size={{ base: "sm", md: "md" }}
                flex={{ base: 1, md: "none" }}
                px={{ base: 4, md: 6 }}
                fontWeight="800"
                onClick={() => {
                  toast({ title: "Save quiz settings first", status: "info", duration: 3000 });
                }}
                _hover={{ bg: useColorModeValue("gray.50", "whiteAlpha.100") }}
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
