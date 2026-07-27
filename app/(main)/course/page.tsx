"use client";

import { CourseCard, CourseCardSkeleton } from "@/app/(main)/course/component/CourseCard";
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
  useToken,
  VStack
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiFilter,
  FiGlobe,
  FiSearch,
  FiTrendingUp
} from "react-icons/fi";

type CatalogSort = "latest" | "popularity" | "price_asc" | "price_desc" | "highest_rated";

const CoursesPage = observer(function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();
  const isLearner = Boolean(stores.auth.user) && isLearnerRole(role);
  const requestedCourseId = String(searchParams.get("courseId") || "").trim();
  const requestedEnrollmentCourseId = String(searchParams.get("enrollCourseId") || "").trim();
  const initialSearch = String(searchParams.get("search") || "").trim();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "paid">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState<CatalogSort>("latest");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, var(--chakra-colors-brand-50) 0%, #ffffff 48%, var(--chakra-colors-brand-100) 100%)",
    "linear-gradient(135deg, var(--chakra-colors-gray-900) 0%, rgba(15, 23, 42, 0.98) 40%, var(--chakra-colors-brand-900) 100%)"
  );
  const pageBg = useColorModeValue("#F8FAFC", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const softText = useColorModeValue("gray.500", "gray.400");
  const drawerBg = useColorModeValue("white", "gray.800");
  const heroPanelOverlay = useColorModeValue(
    "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.3) 100%)",
    "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)"
  );
  const heroHeadingAccent = useColorModeValue(
    "linear(to-r, brand.700, brand.500, brand.300)",
    "linear(to-r, brand.200, brand.400, brand.600)"
  );
  const heroStatShadow = useColorModeValue(
    "0 14px 34px rgba(15, 23, 42, 0.06)",
    "0 18px 42px rgba(2, 6, 23, 0.28)"
  );
  const heroPanelShadow = useColorModeValue(
    "0 18px 50px rgba(15, 23, 42, 0.08)",
    "0 24px 60px rgba(2, 6, 23, 0.34)"
  );
  const heroButtonShadow = useColorModeValue(
    "0 12px 28px rgba(37, 99, 235, 0.24)",
    "0 16px 32px rgba(15, 23, 42, 0.34)"
  );
  const [brand50, brand100, brand200, brand400, brand500, brand700] = useToken("colors", [
    "brand.50",
    "brand.100",
    "brand.200",
    "brand.400",
    "brand.500",
    "brand.700",
  ]);

  useEffect(() => {
    if (isLearner) {
      stores.courseStore.fetchMyCourses().catch(() => undefined);
    }
  }, [isLearner]);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const publicCourses = stores.courseStore.publicCourses || [];
  const publicCoursesMeta = stores.courseStore.publicCoursesMeta;
  const assignedCourses = stores.courseStore.myCourses || [];
  const enrolledCourseIds = useMemo(
    () => new Set(assignedCourses.map((course) => String(course.courseId || "").trim()).filter(Boolean)),
    [assignedCourses]
  );

  const catalogRequestParams = useMemo(
    () => ({
      limit: 12,
      search: debouncedSearchQuery || undefined,
      pricingModel: pricingFilter !== "all" ? pricingFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      language: languageFilter !== "all" ? languageFilter : undefined,
      sortBy,
    }),
    [categoryFilter, debouncedSearchQuery, languageFilter, pricingFilter, sortBy]
  );

  useEffect(() => {
    if (requestedCourseId) {
      return;
    }

    stores.courseStore.fetchPublicCourses(catalogRequestParams).catch(() => undefined);
  }, [catalogRequestParams, requestedCourseId]);

  useEffect(() => {
    if (requestedEnrollmentCourseId) {
      router.replace(`/course?courseId=${requestedEnrollmentCourseId}`);
    }
  }, [requestedEnrollmentCourseId, router]);

  const availableCategories = useMemo(
    () => ["all", ...(publicCoursesMeta.availableCategories || [])],
    [publicCoursesMeta.availableCategories]
  );

  const availableLanguages = useMemo(
    () => ["all", ...(publicCoursesMeta.availableLanguages || [])],
    [publicCoursesMeta.availableLanguages]
  );

  const featuredAssignedCourses = useMemo(() => assignedCourses.slice(0, 4), [assignedCourses]);
  const isInitialPublicCoursesLoading =
    stores.courseStore.isPublicCoursesLoading && publicCourses.length === 0;

  useEffect(() => {
    if (requestedCourseId) {
      return;
    }

    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry?.isIntersecting &&
          stores.courseStore.publicCoursesMeta.hasMore &&
          !stores.courseStore.isPublicCoursesLoading &&
          !stores.courseStore.isPublicCoursesLoadingMore
        ) {
          stores.courseStore.loadMorePublicCourses().catch(() => undefined);
        }
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    publicCourses.length,
    requestedCourseId,
    stores.courseStore,
    stores.courseStore.publicCoursesMeta.hasMore,
    stores.courseStore.isPublicCoursesLoading,
    stores.courseStore.isPublicCoursesLoadingMore,
  ]);

  if (requestedCourseId) {
    return (
      <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 6 }}>
        <MyCoursesBoard basePath="/course" />
      </Box>
    );
  }

