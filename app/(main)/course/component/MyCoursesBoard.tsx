"use client";

import GlassSearchInput from "@/app/component/common/GlassSearch/GlassSearchInput";
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
import {
  FiBookOpen,
  FiClock,
  FiLayers,
  FiPlayCircle,
  FiSearch,
  FiTrendingUp,
  FiAward,
  FiZap,
} from "react-icons/fi";

function formatDate(value?: string | null) {
  if (!value) return "No expiry";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No expiry";
  return date.toLocaleDateString();
}

function getStatusColor(status: string) {
  if (status === "expired") return "red";
  if (status === "expiring_soon") return "orange";
  return "green";
}

function buildScormCourseUrl(scormPath: string) {
  const normalizedPath = scormPath.startsWith("/")
    ? scormPath
    : `/${scormPath}`;
  return `/courses${normalizedPath}`;
}

function truncateText(value?: string, limit = 120) {
  const text = String(value || "").trim();
  if (!text) return "No description available yet.";
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
}

type MyCoursesBoardProps = {
  basePath?: string;
};

const MotionBox = motion(Box);

/* ─────────────────────────────────────────────
   STAT PILL  – tiny summary numbers in header
───────────────────────────────────────────── */
function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      bg="rgba(255,255,255,0.08)"
      backdropFilter="blur(12px)"
      border="1px solid rgba(255,255,255,0.15)"
      borderRadius="20px"
      px={5}
      py={4}
      minW="90px"
      gap={1}
    >
      <Icon as={icon} color="rgba(255,255,255,0.6)" boxSize={4} mb={1} />
      <Text fontSize="2xl" fontWeight="800" color="white" lineHeight="1">
        {value}
      </Text>
      <Text
        fontSize="10px"
        textTransform="uppercase"
        letterSpacing="0.12em"
        color="rgba(255,255,255,0.55)"
        fontWeight="600"
      >
        {label}
      </Text>
    </Flex>
  );
}

