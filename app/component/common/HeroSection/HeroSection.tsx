"use client";

import { CourseCarousel } from "@/app/(main)/course/component/CourseCarousel";
import stores from "@/app/store/stores";
import {
  Badge,
  Box,
  Button,
  Center,
  Circle,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Progress,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToken,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  InfinityIcon,
  Lock,
  ShieldCheck,
  Smartphone,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaLock,
  FaPlayCircle,
  FaSearch,
  FaStar,
  FaTrophy
} from "react-icons/fa";
import {
  FiBriefcase,
  FiCode,
  FiGrid,
  FiPenTool,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import LandingHero from "./LandingHero";
import ContinueLearningSection from "./ContinueLearningSection";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const MotionFlex = motion(Flex);
const MotionCircle = motion(Circle);
const categories = [
  { label: "All" },
  { label: "Development" },
  { label: "Design" },
  { label: "Business" },
  { label: "Marketing" },
  { label: "Leadership" },
];
const getCategoryTheme = (label: string = "") => {
  const key = label.toLowerCase();
  if (key === "all") return { icon: FiGrid, bg: "#F1F3F5", color: "#495057" };
  if (key.includes("dev"))
    return { icon: FiCode, bg: "#E3F2FD", color: "#1971C2" };
  if (key.includes("design"))
    return { icon: FiPenTool, bg: "#FCE4EC", color: "#D6336C" };
  if (key.includes("business"))
    return { icon: FiBriefcase, bg: "#E6FCF5", color: "#0B7A5A" };
  if (key.includes("market"))
    return { icon: FiTarget, bg: "#FFF3E0", color: "#E8590C" };
  if (key.includes("lead"))
    return { icon: FiTrendingUp, bg: "#F3E8FF", color: "#8B2FC9" };
  return { icon: FiGrid, bg: "gray.100", color: "gray.600" };
};
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    quote:
      "LearnHub completely changed how I approach design. The courses feel handcrafted, not mass-produced.",
    avatar: "SC",
    bg: "bg-purple-100 text-purple-700",
  },
  {
    name: "Marcus Rivera",
    role: "Frontend Engineer",
    quote:
      "I got promoted within six months of finishing the web dev track. The instructors actually care.",
    avatar: "MR",
    bg: "bg-blue-100 text-blue-700",
  },
  {
    name: "Aisha Okafor",
    role: "Marketing Lead",
    quote:
      "The pacing is perfect and the community keeps me accountable. I look forward to my study sessions.",
    avatar: "AO",
    bg: "bg-emerald-100 text-emerald-700",
  },
];

