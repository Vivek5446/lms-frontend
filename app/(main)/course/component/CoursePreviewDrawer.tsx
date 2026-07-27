"use client";

import {
  Badge,
  Box,
  Button,
  Circle,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  SimpleGrid,
  Text,
  useBreakpointValue,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { FiArrowLeft, FiArrowRight, FiCheck, FiClock, FiLayers } from "react-icons/fi";

interface CoursePreviewDrawerProps {
  course: any | null;
  onClose: () => void;
}

export const CoursePreviewDrawer: React.FC<CoursePreviewDrawerProps> = ({
  course,
  onClose,
}) => {
  const router = useRouter();

  const drawerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const softText = useColorModeValue("gray.500", "gray.400");

  const previewDrawerPlacement = useBreakpointValue({ base: "bottom" as const, md: "right" as const }) || "bottom";
  const previewDrawerSize = useBreakpointValue({ base: "full" as const, md: "md" as const }) || "md";

  return (
    <Drawer
      isOpen={Boolean(course)}
      placement={previewDrawerPlacement}
      size={previewDrawerSize}
      onClose={onClose}
    >
      <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <DrawerContent
        h={{ base: "100vh", md: "100%" }}
        bg={drawerBg}
        borderTopRadius="none"
        borderLeftRadius="none"
        maxW={{ base: "full", md: "460px" }}
      >
        <DrawerBody
          p={0}
          overflowY="auto"
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#ccc", borderRadius: "4px" },
          }}
        >
          <Box
            w="100%"
            maxW={{ base: "100%", md: "600px", lg: "680px" }}
            mx="auto"
            px={{ base: 5, md: 8 }}
            pt={{ base: 4, md: 5 }}
            pb="190px"
          >
            {/* Header with Arrow Back */}
            <HStack mb={{ base: 4, md: 5 }} spacing={3} align="center">
              <IconButton
                aria-label="Back"
                icon={<FiArrowLeft size={16} />}
                onClick={onClose}
                variant="solid"
                borderRadius="full"
                w="36px"
                h="36px"
                bg={useColorModeValue("brand.50", "whiteAlpha.100")}
                color="brand.600"
                _hover={{ bg: useColorModeValue("brand.100", "whiteAlpha.200"), transform: "scale(1.05)" }}
                _active={{ transform: "scale(0.95)" }}
                border="none"
                transition="all 0.2s"
              />
              <Box>
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                  <Box as="span" color={useColorModeValue("gray.800", "white")}>COURSE </Box>
                  <Box as="span" bgGradient={useColorModeValue("linear(to-r, brand.500, brand.700)", "linear(to-r, brand.300, brand.500)")} bgClip="text">
                    PREVIEW
                  </Box>
                </Text>
                <Text fontSize="9px" color={softText} fontWeight="700" letterSpacing="0.2em" mt={0.5} textTransform="uppercase">
                  EXPLORE SYLLABUS & DETAILS
                </Text>
              </Box>
            </HStack>

            <VStack align="stretch" spacing={5}>
              {course?.thumbnailUrl && (
                <Box position="relative" borderRadius="2xl" overflow="hidden" boxShadow="md">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    w="full"
                    h="220px"
                    objectFit="cover"
                  />
                  <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.500, transparent 40%)" />
                  <Badge
                    position="absolute"
                    top="12px"
                    left="12px"
                    colorScheme="brand"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="10px"
                    fontWeight="800"
                  >
                    {course?.taxonomy?.categories?.[0] || "General"}
                  </Badge>
                </Box>
              )}

              <Box>
                <Heading fontSize="xl" fontWeight="900" color={useColorModeValue("gray.800", "white")} mb={1}>
                  {course?.title}
                </Heading>
                
                <HStack spacing={2} mb={4} align="center">
                  <Badge colorScheme="green" borderRadius="full" px={2.5} py={0.5} fontSize="9px" fontWeight="800">
                    Public Catalog
                  </Badge>
                  <Text fontSize="xs" color={softText} fontWeight="700">
                    • {course?.taxonomy?.level || "All Levels"}
                  </Text>
                </HStack>

                <VStack align="stretch" spacing={2} mb={4}>
                  <HStack spacing={2} align="center">
                    <Box w="3px" h="12px" bg="brand.500" borderRadius="full" />
                    <Text fontSize="10px" fontWeight="900" color="brand.600" textTransform="uppercase" letterSpacing="0.08em">
                      Overview
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={mutedText} lineHeight="1.65" textAlign="justify">
                    {course?.description?.text || "No description available yet."}
                  </Text>
                </VStack>
              </Box>

              <SimpleGrid columns={2} spacing={3.5}>
                <HStack p={4} bg={useColorModeValue("white", "whiteAlpha.50")} borderRadius="2xl" border="1px solid" borderColor={useColorModeValue("gray.150", "whiteAlpha.200")} boxShadow="sm" spacing={3.5}>
                  <Box w="38px" h="38px" display="grid" placeItems="center" borderRadius="full" bg={useColorModeValue("brand.50", "whiteAlpha.100")} color="brand.600" flexShrink={0}>
                    <Icon as={FiClock} boxSize="18px" />
                  </Box>
                  <Box minW={0} flex="1">
                    <Text fontSize="9px" fontWeight="800" color={softText} textTransform="uppercase" letterSpacing="0.05em">Duration</Text>
                    <Text fontSize="sm" fontWeight="900" color={useColorModeValue("gray.800", "white")}>{course?.duration || "8h"}</Text>
                  </Box>
                </HStack>

                <HStack p={4} bg={useColorModeValue("white", "whiteAlpha.50")} borderRadius="2xl" border="1px solid" borderColor={useColorModeValue("gray.150", "whiteAlpha.200")} boxShadow="sm" spacing={3.5}>
                  <Box w="38px" h="38px" display="grid" placeItems="center" borderRadius="full" bg={useColorModeValue("brand.50", "whiteAlpha.100")} color="brand.600" flexShrink={0}>
                    <Icon as={FiLayers} boxSize="18px" />
                  </Box>
                  <Box minW={0} flex="1">
                    <Text fontSize="9px" fontWeight="800" color={softText} textTransform="uppercase" letterSpacing="0.05em">Level</Text>
                    <Text fontSize="sm" fontWeight="900" color={useColorModeValue("gray.800", "white")} textTransform="capitalize">
                      {course?.taxonomy?.level || "Beginner"}
                    </Text>
                  </Box>
                </HStack>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Sticky CTA matching Create Community footer */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg={useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(23, 25, 35, 0.95)")}
            backdropFilter="blur(20px)"
            borderTop="1px solid"
            borderColor={borderColor}
            boxShadow="0 -8px 30px rgba(0, 0, 0, 0.05)"
            px={{ base: 5, md: 8 }}
            pb={{ base: 5, md: 6 }}
            pt={4}
            zIndex={10}
          >
            <Box maxW={{ base: "100%", md: "600px", lg: "680px" }} mx="auto">
              <HStack justify="space-between" align="center" spacing={5}>
                <VStack align="stretch" spacing={0.5} flexShrink={0}>
                  <Text fontSize="9px" fontWeight="800" color={softText} textTransform="uppercase" letterSpacing="0.08em">
                    Total investment
                  </Text>
                  <HStack spacing={1.5} align="center">
                    <Circle size="6px" bg={course?.commerce?.amountInRupees ? "brand.500" : "green.500"} />
                    <Text fontSize="xl" fontWeight="900" color={useColorModeValue("gray.800", "white")} lineHeight="1">
                      {course?.commerce?.amountInRupees
                        ? new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                          }).format(course.commerce.amountInRupees)
                        : "Free Access"}
                    </Text>
                  </HStack>
                </VStack>
                <Button
                  flex="1"
                  h="52px"
                  borderRadius="xl"
                  colorScheme="brand"
                  bgGradient="linear(to-r, brand.500, brand.600)"
                  _hover={{
                    bgGradient: "linear(to-r, brand.600, brand.700)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(98,105,255,0.3)"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  fontSize="sm"
                  fontWeight="900"
                  letterSpacing="0.05em"
                  rightIcon={<FiArrowRight />}
                  onClick={() => {
                    const courseId = course?._id;
                    onClose();
                    router.push(`/course?courseId=${courseId}`);
                  }}
                  transition="all 0.2s"
                >
                  GO TO COURSE
                </Button>
              </HStack>
              <HStack justify="center" mt={3} spacing={1} color={softText} fontSize="10px" fontWeight="700">
                <Icon as={FiCheck} color="green.500" />
                <Text>Lifetime access & immediate enrollment updates</Text>
              </HStack>
            </Box>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