/* ─────────────────────────────────────────────
   COURSE CARD
───────────────────────────────────────────── */
function CourseCard({
  course,
  index,
  onOpen,
  cardBg,
  borderColor,
  subduedText,
}: {
  course: any;
  index: number;
  onOpen: (id: string) => void;
  cardBg: string;
  borderColor: string;
  subduedText: string;
}) {
  const isCompleted = course.status === "completed";
  const isInProgress = course.status === "in_progress";

  const statusLabel = course.isExpired
    ? "Expired"
    : course.visibilityStatus === "expiring_soon"
      ? "Expiring soon"
      : "Active";

  const statusColors: Record<
    string,
    { bg: string; color: string; dot: string }
  > = {
    Active: { bg: "rgba(34,197,94,0.12)", color: "#16a34a", dot: "#22c55e" },
    "Expiring soon": {
      bg: "rgba(249,115,22,0.12)",
      color: "#ea580c",
      dot: "#f97316",
    },
    Expired: { bg: "rgba(239,68,68,0.12)", color: "#dc2626", dot: "#ef4444" },
  };
  const st = statusColors[statusLabel] || statusColors["Active"];

  return (
    <MotionBox
      key={course.courseId}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      bg={cardBg}
      borderRadius="24px"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow="0 2px 16px rgba(0,0,0,0.06)"
      _hover={{
        boxShadow: "0 12px 40px rgba(37,99,235,0.13)",
        borderColor: "blue.200",
        transform: "translateY(-4px)",
      }}
      style={{ transition: "all 0.25s ease" }}
      cursor="pointer"
      onClick={() => onOpen(course.courseId)}
    >
      {/* Thumbnail */}
      <Box position="relative">
        <AspectRatio ratio={16 / 9}>
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              objectFit="cover"
            />
          ) : (
            <Flex
              align="center"
              justify="center"
              bg="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 60%, #ede9fe 100%)"
            >
              <VStack spacing={2}>
                <Box
                  borderRadius="full"
                  bg="white"
                  p={4}
                  boxShadow="0 4px 20px rgba(37,99,235,0.2)"
                >
                  <Icon as={FiBookOpen} boxSize={7} color="blue.500" />
                </Box>
                <Text fontWeight="700" color="blue.600" fontSize="sm">
                  Course Preview
                </Text>
              </VStack>
            </Flex>
          )}
        </AspectRatio>

        {/* Progress overlay bar at bottom of thumbnail */}
        {/* <Box position="absolute" bottom={0} left={0} right={0} h="4px" bg="blackAlpha.200">
          <Box
            h="100%"
            w={`${course.progress}%`}
            bg="linear-gradient(90deg, #2563eb 60%, #3b82f6 100%)"
            transition="width 0.6s ease"
          />
        </Box> */}

        {/* Status badge */}
        <Flex
          position="absolute"
          top={3}
          right={3}
          align="center"
          gap={1.5}
          bg={st.bg}
          backdropFilter="blur(8px)"
          border={`1px solid ${st.color}30`}
          borderRadius="full"
          px={2.5}
          py={1}
        >
          <Box w="6px" h="6px" borderRadius="full" bg={st.dot} />
          <Text
            fontSize="11px"
            fontWeight="700"
            color={st.color}
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            {statusLabel}
          </Text>
        </Flex>
      </Box>

      {/* Body */}
      <Stack spacing={4} p={5}>
        {/* Title + description */}
        <Box>
          <Text
            fontWeight="800"
            fontSize="md"
            noOfLines={2}
            lineHeight="1.35"
            mb={1.5}
          >
            {course.title}
          </Text>
          <Text
            color={subduedText}
            fontSize="sm"
            noOfLines={2}
            lineHeight="1.6"
          >
            {truncateText(course.description?.text, 100)}
          </Text>
        </Box>

        {/* Source badges */}
        <HStack spacing={2} flexWrap="wrap">
          {course.sources.slice(0, 2).map((source: any, i: number) => (
            <Badge
              key={`${source.type}-${source.batchId || i}`}
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="11px"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.06em"
              bg={source.type === "batch" ? "purple.50" : "green.50"}
              color={source.type === "batch" ? "purple.600" : "green.600"}
              border="1px solid"
              borderColor={source.type === "batch" ? "purple.200" : "green.200"}
            >
              {source.type === "batch" ? source.batchName || "Batch" : "Direct"}
            </Badge>
          ))}
          {course.sources.length > 2 && (
            <Badge
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="11px"
              colorScheme="gray"
            >
              +{course.sources.length - 2}
            </Badge>
          )}
        </HStack>

        {/* Progress */}
        <Box>
          <HStack justify="space-between" mb={1.5}>
            <HStack spacing={1}>
              <Icon as={FiTrendingUp} boxSize={3.5} color="blue.500" />
              <Text
                fontSize="xs"
                fontWeight="600"
                color={subduedText}
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
                Progress
              </Text>
            </HStack>
            <Text
              fontSize="sm"
              fontWeight="800"
              color={course.progress > 0 ? "blue.600" : subduedText}
            >
              {course.progress}%
            </Text>
          </HStack>
          <Box h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
            <Box
              h="100%"
              w={`${course.progress}%`}
              bg={
                isCompleted
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #2563eb, #7c3aed)"
              }
              borderRadius="full"
              transition="width 0.6s ease"
            />
          </Box>
        </Box>

        {/* Metrics row */}
        <SimpleGrid columns={3} spacing={2}>
          {[
            {
              icon: FiLayers,
              label: "Modules",
              value: course.curriculum?.totalModules || 0,
              light: { light: "blue.50", dark: "blue.900" },
              hover: { light: "blue.100", dark: "blue.800" },
              iconBg: { light: "blue.100", dark: "blue.800" },
              iconColor: { light: "blue.600", dark: "blue.200" },
            },
            {
              icon: FiZap,
              label: "Status",
              value: (course.status || "").replace(/_/g, " "),
              light: { light: "green.50", dark: "green.900" },
              hover: { light: "green.100", dark: "green.800" },
              iconBg: { light: "green.100", dark: "green.800" },
              iconColor: { light: "green.600", dark: "green.200" },
            },
            {
              icon: FiClock,
              label: "Valid till",
              value: formatDate(course.validTill),
              light: { light: "purple.50", dark: "purple.900" },
              hover: { light: "purple.100", dark: "purple.800" },
              iconBg: { light: "purple.100", dark: "purple.800" },
              iconColor: { light: "purple.600", dark: "purple.200" },
            },
          ].map((m) => (
            <Box
              key={m.label}
              borderRadius="16px"
              bg={useColorModeValue(m.light.light, m.light.dark)}
              border="1px solid"
              borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
              p={3}
            >
              {/* Icon + Label */}
              <HStack spacing={2} mb={1}>
                <Box
                  w={{ base: "18px", md: "28px" }}
                  h={{ base: "18px", md: "28px" }}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={useColorModeValue(m.iconBg.light, m.iconBg.dark)}
                  transition="all 0.2s"
                >
                  <Icon
                    as={m.icon}
                    boxSize={{ base: 2, md: 3.5 }}
                    color={useColorModeValue(
                      m.iconColor.light,
                      m.iconColor.dark,
                    )}
                  />
                </Box>

                <Text
                  fontSize={{ base: "3xs", md: "9px" }}
                  textTransform="uppercase"
                  letterSpacing="0.1em"
                  color={subduedText}
                  fontWeight="700"
                >
                  {m.label}
                </Text>
              </HStack>

              {/* Value */}
              <Text
                fontSize={{ base: "2xs", md: "sm" }}
                fontWeight="700"
                textTransform="capitalize"
              >
                {m.value}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* CTA */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(course.courseId);
          }}
          size="md"
          borderRadius="14px"
          fontWeight="700"
          fontSize="sm"
          bg={isCompleted ? "green.500" : "blue.600"}
          color="white"
          _hover={{
            bg: isCompleted ? "green.600" : "blue.700",
            transform: "translateY(-1px)",
            boxShadow: isCompleted
              ? "0 8px 24px rgba(34,197,94,0.35)"
              : "0 8px 24px rgba(37,99,235,0.35)",
          }}
          _active={{ transform: "translateY(0px)" }}
          transition="all 0.2s ease"
          leftIcon={<Icon as={isCompleted ? FiAward : FiPlayCircle} />}
        >
          {isCompleted ? "Review course" : "Continue learning"}
        </Button>
      </Stack>
    </MotionBox>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const MyCoursesBoard = observer(
  ({ basePath = "/dashboard/course/my-courses" }: MyCoursesBoardProps) => {
    const toast = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const requestedCourseId = searchParams.get("courseId") || "";
    const [playerPath, setPlayerPath] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<
      "all" | "active" | "in_progress" | "completed"
    >("all");

    const pageBg = useColorModeValue("#f8fafc", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const subduedText = useColorModeValue("gray.500", "gray.400");
    const borderColor = useColorModeValue("gray.100", "gray.700");

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
      if (!requestedCourseId || !courseStore.currentCourse) return null;
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
            ...course.sources.map((s: any) => s.label),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);
        if (!matchesSearch) return false;
        if (statusFilter === "active") return !course.isExpired;
        if (statusFilter === "in_progress")
          return course.status === "in_progress";
        if (statusFilter === "completed") return course.status === "completed";
        return true;
      });
    }, [courses, searchQuery, statusFilter]);

    const summary = useMemo(() => {
      const completed = courses.filter(
        (c: any) => c.status === "completed",
      ).length;
      const inProgress = courses.filter(
        (c: any) => c.status === "in_progress",
      ).length;
      const active = courses.filter((c: any) => !c.isExpired).length;
      return { total: courses.length, completed, inProgress, active };
    }, [courses]);

    const handleOpenCourse = (courseId: string) => {
      router.push(`${basePath}?courseId=${courseId}`);
    };

    /* ── Course detail / player view ── */
    if (requestedCourseId) {
      if (courseStore.isMyCourseDetailLoading || !activeCourse) {
        return (
          <HStack justify="center" py={20}>
            <Spinner color="blue.500" />
            <Text color={subduedText}>Loading course details…</Text>
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
            {playerPath && (
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
                  learnerName={
                    stores.auth.user?.name ||
                    stores.auth.user?.username ||
                    stores.auth.user?.email
                  }
                  onBack={() => setPlayerPath(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      );
    }

    /* ── Main listing view ── */
    return (
      <Box minH="100vh" bg={pageBg}>
        <Stack spacing={8}>
          {/* ══════════════════════════════════
              HERO HEADER
          ══════════════════════════════════ */}
          <Box
            borderRadius="28px"
            overflow="hidden"
            position="relative"
            bg="linear-gradient(135deg, #0f172a 0%, #1d4ed8 52%, #dbeafe 100%)"
            px={{ base: 5, md: 8 }}
            py={{ base: 7, md: 10 }}
          >
            {/* Decorative blobs */}
            <Box
              position="absolute"
              top="-60px"
              right="-60px"
              w="280px"
              h="280px"
              borderRadius="full"
              bg="rgba(99,102,241,0.25)"
              filter="blur(60px)"
              pointerEvents="none"
            />
            <Box
              position="absolute"
              bottom="-40px"
              left="30%"
              w="200px"
              h="200px"
              borderRadius="full"
              bg="rgba(37,99,235,0.2)"
              filter="blur(50px)"
              pointerEvents="none"
            />

            <Grid
              templateColumns={{ base: "1fr", lg: "1fr auto" }}
              gap={{ base: 6, lg: 10 }}
              alignItems="center"
              position="relative"
            >
              {/* Left: text + search */}
              <Stack spacing={5}>
                <Box>
                  <Flex
                    align="center"
                    gap={2}
                    bg="rgba(255,255,255,0.08)"
                    border="1px solid rgba(255,255,255,0.12)"
                    borderRadius="full"
                    px={3}
                    py={1.5}
                    w="fit-content"
                    mb={4}
                  >
                    <Icon
                      as={FiBookOpen}
                      color="rgba(255,255,255,0.7)"
                      boxSize={3.5}
                    />
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color="rgba(255,255,255,0.8)"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                    >
                      My Learning
                    </Text>
                  </Flex>

                  <Heading
                    color="white"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="800"
                    lineHeight="1.2"
                    letterSpacing="-0.02em"
                    maxW="520px"
                  >
                    Your courses,{" "}
                    <Box
                      as="span"
                      bgGradient="linear(to-r, #60a5fa, #a78bfa)"
                      bgClip="text"
                    >
                      all in one place
                    </Box>
                  </Heading>

                  <Text
                    color="rgba(255,255,255,0.6)"
                    mt={3}
                    fontSize="sm"
                    maxW="440px"
                    lineHeight="1.7"
                  >
                    Direct assignments and batch-delivered courses — with
                    progress tracking, due dates, and one-click launch.
                  </Text>
                </Box>

                {/* Search */}
                <GlassSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search courses..."
                />
              </Stack>

              {/* Right: stat pills */}
              <HStack spacing={2} flexWrap="nowrap" overflowX="auto" w="100%">
                <StatPill
                  label="Total"
                  value={summary.total}
                  icon={FiBookOpen}
                />
                <StatPill label="Active" value={summary.active} icon={FiZap} />
                <StatPill
                  label="Done"
                  value={summary.completed}
                  icon={FiAward}
                />
              </HStack>
            </Grid>
          </Box>

          {/* ══════════════════════════════════
              FILTER TABS
          ══════════════════════════════════ */}
          <HStack
            spacing={2}
            flexWrap="nowrap"
            overflowX="auto"
            w="100%"
            px={1}
            py={1}
            bg={useColorModeValue("white", "gray.800")}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="16px"
            sx={{
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {[
              { key: "all", label: "All courses", icon: FiBookOpen },
              { key: "active", label: "Active", icon: FiZap },
              { key: "in_progress", label: "In progress", icon: FiTrendingUp },
              { key: "completed", label: "Completed", icon: FiAward },
            ].map((opt) => {
              const isActive = statusFilter === opt.key;

              return (
                <Button
                  key={opt.key}
                  flexShrink={0} // ⭐ important
                  minW="max-content" // ⭐ important
                  whiteSpace="nowrap" // ⭐ important
                  size="sm"
                  borderRadius="12px"
                  fontWeight={isActive ? "700" : "500"}
                  fontSize="sm"
                  bg={isActive ? "blue.600" : "transparent"}
                  color={isActive ? "white" : subduedText}
                  leftIcon={<Icon as={opt.icon} boxSize={3.5} />}
                  px={4}
                  _hover={{
                    bg: isActive
                      ? "blue.700"
                      : useColorModeValue("gray.100", "whiteAlpha.100"),
                  }}
                  onClick={() =>
                    setStatusFilter(opt.key as typeof statusFilter)
                  }
                >
                  {opt.label}
                </Button>
              );
            })}
          </HStack>

          {/* ══════════════════════════════════
              COURSE GRID
          ══════════════════════════════════ */}
          {courseStore.isMyCoursesLoading ? (
            <HStack justify="center" py={20}>
              <Spinner color="blue.500" size="lg" />
              <Text color={subduedText} fontWeight="500">
                Loading your courses…
              </Text>
            </HStack>
          ) : courses.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="24px"
              p={16}
              gap={4}
            >
              <Box borderRadius="full" bg="blue.50" p={5} mb={2}>
                <Icon as={FiBookOpen} boxSize={8} color="blue.400" />
              </Box>
              <Text fontWeight="800" fontSize="xl" color="gray.800">
                No courses assigned yet
              </Text>
              <Text
                color={subduedText}
                textAlign="center"
                maxW="360px"
                lineHeight="1.7"
              >
                When a course is assigned directly or delivered through a batch,
                it'll appear here with progress and launch access.
              </Text>
            </Flex>
          ) : filteredCourses.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="24px"
              p={16}
              gap={4}
            >
              <Box borderRadius="full" bg="orange.50" p={5} mb={2}>
                <Icon as={FiSearch} boxSize={8} color="orange.400" />
              </Box>
              <Text fontWeight="800" fontSize="xl">
                No matches found
              </Text>
              <Text
                color={subduedText}
                textAlign="center"
                maxW="320px"
                lineHeight="1.7"
              >
                Try adjusting your search or switching the filter to explore
                your full library.
              </Text>
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
              {filteredCourses.map((course: any, index: number) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  index={index}
                  onOpen={handleOpenCourse}
                  cardBg={cardBg}
                  borderColor={borderColor}
                  subduedText={subduedText}
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
