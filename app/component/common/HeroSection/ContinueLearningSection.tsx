"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Progress,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiPlay,
  FiPlayCircle,
} from "react-icons/fi";

export interface ContinueLearningCourse {
  courseId: string;
  title: string;
  progress?: number;
  image?: string;
  thumbnail?: string;
  category?: string;
  duration?: string;
}

interface ContinueLearningSectionProps {
  courses: ContinueLearningCourse[];
  onContinue: (course: ContinueLearningCourse) => void;
  onViewAll?: () => void;
}

const ContinueLearningSection: React.FC<
  ContinueLearningSectionProps
> = ({ courses, onContinue, onViewAll }) => {
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const primaryText = useColorModeValue("gray.900", "white");
  const secondaryText = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const progressBg = useColorModeValue("gray.100", "whiteAlpha.200");

  if (!courses.length) {
    return null;
  }

  return (
    <Box
      as="section"
      bg={sectionBg}
      borderBottomWidth="1px"
      borderColor={borderColor}
      py={{ base: 5, md: 7 }}
    >
      <Box
        maxW="1480px"
        mx="auto"
        px={{ base: 4, sm: 6, md: 8, lg: 12 }}
      >
        {/* Section header */}
        <Flex
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
          gap={3}
          mb={{ base: 4, md: 5 }}
        >
          <Box>
            <HStack spacing={2}>
              <Box
                w="27px"
                h="27px"
                display="grid"
                placeItems="center"
                borderRadius="lg"
                bg="brand.500"
                color="white"
              >
                <Icon as={FiPlayCircle} fontSize="xs" />
              </Box>

              <Heading
                color={primaryText}
                fontSize={{ base: "md", md: "lg" }}
                letterSpacing="-0.015em"
              >
                Continue learning
              </Heading>
            </HStack>

            <Text
              mt={1}
              ml={{ base: 0, sm: 9 }}
              color={secondaryText}
              fontSize="xs"
            >
              Pick up where you left off.
            </Text>
          </Box>

          {onViewAll ? (
            <Button
              variant="ghost"
              colorScheme="brand"
              size="xs"
              rightIcon={<FiArrowRight />}
              borderRadius="full"
              onClick={onViewAll}
            >
              View all
            </Button>
          ) : null}
        </Flex>

        {/* Three cards per desktop row */}
        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            xl: 3,
          }}
          spacing={{ base: 3, md: 4 }}
        >
          {courses.slice(0, 3).map((course, index) => {
            const progress = Math.min(
              100,
              Math.max(0, Math.round(Number(course.progress || 0))),
            );

            const courseImage = course.image || course.thumbnail;
            const hasStarted = progress > 0;

            return (
              <Flex
                key={course.courseId}
                role="group"
                overflow="hidden"
                minH={{ base: "105px", md: "112px" }}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                boxShadow="0 5px 18px rgba(15, 23, 42, 0.05)"
                transition="all 0.22s ease"
                cursor="pointer"
                onClick={() => onContinue(course)}
                _hover={{
                  transform: "translateY(-2px)",
                  borderColor: "brand.200",
                  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.1)",
                }}
              >
                {/* Course image */}
                <Box
                  position="relative"
                  flexShrink={0}
                  w={{ base: "92px", md: "105px" }}
                  minH="100%"
                  overflow="hidden"
                  bgGradient={
                    index % 2 === 0
                      ? "linear(to-br, brand.400, brand.600)"
                      : "linear(to-br, brand.300, brand.500)"
                  }
                >
                  {courseImage ? (
                    <>
                      <Image
                        src={courseImage}
                        alt={course.title}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        transition="transform 0.35s ease"
                        _groupHover={{
                          transform: "scale(1.06)",
                        }}
                      />
                      <Box
                        position="absolute"
                        inset={0}
                        bgGradient="linear(to-t, blackAlpha.500, transparent)"
                      />
                    </>
                  ) : (
                    <Box
                      position="absolute"
                      inset={0}
                      display="grid"
                      placeItems="center"
                    >
                      <Box
                        w="38px"
                        h="38px"
                        display="grid"
                        placeItems="center"
                        borderRadius="xl"
                        bg="whiteAlpha.250"
                        color="white"
                        backdropFilter="blur(8px)"
                      >
                        <Icon as={FiBookOpen} fontSize="md" />
                      </Box>
                    </Box>
                  )}
                  <Box
                    position="absolute"
                    left={2}
                    bottom={2}
                    display="grid"
                    placeItems="center"
                    w="25px"
                    h="25px"
                    borderRadius="full"
                    bg="white"
                    color="brand.600"
                    boxShadow="sm"
                  >
                    <Icon as={FiPlay} ml="1px" fontSize="10px" />
                  </Box>
                </Box>
                {/* Course details */}
                <Flex
                  flex={1}
                  minW={0}
                  p={{ base: 3, md: 3.5 }}
                  gap={2}
                  direction="column"
                  justify="space-between"
                >
                  <Box minW={0}>
                    {course.category ? (
                      <Text
                        mb={0.5}
                        color="brand.600"
                        fontSize="9px"
                        fontWeight="800"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                        noOfLines={1}
                      >
                        {course.category}
                      </Text>
                    ) : null}

                    <Text
                      color={primaryText}
                      fontSize={{ base: "xs", md: "sm" }}
                      fontWeight="800"
                      lineHeight="1.35"
                      noOfLines={2}
                    >
                      {course.title}
                    </Text>

                    <HStack
                      mt={1.5}
                      spacing={2}
                      color={secondaryText}
                    >
                      <HStack spacing={1}>
                        <Icon as={FiClock} fontSize="9px" />

                        <Text fontSize="9px" noOfLines={1}>
                          {course.duration || "Self-paced"}
                        </Text>
                      </HStack>

                      <Text fontSize="9px" fontWeight="700">
                        {progress}%
                      </Text>
                    </HStack>
                  </Box>

                  <HStack spacing={2}>
                    <Progress
                      value={progress}
                      flex={1}
                      h="5px"
                      borderRadius="full"
                      bg={progressBg}
                      colorScheme="brand"
                      sx={{
                        "& > div": {
                          borderRadius: "999px",
                        },
                      }}
                    />
                    <Button
                      size="xs"
                      minW="auto"
                      h="27px"
                      px={2.5}
                      colorScheme="brand"
                      borderRadius="full"
                      leftIcon={<FiPlayCircle size={10} />}
                      fontSize="10px"
                      onClick={(event) => {
                        event.stopPropagation();
                        onContinue(course);
                      }}
                    >
                      {hasStarted ? "Continue" : "Start"}
                    </Button>
                  </HStack>
                </Flex>
              </Flex>
            );
          })}
        </SimpleGrid>
      </Box>
    </Box>
  );
};
export default ContinueLearningSection;