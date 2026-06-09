'use client';

import stores from "@/app/store/stores";
import {
  Badge,
  Box,
  Button,
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
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBolt,
  FaLock,
  FaPlayCircle,
  FaSearch,
  FaUserGraduate
} from "react-icons/fa";

const MotionBox = motion(Box);

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();
  const isLearner = role === "user" || role === "manager" || /^l\d+-manager$/i.test(role);

  useEffect(() => {
    stores.courseStore.fetchPublicCourses().catch(() => undefined);
    if (isLearner) {
      stores.courseStore.fetchMyCourses().catch(() => undefined);
    }
  }, [isLearner]);

  const publicCourses = stores.courseStore.publicCourses || [];
  const assignedCourses = stores.courseStore.myCourses || [];
  const featuredPublicCourses = useMemo(() => publicCourses.slice(0, 4), [publicCourses]);
  const featuredAssignedCourses = useMemo(() => assignedCourses.slice(0, 2), [assignedCourses]);
  const avgRating = useMemo(() => {
    const ratedCourses = publicCourses.filter((course) => Number(course.metrics?.averageRating || 0) > 0);
    if (!ratedCourses.length) {
      return "New";
    }

    const average =
      ratedCourses.reduce((sum, course) => sum + Number(course.metrics?.averageRating || 0), 0) / ratedCourses.length;
    return average.toFixed(1);
  }, [publicCourses]);

  const bgMain = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const mutedBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const textPrimary = useColorModeValue("gray.800", "whiteAlpha.900");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const glassBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(15,23,42,0.76)");
  const subtleBorder = useColorModeValue("rgba(255,255,255,0.68)", "rgba(255,255,255,0.08)");
  const gridOverlayOpacity = useColorModeValue(0.08, 0.05);
  const glowOneOpacity = useColorModeValue(0.22, 0.16);
  const glowTwoOpacity = useColorModeValue(0.18, 0.14);
  const glowThreeOpacity = useColorModeValue(0.32, 0.1);
  const heroBaseBg = useColorModeValue(
    "linear-gradient(135deg, var(--chakra-colors-brand-50) 0%, #FFFFFF 42%, var(--chakra-colors-brand-100) 100%)",
    "linear-gradient(135deg, var(--chakra-colors-gray-900) 0%, var(--chakra-colors-gray-800) 48%, var(--chakra-colors-brand-900) 100%)"
  );
  const learnerPanelBg = useColorModeValue(
    "linear-gradient(135deg, var(--chakra-colors-brand-700) 0%, var(--chakra-colors-brand-500) 60%, var(--chakra-colors-brand-400) 100%)",
    "linear-gradient(135deg, var(--chakra-colors-brand-900) 0%, var(--chakra-colors-brand-700) 55%, var(--chakra-colors-brand-500) 100%)"
  );
  const [brand50, brand100, brand200, brand300, brand400, brand500, brand600, brand700, brand900] = useToken("colors", [
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

  const categoryChips = ["Design", "Engineering", "Leadership", "Compliance", "AI & Data"];
  const accentGradients = [
    `linear-gradient(135deg, ${brand600} 0%, ${brand400} 100%)`,
    `linear-gradient(135deg, ${brand500} 0%, ${brand300} 100%)`,
    `linear-gradient(135deg, ${brand700} 0%, ${brand500} 100%)`,
    `linear-gradient(135deg, ${brand400} 0%, ${brand200} 100%)`,
  ];
  const stats = [
    { label: "Public Courses", value: publicCourses.length || "0", accent: accentGradients[0] },
    { label: "Assigned to You", value: isLearner ? assignedCourses.length || "0" : "Live", accent: accentGradients[1] },
    { label: "Avg Rating", value: avgRating, accent: accentGradients[2] },
    {
      label: "Free Courses",
      value: publicCourses.filter((course) => course.commerce?.pricingModel === "free").length || "0",
      accent: accentGradients[3],
    },
  ];


  const handleExplore = () => {
    const query = searchQuery.trim();
    router.push(query ? `/course?search=${encodeURIComponent(query)}` : "/course");
  };

  return (
    <Box minH="100vh" bg={bgMain}>
      <Box as="section" position="relative" overflow="hidden" pb={{ base: 10, md: 20 }} bgImage={heroBaseBg}>
        <Box
          position="absolute"
          inset={0}
          opacity={gridOverlayOpacity}
          backgroundImage="linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)"
          backgroundSize={{ base: "28px 28px", md: "44px 44px" }}
          color={brand900}
        />
        <Circle
          size={{ base: "280px", md: "420px", xl: "520px" }}
          bg={brand400}
          opacity={glowOneOpacity}
          position="absolute"
          top={{ base: "-100px", md: "-120px" }}
          left={{ base: "-110px", md: "-80px" }}
          filter="blur(100px)"
        />
        <Circle
          size={{ base: "340px", md: "500px", xl: "620px" }}
          bg={brand500}
          opacity={glowTwoOpacity}
          position="absolute"
          top={{ base: "20px", md: "40px" }}
          right={{ base: "-180px", md: "-120px" }}
          filter="blur(100px)"
        />
        <Circle
          size={{ base: "260px", md: "360px", xl: "420px" }}
          bg={brand200}
          opacity={glowThreeOpacity}
          position="absolute"
          bottom={{ base: "-120px", md: "-160px" }}
          left={{ base: "35%", md: "30%" }}
          filter="blur(110px)"
        />

        <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }} position="relative" zIndex={1}>
          {/* <Flex align="center" justify="space-between" gap={4} pt={{ base: 5, md: 6 }} pb={{ base: 8, md: 10 }}>
            <HStack
              spacing={3}
              px={{ base: 3, md: 4 }}
              py={2}
              borderRadius="full"
              bg={navBg}
              borderWidth="1px"
              borderColor={subtleBorder}
              backdropFilter="blur(16px)"
              boxShadow="0 12px 35px rgba(15, 23, 42, 0.08)"
            >
              <Flex
                boxSize={{ base: "40px", md: "44px" }}
                borderRadius="xl"
                align="center"
                justify="center"
                bgGradient={`linear(to-br, ${brand700}, ${brand500})`}
                color="white"
                overflow="hidden"
              >
                {logoUrl ? (
                  <Image src={logoUrl} alt={appName} objectFit="contain" boxSize="70%" />
                ) : (
                  <Icon as={FaBolt} />
                )}
              </Flex>
              <Text fontWeight="900" fontSize={{ base: "md", md: "lg" }} color={textPrimary} letterSpacing="-0.02em">
                {appName}
              </Text>
            </HStack>

            <HStack
              spacing={2}
              display={{ base: "none", md: "flex" }}
              px={2}
              py={2}
              borderRadius="full"
              bg={navBg}
              borderWidth="1px"
              borderColor={subtleBorder}
              backdropFilter="blur(16px)"
            >
              {["Catalog", "For Teams", "Pricing", "Docs"].map((item) => (
                <Button key={item} variant="ghost" borderRadius="full" size="sm" color={textSecondary} _hover={{ bg: cardBg, color: brand700 }}>
                  {item}
                </Button>
              ))}
            </HStack>

            <HStack spacing={2}>
              <Button display={{ base: "none", sm: "inline-flex" }} variant="ghost" borderRadius="xl" color={textSecondary}>
                Sign in
              </Button>
              <Button borderRadius="xl" colorScheme="brand" onClick={() => router.push("/course")}>
                Get started
              </Button>
            </HStack>
          </Flex> */}

          <Grid templateColumns={{ base: "1fr", lg: "1.1fr 0.9fr" }} gap={{ base: 7, lg: 14 }} alignItems="center">
            <Box>
           

              <Heading
                as="h1"
                fontSize={{ base: "2xl", sm: "4xl", md: "5xl", xl: "6xl" }}
                fontWeight="extrabold"
                lineHeight={{ base: "1.08", md: "1.02" }}
                color={textPrimary}
                letterSpacing="-0.03em"
                maxW="16ch"
              >
                Learn, resume, and grow{" "}
                <Text as="span" bgGradient={`linear(to-r, ${brand700}, ${brand500}, ${brand300})`} bgClip="text">
                  faster
                </Text>
              </Heading>

              <Text fontSize={{ base: "sm", md: "xl" }} color={textSecondary} mt={5} maxW="2xl" lineHeight="1.8">
                Search the open catalog, compare pricing and course formats, and jump back into your private assignments
                all from one beautifully focused home.
              </Text>

              <Flex
                mt={{ base: 5, md: 8 }}
                p={2}
                bg={glassBg}
                borderRadius={{ base: "xl", md: "2xl" }}
                borderWidth="1px"
                borderColor={subtleBorder}
                backdropFilter="blur(20px)"
                boxShadow={{ base: "0 10px 26px rgba(15, 23, 42, 0.08)", md: "0 12px 60px rgba(15, 23, 42, 0.12)" }}
                gap={2}
                direction={{ base: "column", sm: "row" }}
                align="center"
                maxW={{ base: "100%", md: "720px" }}
              >
                <Flex align="center" gap={{ base: 2, md: 3 }} px={{ base: 3, md: 4 }} flex="1" minW={0} w="full">
                  <Icon as={FaSearch} color={brand500} />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search courses, topics, instructors..."
                    border="none"
                    h={{ base: "40px", md: "50px" }}
                    fontSize={{ base: "sm", md: "md" }}
                    _focusVisible={{ boxShadow: "none" }}
                    px={0}
                  />
                </Flex>
                <Button
                  colorScheme="brand"
                  borderRadius={{ base: "lg", md: "xl" }}
                  h={{ base: "40px", md: "50px" }}
                  w={{ base: "100%", sm: "auto" }}
                  px={{ base: 4, md: 8 }}
                  rightIcon={<FaArrowRight />}
                  fontSize={{ base: "sm", md: "md" }}
                  bgGradient={`linear(to-r, ${brand700}, ${brand500}, ${brand400})`}
                  boxShadow={`0 18px 34px ${brand100}`}
                  _hover={{ bgGradient: `linear(to-r, ${brand700}, ${brand600}, ${brand500})`, transform: "translateY(-1px)" }}
                  onClick={handleExplore}
                >
                  Explore
                </Button>
              </Flex>

              <HStack spacing={2} mt={5} flexWrap="wrap">
                {categoryChips.map((item) => (
                  <Button
                    key={item}
                    size="sm"
                    variant="ghost"
                    borderRadius="full"
                    bg={glassBg}
                    color={textSecondary}
                    borderWidth="1px"
                    borderColor={borderColor}
                    _hover={{ color: brand700, borderColor: brand200, bg: cardBg }}
                  >
                    {item}
                  </Button>
                ))}
              </HStack>

         
            </Box>

            <Stack spacing={5} display={{ base: "none", lg: "flex" }}>
         

              {isLearner && featuredAssignedCourses.length > 0 ? (
                <MotionBox
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.12 }}
                  bgImage={learnerPanelBg}
                  borderRadius="3xl"
                  position="relative"
                  overflow="hidden"
                  p={5}
                  color="white"
                  boxShadow="0 28px 70px rgba(15, 23, 42, 0.22)"
                >
                  <Circle
                    size="180px"
                    position="absolute"
                    top="-60px"
                    right="-40px"
                    bg={brand200}
                    opacity={0.28}
                    filter="blur(40px)"
                  />
                  <HStack justify="space-between" mb={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.12em" fontWeight="700">
                        Assigned Courses
                      </Text>
                      <Heading size="md">Resume your learning</Heading>
                    </VStack>
                    <Circle size="42px" bg="whiteAlpha.200">
                      <Icon as={FaLock} />
                    </Circle>
                  </HStack>

                  <Stack spacing={3}>
                    {featuredAssignedCourses.map((course) => (
                      <Box
                        key={course.courseId}
                        p={4}
                        borderRadius="2xl"
                        bg="whiteAlpha.100"
                        border="1px solid rgba(255,255,255,0.12)"
                      >
                        <Flex justify="space-between" gap={3} align="start">
                          <Box flex="1">
                            <Text fontWeight="700">{course.title}</Text>
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
                            <Text fontSize="sm" color="whiteAlpha.700" mt={1.5}>
                              {Math.round(Number(course.progress || 0))}% complete
                            </Text>
                          </Box>
                          <Button
                            size="sm"
                            leftIcon={<FaPlayCircle />}
                            bg="white"
                            color={brand700}
                            borderRadius="full"
                            _hover={{ bg: brand50 }}
                            onClick={() => router.push(`/course?courseId=${course.courseId}`)}
                          >
                            Continue
                          </Button>
                        </Flex>
                      </Box>
                    ))}
                  </Stack>
                </MotionBox>
              ) : null}
            </Stack>
          </Grid>
        </Box>
      </Box>

      <Box as="section" py={{ base: 10, md: 20 }} bg={mutedBg}>
        <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }}>
          <Flex justify="space-between" align="flex-end" mb={{ base: 5, md: 10 }} flexWrap="wrap" gap={4}>
            <VStack align="start" spacing={2}>
              <Badge bg={brand50} color={brand700} borderRadius="full" px={3} py={1}>
                Explore Public Courses
              </Badge>
              <Heading size={{ base: "md", md: "xl" }} color={textPrimary}>
                Courses to start{" "}
                <Text as="span" bgGradient={`linear(to-r, ${brand500}, ${brand300})`} bgClip="text">
                  right now
                </Text>
              </Heading>
              <Text color={textSecondary}>
                Public courses stay open to everyone, while private assignments remain visible for your signed-in learners.
              </Text>
            </VStack>
            <Button
              size={{ base: "sm", md: "md" }}
              variant="outline"
              borderColor={brand200}
              color={brand700}
              rightIcon={<FaArrowRight />}
              _hover={{ bg: brand50, borderColor: brand400 }}
              onClick={() => router.push("/course")}
            >
              Browse
            </Button>
          </Flex>

          {stores.courseStore.isPublicCoursesLoading ? (
            <HStack justify="center" py={14}>
              <Spinner color={brand500} />
              <Text color={textSecondary}>Loading course highlights...</Text>
            </HStack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={{ base: 4, md: 6 }}>
              {featuredPublicCourses.map((course, index) => (
                <MotionBox
                  key={course._id}
                  whileHover={{ y: -8 }}
                  bg={cardBg}
                  borderRadius={{ base: "xl", md: "3xl" }}
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor={borderColor}
                  boxShadow="0 18px 45px rgba(15, 23, 42, 0.07)"
                >
                  {course.thumbnailUrl ? (
                    <Image src={course.thumbnailUrl} alt={course.title} h={{ base: "124px", md: "180px" }} w="full" objectFit="cover" />
                  ) : (
                    <Flex h={{ base: "124px", md: "180px" }} bgImage={accentGradients[index % accentGradients.length]} align="center" justify="center" color="white">
                      <Icon as={FaBolt} boxSize={8} opacity={0.92} />
                    </Flex>
                  )}
                  <Box p={{ base: 4, md: 5 }}>
                    <HStack spacing={2} flexWrap="wrap" mb={3}>
                      <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                        Public
                      </Badge>
                      <Badge bg={brand50} color={brand700} borderRadius="full" px={3} py={1}>
                        {course.taxonomy?.level || "Beginner"}
                      </Badge>
                    </HStack>
                    <Heading size="sm" minH={{ base: "auto", md: "42px" }} color={textPrimary} noOfLines={2}>
                      {course.title}
                    </Heading>
                    <Text mt={2} fontSize="sm" color={textSecondary} noOfLines={2}>
                      {course.description?.text || "Open this course to inspect pricing, curriculum, and enrollment options."}
                    </Text>

                    <Flex justify="space-between" align="center" mt={4} pt={4} borderTopWidth="1px" borderColor={borderColor}>
                      <Text fontWeight="800" bgGradient={`linear(to-r, ${brand700}, ${brand500})`} bgClip="text">
                        {formatCurrency(course.commerce?.amountInRupees)}
                      </Text>
                      <HStack spacing={1}>
                        <Icon as={FaUserGraduate} color={brand500} />
                        <Text fontSize="sm" color={textSecondary}>
                          {course.metrics?.popularityScore || 0} learners
                        </Text>
                      </HStack>
                    </Flex>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>
    </Box>
  );
});
