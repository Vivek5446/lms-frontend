"use client";

import GlassSearchInput from "@/app/component/common/GlassSearch/GlassSearchInput";
import CourseDetails from "@/app/dashboard/course/CourseDetails";
import CourseAssetModal from "@/app/dashboard/course/scorm/CourseAssetModal";
import CoursePlayer from "@/app/dashboard/course/scorm/CoursePlayer";
import {
  buildCourseAssetUrl,
  CourseLaunchSection,
  isScormLaunchSection,
} from "@/app/dashboard/course/scorm/sectionTracking";
import { courseStore } from "@/app/store/courseStore/courseStore";
import { managerStore } from "@/app/store/managerStore/managerStore";
import stores from "@/app/store/stores";
import {
  Badge,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import MYCourseBoardCard from "./MyCourseBoardCard";

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

const MyCoursesBoard = observer(
  ({ basePath = "/dashboard/course/my-courses" }: MyCoursesBoardProps) => {
    const toast = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const requestedCourseId = searchParams.get("courseId") || "";
    const [playerSection, setPlayerSection] =
      useState<CourseLaunchSection | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<
      "all" | "active" | "in_progress" | "completed"
    >("all");

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
        managerStore.clearMyCourseAnswers();
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

    useEffect(() => {
      const activeCourseId = activeCourse?._id || activeCourse?.courseId;
      if (!activeCourseId) {
        managerStore.clearMyCourseAnswers();
        return;
      }

      managerStore.fetchMyCourseAnswers(activeCourseId).catch(() => undefined);
    }, [activeCourse?._id, activeCourse?.courseId]);

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
      const completed = courses.filter(
        (course) => course.status === "completed",
      ).length;
      const inProgress = courses.filter(
        (course) => course.status === "in_progress",
      ).length;
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

    const syncNonScormSectionProgress = async (
      status: "in_progress" | "completed",
      extra?: {
        currentTime?: number;
        duration?: number;
        progress?: number;
        startOver?: boolean;
      },
    ) => {
      const activeCourseId = activeCourse?._id || activeCourse?.courseId;
      if (
        !activeCourseId ||
        !playerSection?.moduleId ||
        !playerSection?.sectionId
      ) {
        return;
      }

      await courseStore.updateSectionProgress({
        courseId: activeCourseId,
        moduleId: playerSection.moduleId,
        sectionId: playerSection.sectionId,
        status,
        ...extra,
      });

      // We don't necessarily need to refetch everything on every throttled update,
      // but on completion we definitely should.
      if (status === "completed" || extra?.startOver) {
        await Promise.all([
          courseStore.fetchMyCourseDetail(activeCourseId),
          courseStore.fetchMyCourses(),
        ]);
      }
    };

    const [initialSectionProgress, setInitialSectionProgress] =
      useState<any>(null);

    useEffect(() => {
      if (playerSection && !isScormLaunchSection(playerSection)) {
        const activeCourseId = activeCourse?._id || activeCourse?.courseId;
        if (activeCourseId) {
          courseStore
            .fetchSectionProgress({
              courseId: activeCourseId,
              moduleId: playerSection.moduleId,
              sectionId: playerSection.sectionId,
            })
            .then(setInitialSectionProgress);
        }
      } else {
        setInitialSectionProgress(null);
      }
    }, [playerSection, activeCourse?._id, activeCourse?.courseId]);

    if (requestedCourseId) {
      if (!activeCourse) {
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
            onLaunchSection={(launchSection) => setPlayerSection(launchSection)}
            learnerAnswers={managerStore.myCourseAnswers}
            isLearnerAnswersLoading={managerStore.isMyCourseAnswersLoading}
          />

          <AnimatePresence>
            {playerSection && isScormLaunchSection(playerSection) ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ position: "fixed", inset: 0, zIndex: 1400 }}
              >
                <CoursePlayer
                  courseTitle={activeCourse.title}
                  courseUrl={buildCourseAssetUrl(playerSection.assetPath)}
                  courseId={activeCourse._id || activeCourse.courseId}
                  moduleId={playerSection.moduleId}
                  sectionId={playerSection.sectionId}
                  userId={stores.auth.user?._id}
                  learnerName={
                    stores.auth.user?.name ||
                    stores.auth.user?.username ||
                    stores.auth.user?.email
                  }
                  answerSections={managerStore.myCourseAnswers}
                  isAnswerSectionsLoading={
                    managerStore.isMyCourseAnswersLoading
                  }
                  onRefreshAnswerSections={() => {
                    const activeCourseId =
                      activeCourse._id || activeCourse.courseId;
                    if (!activeCourseId) {
                      return Promise.resolve();
                    }

                    return managerStore
                      .fetchMyCourseAnswers(activeCourseId)
                      .then(() => undefined);
                  }}
                  onRefreshProgress={() => {
                    const activeCourseId =
                      activeCourse._id || activeCourse.courseId;
                    if (!activeCourseId) {
                      return Promise.resolve();
                    }

                    return Promise.all([
                      courseStore.fetchMyCourseDetail(activeCourseId),
                      courseStore.fetchMyCourses(),
                    ]).then(() => undefined);
                  }}
                  onBack={() => setPlayerSection(null)}
                />
              </motion.div>
            ) : playerSection ? (
              <CourseAssetModal
                assetKind={playerSection.contentKind}
                assetUrl={buildCourseAssetUrl(playerSection.assetPath)}
                title={playerSection.sectionTitle || activeCourse.title}
                initialTime={initialSectionProgress?.currentTime || 0}
                initialProgress={initialSectionProgress?.progress || 0}
                onOpened={
                  playerSection.contentKind === "video"
                    ? () => syncNonScormSectionProgress("in_progress")
                    : undefined
                }
                onProgressUpdate={(data) =>
                  syncNonScormSectionProgress("in_progress", data)
                }
                onCompleted={() => syncNonScormSectionProgress("completed")}
                onStartOver={() =>
                  syncNonScormSectionProgress("in_progress", {
                    startOver: true,
                  })
                }
                onBack={() => setPlayerSection(null)}
              />
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
            overflow="hidden"
            position="relative"
            bg="blue.50"
            color="gray.800"
            w="full"
          >
            {/* Background decorative circles */}
            <Box
              position="absolute"
              right="30%"
              top="-60px"
              w="300px"
              h="300px"
              borderRadius="full"
              bg="blue.100"
              opacity={0.6}
            />
            <Box
              position="absolute"
              right="25%"
              bottom="-80px"
              w="200px"
              h="200px"
              borderRadius="full"
              bg="blue.200"
              opacity={0.4}
            />

            <Grid
              templateColumns={{ base: "1fr", lg: "1fr 420px" }}
              minH="220px"
            >
              {/* Left: text + search + stats */}
              <Box
                px={{ base: 6, md: 10 }}
                py={{ base: 6, md: 8 }}
                position="relative"
                zIndex={1}
              >
                <Badge
                  bg="blue.100"
                  color="blue.700"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                >
                  Online Learning Course
                </Badge>

                <Heading
                  mt={3}
                  size="lg"
                  color="gray.900"
                  fontWeight="800"
                  lineHeight="1.2"
                >
                  Your assigned courses,{" "}
                  <Text as="span" color="blue.600">
                    ready to continue
                  </Text>
                </Heading>

                {/* Search */}
                <Box mt={5} maxW="480px">
                  <GlassSearchInput
                    value={searchQuery}
                    onChange={(val) => setSearchQuery(val)}
                    placeholder="Search by course title or assignment source"
                    maxW="100%"
                    isLearner={false}
                  />
                </Box>

                {/* Stats row */}
                <HStack mt={5} spacing={6}>
                  <Box>
                    <Text fontSize="2xl" fontWeight="800" color="blue.700">
                      {summary.total}+
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Total Courses
                    </Text>
                  </Box>
                  <Box w="1px" h="32px" bg="gray.200" />
                  <Box>
                    <Text fontSize="2xl" fontWeight="800" color="blue.700">
                      {summary.active}+
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Active Courses
                    </Text>
                  </Box>
                  <Box w="1px" h="32px" bg="gray.200" />
                  <Box>
                    <Text fontSize="2xl" fontWeight="800" color="blue.700">
                      {summary.completed}+
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Completed
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Right: image panel */}
              <Box
                position="relative"
                overflow="hidden"
                display={{ base: "none", lg: "block" }}
                minH="280px"
              >
                {/* Actual image */}
                <Image
                  src="/images/happy-schoolgirl-with-new-books.jpg"
                  alt="Learning"
                  position="absolute"
                  inset={0}
                  w="full"
                  h="full"
                  objectFit="cover"
                  objectPosition="center top"
                />

                {/* Transparent blue overlay */}
                {/* <Box
    position="absolute"
    inset={0}
    bg="blue.600"
    opacity={0.45}
    zIndex={1}
  /> */}
              </Box>
            </Grid>
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
                  onClick={() =>
                    setStatusFilter(option.key as typeof statusFilter)
                  }
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
            <Box
              bg={cardBg}
              borderRadius="3xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={8}
            >
              <Text fontWeight="semibold" fontSize="lg">
                No courses assigned yet
              </Text>
              <Text color={subduedText} mt={2}>
                When a course is assigned directly to you or delivered through a
                batch, it will appear here with its thumbnail, status, and
                launch access.
              </Text>
            </Box>
          ) : filteredCourses.length === 0 ? (
            <Box
              bg={cardBg}
              borderRadius="3xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={8}
            >
              <Text fontWeight="semibold" fontSize="lg">
                No courses match this filter
              </Text>
              <Text color={subduedText} mt={2}>
                Try another search keyword or switch the status filter to see
                the rest of your learning library.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3, xl: 4 }} spacing={4}>
              {filteredCourses.map((course, index) => (
                <MYCourseBoardCard
                  key={course.courseId}
                  course={course}
                  index={index}
                  handleOpenCourse={handleOpenCourse}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Box>
    );
  },
);

export default MyCoursesBoard;
