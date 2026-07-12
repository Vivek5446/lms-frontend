"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import {
  Box, Flex, VStack, HStack, Text, Avatar, Input, IconButton, useColorModeValue, Spacer, Spinner,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Button, Image, Checkbox,
  InputGroup, InputLeftElement, InputRightElement,
  Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, ModalHeader, ModalFooter,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, Textarea, useToast
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useParams, useRouter } from "next/navigation";
import stores from "../../../store/stores";
import { FiArrowLeft, FiMoreVertical, FiSend, FiX, FiPaperclip, FiAlertTriangle, FiTrash2, FiCheck } from "react-icons/fi";

const ChatWindow = observer(() => {
  const { chatStore } = stores;
  const router = useRouter();
  const params = useParams();
  const communityId = params?.communityId as string;
  const [messageText, setMessageText] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hiddenMessages, setHiddenMessages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const drawerBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deleteTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const { isOpen: isMembersOpen, onOpen: onMembersOpen, onClose: onMembersClose } = useDisclosure();

  const bgPanel = useColorModeValue("white", "gray.800");
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const bgChat = useColorModeValue("linear(to-b, gray.50, blue.50)", "linear(to-b, #111827, #0f172a)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

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

  const handleReport = async () => {
    if (!reportReason.trim() || !chatStore.activeCommunity) return;
    setIsSubmitting(true);
    const success = await chatStore.reportCommunity(chatStore.activeCommunity._id, reportReason);
    setIsSubmitting(false);
    if (success) {
      toast({ title: "Community Reported", description: "Your report has been submitted to the admins.", status: "success", duration: 5000 });
      onReportClose();
      setReportReason("");
    } else {
      toast({ title: "Error", description: "Failed to report community.", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!chatStore.activeCommunity) return;
    setIsSubmitting(true);
    const success = await chatStore.deleteCommunity(chatStore.activeCommunity._id);
    setIsSubmitting(false);
    if (success) {
      toast({ title: "Community Deleted", description: "The community has been successfully removed.", status: "success", duration: 5000 });
      onDeleteClose();
      router.push("/chat");
    } else {
      toast({ title: "Error", description: "Failed to delete community.", status: "error" });
    }
  };

  const handleSendMessage = () => {
    const roomId = chatStore.activeRoom?._id;
    if (!messageText.trim() || !roomId) return;
    chatStore.sendMessage(roomId, messageText);
    setMessageText("");
  };

  const handleDeleteMessage = (msgId: string) => {
    const idStr = String(msgId);
    setHiddenMessages(prev => [...prev, idStr]);
    
    const timeout = setTimeout(() => {
      if (chatStore.activeRoom) {
        chatStore.deleteMessage(chatStore.activeRoom._id, idStr);
      }
      setHiddenMessages(prev => prev.filter(id => id !== idStr));
      delete deleteTimeoutsRef.current[idStr];
    }, 5000);

    deleteTimeoutsRef.current[idStr] = timeout;
  };

  const handleBulkDelete = () => {
    selectedMessages.forEach(id => handleDeleteMessage(id));
    setSelectedMessages([]);
    setIsSelectionMode(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const roomId = chatStore.activeRoom?._id;
    if (!file || !roomId) return;
    
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const imageData = {
        file: {
          filename: file.name,
          type: file.type,
          buffer: base64String,
        },
      };
      try {
        const dt = await stores.auth.uploadFile(imageData);
        const imageUrl = dt?.data;
        if (imageUrl) {
           chatStore.sendMessage(roomId, "", imageUrl, file.type);
        }
      } catch (err) {
        console.error("Failed to upload file", err);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const renderMessageContent = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA', textDecoration: 'underline', wordBreak: 'break-all' }}>
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (isInitializing) {
    return (
      <Flex flex={1} align="center" justify="center" h="full" bg={bgMain}>
        <VStack spacing={4}>
          <Spinner size="xl" thickness="3px" color="blue.500" emptyColor={useColorModeValue("gray.200", "gray.700")} />
          <Text color="gray.500" fontSize="lg" fontWeight="500">Connecting to chat...</Text>
        </VStack>
      </Flex>
    );
  }

  if (!chatStore.activeRoom) {
    return (
      <Flex flex={1} align="center" justify="center" h="full" bg={bgMain}>
        <VStack spacing={3}>
          <Box p={4} bg={useColorModeValue("gray.100", "gray.800")} borderRadius="full">
            <FiSend size={32} color={useColorModeValue("#CBD5E0", "#4A5568")} />
          </Box>
          <Text color="gray.500" fontSize="lg" fontWeight="500">No chat available for this community</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Flex flex={1} direction="column" h="full" bg={bgMain}>
      <Box 
        h="64px" px={4} display="flex" alignItems="center" 
        bg={useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(26, 32, 44, 0.8)")} 
        backdropFilter="blur(16px)"
        borderBottom="1px solid" borderColor={borderColor} shadow="sm"
        zIndex={10}
      >
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
          <Menu placement="bottom-end">
            <MenuButton 
              as={IconButton} 
              aria-label="More options" 
              icon={<FiMoreVertical size={20} />} 
              variant="ghost" 
              borderRadius="full" 
            />
            <MenuList 
              bg={useColorModeValue("white", "gray.800")}
              borderColor={useColorModeValue("gray.100", "gray.700")} 
              shadow="2xl" 
              borderRadius="2xl"
              p={2}
              minW="240px"
              zIndex={20}
            >
              <MenuItem 
                bg="transparent"
                _hover={{ bg: useColorModeValue("blue.50", "whiteAlpha.100") }} 
                onClick={() => setIsSelectionMode(true)}
                borderRadius="xl"
                px={3} py={2}
                mb={1}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <HStack spacing={3}>
                  <Flex w="32px" h="32px" borderRadius="lg" bg={useColorModeValue("blue.50", "rgba(66, 153, 225, 0.15)")} align="center" justify="center">
                    <FiCheck size={16} color={useColorModeValue("#3182ce", "#90cdf4")} />
                  </Flex>
                  <Text fontWeight="600" fontSize="sm" color={useColorModeValue("gray.700", "gray.200")}>Select Messages</Text>
                </HStack>
              </MenuItem>
              <MenuItem 
                bg="transparent"
                _hover={{ bg: useColorModeValue("orange.50", "whiteAlpha.100") }} 
                onClick={onReportOpen}
                borderRadius="xl"
                px={3} py={2}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <HStack spacing={3}>
                  <Flex w="32px" h="32px" borderRadius="lg" bg={useColorModeValue("orange.50", "rgba(221, 107, 32, 0.15)")} align="center" justify="center">
                    <FiAlertTriangle size={16} color={useColorModeValue("#dd6b20", "#fbd38d")} />
                  </Flex>
                  <Text fontWeight="600" fontSize="sm" color={useColorModeValue("gray.700", "gray.200")}>Report Community</Text>
                </HStack>
              </MenuItem>
              {chatStore.activeCommunity?.created_by === stores.auth.user?._id && (
                <>
                  <MenuDivider borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} mx={3} my={2} />
                  <MenuItem 
                    bg="transparent"
                    _hover={{ bg: useColorModeValue("red.50", "rgba(229, 62, 62, 0.15)") }} 
                    onClick={onDeleteOpen}
                    borderRadius="xl"
                    px={3} py={2}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    <HStack spacing={3}>
                      <Flex w="32px" h="32px" borderRadius="lg" bg={useColorModeValue("red.50", "rgba(229, 62, 62, 0.15)")} align="center" justify="center">
                        <FiTrash2 size={16} color={useColorModeValue("#e53e3e", "#fc8181")} />
                      </Flex>
                      <Text fontWeight="700" fontSize="sm" color={useColorModeValue("red.600", "red.400")}>Delete Community</Text>
                    </HStack>
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </HStack>
      </Box>

      <Box 
        flex={1} 
        overflowY="auto" 
        p={4} 
        onScroll={handleScroll} 
        ref={scrollContainerRef} 
        bgGradient={bgChat}
        bgImage={useColorModeValue(
          "radial-gradient(#CBD5E0 1px, transparent 1px)",
          "radial-gradient(#1A202C 1px, transparent 1px)"
        )}
        bgSize="20px 20px"
        css={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(150, 150, 150, 0.3)", borderRadius: "24px" },
          "&::-webkit-scrollbar-thumb:hover": { background: "rgba(150, 150, 150, 0.5)" },
        }}
      >
        {chatStore.isLoadingMore && (
          <Flex justify="center" my={4}>
            <Spinner size="sm" color="gray.500" />
          </Flex>
        )}
        <VStack align="stretch" spacing={6}>
          {chatStore.messages.map((msg: any) => {
            const isMe = msg.user_id?._id === stores.auth.user?._id;
            const isCreator = chatStore.activeCommunity?.created_by === stores.auth.user?._id;
            const canDelete = isMe || isCreator;
            const isPendingDelete = hiddenMessages.includes(String(msg._id));
            const isSelected = selectedMessages.includes(String(msg._id));

            if (isPendingDelete) {
              return (
                <HStack key={msg._id} justify={isMe ? "flex-end" : "flex-start"} w="full" animation="fadeIn 0.3s ease">
                  <Box bg={useColorModeValue("gray.100", "gray.800")} px={4} py={2} borderRadius="xl" display="flex" alignItems="center" gap={3}>
                    <FiTrash2 color="gray" />
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">Message deleted</Text>
                    <Button size="xs" variant="ghost" colorScheme="blue" onClick={() => {
                      if (deleteTimeoutsRef.current[String(msg._id)]) {
                        clearTimeout(deleteTimeoutsRef.current[String(msg._id)]);
                        delete deleteTimeoutsRef.current[String(msg._id)];
                      }
                      setHiddenMessages(prev => prev.filter(id => id !== String(msg._id)));
                    }}>Undo</Button>
                  </Box>
                </HStack>
              );
            }

            return (
              <HStack 
                key={msg._id} 
                w="full"
                align="center"
                cursor={isSelectionMode && canDelete ? "pointer" : "default"}
                onClick={() => {
                  if (isSelectionMode && canDelete) {
                    setSelectedMessages(prev => isSelected ? prev.filter(id => id !== String(msg._id)) : [...prev, String(msg._id)]);
                  }
                }}
                animation="fadeInUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                sx={{
                  "@keyframes fadeInUp": {
                    "0%": { opacity: 0, transform: "translateY(10px) scale(0.98)" },
                    "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
                  }
                }}
              >
                {isSelectionMode && canDelete && (
                  <Checkbox 
                    size="lg"
                    colorScheme="blue"
                    isChecked={isSelected}
                    onChange={() => {}}
                    mr={2}
                    pointerEvents="none"
                  />
                )}
                
                <HStack 
                  flex={1}
                  align="end" 
                  spacing={3} 
                  justify={isMe ? "flex-end" : "flex-start"}
                  w="full"
                >
                  {!isMe && <Avatar size="sm" name={msg.user_id?.name} src={msg.user_id?.pic?.url} />}
                
                <VStack align={isMe ? "end" : "start"} spacing={1} maxW="75%">
                  {!isMe && (
                    <Text fontSize="xs" color="gray.500" fontWeight="600" ml={1}>
                      {msg.user_id?.name || "Unknown"}
                    </Text>
                  )}
                  <Box
                    bg={!msg.content && msg.file_url ? "transparent" : isMe ? useColorModeValue("blue.500", "blue.600") : useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.8)")}
                    backdropFilter={!msg.content && msg.file_url ? "none" : isMe ? "none" : "blur(12px)"}
                    color={isMe ? "white" : useColorModeValue("gray.800", "white")}
                    p={!msg.content && msg.file_url ? 0 : 3} 
                    borderRadius={!msg.content && msg.file_url ? "2xl" : "2xl"}
                    borderBottomRightRadius={isMe && (msg.content || !msg.file_url) ? "md" : !msg.content && msg.file_url ? "2xl" : "2xl"}
                    borderBottomLeftRadius={!isMe && (msg.content || !msg.file_url) ? "md" : !msg.content && msg.file_url ? "2xl" : "2xl"}
                    boxShadow={!msg.content && msg.file_url ? "none" : isMe ? "0 4px 14px rgba(59, 130, 246, 0.25)" : "0 4px 14px rgba(0, 0, 0, 0.05)"}
                    position="relative"
                    border={!isMe ? "1px solid" : "none"}
                    borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
                    maxW="100%"
                    role="group"
                  >
                    {msg.file_url && (
                      <Image 
                        src={msg.file_url} 
                        alt="attachment" 
                        borderRadius="xl" 
                        maxH="300px" 
                        maxW="100%"
                        objectFit="cover" 
                        mb={msg.content ? 2 : 0}
                        border={!msg.content && !isMe ? "1px solid" : "none"}
                        borderColor={useColorModeValue("gray.200", "gray.700")}
                        shadow={!msg.content ? "sm" : "none"}
                        cursor="zoom-in"
                        onClick={(e) => {
                          if (isSelectionMode) {
                            return; // Let the click bubble up to the HStack
                          }
                          e.stopPropagation();
                          setPreviewImage(msg.file_url);
                        }}
                      />
                    )}
                    {canDelete && (
                      <IconButton
                        aria-label="Delete message"
                        icon={<FiTrash2 size={14} />}
                        size="xs"
                        colorScheme="red"
                        variant="solid"
                        position="absolute"
                        top={-2}
                        right={!isMe ? -2 : "auto"}
                        left={isMe ? -2 : "auto"}
                        zIndex={999}
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                        transition="all 0.2s"
                        borderRadius="full"
                        boxShadow="md"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteMessage(String(msg._id));
                        }}
                      />
                    )}
                    {msg.content && (
                      <Text fontSize="md" lineHeight="tall" wordBreak="break-word" whiteSpace="pre-wrap">
                        {renderMessageContent(msg.content)}
                      </Text>
                    )}
                  </Box>
                  <Text fontSize="10px" color="gray.400" fontWeight="500" alignSelf={isMe ? "flex-end" : "flex-start"} px={1}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </VStack>
              </HStack>
              </HStack>
            );
          })}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      <Box p={4} bg={bgPanel} borderTop="1px solid" borderColor={borderColor}>
        {isSelectionMode ? (
          <Flex
            w="full"
            justify="space-between"
            align="center"
            bg={useColorModeValue("white", "gray.800")}
            p={2}
            px={4}
            borderRadius="full"
            boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.08)", "0 4px 20px rgba(0,0,0,0.4)")}
            border="1px solid"
            borderColor={useColorModeValue("gray.100", "gray.700")}
          >
            <HStack spacing={3}>
              <Flex w={8} h={8} borderRadius="full" bg={useColorModeValue("blue.50", "rgba(66, 153, 225, 0.15)")} align="center" justify="center">
                <Text fontWeight="800" fontSize="sm" color={useColorModeValue("blue.600", "blue.300")}>
                  {selectedMessages.length}
                </Text>
              </Flex>
              <Text fontWeight="600" color={useColorModeValue("gray.700", "gray.200")} fontSize="sm">
                Selected
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Button 
                size="sm" 
                variant="ghost" 
                borderRadius="full"
                color={useColorModeValue("gray.500", "gray.400")}
                _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.200") }}
                onClick={() => { setIsSelectionMode(false); setSelectedMessages([]); }}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                colorScheme="red" 
                borderRadius="full"
                px={5}
                isDisabled={selectedMessages.length === 0} 
                onClick={handleBulkDelete}
                boxShadow={selectedMessages.length > 0 ? "0 4px 14px rgba(229, 62, 62, 0.3)" : "none"}
                _hover={{ transform: selectedMessages.length > 0 ? "translateY(-1px)" : "none", boxShadow: selectedMessages.length > 0 ? "0 6px 20px rgba(229, 62, 62, 0.4)" : "none" }}
                transition="all 0.2s"
              >
                Delete
              </Button>
            </HStack>
          </Flex>
        ) : (
          <HStack spacing={3}>
            <InputGroup size="lg" alignItems="center" bg={useColorModeValue("white", "whiteAlpha.200")} borderRadius="full" boxShadow="0 2px 10px rgba(0,0,0,0.05)" border="none" _focusWithin={{ ring: 2, ringColor: useColorModeValue("blue.400", "blue.500"), bg: useColorModeValue("white", "whiteAlpha.300") }} transition="all 0.2s">
              <InputLeftElement h="full" w="3rem">
                <IconButton
                aria-label="Attach File"
                variant="ghost"
                borderRadius="full"
                icon={<FiPaperclip size={20} />}
                isLoading={isUploading}
                onClick={() => fileInputRef.current?.click()}
                color={useColorModeValue("gray.500", "gray.400")}
                _hover={{ color: useColorModeValue("blue.500", "blue.300"), bg: "transparent" }}
                _active={{ bg: "transparent" }}
              />
            </InputLeftElement>
            
            <Input
              placeholder={chatStore.isOnline ? "Type a message..." : "You are offline..."}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                if (chatStore.activeRoom) chatStore.emitTyping(chatStore.activeRoom._id);
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              border="none"
              bg="transparent"
              pl="3rem"
              pr="4rem"
              py={6}
              fontSize="md"
              _focus={{ ring: 0 }}
            />
            
            <InputRightElement h="full" w="3.25rem" pr={1} display="flex" alignItems="center" justifyContent="center">
              <IconButton
                aria-label="Send Message"
                bgGradient={useColorModeValue("linear(to-br, blue.400, blue.600)", "linear(to-br, blue.500, blue.700)")}
                color="white"
                borderRadius="full"
                icon={<FiSend size={18} />}
                onClick={handleSendMessage}
                isDisabled={!chatStore.isOnline || isUploading}
                h="40px"
                w="40px"
                minW="40px"
                shadow="md"
                _hover={{ shadow: "lg", transform: "translateY(-1px)", bgGradient: useColorModeValue("linear(to-br, blue.500, blue.700)", "linear(to-br, blue.400, blue.600)") }}
                _active={{ transform: "translateY(0)" }}
              />
            </InputRightElement>
          </InputGroup>

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            onChange={handleFileUpload} 
          />
        </HStack>
        )}
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
          <DrawerBody ref={drawerBodyRef} onScroll={handleMembersScroll} p={4} bg={bgMain}>
            <VStack align="stretch" spacing={2}>
              {chatStore.communityMembers.map((member: any) => (
                <HStack 
                  key={member.user._id} 
                  px={4} 
                  py={3} 
                  bg={useColorModeValue("white", "whiteAlpha.200")}
                  borderRadius="xl"
                  boxShadow="sm"
                  justify="space-between" 
                  w="full" 
                  _hover={{ transform: "translateY(-1px)", shadow: "md", bg: useColorModeValue("gray.50", "whiteAlpha.300") }}
                  transition="all 0.2s"
                >
                  <HStack spacing={3} flex={1} overflow="hidden">
                    <Avatar 
                      size="md" 
                      name={member.user.name} 
                      src={member.user.pic} 
                      border="2px solid"
                      borderColor={member.user._id === chatStore.activeCommunity?.created_by ? useColorModeValue("blue.500", "blue.300") : "transparent"}
                    />
                    <VStack align="start" spacing={0} flex={1} minW={0}>
                      <Text fontWeight="800" fontSize="md" noOfLines={1} color={useColorModeValue("gray.800", "white")}>
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
                      borderRadius="full"
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
      {/* Image Preview Modal */}
      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none" m={4} p={0} display="flex" justifyContent="center" alignItems="center">
          <ModalCloseButton color="white" bg="blackAlpha.600" borderRadius="full" top={2} right={2} size="md" _hover={{ bg: "blackAlpha.800" }} zIndex={10} />
          <ModalBody p={0} display="flex" justifyContent="center" alignItems="center" w="full" h="full">
            {previewImage && (
              <Image 
                src={previewImage} 
                alt="Fullscreen Preview" 
                maxH="85vh" 
                w="auto" 
                borderRadius="lg" 
                boxShadow="2xl" 
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={isReportOpen} onClose={onReportClose} isCentered motionPreset="scale">
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent bg={bgPanel} borderRadius="2xl" shadow="2xl" mx={4}>
          <ModalHeader pt={6} pb={0} display="flex" flexDir="column" alignItems="center">
            <Box bg={useColorModeValue("orange.100", "rgba(237, 137, 54, 0.15)")} p={3} borderRadius="full" mb={3}>
              <FiAlertTriangle size={28} color={useColorModeValue("#DD6B20", "#ED8936")} />
            </Box>
            <Text fontSize="2xl" fontWeight="800">Report Community</Text>
          </ModalHeader>
          <ModalCloseButton 
            mt={3} mr={3} 
            borderRadius="full" 
            bg={useColorModeValue("red.50", "rgba(229, 62, 62, 0.15)")}
            color={useColorModeValue("red.500", "red.300")}
            _hover={{ bg: useColorModeValue("red.100", "rgba(229, 62, 62, 0.25)"), color: useColorModeValue("red.600", "red.400") }}
            transition="all 0.2s"
          />
          <ModalBody textAlign="center" px={6}>
            <Text mb={4} color="gray.500" fontSize="md">Please provide specific details as to why this community violates our terms of service.</Text>
            <Textarea 
              value={reportReason} 
              onChange={(e) => setReportReason(e.target.value)} 
              placeholder="Spam, inappropriate content, harassment..." 
              rows={3} 
              focusBorderColor="orange.400"
              borderRadius="xl"
              bg={useColorModeValue("gray.50", "whiteAlpha.50")}
            />
          </ModalBody>
          <ModalFooter justifyContent="center" gap={3} pb={6} pt={4}>
            <Button size="md" variant="ghost" borderRadius="xl" onClick={onReportClose}>Cancel</Button>
            <Button 
              size="md" 
              bg="orange.500" 
              color="white" 
              _hover={{ bg: "orange.600" }} 
              _active={{ bg: "orange.700" }} 
              borderRadius="xl" 
              onClick={handleReport} 
              isLoading={isSubmitting} 
              isDisabled={!reportReason.trim()} 
              px={6}
            >
              Submit Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered motionPreset="scale">
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
        <ModalContent bg={bgPanel} borderRadius="2xl" shadow="2xl" mx={4}>
          <ModalHeader pt={6} pb={0} display="flex" flexDir="column" alignItems="center">
            <Box bg={useColorModeValue("red.100", "rgba(245, 101, 101, 0.15)")} p={3} borderRadius="full" mb={3}>
              <FiTrash2 size={28} color={useColorModeValue("#E53E3E", "#FC8181")} />
            </Box>
            <Text fontSize="2xl" fontWeight="800" color={useColorModeValue("red.600", "red.400")}>Delete Community</Text>
          </ModalHeader>
          <ModalCloseButton 
            mt={3} mr={3} 
            borderRadius="full" 
            bg={useColorModeValue("red.50", "rgba(229, 62, 62, 0.15)")}
            color={useColorModeValue("red.500", "red.300")}
            _hover={{ bg: useColorModeValue("red.100", "rgba(229, 62, 62, 0.25)"), color: useColorModeValue("red.600", "red.400") }}
            transition="all 0.2s"
          />
          <ModalBody textAlign="center" px={6}>
            <Text fontWeight="700" fontSize="lg" color={useColorModeValue("gray.700", "gray.200")}>Are you absolutely sure?</Text>
            <Text mt={2} color="gray.500" fontSize="md">
              This action cannot be undone. All members will be removed and the chat history will be permanently hidden from everyone.
            </Text>
          </ModalBody>
          <ModalFooter justifyContent="center" gap={3} pb={6} pt={4}>
            <Button size="md" variant="ghost" borderRadius="xl" onClick={onDeleteClose}>Cancel</Button>
            <Button 
              size="md" 
              bg="red.500" 
              color="white" 
              _hover={{ bg: "red.600" }} 
              _active={{ bg: "red.700" }} 
              borderRadius="xl" 
              onClick={handleDelete} 
              isLoading={isSubmitting} 
              px={6}
            >
              Yes, Delete It
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Flex>
  );
});

export default ChatWindow;