const filterInputStyles = {
  bg: cardBg,
  borderColor,
  borderRadius: "xl",
  h: { base: "38px", md: "38px" },
  fontSize: "sm",
  _hover: {
    borderColor: "brand.300",
  },
  _focusVisible: {
    borderColor: "brand.400",
    boxShadow: `0 0 0 3px ${brand100}`,
  },
};

const FilterPanel = (
  <VStack align="stretch" spacing={2.5}>
    <InputGroup>
      <InputLeftElement h="38px" pointerEvents="none">
        <Icon as={FiSearch} color={softText} fontSize="sm" />
      </InputLeftElement>

      <Input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search course, category, language..."
        pl={9}
        {...filterInputStyles}
      />
    </InputGroup>

    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2.5}>
      <Select
        value={pricingFilter}
        onChange={(event) =>
          setPricingFilter(event.target.value as typeof pricingFilter)
        }
        {...filterInputStyles}
      >
        <option value="all">Paid / Free</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </Select>

      <Select
        value={categoryFilter}
        onChange={(event) => setCategoryFilter(event.target.value)}
        {...filterInputStyles}
      >
        {availableCategories.map((category) => (
          <option key={category} value={category}>
            {category === "all" ? "Category" : category}
          </option>
        ))}
      </Select>

      <Select
        value={languageFilter}
        onChange={(event) => setLanguageFilter(event.target.value)}
        {...filterInputStyles}
      >
        {availableLanguages.map((language) => (
          <option key={language} value={language}>
            {language === "all" ? "Language" : language}
          </option>
        ))}
      </Select>
    </SimpleGrid>

    <Select
      value={sortBy}
      onChange={(event) => setSortBy(event.target.value as CatalogSort)}
      {...filterInputStyles}
    >
      <option value="latest">Latest courses</option>
      <option value="popularity">Most popular</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="highest_rated">Highest Rated</option>
    </Select>
  </VStack>
);

  return (
    <Box minH="100vh" bg={pageBg} overflowX="hidden">
<Box
  bg={heroBg}
  borderBottomWidth="1px"
  borderColor={borderColor}
  position="relative"
  overflow="hidden"
>
  {/* Decorative background blobs */}
  <Box
    position="absolute"
    top="-80px"
    right="-70px"
    w="260px"
    h="260px"
    bg={brand400}
    opacity={{ base: 0.14, md: 0.18 }}
    filter="blur(40px)"
    borderRadius="full"
    pointerEvents="none"
  />

  <Box
    maxW="8xl"
    mx="auto"
    px={{ base: 4, md: 8 }}
    py={{ base: 4, md: 8 }}
    position="relative"
  >
    <Grid
      templateColumns={{ base: "1fr", lg: "1.08fr 0.92fr" }}
      gap={{ base: 5, lg: 8 }}
      alignItems="center"
    >
      <Box>
        <Badge
          bg={brand50}
          color={brand700}
          borderRadius="full"
          px={3}
          py={1}
          textTransform="none"
          fontSize="xs"
          boxShadow={heroButtonShadow}
        >
          Course catalog
        </Badge>

        <Heading
          mt={{ base: 2.5, md: 3 }}
          fontSize={{ base: "2xl", md: "4xl", xl: "5xl" }}
          lineHeight={{ base: "1.12", md: "1.05" }}
          maxW="3xl"
          letterSpacing="-0.04em"
        >
          Find the right course,
          <Text
            as="span"
            bgGradient={heroHeadingAccent}
            bgClip="text"
          >
            {" "}
            faster.
          </Text>
        </Heading>

        <Text
          mt={{ base: 3, md: 4 }}
          fontSize={{ base: "sm", md: "md" }}
          color={mutedText}
          maxW={{ base: "20rem", sm: "2xl" }}
          lineHeight="1.65"
          display={{ base: "none", md: "block" }}
        >
          Search, filter, and sort public courses by the signals that matter most.
        </Text>

        <HStack
          mt={{ base: 4, md: 6 }}
          spacing={2.5}
          flexWrap="wrap"
          display={{ base: "none", sm: "flex" }}
        >
          {[
            {
              icon: FiBookOpen,
              color: brand700,
              colorBg: brand50,
              label: "Courses",
              value: publicCoursesMeta.total,
            },
            {
              icon: FiTrendingUp,
              color: brand500,
              colorBg: brand100,
              label: "Enrollments",
              value: publicCourses.reduce(
                (sum, course) =>
                  sum + Number(course.metrics?.popularityScore || 0),
                0
              ),
            },
            {
              icon: FiGlobe,
              colorBg: brand200,
              color: "green.500",
              label: "Open access",
              value: "Open to all",
            },
          ].map((item) => (
            <Box
              key={item.label}
              display="flex"
              alignItems="center"
              gap={3}
              px={3.5}
              py={2.5}
              borderRadius="2xl"
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow={heroStatShadow}
              transition="all 0.2s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: heroPanelShadow,
              }}
            >
              <Box
                w="34px"
                h="34px"
                display="grid"
                placeItems="center"
                borderRadius="xl"
                bg={item.colorBg}
              >
                <Icon as={item.icon} color={item.color} />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="800" lineHeight="1.1">
                  {item.value}
                </Text>
                <Text fontSize="xs" color={softText}>
                  {item.label}
                </Text>
              </Box>
            </Box>
          ))}
        </HStack>

        <Button
          mt={{ base: 3, md: 5 }}
          display={{ base: "inline-flex", md: "none" }}
          colorScheme="brand"
          borderRadius="full"
          leftIcon={<FiFilter />}
          size="sm"
          onClick={onOpen}
          boxShadow={heroButtonShadow}
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
  p={{ md: 4, lg: 4 }}
  boxShadow="0 18px 50px rgba(15, 23, 42, 0.08)"
  position="relative"
  overflow="hidden"
  maxW="760px"
  w="full"
