"use client";

import GlassSearchInput from "@/app/component/common/GlassSearch/GlassSearchInput";
import CourseDetails from "@/app/dashboard/course/CourseDetails";
import CourseAssetModal from "@/app/dashboard/course/scorm/CourseAssetModal";
import CoursePlayer from "@/app/dashboard/course/scorm/CoursePlayer";
import CourseQuizPlayer from "@/app/dashboard/course/quiz/CourseQuizPlayer";
import {
  buildCourseAssetUrl,
  CourseLaunchSection,
  isScormLaunchSection,
} from "@/app/dashboard/course/scorm/sectionTracking";
import { CourseQuizForLearner, courseStore } from "@/app/store/courseStore/courseStore";
import { managerStore } from "@/app/store/managerStore/managerStore";
import stores from "@/app/store/stores";
import {
  Badge,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Icon,
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
import { FiBookOpen, FiCheckCircle, FiClock, FiPlayCircle } from "react-icons/fi";
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
    const [activeQuiz, setActiveQuiz] = useState<CourseQuizForLearner | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<
      "all" | "active" | "in_progress" | "completed"
    >("all");

    const pageBg = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const subduedText = useColorModeValue("gray.600", "gray.300");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const heroBg = useColorModeValue("white", "gray.800");
    const panelBg = useColorModeValue("rgba(255,255,255,0.84)", "whiteAlpha.100");

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
        courseStore.clearCourseQuizzes();
        return;
      }

      managerStore.fetchMyCourseAnswers(activeCourseId).catch(() => undefined);
      courseStore.fetchCourseQuizzes(activeCourseId).catch(() => undefined);
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

    const handleDownloadCertificate = async (courseId: string) => {
      try {
        await courseStore.downloadMyCertificate(courseId);
        toast({
          title: "Certificate downloaded",
          status: "success",
          duration: 3000,
        });
      } catch (error: any) {
        toast({
          title: "Certificate unavailable",
          description: error?.message || error?.data || "Please try again.",
          status: "error",
          duration: 4000,
        });
      }
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
            courseQuizzes={courseStore.courseQuizzes}
            isCourseQuizzesLoading={courseStore.isCourseQuizzesLoading}
            onTakeQuiz={(quiz) => setActiveQuiz(quiz)}
            onDownloadCertificate={handleDownloadCertificate}
            isCertificateDownloading={
              courseStore.certificateDownloadCourseId === (activeCourse._id || activeCourse.courseId)
            }
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
            {activeQuiz ? (
              <CourseQuizPlayer
                quiz={activeQuiz}
                isSubmitting={courseStore.isQuizSubmitting}
                onClose={() => setActiveQuiz(null)}
                onSubmit={async (answers) => {
                  const activeCourseId = activeCourse._id || activeCourse.courseId;
                  const response = await courseStore.submitCourseQuiz(activeCourseId, activeQuiz.quizId, answers);
                  await Promise.all([
                    courseStore.fetchMyCourseDetail(activeCourseId),
                    courseStore.fetchMyCourses(),
                    managerStore.fetchMyCourseAnswers(activeCourseId),
                  ]).catch(() => undefined);
                  const refreshedQuiz = courseStore.courseQuizzes.find((quiz) => quiz.quizId === activeQuiz.quizId);
                  if (refreshedQuiz) {
                    setActiveQuiz(refreshedQuiz);
                  }
                  return response;
                }}
              />
            ) : null}
          </AnimatePresence>
        </>
      );
    }

    return (
      <Box minH="100vh" bg={pageBg} px={{ base: 3, md: 6 }} py={{ base: 3, md: 6 }} overflowX="hidden">
        <Stack spacing={{ base: 3, md: 6 }} maxW="7xl" mx="auto">
          <Box
            borderRadius="2xl"
            overflow="hidden"
            position="relative"
            bg={heroBg}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow={useColorModeValue("0 18px 45px rgba(15, 23, 42, 0.06)", "none")}
            w="full"
          >
            <Grid
              templateColumns={{ base: "1fr", lg: "1fr 360px" }}
              minH={{ base: "auto", lg: "248px" }}
              gap={0}
            >
              <Box
                px={{ base: 3, sm: 5, md: 8 }}
                py={{ base: 4, md: 8 }}
                position="relative"
                zIndex={1}
              >
                <HStack spacing={2} mb={{ base: 2, md: 3 }}>
                  <Icon as={FiPlayCircle} color="blue.500" boxSize={4} />
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1} textTransform="none" fontSize="xs">
                    My learning
                  </Badge>
                </HStack>

                <Heading
                  fontSize={{ base: "xl", sm: "2xl", md: "4xl" }}
                  fontWeight="800"
                  lineHeight={{ base: "1.15", md: "1.08" }}
                >
                  Continue learning{" "}
                  <Text as="span" color="blue.600">
                    today
                  </Text>
                </Heading>
                <Text mt={3} color={subduedText} maxW="2xl" display={{ base: "none", md: "block" }}>
                  Your assigned courses, progress, expiry status, and next actions are gathered into one focused learning space.
                </Text>

                <Box mt={{ base: 3, md: 5 }} maxW="560px">
                  <GlassSearchInput
                    value={searchQuery}
                    onChange={(val) => setSearchQuery(val)}
                    placeholder="Search courses"
                    maxW="100%"
                    isLearner={false}
                  />
                </Box>

                <SimpleGrid columns={3} spacing={{ base: 2, md: 3 }} mt={{ base: 3, md: 5 }} maxW="560px">
                  {[
                    { label: "Courses", value: summary.total, icon: FiBookOpen, color: "blue.500" },
                    { label: "Active", value: summary.active, icon: FiClock, color: "teal.500" },
                    { label: "Done", value: summary.completed, icon: FiCheckCircle, color: "green.500" },
                  ].map((item) => (
                    <HStack key={item.label} spacing={2} bg={panelBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }}>
                      <Icon as={item.icon} color={item.color} boxSize={{ base: 4, md: 5 }} />
                      <Box minW={0}>
                        <Text fontSize={{ base: "md", md: "2xl" }} fontWeight="800" lineHeight="1">
                          {item.value}
                        </Text>
                        <Text fontSize={{ base: "10px", md: "xs" }} color={subduedText} noOfLines={1}>
                          {item.label}
                        </Text>
                      </Box>
                    </HStack>
                  ))}
                </SimpleGrid>
              </Box>

              <Box
                position="relative"
                overflow="hidden"
                display={{ base: "none", lg: "block" }}
                minH="248px"
              >
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
              </Box>
            </Grid>
          </Box>

          <Box overflowX="auto" pb={1} mx={{ base: -3, md: 0 }} px={{ base: 3, md: 0 }}>
          <HStack spacing={2} flexWrap="nowrap" w="max-content">
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
                  minH={{ base: "34px", md: "40px" }}
                  px={{ base: 3, md: 4 }}
                  fontSize={{ base: "xs", md: "sm" }}
                  onClick={() =>
                    setStatusFilter(option.key as typeof statusFilter)
                  }
                >
                  {option.label}
                </Button>
              );
            })}
          </HStack>
          </Box>

          {courseStore.isMyCoursesLoading ? (
            <HStack justify="center" py={{ base: 10, md: 16 }} bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
              <Spinner />
              <Text color={subduedText}>Loading courses...</Text>
            </HStack>
          ) : courses.length === 0 ? (
            <Box
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={{ base: 5, md: 8 }}
            >
              <Text fontWeight="semibold" fontSize="lg">
                No courses assigned yet
              </Text>
              <Text color={subduedText} mt={2} display={{ base: "none", md: "block" }}>
                When a course is assigned directly to you or delivered through a
                batch, it will appear here with its thumbnail, status, and
                launch access.
              </Text>
            </Box>
          ) : filteredCourses.length === 0 ? (
            <Box
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              p={{ base: 5, md: 8 }}
            >
              <Text fontWeight="semibold" fontSize="lg">
                No courses match this filter
              </Text>
              <Text color={subduedText} mt={2} display={{ base: "none", md: "block" }}>
                Try another search keyword or switch the status filter to see
                the rest of your learning library.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={{ base: 3, md: 4 }}>
              {filteredCourses.map((course, index) => (
                <MYCourseBoardCard
                  key={course.courseId}
                  course={course}
                  index={index}
                  handleOpenCourse={handleOpenCourse}
                  handleDownloadCertificate={handleDownloadCertificate}
                  isCertificateDownloading={courseStore.certificateDownloadCourseId === course.courseId}
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
