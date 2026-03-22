'use client';

import { Box, Flex, Image, Text, useBreakpointValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React from 'react';

const zoomIn = keyframes`
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
`;

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      maxHeight="100vh"
      direction={{ base: 'column', md: 'row' }}
      bgGradient="linear(to-br, gray.100, gray.200)"
      justifyContent="center"
      alignItems="center"
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 10 }}
      gap={{ base: 6, md: 10 }}
    >
      {/* Left Section */}
      {!isMobile && (
        <Box
          position="relative"
          height={{ md: '90vh', xl: '94vh' }}
          width={{ md: '40%', lg: '45%' }}
          rounded="2xl"
          overflow="hidden"
          boxShadow="2xl"
        >
          {/* Background Image with Overlay */}
          <Box
            as="div"
            position="absolute"
            inset={0}
            bgGradient="linear(to-b, blackAlpha.700, blackAlpha.400)"
            zIndex={1}
          />
          <Image
            src="/images/auth/bgImage.png"
            alt="Background"
            objectFit="cover"
            w="100%"
            h="100%"
            animation={`${zoomIn} 20s ease-in-out infinite alternate`}
          />

          {/* Content Overlay */}
          <Flex
            position="absolute"
            inset={0}
            zIndex={2}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            color="white"
            textAlign="center"
            px={6}
          >
            <Text fontSize="5xl" fontWeight="extrabold" letterSpacing="wide" mb={3}>
              DentalCare+
            </Text>
            <Image
              src="/images/auth/gridImages.png"
              alt="Dental Services"
              width="70%"
              maxW="380px"
            />
            <Text mt={6} fontSize="lg" fontWeight="medium" opacity={0.85} maxW="90%">
              Providing world-class dental services with expert doctors and modern facilities.
            </Text>
          </Flex>
        </Box>
      )}

      {/* Right Section - Form */}
      <Box
        bg="white"
        p={{ base: 6, md: 10 }}
        rounded="2xl"
        width={{ base: '100%', md: '40%', lg: '45%' }}
        maxW="550px"
        boxShadow="2xl"
        border="1px solid"
        borderColor="gray.200"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight={{ base: 'auto', md: '80vh' }}
      >
        {children}
      </Box>
    </Flex>
  );
};

export default AuthenticationLayout;