>
  <Box
    position="absolute"
    inset={0}
    bgGradient={heroPanelOverlay}
    opacity={1}
    pointerEvents="none"
  />

  <Box position="relative">
    <HStack justify="space-between" align="center" mb={3}>
      <HStack spacing={2.5}>
        <Box
          w="34px"
          h="34px"
          display="grid"
          placeItems="center"
          borderRadius="xl"
          bg={brand500}
          color="white"
          boxShadow={heroButtonShadow}
        >
          <Icon as={FiSearch} fontSize="sm" />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="800" lineHeight="1.1">
            Find Courses
          </Text>
          <Text fontSize="xs" color={softText}>
            Search and refine quickly
          </Text>
        </Box>
      </HStack>

      <Badge
        borderRadius="full"
        bg={brand50}
        color={brand700}
        px={2.5}
        py={1}
        textTransform="none"
        fontSize="xs"
      >
        {publicCoursesMeta.total} total
      </Badge>
    </HStack>

    {FilterPanel}

    <HStack mt={3} spacing={2.5}>
      <Button
        flex="1"
        h="38px"
        colorScheme="brand"
        borderRadius="xl"
        leftIcon={<FiFilter />}
        onClick={onOpen}
        fontSize="sm"
        boxShadow={heroButtonShadow}
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: heroPanelShadow,
        }}
        transition="all 0.2s ease"
      >
        Refine catalog
      </Button>

      <Button
        h="38px"
        px={4}
        variant="outline"
        borderRadius="xl"
        borderColor={borderColor}
        color={mutedText}
        fontSize="sm"
        onClick={() => {
          setSearchQuery("");
          setPricingFilter("all");
          setCategoryFilter("all");
          setLanguageFilter("all");
          setSortBy("latest");
        }}
      >
        Reset
      </Button>
    </HStack>
  </Box>
