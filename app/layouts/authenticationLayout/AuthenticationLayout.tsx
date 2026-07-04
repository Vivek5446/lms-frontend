"use client";

import { Badge, Box, Flex, Heading, HStack, Image, Text, VStack } from "@chakra-ui/react";
import React from "react";

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      minHeight="100vh"
      bg="#F7F3EF"
      justifyContent="center"
      alignItems={{ base: "stretch", md: "center" }}
      px={{ base: 0, md: 6 }}
      py={{ base: 0, md: 6 }}
      overflowX="hidden"
    >
      <Box
        bg="white"
        borderRadius={{ base: 0, md: "28px" }}
        border="1px solid"
        borderColor="whiteAlpha.800"
        overflow="hidden"
        w="100%"
        maxW="1180px"
        minW={0}
        boxShadow={{ base: "none", md: "0 24px 80px rgba(36, 24, 12, 0.14)" }}
      >
        <Flex direction={{ base: "column", lg: "row" }} minH={{ base: "auto", lg: "660px" }} minW={0}>
          <Box
            display={{ base: "none", lg: "block" }}
            w={{ lg: "46%" }}
            position="relative"
            overflow="hidden"
            flexShrink={0}
            m="12px"
          >
            <Image
              src="/images/loginbg.png"
              alt="Learning workspace"
              position="absolute"
              inset={0}
              borderRadius="20px"
              w="100%"
              h="100%"
              objectFit="cover"
            />
            <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(17,24,39,0.18), rgba(17,24,39,0.72))" borderRadius="20px" />
            <VStack position="absolute" left={8} right={8} bottom={8} spacing={5} align="stretch" color="white">
              <Badge alignSelf="flex-start" colorScheme="orange" borderRadius="full" px={3} py={1}>
                LMS workspace
              </Badge>
              <Box>
                <Heading fontSize={{ lg: "3xl", xl: "4xl" }} lineHeight="1.06" fontWeight="800" letterSpacing="0">
                  Learn, manage, and onboard from one place.
                </Heading>
                <Text color="whiteAlpha.800" mt={3} fontSize="sm" lineHeight="1.8" maxW="420px">
                  A cleaner entry point for learners and businesses, with phone OTP and accurate location capture.
                </Text>
              </Box>
              <HStack spacing={2} wrap="wrap">
                {["OTP secure", "Business ready", "Mobile friendly"].map((item) => (
                  <Badge key={item} bg="whiteAlpha.200" color="white" borderRadius="full" px={3} py={1}>
                    {item}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </Box>

          <Flex
            flex={1}
            direction="column"
            justify="center"
            px={{ base: 5, sm: 7, md: 10, xl: 14 }}
            py={{ base: 7, md: 10 }}
            minW={0}
            w="100%"
          >
            <Box w="100%" maxW={{ base: "340px", sm: "440px", lg: "none" }} mx="auto" minW={0}>
              {children}
            </Box>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};

export default AuthenticationLayout;
