"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import {
  Box, Flex, VStack, HStack, Text, Avatar, Input, IconButton, useColorModeValue, Spacer, Spinner,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Button
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useParams, useRouter } from "next/navigation";
import stores from "../../../store/stores";
import { FiArrowLeft, FiMoreVertical, FiSend, FiX } from "react-icons/fi";

const ChatWindow = observer(() => {
  const { chatStore } = stores;
  const router = useRouter();
  const params = useParams();
  const communityId = params?.communityId as string;
  const [messageText, setMessageText] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const drawerBodyRef = useRef<HTMLDivElement>(null);

  const { isOpen: isMembersOpen, onOpen: onMembersOpen, onClose: onMembersClose } = useDisclosure();

  const bgPanel = useColorModeValue("white", "gray.800");
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const initChat = async () => {
      if (communityId) {
        setIsInitializing(true);
        let community = chatStore.communities.find((c: any) => c._id === communityId);
        if (!community) {
          community = await chatStore.fetchCommunityDetails(communityId);
        }

        if (community) {
          chatStore.setActiveCommunity(community);
          chatStore.fetchCommunityMemberCount(community._id);
        }

        await chatStore.fetchCommunityRooms(communityId);
        if (chatStore.rooms.length > 0) {
          const defaultRoom = chatStore.rooms[0];
          chatStore.setActiveRoom(defaultRoom);
        }
        setIsInitializing(false);
      }
    };
    initChat();

    chatStore.connectSocket();
  }, [communityId]);

  useEffect(() => {
    if (isMembersOpen && communityId) {
      chatStore.fetchCommunityMembers(communityId, 1);
    }
  }, [isMembersOpen, communityId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom || chatStore.messages.length <= 100) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [chatStore.messages.length]);

  useLayoutEffect(() => {
    if (scrollContainerRef.current && chatStore.isLoadingMore === false && previousScrollHeight.current > 0) {
      const currentScrollHeight = scrollContainerRef.current.scrollHeight;
      if (currentScrollHeight > previousScrollHeight.current) {
        scrollContainerRef.current.scrollTop = currentScrollHeight - previousScrollHeight.current;
        previousScrollHeight.current = 0;
      }
    }
  }, [chatStore.messages.length, chatStore.isLoadingMore]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && chatStore.hasMoreMessages && !chatStore.isLoadingMore) {
      previousScrollHeight.current = e.currentTarget.scrollHeight;
      chatStore.loadMoreMessages();
    }
  };

  const handleMembersScroll = () => {
    if (!drawerBodyRef.current || chatStore.isFetchingMembers || !chatStore.hasMoreMembers) return;
    const { scrollTop, scrollHeight, clientHeight } = drawerBodyRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      chatStore.fetchCommunityMembers(communityId, chatStore.membersCurrentPage + 1);
    }
  };

  const handleSendMessage = () => {
    const roomId = chatStore.activeRoom?._id;
    if (!messageText.trim() || !roomId) return;
    chatStore.sendMessage(roomId, messageText);
    setMessageText("");
  };

  if (isInitializing) {
    return (
      <Flex flex={1} align="center" justify="center" h="full" bg={bgMain}>
        <Text color="gray.500" fontSize="lg">Loading chat...</Text>
      </Flex>
    );
  }

  if (!chatStore.activeRoom) {
    return (
      <Flex flex={1} align="center" justify="center" h="full" bg={bgMain}>
        <Text color="gray.500" fontSize="lg">No chat available for this community</Text>
      </Flex>
    );
  }

  return (
    <Flex flex={1} direction="column" h="full" bg={bgMain}>
      <Box h="64px" px={4} display="flex" alignItems="center" bg={bgPanel} borderBottom="1px solid" borderColor={borderColor} shadow="sm">
        <HStack spacing={2} w="full">
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Back to communities"
            icon={<FiArrowLeft size={20} />}
            variant="ghost"
            borderRadius="full"
            onClick={() => router.push(`/chat`)}
          />
          <HStack 
            flex={1} 
            cursor="pointer" 
            onClick={onMembersOpen} 
            _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
            py={1}
            px={2}
            borderRadius="lg"
            transition="background 0.2s"
          >
            <Avatar 
              size="sm" 
              name={chatStore.activeCommunity?.name} 
              src={chatStore.activeCommunity?.logo_url} 
              border="2px solid"
              borderColor={useColorModeValue("white", "gray.800")}
              boxShadow="sm"
            />
            <VStack align="start" spacing={0} flex={1} minW={0} ml={2}>
              <Text 
                fontSize="lg" 
                fontWeight="800" 
                bgGradient={useColorModeValue("linear(to-r, blue.600, purple.600)", "linear(to-r, blue.300, purple.300)")}
                bgClip="text"
                letterSpacing="tight"
                noOfLines={1}
                w="full"
              >
                {chatStore.activeCommunity?.name}
              </Text>
              <HStack spacing={1.5}>
                <Box w={2} h={2} borderRadius="full" bg="green.400" boxShadow="0 0 6px rgba(72, 187, 120, 0.8)" />
                <Text fontSize="xs" color={useColorModeValue("blue.600", "blue.300")} fontWeight="700">
                  {chatStore.activeCommunityMemberCount} Members
                </Text>
              </HStack>
            </VStack>
          </HStack>
          <Spacer />
          <IconButton
            aria-label="More options"
            icon={<FiMoreVertical size={20} />}
            variant="ghost"
            borderRadius="full"
          />
        </HStack>
      </Box>

      <Box flex={1} overflowY="auto" p={4} onScroll={handleScroll} ref={scrollContainerRef}>
        {chatStore.isLoadingMore && (
          <Flex justify="center" my={4}>
            <Spinner size="sm" color="gray.500" />
          </Flex>
        )}
        <VStack align="stretch" spacing={6}>
          {chatStore.messages.map((msg: any) => {
            const isMe = msg.user_id?._id === stores.auth.user?._id;
            return (
              <HStack key={msg._id} align="end" spacing={3} justify={isMe ? "flex-end" : "flex-start"}>
                {!isMe && <Avatar size="sm" name={msg.user_id?.name} src={msg.user_id?.pic?.url} />}
                
                <VStack align={isMe ? "end" : "start"} spacing={1} maxW="75%">
                  {!isMe && (
                    <Text fontSize="xs" color="gray.500" fontWeight="600" ml={1}>
                      {msg.user_id?.name || "Unknown"}
                    </Text>
                  )}
                  <Box
                    bg={isMe ? "blue.500" : useColorModeValue("white", "gray.800")}
                    color={isMe ? "white" : "inherit"}
                    px={5} 
                    py={3} 
                    borderRadius="2xl"
                    borderBottomRightRadius={isMe ? "sm" : "2xl"}
                    borderBottomLeftRadius={!isMe ? "sm" : "2xl"}
                    shadow="sm"
                  >
                    <Text fontSize="md" lineHeight="tall">{msg.content}</Text>
                  </Box>
                  <Text fontSize="10px" color="gray.400" fontWeight="500" alignSelf={isMe ? "flex-end" : "flex-start"} px={1}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </VStack>
              </HStack>
            );
          })}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      <Box p={4} bg={bgPanel} borderTop="1px solid" borderColor={borderColor}>
        <HStack spacing={3}>
          <Input
            placeholder={chatStore.isOnline ? "Type a message..." : "You are offline..."}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              if (chatStore.activeRoom) chatStore.emitTyping(chatStore.activeRoom._id);
            }}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            bg={useColorModeValue("gray.100", "gray.900")}
            border="1px solid"
            borderColor="transparent"
            borderRadius="full" 
            px={6} 
            py={6} 
            fontSize="md"
            _focus={{ ring: 0, borderColor: "blue.400", bg: useColorModeValue("white", "gray.800") }}
            _hover={{ bg: useColorModeValue("gray.200", "gray.800") }}
            transition="all 0.2s"
          />
          <IconButton
            aria-label="Send Message"
            colorScheme="blue"
            borderRadius="full"
            icon={<FiSend size={18} />}
            onClick={handleSendMessage}
            isLoading={!chatStore.isOnline}
            size="lg"
            px={6}
          />
        </HStack>
      </Box>

      <Drawer isOpen={isMembersOpen} placement="right" onClose={onMembersClose} size="sm">
        <DrawerOverlay backdropFilter="blur(3px)" bg="blackAlpha.300" />
        <DrawerContent bg={bgPanel} shadow="xl" borderLeftRadius={{ base: 0, md: "2xl" }}>
          <Flex 
            h="64px" 
            minH="64px" 
            w="full"
            align="center" 
            justify="space-between" 
            px={4} 
            borderBottom="1px solid" 
            borderColor={borderColor}
          >
            <VStack align="start" spacing={0}>
              <Text 
                fontSize="lg" 
                fontWeight="800" 
                bgGradient={useColorModeValue("linear(to-r, blue.600, purple.600)", "linear(to-r, blue.300, purple.300)")}
                bgClip="text"
                letterSpacing="tight"
              >
                Community Members
              </Text>
              <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} fontWeight="600">
                {chatStore.activeCommunityMemberCount} Participants
              </Text>
            </VStack>
            <IconButton
              aria-label="Close"
              icon={<FiX size={20} />}
              variant="ghost"
              borderRadius="full"
              onClick={onMembersClose}
            />
          </Flex>
          <DrawerBody ref={drawerBodyRef} onScroll={handleMembersScroll} p={0}>
            <VStack align="stretch" spacing={0}>
              {chatStore.communityMembers.map((member: any) => (
                <HStack 
                  key={member.user._id} 
                  px={4} 
                  py={2} 
                  h="64px"
                  justify="space-between" 
                  w="full" 
                  borderBottom="1px solid" 
                  borderColor={borderColor}
                  _hover={{ bg: useColorModeValue("gray.50", "gray.800") }}
                  transition="background 0.2s"
                >
                  <HStack spacing={3} flex={1} overflow="hidden">
                    <Avatar 
                      size="sm" 
                      name={member.user.name} 
                      src={member.user.pic} 
                      border="2px solid"
                      borderColor={member.user._id === chatStore.activeCommunity?.created_by ? useColorModeValue("blue.500", "blue.300") : "transparent"}
                    />
                    <VStack align="start" spacing={0} flex={1} minW={0}>
                      <Text fontWeight="bold" fontSize="md" noOfLines={1} color={useColorModeValue("gray.800", "white")}>
                        {member.user.name}
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={member.user._id === chatStore.activeCommunity?.created_by ? useColorModeValue("blue.600", "blue.300") : useColorModeValue("gray.500", "gray.400")}
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        {member.user._id === chatStore.activeCommunity?.created_by ? "Creator" : member.role}
                      </Text>
                    </VStack>
                  </HStack>
                  {stores.auth.user?._id === chatStore.activeCommunity?.created_by && member.user._id !== chatStore.activeCommunity?.created_by && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => chatStore.removeCommunityMember(communityId as string, member.user._id)}
                      _hover={{ bg: "red.50" }}
                    >
                      Remove
                    </Button>
                  )}
                </HStack>
              ))}
              {chatStore.isFetchingMembers && (
                <Flex justify="center" p={4}><Spinner size="sm" /></Flex>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
});

export default ChatWindow;
