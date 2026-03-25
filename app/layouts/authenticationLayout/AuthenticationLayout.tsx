'use client';

import { Box, Flex, Image, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

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
        borderRadius="40px"
        border="2px solid"
        borderColor="gray.200"
        overflow="hidden"
        w="100%"
        maxW="980px"
        boxShadow="lg"
      >
        <Flex direction={{ base: 'column', md: 'row' }} minH="600px">
          
          {/* Left — Illustration Panel */}
          {!isMobile && (
            <Box
              w={{ md: '48%' }}
              // bg="#D84315"
              position="relative"
              overflow="hidden"
              flexShrink={0}
              // borderRadius="40px"
              m="12px"
              // Removed justifyContent/alignItems to let image fill space
              display="block" 
            >
              {/* Decorative circles - Kept as absolute overlays */}
              <Box
                position="absolute"
                top="-40px"
                right="-40px"
                w="280px"
                h="280px"
                borderRadius="50%"
                border="1.5px solid rgba(255,255,255,0.15)"
                zIndex={2}
              />
              <Box
                position="absolute"
                top="60px"
                right="20px"
                w="160px"
                h="160px"
                borderRadius="50%"
                border="1px solid rgba(255,255,255,0.08)"
                zIndex={2}
              />

              {/* Image — Now fills the entire orange section */}
              <Image
                src="/images/loginbg.png"
                alt="Learning illustration"
                position="absolute"
                top={0}
                rounded={'30px'}
                left={0}
                w="100%"
                h="100%"
                objectFit="cover" // This ensures the image covers the area without distortion
                zIndex={1}
              />
            </Box>
          )}

          {/* Right — Form Panel */}
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