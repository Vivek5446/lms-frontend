"use client";

import { Flex, Text, useColorModeValue, Button, Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

const ChatRootPage = observer(() => {
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const iconColor = useColorModeValue("brand.500", "brand.300");
  const glowColor = useColorModeValue("rgba(98, 105, 255, 0.15)", "rgba(98, 105, 255, 0.08)");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const { chatStore } = stores;

  return (
    <Flex 
      flex={1} direction="column" h="full" w="full" display={{ base: "none", md: "flex" }}
      bg={bgMain}
      bgImage={useColorModeValue(
        "radial-gradient(#CBD5E0 1px, transparent 1px)",
        "radial-gradient(#1A202C 1px, transparent 1px)"
      )}
      bgSize="20px 20px"
    >
      <Flex 
        flex={1}
        direction="column" 
        align="center" 
        justify="center" 
        textAlign="center"
        maxW="md"
        px={6}
        mx="auto"
      >
        {/* Glowing Icon Container */}
        <Box position="relative" mb={8}>
          <Box 
            position="absolute" 
            top="50%" left="50%" 
            transform="translate(-50%, -50%)"
            w="120px" h="120px" 
            bg={glowColor} 
            borderRadius="full" 
            filter="blur(20px)"
            animation="pulse 3s infinite alternate"
          />
          <Flex 
            position="relative"
            w="80px" h="80px" 
            bg={useColorModeValue("white", "gray.800")}
            boxShadow={useColorModeValue("0 10px 30px -10px rgba(0,0,0,0.1)", "0 10px 30px -10px rgba(0,0,0,0.5)")}
            borderRadius="2xl"
            align="center" justify="center"
            color={iconColor}
          >
            <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="36px" width="36px" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </Flex>
        </Box>

        {/* Typography */}
        <Text fontSize="2xl" fontWeight="700" color={textColor} mb={3} letterSpacing="tight">
          Welcome to Communities
        </Text>
        <Text fontSize="md" color={subTextColor} mb={10} lineHeight="relaxed">
          Select a community from the sidebar to join the conversation, or create a brand new space for your people.
        </Text>
        
        {/* Action Button */}
        <Button
          bg={useColorModeValue("gray.900", "white")}
          color={useColorModeValue("white", "gray.900")}
          size="lg"
          h="54px"
          px={8}
          borderRadius="xl"
          fontWeight="600"
          fontSize="md"
          onClick={() => chatStore.openCreateDrawer()}
          _hover={{ 
            transform: "translateY(-2px)", 
            bg: useColorModeValue("gray.700", "gray.100"),
            boxShadow: useColorModeValue("0 10px 20px -10px rgba(0,0,0,0.3)", "0 10px 20px -10px rgba(255,255,255,0.2)")
          }}
          _active={{ transform: "scale(0.97)" }}
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          Create New Community
        </Button>
      </Flex>
    </Flex>
  );
});

export default ChatRootPage;
