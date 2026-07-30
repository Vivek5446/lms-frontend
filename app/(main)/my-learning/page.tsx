"use client";

import { CourseCard, CourseCardSkeleton } from "@/app/(main)/course/component/CourseCard";
import GlassSearchInput from "@/app/component/common/GlassSearch/GlassSearchInput";
import stores from "@/app/store/stores";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Progress,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiPlay,
  FiPlayCircle,
  FiRefreshCw,
} from "react-icons/fi";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "not_started", label: "Not Started" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["key"];

type LearningCourse = {
  courseId: string;
  title?: string;
  thumbnailUrl?: string;
  status?: string;
  progress?: number;
  description?: { text?: string };
  taxonomy?: {
    categories?: string[];
    languages?: string[];
  };
  sources?: Array<{ type?: string }>;
  commerce?: {
    pricingModel?: string;
    amountInRupees?: number;
  };
  assessmentSummary?: {
    scorePercentage?: number;
  };
  [key: string]: any;
};

function mapStatusLabel(status?: string) {
  const normalized = String(status || "").trim().toLowerCase();
  if (!normalized) {
    return "Assigned";
  }

  return normalized
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPrimaryBadge(course: LearningCourse) {
  const sourceType = String(course?.sources?.[0]?.type || "")
    .trim()
    .toLowerCase();

  if (sourceType === "self") {
    return "Self Enrolled";
  }

  if (sourceType === "batch") {
    return "Batch";
  }

  return "Assigned";
}

function getStatusColorScheme(status?: string) {
  switch (status) {
    case "completed":
      return "green";
    case "in_progress":
      return "blue";
    case "not_started":
      return "gray";
    default:
      return "purple";
  }
}

function getProgressValue(progress?: number) {
  const parsedProgress = Number(progress || 0);
  return Math.min(100, Math.max(0, Number.isFinite(parsedProgress) ? parsedProgress : 0));
}

function buildCourseCardModel(course: LearningCourse) {
  return {
    ...course,
    _id: course.courseId,
    courseType: undefined,
    description: course.description,
    taxonomy: course.taxonomy,
    thumbnailUrl: course.thumbnailUrl,
    title: course.title,
    commerce: {
      pricingModel: course.commerce?.pricingModel || "free",
      amountInRupees: course.commerce?.amountInRupees ?? 0,
    },
    metrics: {
      averageRating: course.assessmentSummary?.scorePercentage
        ? Math.min(5, Math.max(0, Number(course.assessmentSummary.scorePercentage) / 20))
        : null,
      enrolledCount: 0,
    },
  };
}

interface MobileLearningCourseCardProps {
  course: LearningCourse;
  onClick: () => void;
}

const MobileLearningCourseCard = ({ course, onClick }: MobileLearningCourseCardProps) => {
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.800");
  const titleColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const thumbnailBg = useColorModeValue(
    "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
    "linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%)"
  );
  const progressTrackBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const iconButtonBg = useColorModeValue("gray.50", "whiteAlpha.100");

  const progress = getProgressValue(course.progress);
  const category = course.taxonomy?.categories?.[0];
  const sourceLabel = getPrimaryBadge(course);
  const statusLabel = mapStatusLabel(course.status);
  const statusColorScheme = getStatusColorScheme(course.status);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Open ${course.title || "course"}`}
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      transition="border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease"
      _hover={{ borderColor: "blue.300", boxShadow: "sm", transform: "translateY(-1px)" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "blue.400", outlineOffset: "2px" }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <Flex minH="124px">
        <Flex
          position="relative"
          flex="0 0 108px"
          minH="124px"
          align="center"
          justify="center"
          overflow="hidden"
          bg={course.thumbnailUrl ? undefined : thumbnailBg}
        >
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title || "Course thumbnail"}
              position="absolute"
              inset={0}
              w="full"
              h="full"
              objectFit="cover"
            />
          ) : (
            <Flex
              w="42px"
              h="42px"
              align="center"
              justify="center"
              borderRadius="xl"
              bg="whiteAlpha.300"
              backdropFilter="blur(8px)"
            >
              <Icon as={FiBookOpen} boxSize={5} color="white" />
            </Flex>
          )}

          <Badge
            position="absolute"
            left={2}
            bottom={2}
            maxW="92px"
            bg="blackAlpha.600"
            color="white"
            borderRadius="md"
            px={2}
            py={0.5}
            fontSize="9px"
            fontWeight="700"
            textTransform="none"
            noOfLines={1}
          >
            {sourceLabel}
          </Badge>
        </Flex>

        <Flex flex="1" minW={0} direction="column" justify="space-between" p={3} gap={2}>
          <Box minW={0}>
            <HStack justify="space-between" align="start" spacing={2} mb={1.5}>
              <Badge
                colorScheme={statusColorScheme}
                variant="subtle"
                borderRadius="md"
                px={2}
                py={0.5}
                fontSize="9px"
                fontWeight="700"
                textTransform="none"
              >
                {statusLabel}
              </Badge>

              {category ? (
                <Text color={mutedText} fontSize="10px" fontWeight="600" noOfLines={1} maxW="42%">
                  {category}
                </Text>
              ) : null}
            </HStack>

            <Heading
              as="h3"
              color={titleColor}
              fontSize="sm"
              lineHeight="1.35"
              fontWeight="700"
              noOfLines={2}
            >
              {course.title || "Untitled course"}
            </Heading>
          </Box>

          <Box>
            <HStack justify="space-between" spacing={3} mb={1.5}>
              <Text color={mutedText} fontSize="10px" fontWeight="600">
                {course.status === "completed" ? "Completed" : "Course progress"}
              </Text>
              <Text color={titleColor} fontSize="10px" fontWeight="800">
                {Math.round(progress)}%
              </Text>
            </HStack>

            <HStack spacing={2.5} align="center">
              <Progress
                value={progress}
                flex="1"
                h="5px"
                borderRadius="full"
                bg={progressTrackBg}
                colorScheme={course.status === "completed" ? "green" : "blue"}
              />
              <IconButton
                aria-label={`Open ${course.title || "course"}`}
                icon={course.status === "not_started" ? <FiPlay /> : <FiArrowRight />}
                size="xs"
                minW="28px"
                h="28px"
                borderRadius="full"
                variant="ghost"
                bg={iconButtonBg}
                color="blue.500"
                onClick={(event) => {
                  event.stopPropagation();
                  onClick();
                }}
              />
            </HStack>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

const MobileLearningCourseCardSkeleton = () => {
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.800");

  return (
    <Flex
      minH="124px"
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
    >
      <Skeleton flex="0 0 108px" minH="124px" />
      <Flex flex="1" minW={0} direction="column" justify="space-between" p={3}>
        <Box>
          <Skeleton h="18px" w="74px" borderRadius="md" mb={2} />
          <SkeletonText noOfLines={2} spacing={2} skeletonHeight="3" />
        </Box>
        <Box>
          <HStack justify="space-between" mb={2}>
            <Skeleton h="10px" w="72px" />
            <Skeleton h="10px" w="28px" />
          </HStack>
          <HStack spacing={2.5}>
            <Skeleton h="5px" flex="1" borderRadius="full" />
            <Skeleton w="28px" h="28px" borderRadius="full" />
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
};

const MyLearningPage = observer(() => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [errorMessage, setErrorMessage] = useState("");

  const pageBg = useColorModeValue("white", "gray.950");
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.800");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const softText = useColorModeValue("gray.500", "gray.500");
  const compactPanelBg = useColorModeValue("white", "gray.900");
  const activeFilterBg = useColorModeValue("gray.900", "white");
  const activeFilterColor = useColorModeValue("white", "gray.900");
  const inactiveFilterBg = useColorModeValue("white", "gray.900");
  const inactiveFilterHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const emptyIconBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const noResultsIconBg = useColorModeValue("orange.50", "whiteAlpha.100");
  const continueBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const continueBorder = useColorModeValue("blue.100", "whiteAlpha.200");

  const {
    auth: { user, sessionReady },
    courseStore,
  } = stores;

  const loadCourses = async () => {
    setErrorMessage("");
    try {
      await courseStore.fetchMyCourses();
    } catch (error: any) {
      setErrorMessage(
        error?.message || error?.error || courseStore.accessError || "Unable to load your learning library."
      );
    }
  };

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/my-learning")}`);
      return;
    }

    void loadCourses();
  }, [router, sessionReady, user]);

  const courses: LearningCourse[] = courseStore.myCourses || [];

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return courses.filter((course) => {
      const haystack = [
        course.title,
        course.description?.text,
        ...(course.taxonomy?.categories || []),
        ...(course.taxonomy?.languages || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (query && !haystack.includes(query)) {
        return false;
      }

      if (statusFilter !== "all" && course.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery, statusFilter]);

  const summary = useMemo(
    () => ({
      total: courses.length,
      inProgress: courses.filter((course) => course.status === "in_progress").length,
      completed: courses.filter((course) => course.status === "completed").length,
    }),
    [courses]
  );

  const nextUpCourse = useMemo(() => {
    if (courses.length === 0) {
      return null;
    }

    return (
      courses.find((course) => Number(course.progress || 0) > 0 && Number(course.progress || 0) < 100) ||
      courses.find((course) => course.status === "not_started") ||
      courses[0]
    );
  }, [courses]);

  if (!sessionReady || (!user && !errorMessage)) {
    return (
      <Box minH="100vh" bg={pageBg} px={4} py={6}>
        <HStack justify="center" minH="60vh" spacing={3}>
          <Spinner />
          <Text color={mutedText}>Preparing your learning space...</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 3, sm: 4, md: 6, lg: 8 }} py={{ base: 3, md: 6 }}>
      <VStack spacing={{ base: 3.5, md: 5 }} align="stretch" maxW="1440px" mx="auto">
        <Box
          bg={compactPanelBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius={{ base: "xl", md: "2xl" }}
          px={{ base: 3.5, md: 5 }}
          py={{ base: 3.5, md: 4.5 }}
        >
          <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} gap={4}>
            <Box minW={0}>
              <Heading fontSize={{ base: "xl", md: "2xl" }} lineHeight="1.2" fontWeight="800">
                My Learning
              </Heading>
              <Text mt={1} color={mutedText} fontSize={{ base: "xs", md: "sm" }} noOfLines={{ base: 2, md: 1 }}>
                Continue your enrolled courses and keep track of your progress.
              </Text>

              <HStack mt={3} spacing={{ base: 3, md: 5 }} divider={<Box h="18px" borderLeftWidth="1px" borderColor={borderColor} />}>
                <HStack spacing={1.5}>
                  <Icon as={FiBookOpen} color="blue.500" boxSize={3.5} />
                  <Text fontSize="xs" color={softText}>
                    <Text as="span" color="inherit" fontWeight="800">
                      {summary.total}
                    </Text>{" "}
                    courses
                  </Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Icon as={FiPlayCircle} color="orange.400" boxSize={3.5} />
                  <Text fontSize="xs" color={softText}>
                    <Text as="span" color="inherit" fontWeight="800">
                      {summary.inProgress}
                    </Text>{" "}
                    active
                  </Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Icon as={FiCheckCircle} color="green.500" boxSize={3.5} />
                  <Text fontSize="xs" color={softText}>
                    <Text as="span" color="inherit" fontWeight="800">
                      {summary.completed}
                    </Text>{" "}
                    done
                  </Text>
                </HStack>
              </HStack>
            </Box>

            <Button
              size={{ base: "sm", md: "md" }}
              flexShrink={0}
              variant="outline"
              borderRadius="lg"
              leftIcon={<FiBookOpen />}
              onClick={() => router.push("/course")}
            >
              <Text display={{ base: "none", sm: "block" }}>Browse courses</Text>
              <Text display={{ base: "block", sm: "none" }}>Browse</Text>
            </Button>
          </Flex>
        </Box>

        <Box
          bg={compactPanelBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius={{ base: "xl", md: "2xl" }}
          p={{ base: 3, md: 4 }}
        >
          <Flex direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }} gap={3}>
            <Box flex="1" maxW={{ md: "520px" }}>
              <GlassSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search enrolled courses"
                maxW="100%"
                isLearner={false}
              />
            </Box>

            <Box flex="1" minW={0} overflowX="auto" pb={{ base: 0.5, md: 0 }}>
              <HStack spacing={2} w="max-content" ml={{ md: "auto" }}>
                {STATUS_FILTERS.map((option) => {
                  const isActive = statusFilter === option.key;
                  return (
                    <Button
                      key={option.key}
                      size="sm"
                      h="34px"
                      px={3.5}
                      borderRadius="full"
                      borderWidth="1px"
                      borderColor={isActive ? activeFilterBg : borderColor}
                      bg={isActive ? activeFilterBg : inactiveFilterBg}
                      color={isActive ? activeFilterColor : mutedText}
                      fontSize="xs"
                      fontWeight="700"
                      _hover={{ bg: isActive ? activeFilterBg : inactiveFilterHoverBg }}
                      onClick={() => setStatusFilter(option.key)}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </HStack>
            </Box>
          </Flex>
        </Box>

        {nextUpCourse && !courseStore.isMyCoursesLoading && !errorMessage ? (
          <Flex
            align="center"
            justify="space-between"
            gap={3}
            bg={continueBg}
            borderWidth="1px"
            borderColor={continueBorder}
            borderRadius="xl"
            px={{ base: 3, md: 4 }}
            py={{ base: 2.5, md: 3 }}
            cursor="pointer"
            onClick={() => router.push(`/course?courseId=${nextUpCourse.courseId}`)}
          >
            <HStack minW={0} spacing={3}>
              <Flex
                flexShrink={0}
                w="34px"
                h="34px"
                align="center"
                justify="center"
                borderRadius="lg"
                bg="blue.500"
                color="white"
              >
                <Icon as={FiPlay} boxSize={4} />
              </Flex>
              <Box minW={0}>
                <Text color="blue.500" fontSize="9px" fontWeight="800" textTransform="uppercase" letterSpacing="0.08em">
                  Continue learning
                </Text>
                <Text mt={0.5} fontSize={{ base: "xs", md: "sm" }} fontWeight="700" noOfLines={1}>
                  {nextUpCourse.title}
                </Text>
              </Box>
            </HStack>

            <HStack flexShrink={0} spacing={2}>
              <Text display={{ base: "none", sm: "block" }} color={mutedText} fontSize="xs" fontWeight="600">
                {Math.round(getProgressValue(nextUpCourse.progress))}% complete
              </Text>
              <Icon as={FiArrowRight} color="blue.500" boxSize={4} />
            </HStack>
          </Flex>
        ) : null}

        {errorMessage ? (
          <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={{ base: 4, md: 6 }}
          >
            <VStack spacing={3.5} align="stretch">
              <HStack spacing={3} color="red.500">
                <Icon as={FiAlertCircle} boxSize={5} />
                <Heading size="sm">Unable to load your courses</Heading>
              </HStack>
              <Text color={mutedText} fontSize={{ base: "sm", md: "md" }}>
                {errorMessage}
              </Text>
              <HStack spacing={3}>
                <Button size="sm" leftIcon={<FiRefreshCw />} colorScheme="blue" borderRadius="lg" onClick={() => void loadCourses()}>
                  Try again
                </Button>
                <Button size="sm" variant="outline" borderRadius="lg" onClick={() => router.push("/course")}>
                  Open catalog
                </Button>
              </HStack>
            </VStack>
          </Box>
        ) : courseStore.isMyCoursesLoading ? (
          <>
            <VStack display={{ base: "flex", md: "none" }} spacing={3} align="stretch">
              {Array.from({ length: 5 }).map((_, index) => (
                <MobileLearningCourseCardSkeleton key={`mobile-learning-skeleton-${index}`} />
              ))}
            </VStack>

            <SimpleGrid display={{ base: "none", md: "grid" }} columns={{ md: 2, lg: 3, xl: 4 }} spacing={5}>
              {Array.from({ length: 8 }).map((_, index) => (
                <CourseCardSkeleton key={`desktop-learning-skeleton-${index}`} />
              ))}
            </SimpleGrid>
          </>
        ) : courses.length === 0 ? (
          <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={{ base: 5, md: 8 }}
          >
            <VStack spacing={3.5} textAlign="center">
              <Flex
                w={{ base: "48px", md: "56px" }}
                h={{ base: "48px", md: "56px" }}
                borderRadius="xl"
                align="center"
                justify="center"
                bg={emptyIconBg}
                color="blue.500"
              >
                <Icon as={FiBookOpen} boxSize={{ base: 5, md: 6 }} />
              </Flex>
              <Box>
                <Heading size={{ base: "sm", md: "md" }}>No courses in your learning library yet</Heading>
                <Text mt={2} color={mutedText} maxW="520px" fontSize={{ base: "sm", md: "md" }}>
                  Enrolled and assigned courses will appear here when they are available.
                </Text>
              </Box>
              <HStack spacing={3}>
                <Button size="sm" colorScheme="blue" borderRadius="lg" rightIcon={<FiArrowRight />} onClick={() => router.push("/course")}>
                  Explore courses
                </Button>
                <Button size="sm" variant="outline" borderRadius="lg" leftIcon={<FiRefreshCw />} onClick={() => void loadCourses()}>
                  Refresh
                </Button>
              </HStack>
            </VStack>
          </Box>
        ) : filteredCourses.length === 0 ? (
          <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p={{ base: 5, md: 8 }}
          >
            <VStack spacing={3.5} textAlign="center">
              <Flex
                w={{ base: "46px", md: "54px" }}
                h={{ base: "46px", md: "54px" }}
                borderRadius="xl"
                align="center"
                justify="center"
                bg={noResultsIconBg}
                color="orange.400"
              >
                <Icon as={FiClock} boxSize={{ base: 5, md: 6 }} />
              </Flex>
              <Box>
                <Heading size={{ base: "sm", md: "md" }}>No courses match this view</Heading>
                <Text mt={2} color={mutedText} fontSize={{ base: "sm", md: "md" }}>
                  Try another search or switch the selected status filter.
                </Text>
              </Box>
              <Button
                size="sm"
                variant="outline"
                borderRadius="lg"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            </VStack>
          </Box>
        ) : (
          <>
            <VStack display={{ base: "flex", md: "none" }} spacing={3} align="stretch">
              {filteredCourses.map((course) => (
                <MobileLearningCourseCard
                  key={course.courseId}
                  course={course}
                  onClick={() => router.push(`/course?courseId=${course.courseId}`)}
                />
              ))}
            </VStack>

            <SimpleGrid display={{ base: "none", md: "grid" }} columns={{ md: 2, lg: 3, xl: 4 }} spacing={5}>
              {filteredCourses.map((course) => (
                <Box key={course.courseId} minW={0}>
                  <CourseCard
                    course={buildCourseCardModel(course)}
                    enrolled
                    primaryBadgeLabel={getPrimaryBadge(course)}
                    secondaryBadgeLabel={mapStatusLabel(course.status)}
                    onClick={() => router.push(`/course?courseId=${course.courseId}`)}
                  />
                </Box>
              ))}
            </SimpleGrid>
          </>
        )}
      </VStack>
    </Box>
  );
});

export default MyLearningPage;
