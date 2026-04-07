"use client";

import { CourseLaunchSection, buildLaunchSection, getFirstPlayableLaunchSection } from "@/app/dashboard/course/scorm/sectionTracking";
import ScormQuizReviewContent from "@/app/dashboard/course/scorm/ScormQuizReviewContent";
import {
  estimateCompletedSections,
  ScormAnswerSectionRecord,
  summarizeAnswerSections,
} from "@/app/dashboard/course/scorm/quizReviewTypes";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  FileBox,
  GraduationCap,
  Layers,
  MapPin,
  PlayCircle,
  Rocket,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);

interface CourseDetailsProps {
  course: any;
  onBack: () => void;
  onLaunchSection: (launchSection: CourseLaunchSection) => void;
  onAssignCourse?: (course: any) => void;
  learnerAnswers?: ScormAnswerSectionRecord[];
  isLearnerAnswersLoading?: boolean;
}

export default function CourseDetails({
  course,
  onBack,
  onLaunchSection,
  onAssignCourse,
  learnerAnswers = [],
  isLearnerAnswersLoading = false,
}: CourseDetailsProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const firstPlayableLaunchSection = getFirstPlayableLaunchSection(course);
  const answerSummary = summarizeAnswerSections(learnerAnswers);
  const totalSections = Number(course.curriculum?.totalSections || 0);
  const sectionsCompleted = estimateCompletedSections(course.progress, totalSections);

  // Colors (Chakra + Tailwind friendly)
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = "blue.500";
  const accentLight = useColorModeValue("blue.50", "blue.900");
  const textMuted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Sticky Header */}
      <Box
        position="sticky"
        top={-4}
        zIndex="sticky"
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        backdropFilter="blur(12px)"
        bg={useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)")}
        px={{ base: 4, md: 6 }}
        py={3}
      >
        <Container maxW="container.xl">
          <Flex align="center" gap={4}>
            <MotionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              variant="ghost"
              rounded="full"
              p={0}
              minW="auto"
              aria-label="Go back"
            >
              <Icon as={ChevronLeft} boxSize={5} />
            </MotionButton>
            <Box>
              <Heading as="h1" size="lg" fontWeight="bold">
                {course.title}
              </Heading>
              <Flex gap={2} mt={1}>
                <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                  {course.taxonomy?.level || "Beginner"}
                </Badge>
                {course.taxonomy?.categories?.slice(0, 2).map((cat: string, idx: number) => (
                  <Badge key={idx} colorScheme="gray" variant="subtle" borderRadius="full" px={3} py={1}>
                    {cat}
                  </Badge>
                ))}
              </Flex>
            </Box>
            {onAssignCourse ? (
              <Button
                ml="auto"
                colorScheme="blue"
                variant="outline"
                borderRadius="full"
                onClick={() => onAssignCourse(course)}
              >
                Assign Course
              </Button>
            ) : null}
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* Main content */}
          <Stack spacing={8}>
            {/* Overview Card */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card bg={cardBg} shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0}>
                  <Flex align="center" gap={2}>
                    <Icon as={GraduationCap} boxSize={6} color={accentColor} />
                    <Heading size="md">About this course</Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Box
                    dangerouslySetInnerHTML={{
                      __html:
                        course.description?.html ||
                        course.description?.text ||
                        "No description provided.",
                    }}
                    className="prose prose-sm max-w-none"
                    color={useColorModeValue("gray.600", "gray.300")}
                  />
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={6}>
                    <Flex align="center" gap={3} p={3} bg={accentLight} borderRadius="xl">
                      <Icon as={Clock} boxSize={5} color={accentColor} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={textMuted}>
                          Duration
                        </Text>
                        <Text fontWeight="bold">
                          {course.progression?.completionWindowDays || "Self-paced"} days
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap={3} p={3} bg={accentLight} borderRadius="xl">
                      <Icon as={Award} boxSize={5} color={accentColor} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={textMuted}>
                          Certification
                        </Text>
                        <Text fontWeight="bold">
                          {course.progression?.certificateEnabled
                            ? "Certificate included"
                            : "No certificate"}
                        </Text>
                      </Box>
                    </Flex>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </MotionBox>

            {/* Curriculum Card - Enhanced Timeline Design */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card bg={cardBg} shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0}>
                  <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
                    <Flex align="center" gap={2}>
                      <Icon as={Layers} boxSize={6} color={accentColor} />
                      <Heading size="md">Course Curriculum</Heading>
                    </Flex>
                    <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                      {course.curriculum?.totalModules} modules • {course.curriculum?.totalSections} lessons
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Accordion allowMultiple defaultIndex={[0]}>
                    {course.curriculum?.modules?.map((mod: any) => (
                      <AccordionItem
                        key={mod.order}
                        border="none"
                        mb={4}
                        bg={useColorModeValue("white", "gray.800")}
                        borderRadius="2xl"
                        borderWidth="1px"
                        borderColor={borderColor}
                        overflow="hidden"
                        shadow="sm"
                      >
                        {({ isExpanded }) => (
                          <>
                            <AccordionButton
                              px={5}
                              py={4}
                              _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                            >
                              <Flex align="center" gap={4} w="full">
                                <Box
                                  w={10}
                                  h={10}
                                  borderRadius="xl"
                                  bg={isExpanded ? accentColor : useColorModeValue("gray.100", "gray.700")}
                                  color={isExpanded ? "white" : textMuted}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontWeight="bold"
                                  transition="all 0.2s"
                                >
                                  {mod.order}
                                </Box>
                                <Box flex="1" textAlign="left">
                                  <Text fontWeight="bold" fontSize="lg">{mod.title}</Text>
                                  <Text fontSize="sm" color={textMuted}>
                                    {mod.sections?.length} {mod.sections?.length === 1 ? "lesson" : "lessons"}
                                  </Text>
                                </Box>
                                <AccordionIcon boxSize={6} color={textMuted} />
                              </Flex>
                            </AccordionButton>
                            
                            <AccordionPanel pb={6} pt={2} px={6}>
                              {mod.summary && (
                                <Text fontSize="sm" color={textMuted} mb={6} pl={14}>
                                  {mod.summary}
                                </Text>
                              )}
                              
                              {/* Timeline Container */}
                              <Box position="relative" pl={4}>
                                {/* Vertical Timeline Line */}
                                <Box
                                  position="absolute"
                                  left="31px"
                                  top="20px"
                                  bottom="30px"
                                  width="2px"
                                  bg={useColorModeValue("gray.100", "gray.700")}
                                  zIndex={0}
                                />

                                {mod.sections?.map((sec: any, idx: number) => {
                                  const secId = mod.order * 100 + idx;
                                  const isPlayable = Boolean(sec.content?.previewUrl);
                                  const isLast = idx === mod.sections.length - 1;

                                  return (
                                    <MotionFlex
                                      key={sec.order}
                                      position="relative"
                                      zIndex={1}
                                      align="flex-start"
                                      gap={4}
                                      mb={isLast ? 0 : 6}
                                      onMouseEnter={() => setHoveredSection(secId)}
                                      onMouseLeave={() => setHoveredSection(null)}
                                      cursor={isPlayable ? "pointer" : "default"}
                                      onClick={() => {
                                        const launchSection = buildLaunchSection(mod, sec);
                                        if (launchSection) {
                                          onLaunchSection(launchSection);
                                        }
                                      }}
                                    >
                                      {/* Timeline Dot */}
                                      <Box
                                        w={10}
                                        h={10}
                                        borderRadius="full"
                                        bg={isPlayable ? useColorModeValue("white", "gray.800") : "transparent"}
                                        border="4px solid"
                                        borderColor={isPlayable ? accentLight : useColorModeValue("gray.50", "gray.700")}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mt={1}
                                        boxShadow={hoveredSection === secId ? "0 0 0 4px var(--chakra-colors-blue-100)" : "none"}
                                        transition="all 0.2s"
                                        zIndex={2}
                                      >
                                        <Icon
                                          as={isPlayable ? PlayCircle : BookOpen}
                                          boxSize={5}
                                          color={isPlayable ? accentColor : textMuted}
                                          fill={isPlayable && hoveredSection === secId ? accentColor : "none"}
                                          stroke={isPlayable && hoveredSection === secId ? "white" : "currentColor"}
                                        />
                                      </Box>

                                      {/* Section Content Card */}
                                      <Box
                                        flex="1"
                                        p={4}
                                        bg={useColorModeValue("white", "gray.800")}
                                        borderWidth="1px"
                                        borderColor={hoveredSection === secId ? accentColor : borderColor}
                                        borderRadius="xl"
                                        shadow={hoveredSection === secId ? "md" : "sm"}
                                        transition="all 0.2s"
                                        transform={hoveredSection === secId ? "translateX(4px)" : "translateX(0)"}
                                      >
                                        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={2}>
                                          <Box flex="1">
                                            <Heading size="sm" mb={1}>{sec.title}</Heading>
                                            {sec.description && (
                                              <Text fontSize="sm" color={textMuted} noOfLines={2}>
                                                {sec.description}
                                              </Text>
                                            )}
                                          </Box>
                                          
                                          {sec.content && (
                                            <Tag size="sm" variant="subtle" colorScheme="gray" borderRadius="md" mt={1}>
                                              <Icon as={FileBox} boxSize={3} mr={1} />
                                              {sec.content.kind?.toUpperCase()}
                                            </Tag>
                                          )}
                                        </Flex>
                                      </Box>
                                    </MotionFlex>
                                  );
                                })}
                              </Box>
                            </AccordionPanel>
                          </>
                        )}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardBody>
              </Card>
            </MotionBox>

            {/* Quiz Review Card */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18 }}
            >
              <Card bg={cardBg} shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0}>
                  <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                    <Flex align="center" gap={2}>
                      <Icon as={Award} boxSize={6} color={accentColor} />
                      <Heading size="md">Quiz Review</Heading>
                    </Flex>
                    <HStack spacing={2}>
                      <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                        Score {answerSummary.correctCount}/{answerSummary.totalQuestions}
                      </Badge>
                      {answerSummary.pending > 0 ? (
                        <Badge colorScheme="orange" borderRadius="full" px={3} py={1}>
                          {answerSummary.pending} pending review
                        </Badge>
                      ) : null}
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <ScormQuizReviewContent
                    sections={learnerAnswers}
                    isLoading={isLearnerAnswersLoading}
                    progressSummary={{
                      progressPercent: Number(course.progress || 0),
                      sectionsCompleted,
                      totalSections,
                    }}
                    emptyState="Your answers will appear here as soon as the SCORM lesson saves quiz progress."
                  />
                </CardBody>
              </Card>
            </MotionBox>

            {/* Batch Management Card */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card bg={cardBg} shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
                <CardHeader pb={0}>
                  <Flex align="center" gap={2}>
                    <Icon as={Users} boxSize={6} color={accentColor} />
                    <Heading size="md">Batch Delivery</Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Stack spacing={4}>
                    <Text color={textMuted}>
                      Courses are now delivered through the dedicated batch module. Create and manage batches from the
                      Batches workspace, then learners will see course access marked with the batch they came from.
                    </Text>
                    <Box
                      p={4}
                      borderWidth="1px"
                      borderRadius="xl"
                      borderColor={borderColor}
                      bg={useColorModeValue("gray.50", "gray.800")}
                    >
                      <HStack spacing={3} align="start">
                        <Icon as={Calendar} boxSize={5} color={accentColor} mt={0.5} />
                        <Box>
                          <Text fontWeight="semibold">Standalone batch management</Text>
                          <Text mt={1} fontSize="sm" color={textMuted}>
                            Use the new batch screens to group users, attach multiple courses, define dates, and track
                            learner progress without mixing batch logic into course setup.
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  </Stack>
                </CardBody>
              </Card>
            </MotionBox>
          </Stack>

          {/* Sidebar */}
          <Box>
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              position="sticky"
              top="6rem"
            >
              <Card bg={cardBg} shadow="lg" borderRadius="2xl" borderWidth="1px" borderColor={borderColor} overflow="hidden">
                <Box position="relative">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    h="240px"
                    w="full"
                    objectFit="cover"
                  />
                  {course.commerce?.pricingModel === "free" && (
                    <Badge position="absolute" top={4} right={4} colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                      Free Course
                    </Badge>
                  )}
                </Box>
                <CardBody>
                  <VStack spacing={5} align="stretch">
                    <Box textAlign="center" pt={2}>
                      <Text fontSize="xs" fontWeight="bold" color={textMuted} textTransform="uppercase" letterSpacing="wide">
                        Enrollment Price
                      </Text>
                      <Text fontSize="4xl" fontWeight="extrabold" color={accentColor}>
                        {course.commerce?.pricingModel === "paid"
                          ? `₹${course.commerce.amountInRupees}`
                          : "Free"}
                      </Text>
                    </Box>

                    <MotionButton
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (firstPlayableLaunchSection) {
                          onLaunchSection(firstPlayableLaunchSection);
                          return;
                        }

                        if (course.scormFilePath) {
                          onLaunchSection({
                            scormPath: course.scormFilePath,
                            moduleId: "",
                            moduleTitle: "",
                            sectionId: "",
                            sectionTitle: course.title || "Course",
                          });
                        }
                      }}
                      isDisabled={!firstPlayableLaunchSection && !course.scormFilePath}
                      colorScheme="blue"
                      size="lg"
                      borderRadius="xl"
                      w="full"
                      leftIcon={<Icon as={Rocket} />}
                      shadow="md"
                    >
                      Start Learning
                    </MotionButton>

                    <Divider />

                    <VStack spacing={3} align="start" px={2}>
                      <HStack>
                        <Icon as={CheckCircle} boxSize={5} color="green.500" />
                        <Text fontSize="sm" fontWeight="medium">Full lifetime access</Text>
                      </HStack>
                      <HStack>
                        <Icon as={Layers} boxSize={5} color="blue.500" />
                        <Text fontSize="sm" fontWeight="medium">{course.curriculum?.totalSections} Interactive modules</Text>
                      </HStack>
                      {course.progression?.certificateEnabled && (
                        <HStack>
                          <Icon as={Award} boxSize={5} color="purple.500" />
                          <Text fontSize="sm" fontWeight="medium">Certificate of completion</Text>
                        </HStack>
                      )}
                      <HStack>
                        <Icon as={Star} boxSize={5} color="yellow.500" />
                        <Text fontSize="sm" fontWeight="medium">Community support</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
