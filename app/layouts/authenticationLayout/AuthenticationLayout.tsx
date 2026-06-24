"use client";

import { Box, Flex, Image } from "@chakra-ui/react";
import React from "react";

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      minHeight="100vh"
      bg="#F0F0F0"
      justifyContent="center"
      alignItems="center"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 6 }}
    >
      <Box
        bg="white"
        borderRadius={{ base: "16px", md: "32px" }}
        border="1px solid"
        borderColor="gray.200"
        overflow="hidden"
        w="100%"
        maxW="980px"
        boxShadow="lg"
      >
        <Flex direction={{ base: "column", md: "row" }} minH={{ base: "auto", md: "600px" }}>
          <Box
            display={{ base: "none", md: "block" }}
            w={{ md: "48%" }}
            position="relative"
            overflow="hidden"
            flexShrink={0}
            m="12px"
          >
            <Image
              src="/images/loginbg.png"
              alt="Learning illustration"
              position="absolute"
              inset={0}
              borderRadius="24px"
              w="100%"
              h="100%"
              objectFit="cover"
            />
          </Box>

          <Flex
            flex={1}
            direction="column"
            justify="center"
            px={{ base: 6, md: 10, lg: 14 }}
            py={{ base: 8, md: 10 }}
          >
            {children}
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};

export default AuthenticationLayout;
