"use client";

import MyCoursesBoard from "@/app/(main)/course/component/MyCoursesBoard";
import { isLearnerRole } from "@/app/config/utils/roleAccess";
import stores from "@/app/store/stores";
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiDollarSign,
  FiFilter,
  FiGlobe,
  FiSearch,
  FiStar,
  FiTrendingUp
} from "react-icons/fi";

type CatalogSort = "latest" | "popularity" | "price_asc" | "price_desc" | "highest_rated";

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

function AssessmentBadge({ summary }: { summary?: any }) {
  if (!summary || summary.outcome === "not_configured") {
    return null;
  }

  const colorScheme = summary.outcome === "passed" ? "green" : summary.outcome === "failed" ? "red" : "orange";
  const label =
    summary.outcome === "passed"
      ? "Passed"
      : summary.outcome === "failed"
        ? "Failed"
        : "Assessment Pending";

  return (
    <Badge colorScheme={colorScheme} borderRadius="full" px={3} py={1}>
      {label}
    </Badge>
  );
}

const CoursesPage = observer(function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();
  const isLearner = Boolean(stores.auth.user) && isLearnerRole(role);
  const requestedCourseId = String(searchParams.get("courseId") || "").trim();
  const initialSearch = String(searchParams.get("search") || "").trim();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "paid">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [courseTypeFilter, setCourseTypeFilter] = useState<"all" | "standard" | "scorm">("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState<CatalogSort>("latest");
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, #ffffff 0%, #eef6ff 58%, #ecfdf5 100%)",
    "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 64, 175, 0.82) 58%, rgba(20, 83, 45, 0.55) 100%)"
  );
  const pageBg = useColorModeValue("#F8FAFC", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const softText = useColorModeValue("gray.500", "gray.400");
  const drawerBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    stores.courseStore.fetchPublicCourses().catch(() => undefined);
    if (isLearner) {
      stores.courseStore.fetchMyCourses().catch(() => undefined);
    }
  }, [isLearner]);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const publicCourses = stores.courseStore.publicCourses || [];
  const assignedCourses = stores.courseStore.myCourses || [];

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    publicCourses.forEach((course) => {
      (course.taxonomy?.categories || []).forEach((category) => {
        if (category) categories.add(category);
      });
    });
    return ["all", ...Array.from(categories).sort((left, right) => left.localeCompare(right))];
  }, [publicCourses]);

  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    publicCourses.forEach((course) => {
      (course.taxonomy?.languages || []).forEach((language) => {
        if (language) languages.add(language);
      });
    });
    return ["all", ...Array.from(languages).sort((left, right) => left.localeCompare(right))];
  }, [publicCourses]);

  const filteredPublicCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const nextCourses = publicCourses.filter((course) => {
      const searchableText = [
        course.title,
        course.description?.text,
        course.taxonomy?.level,
        ...(course.taxonomy?.categories || []),
        ...(course.taxonomy?.languages || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (query && !searchableText.includes(query)) {
        return false;
      }

      if (pricingFilter !== "all" && course.commerce?.pricingModel !== pricingFilter) {
        return false;
      }

      if (categoryFilter !== "all" && !(course.taxonomy?.categories || []).includes(categoryFilter)) {
        return false;
      }

      if (courseTypeFilter !== "all" && course.courseType !== courseTypeFilter) {
        return false;
      }

      if (languageFilter !== "all" && !(course.taxonomy?.languages || []).includes(languageFilter)) {
        return false;
      }

      return true;
    });

    nextCourses.sort((left, right) => {
      if (sortBy === "popularity") {
        return (right.metrics?.popularityScore || 0) - (left.metrics?.popularityScore || 0);
      }

      if (sortBy === "price_asc") {
        return Number(left.commerce?.amountInRupees || 0) - Number(right.commerce?.amountInRupees || 0);
      }

      if (sortBy === "price_desc") {
        return Number(right.commerce?.amountInRupees || 0) - Number(left.commerce?.amountInRupees || 0);
      }

      if (sortBy === "highest_rated") {
        return (right.metrics?.averageRating || 0) - (left.metrics?.averageRating || 0);
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

    return nextCourses;
  }, [categoryFilter, courseTypeFilter, languageFilter, pricingFilter, publicCourses, searchQuery, sortBy]);

  const featuredAssignedCourses = useMemo(() => assignedCourses.slice(0, 3), [assignedCourses]);

  if (isLearner && requestedCourseId) {
    return (
      <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 6 }}>
        <MyCoursesBoard basePath="/course" />
      </Box>
    );
  }

  const FilterPanel = (
    <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
      <Box>
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.08em" color={softText} textTransform="uppercase" mb={2}>
          Search
        </Text>
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by course name, language, or category"
          bg={cardBg}
          borderColor={borderColor}
          h={{ base: "40px", md: "46px" }}
          fontSize={{ base: "sm", md: "md" }}
        />
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
        <Select value={pricingFilter} onChange={(event) => setPricingFilter(event.target.value as typeof pricingFilter)} bg={cardBg} borderColor={borderColor} h={{ base: "40px", md: "46px" }} fontSize={{ base: "sm", md: "md" }}>
          <option value="all">Paid / Free</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </Select>
        <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} bg={cardBg} borderColor={borderColor} h={{ base: "40px", md: "46px" }} fontSize={{ base: "sm", md: "md" }}>
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "Category" : category}
            </option>
          ))}
        </Select>
        <Select value={courseTypeFilter} onChange={(event) => setCourseTypeFilter(event.target.value as typeof courseTypeFilter)} bg={cardBg} borderColor={borderColor} h={{ base: "40px", md: "46px" }} fontSize={{ base: "sm", md: "md" }}>
          <option value="all">Course Type</option>
          <option value="standard">Standard</option>
          <option value="scorm">SCORM</option>
        </Select>
        <Select value={languageFilter} onChange={(event) => setLanguageFilter(event.target.value)} bg={cardBg} borderColor={borderColor} h={{ base: "40px", md: "46px" }} fontSize={{ base: "sm", md: "md" }}>
          {availableLanguages.map((language) => (
            <option key={language} value={language}>
              {language === "all" ? "Language" : language}
            </option>
          ))}
        </Select>
      </SimpleGrid>

      <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as CatalogSort)} bg={cardBg} borderColor={borderColor} h={{ base: "40px", md: "46px" }} fontSize={{ base: "sm", md: "md" }}>
        <option value="latest">Latest</option>
        <option value="popularity">Popularity</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="highest_rated">Highest Rated</option>
      </Select>
    </VStack>
  );

  return (
    <Box minH="100vh" bg={pageBg} overflowX="hidden">
      <Box bgImage={heroBg} borderBottomWidth="1px" borderColor={borderColor}>
        <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 5, md: 12 }}>
          <Grid templateColumns={{ base: "1fr", lg: "1.16fr 0.84fr" }} gap={{ base: 4, lg: 10 }} alignItems="center">
            <Box>
              <Badge colorScheme="blue" borderRadius="full" px={3} py={1} textTransform="none" fontSize="xs">
                Course catalog
              </Badge>
              <Heading mt={3} fontSize={{ base: "2xl", md: "5xl" }} lineHeight={{ base: "1.12", md: "1.06" }} maxW="3xl">
                Find the right course,
                <Text as="span" color="blue.500"> faster.</Text>
              </Heading>
              <Text mt={4} fontSize={{ base: "sm", md: "lg" }} color={mutedText} maxW="2xl" lineHeight="1.7" display={{ base: "none", sm: "block" }}>
                Search by title, narrow by pricing, category, course type, and language, then sort by the signals that matter most.
              </Text>

              <HStack mt={{ base: 4, md: 7 }} spacing={3} flexWrap="wrap" display={{ base: "none", sm: "flex" }}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  borderRadius="xl"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Icon as={FiBookOpen} color="blue.500" />
                  <Box>
                    <Text fontSize="sm" fontWeight="700">{publicCourses.length}</Text>
                    <Text fontSize="xs" color={softText}>Courses</Text>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  borderRadius="xl"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Icon as={FiTrendingUp} color="purple.500" />
                  <Box>
                    <Text fontSize="sm" fontWeight="700">
                      {publicCourses.reduce((sum, course) => sum + Number(course.metrics?.popularityScore || 0), 0)}
                    </Text>
                    <Text fontSize="xs" color={softText}>Enrollments</Text>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  borderRadius="xl"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Icon as={FiGlobe} color="green.500" />
                  <Box>
                    <Text fontSize="sm" fontWeight="700">Open to all</Text>
                    <Text fontSize="xs" color={softText}>Open access</Text>
                  </Box>
                </Box>
              </HStack>

              <Button
                mt={5}
                display={{ base: "inline-flex", md: "none" }}
                colorScheme="blue"
                borderRadius="full"
                leftIcon={<FiFilter />}
                size="sm"
                minH="38px"
                onClick={onOpen}
              >
                Filters
              </Button>
            </Box>

            <Box
              display={{ base: "none", md: "block" }}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              bg={cardBg}
              p={{ base: 5, md: 6 }}
              boxShadow="0 28px 70px rgba(15, 23, 42, 0.08)"
            >
              <HStack spacing={3} mb={4}>
                <Icon as={FiSearch} color="blue.500" />
                <Text fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color={softText}>
                  Find Courses
                </Text>
              </HStack>
              {FilterPanel}
              <Button
                mt={5}
                w="full"
                h="48px"
                colorScheme="blue"
                borderRadius="xl"
                leftIcon={<FiFilter />}
                onClick={onOpen}
              >
                Refine catalog
              </Button>
            </Box>
          </Grid>
        </Box>
      </Box>

      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 7, md: 10 }}>
        {isLearner && featuredAssignedCourses.length > 0 ? (
          <Box mb={{ base: 7, md: 10 }}>
            <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={3}>
              <Box>
                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="700" color="blue.500" textTransform="uppercase" letterSpacing="0.08em">
                  Assigned Private Courses
                </Text>
                <Heading size={{ base: "md", md: "lg" }} mt={1}>Continue learning</Heading>
              </Box>
              <Button
                size={{ base: "sm", md: "md" }}
                variant="ghost"
                colorScheme="blue"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push(`/course?courseId=${featuredAssignedCourses[0].courseId}`)}
              >
                Resume latest course
              </Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={{ base: 4, md: 5 }}>
              {featuredAssignedCourses.map((course) => (
                <MotionBox
                  key={course.courseId}
                  whileHover={{ y: -6 }}
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  overflow="hidden"
                  boxShadow="0 18px 45px rgba(15, 23, 42, 0.06)"
                >
                  <Box position="relative">
                    {course.thumbnailUrl ? (
                      <Image src={course.thumbnailUrl} alt={course.title} h={{ base: "128px", md: "190px" }} w="full" objectFit="cover" />
                    ) : (
                      <Box h={{ base: "128px", md: "190px" }} bgGradient="linear(to-br, blue.600, blue.300)" />
                    )}
                    <Badge position="absolute" top={4} left={4} colorScheme="blue" borderRadius="full" px={3} py={1}>
                      Private
                    </Badge>
                  </Box>

                  <Box p={{ base: 4, md: 5 }}>
                    <HStack spacing={2} flexWrap="wrap" mb={3}>
                      <Badge colorScheme="gray" borderRadius="full" px={3} py={1}>
                        {course.taxonomy?.level || "Beginner"}
                      </Badge>
                      <AssessmentBadge summary={course.assessmentSummary} />
                    </HStack>
                    <Heading size={{ base: "sm", md: "md" }} mb={2} noOfLines={2}>{course.title}</Heading>
                    <Text fontSize="sm" color={mutedText} noOfLines={2} display={{ base: "none", md: "block" }}>
                      {course.description?.text || "Assigned privately by your organization."}
                    </Text>

                    <HStack justify="space-between" mt={4}>
                      <Text fontSize="sm" fontWeight="700" color="blue.500">
                        {Math.round(Number(course.progress || 0))}% complete
                      </Text>
                      <Text fontSize="sm" color={softText}>
                        {course.status === "completed" ? "Completed" : "In progress"}
                      </Text>
                    </HStack>

                    <Button mt={{ base: 3, md: 4 }} h={{ base: "40px", md: "auto" }} w="full" colorScheme="blue" borderRadius="xl" onClick={() => router.push(`/course?courseId=${course.courseId}`)}>
                      Continue Course
                    </Button>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </Box>
        ) : null}

        <Flex justify="space-between" align="flex-end" mb={5} flexWrap="wrap" gap={4}>
          <Box>
            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="700" color="blue.500" textTransform="uppercase" letterSpacing="0.08em">
              Explore Courses
            </Text>
            <Heading size={{ base: "md", md: "lg" }} mt={1}>Public learning catalog</Heading>
                <Text mt={2} color={mutedText} display={{ base: "none", md: "block" }}>
                  {filteredPublicCourses.length} course{filteredPublicCourses.length === 1 ? "" : "s"} match your current filters.
                </Text>
          </Box>

          <Button
            display={{ base: "inline-flex", md: "none" }}
            colorScheme="blue"
            borderRadius="full"
            leftIcon={<FiFilter />}
            size="sm"
            minH="38px"
            onClick={onOpen}
          >
            Filters
          </Button>
        </Flex>

        {stores.courseStore.isPublicCoursesLoading ? (
          <HStack justify="center" py={20}>
            <Spinner color="blue.500" />
            <Text color={mutedText}>Loading public courses...</Text>
          </HStack>
        ) : filteredPublicCourses.length === 0 ? (
          <Box textAlign="center" py={16} borderRadius="2xl" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <Icon as={FiBookOpen} boxSize={8} color="gray.400" />
            <Heading size="md" mt={4}>No public courses found</Heading>
            <Text mt={2} color={mutedText}>Try changing your search or filters to broaden the results.</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={{ base: 4, md: 5 }}>
            {filteredPublicCourses.map((course) => (
              <MotionBox
                key={course._id}
                whileHover={{ y: -6 }}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="0 18px 45px rgba(15, 23, 42, 0.06)"
              >
                <Box position="relative">
                  {course.thumbnailUrl ? (
                    <Image src={course.thumbnailUrl} alt={course.title} h={{ base: "128px", md: "210px" }} w="full" objectFit="cover" />
                  ) : (
                    <Box h={{ base: "128px", md: "210px" }} bgGradient="linear(to-br, blue.600, teal.300)" />
                  )}
                  <HStack position="absolute" top={4} left={4} spacing={2} flexWrap="wrap">
                    <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                      Public
                    </Badge>
                    <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                      {course.courseType === "scorm" ? "SCORM" : "Standard"}
                    </Badge>
                  </HStack>
                </Box>

                <Box p={{ base: 4, md: 5 }}>
                  <HStack spacing={2} flexWrap="wrap" mb={3}>
                    {(course.taxonomy?.categories || []).slice(0, 2).map((category) => (
                      <Badge key={`${course._id}-${category}`} borderRadius="full" px={3} py={1}>
                        {category}
                      </Badge>
                    ))}
                    <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                      {course.taxonomy?.level || "Beginner"}
                    </Badge>
                  </HStack>

                  <Heading size={{ base: "sm", md: "md" }} mb={2} noOfLines={2}>{course.title}</Heading>
                  <Text fontSize="sm" color={mutedText} noOfLines={3} display={{ base: "none", sm: "block" }}>
                    {course.description?.text || "Explore this course to review the curriculum, pricing, and assessment thresholds."}
                  </Text>

                  <SimpleGrid columns={2} spacing={3} mt={4} display={{ base: "none", sm: "grid" }}>
                    <Box>
                      <Text fontSize="xs" color={softText} textTransform="uppercase" letterSpacing="0.08em">Price</Text>
                      <HStack spacing={2} mt={1}>
                        <Icon as={FiDollarSign} color="green.500" />
                        <Text fontWeight="700">{formatCurrency(course.commerce?.amountInRupees)}</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color={softText} textTransform="uppercase" letterSpacing="0.08em">Popularity</Text>
                      <HStack spacing={2} mt={1}>
                        <Icon as={FiTrendingUp} color="purple.500" />
                        <Text fontWeight="700">{course.metrics?.popularityScore || 0}</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color={softText} textTransform="uppercase" letterSpacing="0.08em">Rating</Text>
                      <HStack spacing={2} mt={1}>
                        <Icon as={FiStar} color="orange.400" />
                        <Text fontWeight="700">
                          {course.metrics?.averageRating ? course.metrics.averageRating.toFixed(1) : "New"}
                        </Text>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color={softText} textTransform="uppercase" letterSpacing="0.08em">Language</Text>
                      <HStack spacing={2} mt={1}>
                        <Icon as={FiClock} color="blue.500" />
                        <Text fontWeight="700">{course.taxonomy?.languages?.[0] || "Any"}</Text>
                      </HStack>
                    </Box>
                  </SimpleGrid>

                  <Button mt={{ base: 3, md: 5 }} h={{ base: "40px", md: "auto" }} w="full" colorScheme="blue" borderRadius="xl" rightIcon={<FiArrowRight />} onClick={() => setSelectedCourse(course)}>
                    View Course
                  </Button>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(6px)" />
        <DrawerContent borderTopRadius="3xl" bg={drawerBg}>
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            Filters and Sorting
          </DrawerHeader>
          <DrawerBody py={6}>{FilterPanel}</DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer isOpen={Boolean(selectedCourse)} placement="right" onClose={() => setSelectedCourse(null)} size="md">
        <DrawerOverlay backdropFilter="blur(6px)" />
        <DrawerContent bg={drawerBg}>
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            Course Overview
          </DrawerHeader>
          <DrawerBody py={6}>
            {selectedCourse ? (
              <Stack spacing={5}>
                {selectedCourse.thumbnailUrl ? (
                  <Image src={selectedCourse.thumbnailUrl} alt={selectedCourse.title} borderRadius="2xl" h="220px" objectFit="cover" />
                ) : null}

                <Box>
                  <HStack spacing={2} flexWrap="wrap" mb={3}>
                    <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                      Public
                    </Badge>
                    <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                      {selectedCourse.courseType === "scorm" ? "SCORM" : "Standard"}
                    </Badge>
                    <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                      {selectedCourse.taxonomy?.level || "Beginner"}
                    </Badge>
                  </HStack>
                  <Heading size="lg">{selectedCourse.title}</Heading>
                  <Text mt={3} color={mutedText} lineHeight="1.8">
                    {selectedCourse.description?.text || "Course description will appear here once content is available."}
                  </Text>
                </Box>

                <SimpleGrid columns={2} spacing={4}>
                  <Box p={4} borderRadius="2xl" bg={useColorModeValue("blue.50", "blue.900")} borderWidth="1px" borderColor={borderColor}>
                    <Text fontSize="xs" color={softText} textTransform="uppercase" letterSpacing="0.08em">Price</Text>
                    <Text mt={2} fontWeight="800" fontSize="lg">{formatCurrency(selectedCourse.commerce?.amountInRupees)}</Text>
                  </Box>
                  <Box p={4} borderRadius="2xl" bg={useColorModeValue("purple.50", "purple.900")} borderWidth="1px" borderColor={borderColor}>
                    <Text fontSize="xs" color={softText} textTransform="uppercase" letterSpacing="0.08em">Modules</Text>
                    <Text mt={2} fontWeight="800" fontSize="lg">{selectedCourse.curriculum?.totalModules || 0}</Text>
                  </Box>
                  <Box p={4} borderRadius="2xl" bg={useColorModeValue("green.50", "green.900")} borderWidth="1px" borderColor={borderColor}>
                    <Text fontSize="xs" color={softText} textTransform="uppercase" letterSpacing="0.08em">Pass Marks</Text>
                    <Text mt={2} fontWeight="800" fontSize="lg">
                      {selectedCourse.assessment?.passingMarks && selectedCourse.assessment?.totalMarks
                        ? `${selectedCourse.assessment.passingMarks}/${selectedCourse.assessment.totalMarks}`
                        : "Not set"}
                    </Text>
                  </Box>
                  <Box p={4} borderRadius="2xl" bg={useColorModeValue("orange.50", "orange.900")} borderWidth="1px" borderColor={borderColor}>
                    <Text fontSize="xs" color={softText} textTransform="uppercase" letterSpacing="0.08em">Rating</Text>
                    <Text mt={2} fontWeight="800" fontSize="lg">
                      {selectedCourse.metrics?.averageRating ? selectedCourse.metrics.averageRating.toFixed(1) : "New"}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color={softText} mb={2}>
                    Languages
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {(selectedCourse.taxonomy?.languages || []).map((language: string) => (
                      <Badge key={`${selectedCourse._id}-${language}`} borderRadius="full" px={3} py={1}>
                        {language}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                <Button colorScheme="blue" borderRadius="xl" h="48px">
                  Enroll / Purchase Flow
                </Button>
                <Text fontSize="sm" color={softText}>
                  Public visibility is enabled for this course. Hook this CTA into your checkout or self-enrollment flow when that backend is ready.
                </Text>
              </Stack>
            ) : null}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
});

export default CoursesPage;

