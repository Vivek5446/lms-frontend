'use client';

import stores from "@/app/store/stores";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaBookOpen,
  FaCheckCircle,
  FaGlobe,
  FaLock,
  FaSearch,
  FaStar,
  FaUserGraduate,
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

  const bgMain = useColorModeValue('white', 'gray.900');
  const heroBg = useColorModeValue(
    "linear-gradient(135deg, var(--chakra-colors-blue-50) 0%, var(--chakra-colors-blue-100) 45%, var(--chakra-colors-blue-200) 100%)",
    "linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, var(--chakra-colors-blue-900) 100%)"
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const mutedBg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textPrimary = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  const handleExplore = () => {
    const query = searchQuery.trim();
    router.push(query ? `/course?search=${encodeURIComponent(query)}` : "/course");
  };

  return (
    <Box minH="100vh" bg={bgMain}>
      <Box
        as="section"
        position="relative"
        overflow="hidden"
        pt={{ base: 4, md: '72px' }}
        pb={{ base: 6, md: '84px' }}
        bgImage={heroBg}
      >
        <Circle
          size="560px"
          bg="blue.500"
          opacity="0.06"
          position="absolute"
          top="-180px"
          right="-80px"
          filter="blur(100px)"
          zIndex={0}
          display={{ base: "none", md: "block" }}
        />

        <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} position="relative" zIndex={1}>
          <Grid templateColumns={{ base: "1fr", lg: "1.15fr 0.95fr" }} gap={{ base: 5, lg: 14 }} alignItems="center">
            <Box>
              <Badge
                colorScheme="blue"
                variant="subtle"
                px={{ base: 3, md: 4 }}
                py={{ base: 1, md: 2 }}
                mb={{ base: 3, md: 5 }}
                borderRadius="full"
                textTransform="none"
              >
                <HStack spacing={2}>
                  <Icon as={FaCheckCircle} />
                  <Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }}>
                    Learning hub
                  </Text>
                </HStack>
              </Badge>

              <Heading
                as="h1"
                fontSize={{ base: '2xl', sm: '3xl', md: '5xl', xl: '6xl' }}
                fontWeight="extrabold"
                lineHeight={{ base: "1.12", md: "1.02" }}
                color={textPrimary}
                maxW={{ base: "20rem", md: "none" }}
              >
                Learn, resume, and grow
                <Text as="span" color="blue.600"> faster</Text>
              </Heading>

              <Text
                fontSize={{ base: "sm", md: "xl" }}
                color={textSecondary}
                mt={5}
                maxW="2xl"
                lineHeight="1.8"
                display={{ base: "none", md: "block" }}
              >
                Search the open catalog, compare pricing and course formats, and jump back into your private assignments without leaving the homepage.
              </Text>

              <Flex
                mt={{ base: 4, md: 8 }}
                p={2}
                bg={cardBg}
                borderRadius={{ base: "xl", md: "2xl" }}
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow={{ base: "0 10px 26px rgba(15, 23, 42, 0.08)", md: "0 22px 50px rgba(15, 23, 42, 0.08)" }}
                gap={2}
                direction="row"
                align="center"
                maxW={{ base: "100%", md: "720px" }}
              >
                <Flex align="center" gap={{ base: 2, md: 3 }} px={{ base: 3, md: 4 }} flex="1" minW={0}>
                  <Icon as={FaSearch} color="blue.500" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search courses"
                    border="none"
                    h={{ base: "38px", md: "50px" }}
                    fontSize={{ base: "sm", md: "md" }}
                    _focusVisible={{ boxShadow: "none" }}
                    px={0}
                  />
                </Flex>
                <Button
                  colorScheme="blue"
                  borderRadius={{ base: "lg", md: "xl" }}
                  h={{ base: "38px", md: "50px" }}
                  px={{ base: 4, md: 8 }}
                  rightIcon={<FaArrowRight />}
                  fontSize={{ base: "sm", md: "md" }}
                  onClick={handleExplore}
                >
                  Explore
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={8} display={{ base: "none", md: "grid" }}>
                {[
                  { label: "Public Courses", value: publicCourses.length || "0" },
                  { label: "Assigned to You", value: isLearner ? assignedCourses.length || "0" : "Live" },
                  {
                    label: "Avg Rating",
                    value: publicCourses.some((course) => course.metrics?.averageRating)
                      ? (
                          publicCourses.reduce((sum, course) => sum + Number(course.metrics?.averageRating || 0), 0) /
                          publicCourses.filter((course) => Number(course.metrics?.averageRating || 0) > 0).length
                        ).toFixed(1)
                      : "New",
                  },
                  {
                    label: "Free Courses",
                    value: publicCourses.filter((course) => course.commerce?.pricingModel === "free").length || "0",
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    p={4}
                    borderRadius="2xl"
                    bg="rgba(255,255,255,0.78)"
                    border="1px solid rgba(255,255,255,0.42)"
                    backdropFilter="blur(12px)"
                  >
                    <Text fontSize="2xl" fontWeight="800" color={textPrimary}>{item.value}</Text>
                    <Text fontSize="sm" color={textSecondary}>{item.label}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <Stack spacing={5} display={{ base: "none", lg: "flex" }}>
              <MotionBox
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                bg={cardBg}
                borderRadius="3xl"
                p={5}
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow="0 28px 70px rgba(15, 23, 42, 0.12)"
              >
                <HStack justify="space-between" mb={4}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xs" color={textSecondary} textTransform="uppercase" letterSpacing="0.08em" fontWeight="700">
                      Featured Public Courses
                    </Text>
                    <Heading size="md" color={textPrimary}>Open catalog highlights</Heading>
                  </VStack>
                  <Circle size="42px" bg="blue.50" color="blue.500">
                    <Icon as={FaGlobe} />
                  </Circle>
                </HStack>

                <Stack spacing={4}>
                  {featuredPublicCourses.map((course) => (
                    <Box
                      key={course._id}
                      p={4}
                      borderRadius="2xl"
                      borderWidth="1px"
                      borderColor={borderColor}
                      bg={mutedBg}
                    >
                      <Flex justify="space-between" gap={3}>
                        <Box>
                          <HStack spacing={2} flexWrap="wrap" mb={2}>
                            <Badge colorScheme="green" borderRadius="full" px={3} py={1}>Public</Badge>
                            <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                              {course.courseType === "scorm" ? "SCORM" : "Standard"}
                            </Badge>
                          </HStack>
                          <Text fontWeight="700" color={textPrimary}>{course.title}</Text>
                          <Text fontSize="sm" color={textSecondary} mt={1}>
                            {(course.taxonomy?.categories || []).slice(0, 2).join(" • ") || "General"}
                          </Text>
                        </Box>
                        <VStack align="end" spacing={1}>
                          <Text fontWeight="800" color="blue.600">{formatCurrency(course.commerce?.amountInRupees)}</Text>
                          <HStack spacing={1}>
                            <Icon as={FaStar} color="orange.400" />
                            <Text fontSize="sm" color={textSecondary}>
                              {course.metrics?.averageRating ? course.metrics.averageRating.toFixed(1) : "New"}
                            </Text>
                          </HStack>
                        </VStack>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </MotionBox>

              {isLearner && featuredAssignedCourses.length > 0 ? (
                <MotionBox
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.12 }}
                  bg="linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)"
                  borderRadius="3xl"
                  p={5}
                  color="white"
                  boxShadow="0 28px 70px rgba(15, 23, 42, 0.22)"
                >
                  <HStack justify="space-between" mb={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.08em" fontWeight="700">
                        Assigned Private Courses
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
                          <Box>
                            <Text fontWeight="700">{course.title}</Text>
                            <Text fontSize="sm" color="whiteAlpha.700" mt={1}>
                              {Math.round(Number(course.progress || 0))}% complete
                            </Text>
                          </Box>
                          <Button
                            size="sm"
                            colorScheme="whiteAlpha"
                            borderRadius="full"
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

      <Box as="section" py={{ base: 8, md: 20 }} bg={mutedBg}>
        <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }}>
          <Flex justify="space-between" align="flex-end" mb={{ base: 5, md: 10 }} flexWrap="wrap" gap={4}>
            <VStack align="start" spacing={2}>
              <Badge colorScheme="blue" variant="subtle">Explore Public Courses</Badge>
              <Heading size={{ base: "md", md: "xl" }} color={textPrimary}>Courses to start now</Heading>
              <Text color={textSecondary} display={{ base: "none", md: "block" }}>
                Public courses stay open to everyone, while private assignments remain visible for your signed-in learners.
              </Text>
            </VStack>
            <Button size={{ base: "sm", md: "md" }} colorScheme="blue" variant="ghost" rightIcon={<FaArrowRight />} onClick={() => router.push("/course")}>
              Browse
            </Button>
          </Flex>

          {stores.courseStore.isPublicCoursesLoading ? (
            <HStack justify="center" py={14}>
              <Spinner color="blue.500" />
              <Text color={textSecondary}>Loading course highlights...</Text>
            </HStack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={{ base: 3, md: 6 }}>
              {featuredPublicCourses.map((course) => (
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
                    <Box h={{ base: "124px", md: "180px" }} bgGradient="linear(to-br, blue.500, cyan.400)" />
                  )}
                  <Box p={{ base: 4, md: 5 }}>
                    <HStack spacing={2} flexWrap="wrap" mb={3}>
                      <Badge colorScheme="green" borderRadius="full" px={3} py={1}>Public</Badge>
                      <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                        {course.taxonomy?.level || "Beginner"}
                      </Badge>
                    </HStack>
                    <Heading size="sm" minH={{ base: "auto", md: "42px" }} color={textPrimary} noOfLines={2}>{course.title}</Heading>
                    <Text mt={2} fontSize="sm" color={textSecondary} noOfLines={2} display={{ base: "none", md: "block" }}>
                      {course.description?.text || "Open this course to inspect pricing, curriculum, and enrollment options."}
                    </Text>

                    <Flex justify="space-between" align="center" mt={4}>
                      <Text fontWeight="800" color="blue.600">{formatCurrency(course.commerce?.amountInRupees)}</Text>
                      <HStack spacing={1}>
                        <Icon as={FaUserGraduate} color="blue.500" />
                        <Text fontSize="sm" color={textSecondary}>{course.metrics?.popularityScore || 0}</Text>
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
