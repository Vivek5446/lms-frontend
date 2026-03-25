'use client';

import { Box, Flex, Image, Text, useBreakpointValue } from '@chakra-ui/react';

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
        borderRadius="20px"
        border="1px solid"
        borderColor="gray.200"
        overflow="hidden"
        w="100%"
        maxW="960px"
        boxShadow="sm"
      >
        {/* Main Content Row */}
        <Flex direction={{ base: 'column', md: 'row' }} minH="600px">
 
          {/* Left — Illustration Panel */}
          {!isMobile && (
            <Box
              w={{ md: '46%' }}
              bg="#D84315"
              position="relative"
              overflow="hidden"
              flexShrink={0}
              borderRadius="16px"
              m="12px"
              display="flex"
              alignItems="flex-end"
              justifyContent="center"
            >
              {/* Decorative circles */}
              <Box
                position="absolute"
                top="-40px"
                right="-40px"
                w="280px"
                h="280px"
                borderRadius="50%"
                border="1.5px solid rgba(255,255,255,0.15)"
              />
              <Box
                position="absolute"
                top="60px"
                right="20px"
                w="160px"
                h="160px"
                borderRadius="50%"
                border="1px solid rgba(255,255,255,0.08)"
              />
              <Box
                position="absolute"
                bottom="-60px"
                left="-50px"
                w="220px"
                h="220px"
                borderRadius="50%"
                border="1px solid rgba(255,255,255,0.08)"
              />
 
              {/* White arc at bottom */}
              <Box
                position="absolute"
                bottom="-80px"
                left="50%"
                transform="translateX(-50%)"
                w="400px"
                h="200px"
                bg="white"
                borderRadius="50% 50% 0 0"
              />
 
              {/* Image — fills the panel nicely */}
              <Image
                src="/images/student.jpg"
                alt="Learning illustration"
                position="relative"
                zIndex={1}
                w="92%"
                maxW="360px"
                objectFit="contain"
                mb="-4px"
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
 
        {/* Footer */}
       
      </Box>
    </Flex>
  );
};
 
export default AuthenticationLayout;
