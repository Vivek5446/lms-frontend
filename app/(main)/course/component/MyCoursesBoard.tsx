"use client";

import CourseDetails from "@/app/dashboard/course/CourseDetails";
import CoursePlayer from "@/app/dashboard/course/scorm/CoursePlayer";
import { courseStore } from "@/app/store/courseStore/courseStore";
import stores from "@/app/store/stores";
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiClock, FiLayers, FiPlayCircle, FiSearch } from "react-icons/fi";

function formatDate(value?: string | null) {
  if (!value) {
    return "No expiry";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No expiry";
  }

  return date.toLocaleDateString();
}

function getStatusColor(status: string) {
  if (status === "expired") {
    return "red";
  }

  if (status === "expiring_soon") {
    return "orange";
  }

  return "green";
}

function buildScormCourseUrl(scormPath: string) {
  const normalizedPath = scormPath.startsWith("/") ? scormPath : `/${scormPath}`;
  return `/courses${normalizedPath}`;
}

function truncateText(value?: string, limit = 120) {
  const text = String(value || "").trim();
  if (!text) {
    return "No description available yet.";
  }

  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
}

type MyCoursesBoardProps = {
  basePath?: string;
};

const MotionBox = motion(Box);

const MyCoursesBoard = observer(({ basePath = "/dashboard/course/my-courses" }: MyCoursesBoardProps) => {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCourseId = searchParams.get("courseId") || "";
  const [playerPath, setPlayerPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "in_progress" | "completed">("all");

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const subduedText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const metricBg = useColorModeValue("gray.50", "whiteAlpha.100");

  useEffect(() => {
    courseStore.fetchMyCourses().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!requestedCourseId) {
      courseStore.clearCurrentCourse();
      return;
    }

    courseStore.fetchMyCourseDetail(requestedCourseId).catch((error) => {
      toast({
        title: "Unable to open course",
        description: error?.message || error?.error || "Please try again.",
        status: "error",
        duration: 4000,
      });
      router.replace(basePath);
    });
  }, [basePath, requestedCourseId, router, toast]);

  const courses = courseStore.myCourses || [];
  const activeCourse = useMemo(() => {
    if (!requestedCourseId || !courseStore.currentCourse) {
      return null;
    }

    return courseStore.currentCourse;
  }, [requestedCourseId, courseStore.currentCourse]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !query ||
        [
          course.title,
          course.description?.text,
          ...course.sources.map((source) => source.label),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (statusFilter === "active") {
        return !course.isExpired;
      }

      if (statusFilter === "in_progress") {
        return course.status === "in_progress";
      }

      if (statusFilter === "completed") {
        return course.status === "completed";
      }

      return true;
    });
  }, [courses, searchQuery, statusFilter]);

  const summary = useMemo(() => {
    const completed = courses.filter((course) => course.status === "completed").length;
    const inProgress = courses.filter((course) => course.status === "in_progress").length;
    const active = courses.filter((course) => !course.isExpired).length;

    return {
      total: courses.length,
      completed,
      inProgress,
      active,
    };
  }, [courses]);

  const handleOpenCourse = (courseId: string) => {
    router.push(`${basePath}?courseId=${courseId}`);
  };

  if (requestedCourseId) {
    if (courseStore.isMyCourseDetailLoading || !activeCourse) {
      return (
        <HStack justify="center" py={20}>
          <Spinner />
          <Text color={subduedText}>Loading course details...</Text>
        </HStack>
      );
    }

    return (
      <>
        <CourseDetails
          course={activeCourse}
          onBack={() => router.push(basePath)}
          onLaunchSection={(path: string) => setPlayerPath(path)}
        />

        <AnimatePresence>
          {playerPath ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: "fixed", inset: 0, zIndex: 1400 }}
            >
              <CoursePlayer
                courseTitle={activeCourse.title}
                courseUrl={buildScormCourseUrl(playerPath)}
                courseId={activeCourse._id || activeCourse.courseId}
                userId={stores.auth.user?._id}
                learnerName={stores.auth.user?.name || stores.auth.user?.username || stores.auth.user?.email}
                onBack={() => setPlayerPath(null)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg}>
      <Stack spacing={6}>
        <Box
          borderRadius="3xl"
          px={{ base: 5, md: 8 }}
          py={{ base: 6, md: 8 }}
          bg="linear-gradient(135deg, #0f172a 0%, #1d4ed8 52%, #dbeafe 100%)"
          color="white"
          overflow="hidden"
          position="relative"
        >
          <Box position="absolute" right="-20px" top="-30px" w="220px" h="220px" borderRadius="full" bg="whiteAlpha.200" />
          <Stack spacing={6} position="relative">
            <Box maxW="3xl">
              <Badge bg="whiteAlpha.300" color="white" borderRadius="full" px={3} py={1}>
                My Learning
              </Badge>
              <Heading mt={4} size="lg">
                Your assigned courses, ready to continue from one place
              </Heading>
              <Text mt={3} color="whiteAlpha.900" maxW="2xl">
                Direct assignments and batch-delivered courses both show up here, with faster access to thumbnails,
                progress, due dates, and the learning material itself.
              </Text>
            </Box>

            <Grid templateColumns={{ base: "1fr", lg: "1.6fr 0.9fr" }} gap={4}>
              <Box bg="whiteAlpha.220" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="2xl" p={4}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="whiteAlpha.800" />
                  </InputLeftElement>
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by course title or assignment source"
                    color="white"
                    borderColor="whiteAlpha.400"
                    _placeholder={{ color: "whiteAlpha.700" }}
                    _hover={{ borderColor: "whiteAlpha.600" }}
                    _focus={{ borderColor: "white", boxShadow: "none" }}
                  />
                </InputGroup>
              </Box>

              <SimpleGrid columns={3} spacing={3}>
                <Box bg="whiteAlpha.220" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="2xl" p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em" color="whiteAlpha.800">
                    Total
                  </Text>
                  <Text mt={2} fontSize="2xl" fontWeight="bold">
                    {summary.total}
                  </Text>
                </Box>
                <Box bg="whiteAlpha.220" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="2xl" p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em" color="whiteAlpha.800">
                    Active
                  </Text>
                  <Text mt={2} fontSize="2xl" fontWeight="bold">
                    {summary.active}
                  </Text>
                </Box>
                <Box bg="whiteAlpha.220" borderWidth="1px" borderColor="whiteAlpha.300" borderRadius="2xl" p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em" color="whiteAlpha.800">
                    Completed
                  </Text>
                  <Text mt={2} fontSize="2xl" fontWeight="bold">
                    {summary.completed}
                  </Text>
                </Box>
              </SimpleGrid>
            </Grid>
          </Stack>
        </Box>

        <HStack spacing={3} flexWrap="wrap">
          {[
            { key: "all", label: "All courses" },
            { key: "active", label: "Active" },
            { key: "in_progress", label: "In progress" },
            { key: "completed", label: "Completed" },
          ].map((option) => {
            const isActive = statusFilter === option.key;
            return (
              <Button
                key={option.key}
                size="sm"
                borderRadius="full"
                variant={isActive ? "solid" : "outline"}
                colorScheme={isActive ? "blue" : "gray"}
                onClick={() => setStatusFilter(option.key as typeof statusFilter)}
              >
                {option.label}
              </Button>
            );
          })}
        </HStack>

        {courseStore.isMyCoursesLoading ? (
          <HStack justify="center" py={20}>
            <Spinner />
            <Text color={subduedText}>Loading your courses...</Text>
          </HStack>
        ) : courses.length === 0 ? (
          <Box bg={cardBg} borderRadius="3xl" borderWidth="1px" borderColor={borderColor} p={8}>
            <Text fontWeight="semibold" fontSize="lg">
              No courses assigned yet
            </Text>
            <Text color={subduedText} mt={2}>
              When a course is assigned directly to you or delivered through a batch, it will appear here with its
              thumbnail, status, and launch access.
            </Text>
          </Box>
        ) : filteredCourses.length === 0 ? (
          <Box bg={cardBg} borderRadius="3xl" borderWidth="1px" borderColor={borderColor} p={8}>
            <Text fontWeight="semibold" fontSize="lg">
              No courses match this filter
            </Text>
            <Text color={subduedText} mt={2}>
              Try another search keyword or switch the status filter to see the rest of your learning library.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
            {filteredCourses.map((course, index) => (
              <MotionBox
                key={course.courseId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                bg={cardBg}
                borderRadius="3xl"
                borderWidth="1px"
                borderColor={borderColor}
                overflow="hidden"
                boxShadow="sm"
              >
                <AspectRatio ratio={16 / 9}>
                  {course.thumbnailUrl ? (
                    <Image src={course.thumbnailUrl} alt={course.title} objectFit="cover" />
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      bg="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #eff6ff 100%)"
                      color="blue.700"
                    >
                      <VStack spacing={3}>
                        <Box borderRadius="full" bg="whiteAlpha.800" p={4}>
                          <Icon as={FiBookOpen} boxSize={6} />
                        </Box>
                        <Text fontWeight="semibold">Course Preview</Text>
                      </VStack>
                    </Flex>
                  )}
                </AspectRatio>

                <Stack spacing={4} p={5}>
                  <HStack justify="space-between" align="start">
                    <Box pr={4}>
                      <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
                        {course.title}
                      </Text>
                      <Text mt={2} color={subduedText} fontSize="sm" noOfLines={3}>
                        {truncateText(course.description?.text, 135)}
                      </Text>
                    </Box>
                    <Badge colorScheme={getStatusColor(course.visibilityStatus)} borderRadius="full" px={3} py={1}>
                      {course.isExpired ? "Expired" : course.visibilityStatus === "expiring_soon" ? "Expiring soon" : "Active"}
                    </Badge>
                  </HStack>

                  <HStack spacing={2} flexWrap="wrap">
                    {course.sources.slice(0, 2).map((source, sourceIndex) => (
                      <Badge
                        key={`${source.type}-${source.batchId || sourceIndex}`}
                        colorScheme={source.type === "batch" ? "purple" : "green"}
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        {source.type === "batch" ? source.batchName || "Batch" : "Direct assignment"}
                      </Badge>
                    ))}
                    {course.sources.length > 2 ? (
                      <Badge colorScheme="gray" borderRadius="full" px={3} py={1}>
                        +{course.sources.length - 2} more
                      </Badge>
                    ) : null}
                  </HStack>

                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        Progress
                      </Text>
                      <Text fontSize="sm" color={subduedText}>
                        {course.progress}%
                      </Text>
                    </HStack>
                    <Progress value={course.progress} colorScheme="blue" borderRadius="full" h="10px" />
                  </Box>

                  <SimpleGrid columns={3} spacing={3}>
                    <Box borderRadius="2xl" bg={metricBg} p={3}>
                      <HStack spacing={2} color={subduedText}>
                        <Icon as={FiLayers} />
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                          Modules
                        </Text>
                      </HStack>
                      <Text mt={2} fontWeight="semibold">
                        {course.curriculum?.totalModules || 0}
                      </Text>
                    </Box>
                    <Box borderRadius="2xl" bg={metricBg} p={3}>
                      <HStack spacing={2} color={subduedText}>
                        <Icon as={FiPlayCircle} />
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                          Status
                        </Text>
                      </HStack>
                      <Text mt={2} fontWeight="semibold" textTransform="capitalize">
                        {course.status.replace(/_/g, " ")}
                      </Text>
                    </Box>
                    <Box borderRadius="2xl" bg={metricBg} p={3}>
                      <HStack spacing={2} color={subduedText}>
                        <Icon as={FiClock} />
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                          Valid Till
                        </Text>
                      </HStack>
                      <Text mt={2} fontWeight="semibold" fontSize="sm">
                        {formatDate(course.validTill)}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  <Button
                    colorScheme="blue"
                    borderRadius="xl"
                    rightIcon={<Icon as={FiPlayCircle} />}
                    onClick={() => handleOpenCourse(course.courseId)}
                  >
                    {course.status === "completed" ? "Review course" : "Continue learning"}
                  </Button>
                </Stack>
              </MotionBox>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Box>
  );
});

export default MyCoursesBoard;
