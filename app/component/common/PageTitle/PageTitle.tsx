"use client";

import { Box, Flex, Heading, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { FiSettings, FiArrowLeft } from "react-icons/fi";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const glowBlue = useColorModeValue("blue.400", "blue.600");
  const glowPurple = useColorModeValue("purple.400", "purple.600");
  const dotColor = useColorModeValue("#CBD5E0", "#4A5568");

  return (
    <Flex 
      direction="column" 
      bg={bg} 
      px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }} 
      borderRadius={{ base: "xl", md: "3xl" }} 
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      mb={{ base: 2, md: 2 }}
      position="relative"
      overflow="hidden"
    >
      {/* Ambient Glow Effects */}
      <Box position="absolute" top="-10%" right="-5%" w="150px" h="150px" bg={glowPurple} opacity={0.15} filter="blur(40px)" borderRadius="full" />
      <Box position="absolute" bottom="-10%" left="10%" w="150px" h="150px" bg={glowBlue} opacity={0.15} filter="blur(40px)" borderRadius="full" />
      
      {/* Subtle Dot Pattern Overlay */}
      <Box position="absolute" inset={0} opacity={useColorModeValue(0.4, 0.15)} backgroundImage={`radial-gradient(${dotColor} 1px, transparent 1px)`} backgroundSize="20px 20px" />

      <Flex align="flex-start" gap={{ base: 3, md: 6 }} position="relative" zIndex={1}>
        <Box 
          as="button"
          onClick={() => window.history.back()}
          color={textColor}
          bg={useColorModeValue("gray.100", "whiteAlpha.100")}
          w={{ base: "36px", md: "48px" }} h={{ base: "36px", md: "48px" }}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.200"), color: "blue.500", transform: "translateX(-3px)" }}
          transition="all 0.2s"
          flexShrink={0}
          mt={{ base: 0.5, md: 0 }}
        >
          <FiArrowLeft size={18} />
        </Box>
        <Flex
          display={{ base: "none", md: "flex" }}
          align="center"
          justify="center"
          w={{ base: "40px", md: "64px" }}
          h={{ base: "40px", md: "64px" }}
          borderRadius={{ base: "lg", md: "2xl" }}
          bgGradient="linear(to-br, blue.500, purple.600)"
          color="white"
          boxShadow="0 10px 25px -5px rgba(66, 153, 225, 0.5)"
          flexShrink={0}
        >
          <Icon as={FiSettings} boxSize={{ base: 5, md: 8 }} />
        </Flex>
        <Box>
          <Heading size={{ base: "sm", md: "lg" }} fontWeight="900" letterSpacing="tight" mb={{ base: 0, md: 1 }} textTransform="uppercase">
            <Box as="span" color={useColorModeValue("gray.900", "white")}>
              {title.includes(" ") ? title.substring(0, title.lastIndexOf(" ")) + " " : ""}
            </Box>
            <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
              {title.includes(" ") ? title.substring(title.lastIndexOf(" ") + 1) : title}
            </Box>
          </Heading>
          {subtitle && (
            <Text mt={1} fontSize={{ base: "2xs", md: "xs" }} fontWeight="700" color={textColor} letterSpacing="0.1em" textTransform="uppercase" noOfLines={1}>
              {subtitle}
            </Text>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default PageTitle;
