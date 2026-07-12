"use client";

import { Box, VStack, HStack, Text, Avatar, Spinner, useColorModeValue, IconButton, Divider } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter, useParams } from "next/navigation";
import stores from "../../../store/stores";
import { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";

const CommunitySidebar = observer(() => {
  const { chatStore } = stores;
  const router = useRouter();
  const params = useParams();
  const communityId = params?.communityId as string;

  const bgPanel = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (chatStore.communities.length === 0) {
      chatStore.fetchMyCommunities();
    }
  }, []);

  const handleSelectCommunity = (community: any) => {
    chatStore.setActiveCommunity(community);
    router.push(`/chat/${community._id}`);
  };

  return (
    <Box w={{ base: "full", md: "80px" }} h={{ base: "100vh", md: "calc(100vh - 64px)" }} bg={bgPanel} borderRight="1px solid" borderColor={borderColor}>
      {/* Mobile Header for Community List */}
      <Box 
        display={{ base: "flex", md: "none" }} 
        h="64px"
        px={4} 
        borderBottom="1px solid" 
        borderColor={borderColor}
        alignItems="center"
        shadow="sm"
      >
        <IconButton
          aria-label="Back to home"
          icon={<FiArrowLeft size={20} />}
          variant="ghost"
          borderRadius="full"
          mr={3}
          onClick={() => router.push('/')}
        />
        <Text 
          fontSize="xl" 
          fontWeight="800" 
          bgGradient={useColorModeValue("linear(to-r, blue.600, purple.600)", "linear(to-r, blue.300, purple.300)")}
          bgClip="text"
          letterSpacing="tight"
        >
          Messages
        </Text>
      </Box>

      <VStack spacing={{ base: 0, md: 4 }} align={{ base: "stretch", md: "center" }} py={{ base: 0, md: 4 }}>
        {chatStore.isLoading && chatStore.communities.length === 0 && <Spinner size="sm" alignSelf="center" />}
        {chatStore.communities.map((community: any) => {
          const isActive = communityId === community._id;
          return (
            <Box 
              key={community._id}
              borderBottom={{ base: "1px solid", md: "none" }}
              borderColor={borderColor}
            >
              <HStack
                onClick={() => handleSelectCommunity(community)}
                cursor="pointer"
                px={{ base: 4, md: 0 }}
                py={{ base: 4, md: 0 }}
                bg={isActive ? useColorModeValue("linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%)", "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.1) 100%)") : "transparent"}
                _hover={{ bg: !isActive ? useColorModeValue("gray.50", "gray.800") : undefined }}
                justify={{ base: "flex-start", md: "center" }}
                spacing={{ base: 4, md: 0 }}
                transition="all 0.3s ease"
              >
                <Box 
                  p={isActive ? "2px" : "0"} 
                  bgGradient={isActive ? "linear(to-tr, blue.400, purple.400)" : "transparent"} 
                  borderRadius="full"
                  boxShadow={isActive ? "0 4px 10px rgba(59, 130, 246, 0.3)" : "none"}
                >
                  <Avatar 
                    size={{ base: "md", md: "sm" }} 
                    name={community.name} 
                    src={community.logo_url}
                    border={isActive ? "2px solid" : "none"}
                    borderColor={useColorModeValue("white", "gray.900")}
                  />
                </Box>
                <VStack 
                  display={{ base: "flex", md: "none" }} 
                  align="start" 
                  spacing={0.5}
                  flex={1}
                >
                  <Text 
                    fontWeight="700" 
                    fontSize="md" 
                    color={isActive ? useColorModeValue("blue.700", "blue.300") : "inherit"}
                    noOfLines={1}
                  >
                    {community.name}
                  </Text>
                  <Text 
                    fontSize="xs" 
                    color={isActive ? useColorModeValue("purple.600", "purple.300") : "gray.500"} 
                    fontWeight="600"
                  >
                    {isActive ? "Currently active" : "Tap to open chat"}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
});

export default CommunitySidebar;