function formatCurrency(value?: number | null) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export default observer(function LMSLandingPage() {
  // inside your component:
  const [activeCat, setActiveCat] = useState("All");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const role = String(
    stores.auth.userType || stores.auth.user?.role || "",
  ).toLowerCase();
  const isLearner =
    role === "user" || role === "manager" || /^l\d+-manager$/i.test(role);

  useEffect(() => {
    stores.courseStore.fetchPublicCourses().catch(() => undefined);
    if (isLearner) {
      stores.courseStore.fetchMyCourses().catch(() => undefined);
    }
  }, [isLearner]);

  const publicCourses = stores.courseStore.publicCourses || [];
  const assignedCourses = stores.courseStore.myCourses || [];
  const enrolledCourseIds = useMemo(() => {
    return new Set(
      (stores.courseStore.myCourses || []).map((course) =>
        String(course.courseId || "").trim(),
      ),
    );
  }, [stores.courseStore.myCourses]);
  const featuredPublicCourses = useMemo(
    () => publicCourses.slice(0, 4),
    [publicCourses],
  );
  const featuredAssignedCourses = useMemo(
    () => assignedCourses.slice(0, 2),
    [assignedCourses],
  );
  const avgRating = useMemo(() => {
    const ratedCourses = publicCourses.filter(
      (course) => Number(course.metrics?.averageRating || 0) > 0,
    );
    if (!ratedCourses.length) {
      return "New";
    }

    const average =
      ratedCourses.reduce(
        (sum, course) => sum + Number(course.metrics?.averageRating || 0),
        0,
      ) / ratedCourses.length;
    return average.toFixed(1);
  }, [publicCourses]);
  const heroHighlights = useMemo(
    () => [
      { label: "Public courses", value: publicCourses.length || "120+" },
      { label: "Avg. rating", value: avgRating },
      { label: "For teams", value: "Private paths" },
    ],
    [avgRating, publicCourses.length],
  );

  const bgMain = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const mutedBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const textPrimary = useColorModeValue("gray.800", "whiteAlpha.900");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const glassBg = useColorModeValue(
    "rgba(255,255,255,0.8)",
    "rgba(15,23,42,0.76)",
  );
  const subtleBorder = useColorModeValue(
    "rgba(255,255,255,0.68)",
    "rgba(255,255,255,0.08)",
  );
  const gridOverlayOpacity = useColorModeValue(0.08, 0.05);
  const glowOneOpacity = useColorModeValue(0.22, 0.16);
  const glowTwoOpacity = useColorModeValue(0.18, 0.14);
  const glowThreeOpacity = useColorModeValue(0.32, 0.1);
  const heroBaseBg = useColorModeValue(
    "linear-gradient(135deg, var(--chakra-colors-brand-50) 0%, #FFFFFF 42%, var(--chakra-colors-brand-100) 100%)",
    "linear-gradient(135deg, var(--chakra-colors-gray-900) 0%, var(--chakra-colors-gray-800) 48%, var(--chakra-colors-brand-900) 100%)",
  );
  const learnerPanelBg = useColorModeValue(
    "linear-gradient(135deg, var(--chakra-colors-brand-700) 0%, var(--chakra-colors-brand-500) 60%, var(--chakra-colors-brand-400) 100%)",
    "linear-gradient(135deg, var(--chakra-colors-brand-900) 0%, var(--chakra-colors-brand-700) 55%, var(--chakra-colors-brand-500) 100%)",
  );
  const [
    brand50,
    brand100,
    brand200,
    brand300,
    brand400,
    brand500,
    brand600,
    brand700,
    brand900,
  ] = useToken("colors", [
    "brand.50",
    "brand.100",
    "brand.200",
    "brand.300",
    "brand.400",
    "brand.500",
    "brand.600",
    "brand.700",
    "brand.900",
  ]);

  const categoryChips = [
    "Design",
    "Engineering",
    "Leadership",
    "Compliance",
    "AI & Data",
  ];
  const accentGradients = [
    `linear-gradient(135deg, ${brand600} 0%, ${brand400} 100%)`,
    `linear-gradient(135deg, ${brand500} 0%, ${brand300} 100%)`,
    `linear-gradient(135deg, ${brand700} 0%, ${brand500} 100%)`,
    `linear-gradient(135deg, ${brand400} 0%, ${brand200} 100%)`,
  ];

  const handleExplore = () => {
    const query = searchQuery.trim();
    router.push(
      query ? `/course?search=${encodeURIComponent(query)}` : "/course",
    );
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  function Stat({
    icon,
    bg,
    value,
    label,
  }: {
    icon: React.ReactNode;
    bg: string;
    value: string;
    label: string;
  }) {
    return (
      <div className="flex items-center gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-full ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-black">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    );
  }

  function Perk({
    icon,
    title,
    sub,
  }: {
    icon: React.ReactNode;
    title: string;
    sub: string;
  }) {
    return (
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      </div>
    );
  }

  return (
    <Box minH="100vh" bg={bgMain}>

      <>
 <LandingHero
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  onExplore={handleExplore}
  transitionInterval={6500}
  slides={[
    {
      backgroundImage: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      illustration: "/images/hero/learning-books.png",
      floatingTitle: "Discover new courses",
      floatingText: "Find your next skill",
      statValue: "120+ courses",
      statLabel: "Across multiple categories",
    },
    {
      backgroundImage: "https://images.unsplash.com/photo-1758873272955-3b066dd11c6b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODJ8fG9ubGluZSUyMGNvdXJzZXN8ZW58MHx8MHx8fDA%3D",
      illustration: "/images/hero/online-learning.png",
      floatingTitle: "Learn from anywhere",
      floatingText: "Continue across devices",
      statValue: "Self-paced",
      statLabel: "Learning that fits your day",
    },
    {
      backgroundImage: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fG9ubGluZSUyMGNvdXJzZXN8ZW58MHx8MHx8fDA%3D",
      illustration: "/images/hero/certificate-growth.png",
      floatingTitle: "Reach your goals",
      floatingText: "Complete courses and grow",
      statValue: "Progress tracking",
      statLabel: "See how far you have come",
    },
  ]}
/>

  {isLearner && featuredAssignedCourses.length > 0 ? (
    <ContinueLearningSection
      courses={featuredAssignedCourses}
      onContinue={(course) =>
        router.push(`/course?courseId=${course.courseId}`)
      }
      onViewAll={() => router.push("/course")}
    />
  ) : null}
</>
      {/* <Box
        as="section"
        position="relative"
        overflow="hidden"
        bgImage={heroBaseBg}
        pb={{ base: 4, md: 8 }}
        borderBottomWidth="1px"
        borderColor={subtleBorder}
      >
        <MotionCircle
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          size={{ base: "180px", md: "300px" }}
          bg={brand400}
          opacity={glowOneOpacity}
          position="absolute"
          top={{ base: "-70px", md: "-100px" }}
          left={{ base: "-70px", md: "-60px" }}
          filter="blur(70px)"
          pointerEvents="none"
        />
        <MotionCircle
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          size={{ base: "200px", md: "340px" }}
          bg={brand500}
          opacity={glowTwoOpacity}
          position="absolute"
          top={{ base: "10px", md: "30px" }}
          right={{ base: "-100px", md: "-100px" }}
          filter="blur(80px)"
          pointerEvents="none"
        />
        <Circle
          size={{ base: "150px", md: "240px" }}
          bg={brand200}
          opacity={glowThreeOpacity}
          position="absolute"
          bottom={{ base: "-70px", md: "-110px" }}
          left={{ base: "35%", md: "30%" }}
          filter="blur(80px)"
          pointerEvents="none"
        />

        <Box
          maxW="full"
          mx="auto"
          px={{ base: 4, md: 8 }}
          py={{ base: 4, md: 8 }}
          position="relative"
          zIndex={1}
        >
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={{ base: 8, lg: 16 }}
            alignItems="center"
          >
            <VStack
              align="start"
              spacing={{ base: 3, md: 4 }}
              maxW="2xl"
              ml={{ lg: "60px" }}
            >
              <Badge
                bg={glassBg}
                color={brand700}
                borderRadius="full"
                px={3}
                py={1}
                borderWidth="1px"
                borderColor={subtleBorder}
                fontSize="10px"
                textTransform="uppercase"
                letterSpacing="0.08em"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={FaBolt} boxSize={2.5} />
                Learning platform
              </Badge>

              <Heading
                as="h1"
                fontSize={{ base: "1.7rem", sm: "2rem", md: "2.6rem" }}
                fontWeight="extrabold"
                lineHeight="1.1"
                color={textPrimary}
                letterSpacing="-0.03em"
              >
                Learn &amp; grow{" "}
                <Text
                  as="span"
                  bgGradient={`linear(to-r, ${brand700}, ${brand500}, ${brand300})`}
                  bgClip="text"
                >
                  faster
                </Text>
              </Heading>

              <Text
                display={{ base: "none", sm: "block" }}
                fontSize={{ sm: "xs", md: "sm" }}
                color={textSecondary}
                maxW="38ch"
                lineHeight="1.7"
              >
                Discover courses, compare formats, and jump back into your
                assignments all in one place.
              </Text>

              <Flex
                w="full"
                maxW={{ base: "100%", md: "560px" }}
                p={1.5}
                bg={glassBg}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={subtleBorder}
                backdropFilter="blur(20px)"
                gap={2}
                align="center"
              >
                <Flex align="center" gap={2} px={3} flex="1" minW={0}>
                  <Icon
                    as={FaSearch}
                    color={brand500}
                    boxSize={3.5}
                    flexShrink={0}
                  />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search courses, topics..."
                    border="none"
                    h="36px"
                    fontSize="sm"
                    _focusVisible={{ boxShadow: "none" }}
                    px={0}
                  />
                </Flex>
                <Button
                  colorScheme="brand"
                  borderRadius="lg"
                  h={{ base: "32px", md: "36px" }}
                  px={4}
                  fontSize="sm"
                  rightIcon={<FaArrowRight size={11} />}
                  bgGradient={`linear(to-r, ${brand700}, ${brand500}, ${brand400})`}
                  _hover={{
                    bgGradient: `linear(to-r, ${brand700}, ${brand600}, ${brand500})`,
                    transform: "translateY(-1px)",
                  }}
                  onClick={handleExplore}
                  flexShrink={0}
                >
                  Explore
                </Button>
              </Flex>

              <SimpleGrid
                columns={{ base: 1, sm: 3 }}
                spacing={4}
                w="full"
                maxW={{ base: "100%", md: "560px" }}
                pt={2}
                display={{ base: "none", md: "grid" }}
              >
                {[
                  {
                    icon: FaClock,
                    title: "Learn at your pace",
                    sub: "Anytime, anywhere",
                  },
                  {
                    icon: FaGraduationCap,
                    title: "Expert instructors",
                    sub: "Industry pros",
                  },
                  {
                    icon: FaTrophy,
                    title: "Certificates",
                    sub: "Boost your CV",
                  },
                ].map((f) => (
                  <HStack key={f.title} align="start" spacing={2}>
                    <Circle size="32px" bg={brand50 || glassBg} flexShrink={0}>
                      <Icon as={f.icon} color={brand500} boxSize={3.5} />
                    </Circle>
                    <Box>
                      <Text fontSize="xs" fontWeight="700" color={textPrimary}>
                        {f.title}
                      </Text>
                      <Text fontSize="10px" color={textSecondary}>
                        {f.sub}
                      </Text>
                    </Box>
                  </HStack>
                ))}
              </SimpleGrid>

              {isLearner && featuredAssignedCourses.length > 0 ? (
                <Box
                  display={{ base: "block", lg: "none" }}
                  w="full"
                  maxW={{ base: "100%", md: "560px" }}
                  bg={glassBg}
                  borderWidth="1px"
                  borderColor={subtleBorder}
                  borderRadius="xl"
                  p={3}
                  backdropFilter="blur(16px)"
                >
                  <HStack justify="space-between" mb={3}>
                    <Text
                      fontSize="10px"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                      fontWeight="700"
                      color={textSecondary}
                    >
                      Resume learning
                    </Text>
                    <Icon as={FaLock} color={brand500} boxSize={3} />
                  </HStack>
                  <Stack spacing={2}>
                    {featuredAssignedCourses.map((course) => (
                      <Flex
                        key={course.courseId}
                        align="center"
                        gap={3}
                        bg={cardBg}
                        borderWidth="1px"
                        borderColor={subtleBorder}
                        borderRadius="lg"
                        p={2.5}
                      >
                        <Box flex="1" minW={0}>
                          <Text
                            fontWeight="700"
                            fontSize="xs"
                            noOfLines={1}
                            color={textPrimary}
                          >
                            {course.title}
                          </Text>
                          <Progress
                            value={Math.round(Number(course.progress || 0))}
                            size="xs"
                            mt={1.5}
                            borderRadius="full"
                            bg="blackAlpha.100"
                            sx={{
                              "& > div": {
                                background: `linear-gradient(90deg, ${brand700}, ${brand300})`,
                              },
                            }}
                          />
                          <Text fontSize="10px" color={textSecondary} mt={1}>
                            {Math.round(Number(course.progress || 0))}% complete
                          </Text>
                        </Box>
                        <Button
                          size="xs"
                          leftIcon={<FaPlayCircle size={10} />}
                          colorScheme="brand"
                          borderRadius="full"
                          flexShrink={0}
                          bgGradient={`linear(to-r, ${brand700}, ${brand500})`}
                          _hover={{
                            bgGradient: `linear(to-r, ${brand700}, ${brand600})`,
                          }}
                          onClick={() =>
                            router.push(`/course?courseId=${course.courseId}`)
                          }
                        >
                          Continue
                        </Button>
                      </Flex>
                    ))}
                  </Stack>
                </Box>
              ) : null}
            </VStack>

            {isLearner && featuredAssignedCourses.length > 0 ? (
              <Box display={{ base: "none", lg: "block" }}>
                <Box
                  bgImage={learnerPanelBg}
                  borderRadius="2xl"
                  position="relative"
                  overflow="hidden"
                  p={4}
                  color="white"
                  boxShadow="0 20px 48px rgba(15, 23, 42, 0.18)"
                >
                  <Circle
                    size="140px"
                    position="absolute"
                    top="-50px"
                    right="-30px"
                    bg={brand200}
                    opacity={0.25}
                    filter="blur(36px)"
                    pointerEvents="none"
                  />
                  <HStack justify="space-between" mb={4}>
                    <VStack align="start" spacing={0.5}>
                      <Text
                        fontSize="9px"
                        color="whiteAlpha.700"
                        textTransform="uppercase"
                        letterSpacing="0.12em"
                        fontWeight="700"
                      >
                        Assigned courses
                      </Text>
                      <Text fontSize="sm" fontWeight="700">
                        Resume your learning
                      </Text>
                    </VStack>
                    <Circle size="32px" bg="whiteAlpha.200">
                      <Icon as={FaLock} boxSize={3} />
                    </Circle>
                  </HStack>
                  <Stack spacing={2.5}>
                    {featuredAssignedCourses.map((course) => (
                      <Box
                        key={course.courseId}
                        p={3}
                        borderRadius="xl"
                        bg="whiteAlpha.100"
                        border="1px solid rgba(255,255,255,0.12)"
                      >
                        <Flex justify="space-between" gap={2.5} align="start">
                          <Box flex="1" minW={0}>
                            <Text fontWeight="700" fontSize="sm" noOfLines={2}>
                              {course.title}
                            </Text>
                            <Progress
                              value={Math.round(Number(course.progress || 0))}
                              size="xs"
                              mt={2}
                              borderRadius="full"
                              bg="whiteAlpha.200"
                              sx={{
                                "& > div": {
                                  background: `linear-gradient(90deg, ${brand50}, ${brand300})`,
                                },
                              }}
                            />
                            <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                              {Math.round(Number(course.progress || 0))}%
                              complete
                            </Text>
                          </Box>
                          <Button
                            size="sm"
                            leftIcon={<FaPlayCircle size={12} />}
                            bg="white"
                            color={brand700}
                            borderRadius="full"
                            flexShrink={0}
                            fontSize="xs"
                            _hover={{ bg: brand50 }}
                            onClick={() =>
                              router.push(`/course?courseId=${course.courseId}`)
                            }
                          >
                            Continue
                          </Button>
                        </Flex>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            ) : (
              <Box
                display={{ base: "none", lg: "block" }}
                position="relative"
                maxW="md"
                mx="auto"
              >
                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src="/images/heroimg-Photoroom.png"
                    alt="Graduation cap on stack of books"
                    w="full"
                    filter="drop-shadow(0 20px 30px rgba(0,0,0,0.15))"
                  />
                </motion.div>

                <Box
                  position="absolute"
                  left="-6%"
                  top="14%"
                  zIndex={2}
                  bg="whiteAlpha.900"
                  borderRadius="xl"
                  p={3}
                  boxShadow="lg"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Circle size="32px" bg="green.100">
                    <Icon as={FaCheckCircle} color="green.600" boxSize={3.5} />
                  </Circle>
                  <Box>
                    <Text fontSize="xs" fontWeight="700">
                      Course completed
                    </Text>
                    <Text fontSize="10px" color={textSecondary}>
                      +50 XP earned
                    </Text>
                  </Box>
                </Box>

                <Box
                  position="absolute"
                  right="-8%"
                  bottom="10%"
                  zIndex={2}
                  bg="whiteAlpha.900"
                  borderRadius="xl"
                  p={3}
                  boxShadow="lg"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Circle size="32px" bg="amber.100">
                    <Icon as={FaStar} color="amber.500" boxSize={3.5} />
                  </Circle>
                  <Box>
                    <Text fontSize="xs" fontWeight="700">
                      4.9 average
                    </Text>
                    <Text fontSize="10px" color={textSecondary}>
                      from 12k reviews
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}
          </Grid>

          <div className="relative mx-auto hidden max-w-7xl px-6 pt-10 pb-6 lg:block">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 gap-2 rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-xl shadow-blue-500/5 backdrop-blur md:grid-cols-4 md:gap-6 md:p-8"
            >
              <Stat
                icon={<BookOpen className="h-6 w-6 text-purple-500" />}
                bg="bg-purple-100"
                value="120+"
                label="Courses"
              />
              <Stat
                icon={<Star className="h-6 w-6 text-amber-500" />}
                bg="bg-amber-100"
                value="4.8"
                label="Average Rating"
              />
              <Stat
                icon={<Users className="h-6 w-6 text-emerald-500" />}
                bg="bg-emerald-100"
                value="10K+"
                label="Learners"
              />
              <Stat
                icon={<Trophy className="h-6 w-6 text-blue-500" />}
                bg="bg-blue-100"
                value="50+"
                label="Categories"
              />
            </motion.div>
          </div>
        </Box>
      </Box> */}

      <Box as="section" py={{ base: 8, md: 20 }}>
        <Box maxW="full" mx="auto" px={{ base: 4, md: 8 }}>
          <Box maxW="full" mx="auto">
            {/* Header */}
            <MotionFlex
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              gap={5}
              mb={{ base: 6, md: 10 }}
            >
              <VStack align="start" spacing={2}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  letterSpacing="0.2em"
                  color={brand600}
                  textTransform="uppercase"
                >
                  Explore Courses
                </Text>

                <Heading
                  fontSize={{ base: "xl", sm: "2xl", md: "4xl" }}
                  fontWeight="black"
                  letterSpacing="-0.03em"
                  color={textPrimary}
                >
                  Start learning{" "}
                  <Text as="span" color={brand600}>
                    today
                  </Text>
                </Heading>

                <Text
                  color={textSecondary}
                  maxW="420px"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  Browse popular public courses handpicked for you.
                </Text>
              </VStack>

              <Button
                role="group"
                size={{ base: "md", md: "md" }}
                w={{ base: "full", md: "auto" }}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                bg="white"
                color={textPrimary}
                fontWeight="600"
                px={6}
                boxShadow="sm"
                flexShrink={0}
                _hover={{
                  bg: brand50,
                  borderColor: brand200,
                  color: brand700,
                }}
                rightIcon={
                  <Icon
                    as={FaArrowRight}
                    transition="transform .2s"
                    _groupHover={{ transform: "translateX(4px)" }}
                  />
                }
                onClick={() => router.push("/course")}
              >
                Browse all courses
              </Button>
            </MotionFlex>

            {/* Categories */}
            <Box
              overflowX="auto"
              sx={{
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
              mx={{ base: -4, md: 0 }}
              px={{ base: 4, md: 0 }}
              py={2}
              mb={{ base: 4, md: 8 }}
            >
              {/* MOBILE: icon-buttons */}
              <HStack
                spacing={5}
                display={{ base: "flex", md: "none" }}
                w="max-content"
              >
                {categories.map((cat) => {
                  const isActive = activeCat === cat.label;
                  const theme = getCategoryTheme(cat.label);

                  return (
                    <VStack
                      key={cat.label}
                      spacing={2}
                      flexShrink={0}
                      w="68px"
                      cursor="pointer"
                      onClick={() => setActiveCat(cat.label)}
                    >
                      <Center
                        w="56px"
                        h="56px"
                        borderRadius="2xl"
                        bg={theme.bg}
                        boxShadow={
                          isActive ? `0 0 0 2px ${theme.color}` : "none"
                        }
                        transition="all 0.2s ease"
                      >
                        <Icon as={theme.icon} boxSize={5} color={theme.color} />
                      </Center>
                      <Text
                        fontSize="xs"
                        fontWeight={isActive ? "700" : "600"}
                        color={isActive ? "gray.800" : "gray.500"}
                        textAlign="center"
                        noOfLines={1}
                      >
                        {cat.label}
                      </Text>
                    </VStack>
                  );
                })}
              </HStack>

              {/* DESKTOP: pill buttons (unchanged) */}
              <HStack
                spacing={3}
                flexWrap="wrap"
                display={{ base: "none", md: "flex" }}
              >
                {categories.map((cat) => {
                  const isActive = activeCat === cat.label;
                  return (
                    <Button
                      key={cat.label}
                      size="sm"
                      flexShrink={0}
                      borderRadius="full"
                      px={5}
                      h="40px"
                      fontWeight="600"
                      bg={isActive ? "gray.900" : "gray.100"}
                      color={isActive ? "white" : "gray.600"}
                      boxShadow={
                        isActive ? "0 6px 16px rgba(15,23,42,.18)" : "none"
                      }
                      _hover={{ bg: isActive ? "gray.900" : "gray.200" }}
                      onClick={() => setActiveCat(cat.label)}
                    >
                      {cat.label}
                    </Button>
                  );
                })}
              </HStack>
            </Box>

            {/* Courses */}
            {stores.courseStore.isPublicCoursesLoading ? (
              <HStack justify="center" py={16}>
                <Spinner color={brand500} />
                <Text color={textSecondary}>Loading course highlights...</Text>
              </HStack>
            ) : (
              <CourseCarousel
                courses={featuredPublicCourses}
                enrolledCourseIds={enrolledCourseIds}
                router={router}
              />
            )}
          </Box>
        </Box>
      </Box>
      {/* Testimonials */}
      <section className="px-16 py-16">
        <VStack align="start" spacing={2}>
          <Text
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="0.2em"
            color={brand600}
            textTransform="uppercase"
          >
            LOVED BY LEARNERS
          </Text>

          <Heading
            fontSize={{ base: "xl", sm: "2xl", md: "4xl" }}
            fontWeight="black"
            letterSpacing="-0.03em"
            color={textPrimary}
          >
            Real stories,{" "}
            <Text as="span" color={brand600}>
              real progress
            </Text>
          </Heading>
        </VStack>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.figure
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="relative flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-slate-700">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${t.bg}`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </section>

      {/* Dashboard promo */}
      <section className="px-16 pb-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative grid gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-blue-50/60 to-purple-50 p-8 md:grid-cols-2 md:p-12"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold tracking-[0.2em] text-blue-600">
              YOUR DASHBOARD
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Learn. Track. Achieve.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-slate-600">
              Your personalized dashboard helps you track progress, earn
              certificates, and stay motivated.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              {[
                "Personalized learning paths",
                "Weekly progress reports",
                "Shareable certificates",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {f}
                </li>
              ))}
            </ul>
            <button className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-transform hover:-translate-y-0.5">
              Create your free account{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="relative grid gap-4 sm:grid-cols-2">
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
            >
              <p className="text-xs font-semibold text-slate-500">
                My Progress
              </p>
              <div className="mt-4 grid place-items-center">
                <motion.div
                  initial={{ rotate: -90, opacity: 0 }}
                  whileInView={{ rotate: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative grid h-28 w-28 place-items-center rounded-full"
                  style={{
                    background: "conic-gradient(#3b82f6 75%, #e5e7eb 0)",
                  }}
                >
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-lg font-black">
                    75%
                  </div>
                </motion.div>
                <p className="mt-3 text-xs text-slate-500">Keep learning!</p>
              </div>
            </motion.div>
            <div className="flex flex-col gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <p className="text-[11px] font-semibold text-slate-500">
                  In Progress
                </p>
                <p className="mt-1 text-sm font-bold">UI/UX Design Basics</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "60%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    />
                  </div>
                  <span className="text-xs font-semibold">60%</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <p className="text-[11px] font-semibold text-slate-500">
                  Recent Achievement
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-100">
                    <Trophy className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      Design Fundamentals Certificate
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Earned on May 24, 2025
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className=" px-12 pb-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 p-10 text-center md:p-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.35),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.3),transparent_50%)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
              Ready to invest in{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                yourself?
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-slate-300">
              Join thousands of learners levelling up their careers with
              LearnHub every day.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-transform hover:-translate-y-0.5">
                Get started free
              </button>
              <button className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Talk to sales
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer perks */}
      <section className="px-16 pb-12">
        <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-10 md:grid-cols-4">
          <Perk
            icon={<ShieldCheck className="h-5 w-5 text-slate-500" />}
            title="14-Day Money Back"
            sub="Learn with confidence"
          />
          <Perk
            icon={<InfinityIcon className="h-5 w-5 text-slate-500" />}
            title="Lifetime Access"
            sub="Yours to keep forever"
          />
          <Perk
            icon={<Lock className="h-5 w-5 text-slate-500" />}
            title="Secure Payments"
            sub="100% secure checkout"
          />
          <Perk
            icon={<Smartphone className="h-5 w-5 text-slate-500" />}
            title="Mobile Friendly"
            sub="Learn on the go"
          />
        </div>
      </section>
    </Box>
  );
});