</Box>
    </Grid>
  </Box>
</Box>


      <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 7, md: 10 }}>
        {isLearner && featuredAssignedCourses.length > 0 ? (
          <Box mb={{ base: 7, md: 10 }}>
            <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={3}>
              <Box>
                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="700" color="blue.500" textTransform="uppercase" letterSpacing="0.08em">
                  Assigned Courses
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

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 4, md: 5 }}>
              {featuredAssignedCourses.map((course) => (
                <Box
                  key={course.courseId}
                  onClick={() => router.push(`/course?courseId=${course.courseId}`)}
                >
                  <CourseCard
                    course={{
                      ...course,
                      _id: course.courseId,
                      courseType: undefined,
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
                    }}
                    primaryBadgeLabel="Private"
                    secondaryBadgeLabel={null}
                    onClick={() => router.push(`/course?courseId=${course.courseId}`)}
                  />
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        ) : null}

        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "flex-end" }}
          direction={{ base: "column", md: "row" }}
          mb={{base:3,md:5}}
          gap={{ base: 3, md: 4 }}
        >
          <Box minW={0}>
            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="700" color="blue.500" textTransform="uppercase" letterSpacing="0.08em">
              Explore Courses
            </Text>
            <Heading size={{ base: "md", md: "lg" }} mt={1}>Public learning catalog</Heading>
                <Text mt={2} color={mutedText} display={{ base: "none", md: "block" }}>
                  {publicCoursesMeta.total} course{publicCoursesMeta.total === 1 ? "" : "s"} match your current filters.
                </Text>
          </Box>

          <Button
            display={{ base: "inline-flex", md: "none" }}
            colorScheme="blue"
            borderRadius="full"
            leftIcon={<FiFilter />}
            size="sm"
            minH={{ base: "34px", md:"38px"}}
            flexShrink={0}
            onClick={onOpen}
          >
            Filters
          </Button>
        </Flex>

        {isInitialPublicCoursesLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={{ base: 4, md: 5 }}>
            {Array.from({ length: 12 }).map((_, index) => (
              <CourseCardSkeleton key={`course-card-skeleton-${index}`} />
            ))}
          </SimpleGrid>
        ) : publicCourses.length === 0 ? (
          <Box textAlign="center" py={16} borderRadius="2xl" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <Icon as={FiBookOpen} boxSize={8} color="gray.400" />
            <Heading size="md" mt={4}>No public courses found</Heading>
            <Text mt={2} color={mutedText}>Try changing your search or filters to broaden the results.</Text>
          </Box>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={{ base: 4, md: 5 }}>
              {publicCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  enrolled={enrolledCourseIds.has(String(course._id))}
                  onClick={() => {
                    router.push(`/course?courseId=${course._id}`);
                  }}
                />
              ))}

              {stores.courseStore.isPublicCoursesLoadingMore
                ? Array.from({ length: 4 }).map((_, index) => (
                    <CourseCardSkeleton key={`course-card-loading-more-${index}`} />
                  ))
                : null}
            </SimpleGrid>

            <Box ref={loadMoreRef} h="1px" mt={6} />

            {!publicCoursesMeta.hasMore && publicCourses.length > 0 ? (
              <Text mt={6} textAlign="center" color={softText} fontSize="sm">
                You&apos;ve reached the end of the catalog.
              </Text>
            ) : null}
          </>
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


    </Box>
  );
});

export default CoursesPage;
