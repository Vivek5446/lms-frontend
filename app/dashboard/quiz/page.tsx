"use client";

import {
  Box, Button, Center, Flex, Heading, Icon, Stack, Text, useColorModeValue,
  Badge, Spinner, IconButton, useToast, HStack, useDisclosure, AlertDialog,
  AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody,
  AlertDialogFooter, Switch, Tooltip, VStack, Divider
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { FaClipboardList, FaPlus, FaTrash, FaEdit, FaMagic, FaRegClock, FaGlobe } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function QuizDashboardPage() {
  const router = useRouter();
  const toast = useToast();
  
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Community Chat Premium Tokens
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.900", "white");
  const subColor = useColorModeValue("gray.500", "gray.400");
  const iconBg = useColorModeValue("gray.100", "gray.700");

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const deleteCancelRef = useRef<HTMLButtonElement>(null);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();
  const statusCancelRef = useRef<HTMLButtonElement>(null);
  const [quizToToggle, setQuizToToggle] = useState<any>(null);
  const [targetStatus, setTargetStatus] = useState<boolean>(false);

  const fetchQuizzes = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get("/quiz");
      setQuizzes(response.data.data.data || []);
    } catch (error: any) {
      toast({ title: "Failed to load quizzes", status: "error" });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const triggerDelete = (id: string) => {
    setQuizToDelete(id);
    onDeleteOpen();
  };

  const triggerToggleStatus = (quiz: any, newStatus: boolean) => {
    setQuizToToggle(quiz);
    setTargetStatus(newStatus);
    onStatusOpen();
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    try {
      await axios.delete(`/quiz/${quizToDelete}`);
      toast({ title: "Quiz deleted successfully", status: "success" });
      fetchQuizzes();
    } catch (error: any) {
      toast({ title: "Failed to delete quiz", status: "error" });
    } finally {
      onDeleteClose();
      setQuizToDelete(null);
    }
  };

  const handleConfirmToggleActive = async () => {
    if (!quizToToggle) return;
    try {
      setQuizzes(quizzes.map(q => q._id === quizToToggle._id ? { ...q, isActive: targetStatus } : q));
      await axios.patch(`/quiz/${quizToToggle._id}/status`, { isActive: targetStatus });
      toast({ title: `Quiz ${targetStatus ? 'Activated' : 'Deactivated'}`, status: targetStatus ? "success" : "info", duration: 2000 });
    } catch (error: any) {
      setQuizzes(quizzes.map(q => q._id === quizToToggle._id ? { ...q, isActive: !targetStatus } : q));
      toast({ title: "Failed to update quiz status", status: "error" });
    } finally {
      onStatusClose();
      setQuizToToggle(null);
    }
  };

  return (
    <Box bg="transparent">
      {/* Header Area */}
      <Box 
        bg={cardBg} 
        borderWidth="1px" 
        borderColor={borderColor} 
        rounded="2xl"
        px={{ base: 4, md: 6 }} 
        py={{ base: 4, md: 5 }}
        shadow="sm"
        mb={6}
      >
        <Flex w="full" justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={{ base: 5, md: 4 }}>
          <HStack spacing={{ base: 3, md: 4 }} align="center">
            <Box 
              as="button"
              onClick={() => window.history.back()}
              color={subColor}
              bg={useColorModeValue("gray.100", "whiteAlpha.100")}
              w={{ base: "36px", md: "40px" }} h={{ base: "36px", md: "40px" }}
              rounded="full"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.200"), color: "blue.500", transform: "translateX(-3px)" }}
              transition="all 0.2s"
            >
              <FiArrowLeft size={18} />
            </Box>
            <Box display={{ base: "none", md: "flex" }} p={3} bg={useColorModeValue("blue.50", "rgba(98,105,255,0.15)")} rounded="2xl">
              <Icon as={FaClipboardList} boxSize={6} color="blue.500" />
            </Box>
            <Box>
              <Heading size={{ base: "sm", md: "lg" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                <Box as="span" color={headingColor}>QUIZ </Box>
                <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
                  SPACES
                </Box>
              </Heading>
              <Text mt={1} fontSize={{ base: "2xs", md: "xs" }} fontWeight="700" color={subColor} letterSpacing="0.1em" textTransform="uppercase" noOfLines={1}>
                MANAGE ASSESSMENTS
              </Text>
            </Box>
          </HStack>

          <Button 
            bgGradient="linear(to-r, blue.500, blue.600)"
            color="white"
            size={{ base: "md", md: "lg" }}
            rounded="xl"
            px={{ base: 6, md: 8 }}
            h={{ base: "48px", md: "52px" }}
            fontWeight="800"
            letterSpacing="0.05em"
            leftIcon={<FaPlus />}
            onClick={() => router.push("/dashboard/quiz/create")}
            shadow="0 4px 14px rgba(49,130,206,0.35)"
            _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)", transform: "translateY(-2px)", shadow: "0 8px 25px rgba(49,130,206,0.5)" }}
            _active={{ transform: "translateY(0)" }}
            transition="all 0.2s"
          >
            CREATE QUIZ
          </Button>
        </Flex>
      </Box>

      {/* Main Content Area */}
      <Box w="full" px={0} py={2}>
        
        {isFetching ? (
          <Center py={20} flexDir="column" gap={4}>
            <Spinner size="xl" color="blue.500" thickness="3px" speed="0.8s" />
            <Text fontSize="10px" fontWeight="800" color={subColor} letterSpacing="0.15em">LOADING QUIZZES</Text>
          </Center>
        ) : quizzes.length === 0 ? (
          <Center flexDirection="column" py={20}>
            <Box p={8} bg={iconBg} rounded="full" mb={6} border="2px dashed" borderColor={borderColor}>
              <Icon as={FaClipboardList} boxSize={12} color="gray.400" />
            </Box>
            <Heading size="md" color={headingColor} mb={2} fontWeight="800" letterSpacing="tight">No Quizzes Found</Heading>
            <Text color={subColor} fontWeight="500">You haven't created any assessments yet.</Text>
          </Center>
        ) : (
          <VStack spacing={5} align="stretch">
            {quizzes.map((quiz) => {
              const isActive = quiz.isActive ?? true;
              
              return (
                <Box 
                  key={quiz._id}
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={isActive ? "blue.400" : borderColor}
                  rounded="2xl"
                  p={5}
                  shadow={isActive ? "0 4px 20px rgba(98,105,255,0.08)" : "sm"}
                  transition="all 0.2s ease"
                  _hover={{ transform: "translateY(-2px)", shadow: "md", borderColor: "blue.500" }}
                  position="relative"
                  overflow="hidden"
                >
                  {/* Active Indicator Bar */}
                  {isActive && <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg="blue.500" />}

                  <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={6} pl={{ base: isActive ? 2 : 0, md: isActive ? 4 : 2 }}>
                    
                    {/* Left: Icon & Info */}
                    <HStack spacing={5} flex={1}>
                      <Flex 
                        w="56px" h="56px" minW="56px"
                        rounded="2xl" 
                        bg={isActive ? "blue.50" : iconBg} 
                        color={isActive ? "blue.600" : "gray.400"}
                        align="center" justify="center"
                        border="1px solid"
                        borderColor={isActive ? "blue.200" : borderColor}
                      >
                        <FaClipboardList size={24} />
                      </Flex>
                      
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="800" color={headingColor} letterSpacing="tight">
                          {quiz.title}
                        </Text>
                        
                        <HStack spacing={4} pt={1}>
                          <HStack spacing={1}>
                            <Icon as={FaGlobe} color={subColor} boxSize={3} />
                            <Text fontSize="xs" fontWeight="700" color={subColor} letterSpacing="0.05em" textTransform="uppercase">
                              {quiz.visibility}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={FaRegClock} color={subColor} boxSize={3} />
                            <Text fontSize="xs" fontWeight="700" color={subColor} letterSpacing="0.05em" textTransform="uppercase">
                              {new Date(quiz.createdAt).toLocaleDateString()}
                            </Text>
                          </HStack>
                          <Badge colorScheme={isActive ? "green" : "gray"} variant="subtle" rounded="md" px={2} fontSize="10px" fontWeight="800">
                            {quiz.questionCount || 0} Questions
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>

                    {/* Right: Actions */}
                    <HStack spacing={6}>
                      
                      {/* Status Toggle */}
                      <Tooltip label={isActive ? "Quiz is Live" : "Quiz is Disabled"} placement="top">
                        <HStack bg={isActive ? "green.50" : "gray.50"} _dark={{ bg: isActive ? "rgba(72, 187, 120, 0.1)" : "gray.700" }} px={4} py={2} rounded="xl" border="1px solid" borderColor={isActive ? "green.200" : borderColor}>
                          <Switch colorScheme="green" isChecked={isActive} onChange={(e) => triggerToggleStatus(quiz, e.target.checked)} />
                          <Text fontSize="xs" fontWeight="800" color={isActive ? "green.600" : subColor} letterSpacing="0.1em">
                            {isActive ? "LIVE" : "OFF"}
                          </Text>
                        </HStack>
                      </Tooltip>

                      <Divider orientation="vertical" h="30px" />

                      <HStack spacing={3}>
                        <Button
                          leftIcon={<FaEdit />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          rounded="xl"
                          px={4}
                          onClick={() => router.push(`/dashboard/quiz/${quiz._id}`)}
                          _hover={{ bg: "blue.50" }}
                        >
                          Edit
                        </Button>
                        <IconButton
                          aria-label="Delete"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          rounded="xl"
                          _hover={{ bg: "red.50" }}
                          onClick={() => triggerDelete(quiz._id)}
                        />
                      </HStack>

                    </HStack>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={deleteCancelRef} onClose={onDeleteClose} isCentered>
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent bg={cardBg} rounded="2xl" borderWidth="1px" borderColor={borderColor}>
            <AlertDialogHeader fontSize="xl" fontWeight="900" color={headingColor} letterSpacing="tight">
              DELETE QUIZ
            </AlertDialogHeader>
            <AlertDialogBody color={subColor} fontWeight="500">
              Are you sure? You can't undo this action afterwards. This will permanently delete the quiz and all of its associated questions.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteCancelRef} onClick={onDeleteClose} variant="ghost" rounded="xl" fontWeight="800">
                CANCEL
              </Button>
              <Button colorScheme="red" onClick={handleDeleteQuiz} ml={3} rounded="xl" fontWeight="800" shadow="0 4px 14px rgba(229,62,62,0.4)">
                DELETE PERMANENTLY
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Status Toggle Confirmation Modal */}
      <AlertDialog isOpen={isStatusOpen} leastDestructiveRef={statusCancelRef} onClose={onStatusClose} isCentered>
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent bg={cardBg} rounded="2xl" borderWidth="1px" borderColor={borderColor}>
            <AlertDialogHeader fontSize="xl" fontWeight="900" color={headingColor} letterSpacing="tight">
              {targetStatus ? "ACTIVATE QUIZ" : "DEACTIVATE QUIZ"}
            </AlertDialogHeader>
            <AlertDialogBody color={subColor} fontWeight="500">
              {targetStatus 
                ? "Are you sure you want to activate this quiz? It will become live for students to take." 
                : "Are you sure you want to deactivate this quiz? Students will no longer be able to take it."}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={statusCancelRef} onClick={onStatusClose} variant="ghost" rounded="xl" fontWeight="800">
                CANCEL
              </Button>
              <Button 
                colorScheme={targetStatus ? "green" : "orange"} 
                onClick={handleConfirmToggleActive} 
                ml={3} 
                rounded="xl" 
                fontWeight="800"
                shadow={targetStatus ? "0 4px 14px rgba(56,161,105,0.4)" : "0 4px 14px rgba(221,107,32,0.4)"}
              >
                YES, {targetStatus ? "ACTIVATE" : "DEACTIVATE"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
