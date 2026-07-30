"use client";

import { CourseCard, CourseCardSkeleton } from "@/app/(main)/course/component/CourseCard";
import { CourseFilterControls } from "@/app/(main)/course/component/CourseFilterControls";
import { CoursePreviewDrawer } from "@/app/(main)/course/component/CoursePreviewDrawer";
import MyCoursesBoard from "@/app/(main)/course/component/MyCoursesBoard";
import { isLearnerRole } from "@/app/config/utils/roleAccess";
import stores from "@/app/store/stores";
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
  useToken
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiCompass,
  FiDollarSign,
  FiFilter,
  FiGlobe,
  FiPlayCircle,
  FiSearch,
  FiStar,
  FiTrendingUp,
  FiX,
  FiZap
} from "react-icons/fi";
import CourseCatalogHero from "./component/CourseCatalogHero";

export type CatalogSort = "latest" | "popularity" | "price_asc" | "price_desc" | "highest_rated";
export type PricingFilter = "all" | "free" | "paid";

const floatAnimation = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); }
  50% { transform: translate3d(0, -8px, 0) rotate(1deg); }
`;

const floatReverseAnimation = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) rotate(2deg); }
  50% { transform: translate3d(0, 7px, 0) rotate(-1deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.55; }
  50% { transform: scale(1.08); opacity: 0.85; }
`;

// Hidden-but-still-scrollable scrollbar styles, reused across filter panels
const hiddenScrollbarCss = {
  scrollbarWidth: "none" as const,
  msOverflowStyle: "none" as const,
  "&::-webkit-scrollbar": { display: "none" },
};

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
  const [pricingFilter, setPricingFilter] = useState<PricingFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState<CatalogSort>("latest");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
  const [selectedPreviewCourse, setSelectedPreviewCourse] = useState<any | null>(null);

  const catalogSectionRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const pageBg = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const softText = useColorModeValue("gray.500", "gray.400");
  const drawerBg = useColorModeValue("white", "gray.800");
  const heroBg = useColorModeValue(
    "linear-gradient(118deg, var(--chakra-colors-brand-50) 0%, var(--chakra-colors-white) 48%, var(--chakra-colors-brand-100) 100%)",
    "linear-gradient(118deg, var(--chakra-colors-gray-900) 0%, var(--chakra-colors-gray-800) 52%, var(--chakra-colors-brand-900) 100%)"
  );
  const heroAccentGradient = useColorModeValue(
    "linear(to-r, brand.700, brand.500)",
    "linear(to-r, brand.200, brand.400)"
  );
  const softShadow = useColorModeValue(
    "0 16px 45px rgba(15, 23, 42, 0.07)",
    "0 20px 50px rgba(0, 0, 0, 0.24)"
  );
  const floatingShadow = useColorModeValue(
    "0 18px 38px rgba(15, 23, 42, 0.11)",
    "0 22px 46px rgba(0, 0, 0, 0.32)"
  );
  // Glass overlays that sit on top of the hero card background photos
  const glassOverlayGradient = useColorModeValue(
    "linear(to-br, whiteAlpha.800, brand.50, whiteAlpha.700)",
    "linear(to-br, blackAlpha.700, brand.900, blackAlpha.600)"
  );
  const glassBorderColor = useColorModeValue("whiteAlpha.800", "whiteAlpha.200");

  const [brand100, brand200, brand400] = useToken("colors", [
    "brand.100",
    "brand.200",
    "brand.400",
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
    () =>
      new Set(
        assignedCourses
          .map((course) => String(course.courseId || "").trim())
          .filter(Boolean)
      ),
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
    stores.courseStore.fetchMasterCategories().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (requestedEnrollmentCourseId) {
      router.replace(`/course?courseId=${requestedEnrollmentCourseId}`);
    }
  }, [requestedEnrollmentCourseId, router]);

  const availableCategories = useMemo(() => {
    const masterNames = (stores.courseStore.masterCategories || []).map((c) => c.name);
    const catalogNames = publicCoursesMeta.availableCategories || [];
    const combined = Array.from(new Set([...masterNames, ...catalogNames])).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["all", ...combined];
  }, [publicCoursesMeta.availableCategories, stores.courseStore.masterCategories]);

  const availableLanguages = useMemo(
    () => ["all", ...(publicCoursesMeta.availableLanguages || [])],
    [publicCoursesMeta.availableLanguages]
  );

  const featuredAssignedCourses = useMemo(() => assignedCourses.slice(0, 4), [assignedCourses]);

  // Any fetch driven by filters/search/sort OR the very first load — show full skeleton grid.
  const isPublicCoursesLoading = stores.courseStore.isPublicCoursesLoading;
  const isPublicCoursesLoadingMore = stores.courseStore.isPublicCoursesLoadingMore;

  const activeFilterCount = useMemo(
    () =>
      [
        Boolean(searchQuery.trim()),
        pricingFilter !== "all",
        categoryFilter !== "all",
        languageFilter !== "all",
        sortBy !== "latest",
      ].filter(Boolean).length,
    [categoryFilter, languageFilter, pricingFilter, searchQuery, sortBy]
  );

  const activeFilterLabels = useMemo(() => {
    const labels: Array<{ key: string; label: string; clear: () => void }> = [];

    if (searchQuery.trim()) {
      labels.push({
        key: "search",
        label: `Search: ${searchQuery.trim()}`,
        clear: () => setSearchQuery(""),
      });
    }

    if (pricingFilter !== "all") {
      labels.push({
        key: "pricing",
        label: pricingFilter === "free" ? "Free" : "Paid",
        clear: () => setPricingFilter("all"),
      });
    }

    if (categoryFilter !== "all") {
      labels.push({
        key: "category",
        label: categoryFilter,
        clear: () => setCategoryFilter("all"),
      });
    }

    if (languageFilter !== "all") {
      labels.push({
        key: "language",
        label: languageFilter,
        clear: () => setLanguageFilter("all"),
      });
    }

    if (sortBy !== "latest") {
      const sortLabels: Record<CatalogSort, string> = {
        latest: "Latest courses",
        popularity: "Most popular",
        price_asc: "Price: Low to High",
        price_desc: "Price: High to Low",
        highest_rated: "Highest rated",
      };

      labels.push({
        key: "sort",
        label: sortLabels[sortBy],
        clear: () => setSortBy("latest"),
      });
    }

    return labels;
  }, [categoryFilter, languageFilter, pricingFilter, searchQuery, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setPricingFilter("all");
    setCategoryFilter("all");
    setLanguageFilter("all");
    setSortBy("latest");
  };

  const scrollToCatalog = () => {
    catalogSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
      <Box minH="100vh" bg={pageBg} px={{ base: 3, md: 6 }}>
        <MyCoursesBoard basePath="/course" />
      </Box>
    );
  }

  const searchInputStyles = {
    bg: cardBg,
    borderColor,
    borderRadius: "xl",
    h: "42px",
    fontSize: "sm",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
    _hover: {
      borderColor: "brand.300",
    },
    _focusVisible: {
      borderColor: "brand.400",
      boxShadow: `0 0 0 3px ${brand100}`,
    },
  };

  const sortOptions: Array<{
    value: CatalogSort;
    label: string;
    description: string;
    icon: typeof FiClock;
  }> = [
    {
      value: "latest",
      label: "Fresh arrivals",
      description: "Newest courses first",
      icon: FiClock,
    },
    {
      value: "popularity",
      label: "Community picks",
      description: "Most popular courses",
      icon: FiTrendingUp,
    },
    {
      value: "highest_rated",
      label: "Top rated",
      description: "Highest learner ratings",
      icon: FiStar,
    },
    {
      value: "price_asc",
      label: "Lowest price",
      description: "Affordable options first",
      icon: FiDollarSign,
    },
    {
      value: "price_desc",
      label: "Highest price",
      description: "Premium options first",
      icon: FiDollarSign,
    },
  ];



  return (
    <Box minH="100vh" bg={pageBg}>

      <CourseCatalogHero
  totalCourses={publicCoursesMeta.total}
  onExploreCourses={scrollToCatalog}
/>
      {/* <Box
        bg={heroBg}
        borderBottomWidth="1px"
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-105px"
          right="-70px"
          w={{ base: "220px", md: "320px" }}
          h={{ base: "220px", md: "320px" }}
          bg={brand400}
          opacity={{ base: 0.12, md: 0.16 }}
          filter="blur(52px)"
          borderRadius="full"
          pointerEvents="none"
          animation={`${pulseAnimation} 7s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          bottom="-120px"
          left="18%"
          w="260px"
          h="260px"
          bg={brand200}
          opacity={{ base: 0.08, md: 0.12 }}
          filter="blur(60px)"
          borderRadius="full"
          pointerEvents="none"
        />

        <Grid
          maxW="full"
          mx="auto"
          px={{ base: 4, md: 8, lg: 12 }}
          py={{ base: 5, md: 7 }}
          minH={{ base: "188px", md: "238px" }}
          templateColumns={{ base: "1fr", md: "minmax(0, 1fr) 360px" }}
          alignItems="center"
          gap={{ base: 4, md: 8 }}
          position="relative"
        >
          <Box maxW="720px">
            <HStack spacing={2} mb={{ base: 2.5, md: 3 }}>
              <Box
                w="28px"
                h="28px"
                display="grid"
                placeItems="center"
                borderRadius="lg"
                bg="brand.500"
                color="white"
                boxShadow={softShadow}
              >
                <Icon as={FiCompass} fontSize="sm" />
              </Box>
              <Badge
                bg="brand.50"
                color="brand.700"
                borderRadius="full"
                px={2.5}
                py={1}
                textTransform="none"
                fontSize="xs"
                borderWidth="1px"
                borderColor="brand.100"
              >
                Learning catalog
              </Badge>
            </HStack>

            <Heading
              fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
              lineHeight={{ base: "1.16", md: "1.08" }}
              letterSpacing="-0.035em"
              maxW="680px"
            >
              Learn something useful,
              <Text as="span" bgGradient={heroAccentGradient} bgClip="text">
                {" "}one course at a time.
              </Text>
            </Heading>

            <Text
              mt={{ base: 2.5, md: 3 }}
              color={mutedText}
              fontSize={{ base: "sm", md: "md" }}
              lineHeight="1.6"
              maxW="590px"
              noOfLines={{ base: 2, md: 2 }}
            >
              Discover practical courses, continue your learning, and build skills at your own pace.
            </Text>

            <HStack mt={{ base: 3.5, md: 4 }} spacing={3}>
              <Button
                size={{ base: "sm", md: "md" }}
                colorScheme="brand"
                borderRadius="full"
                rightIcon={<FiArrowRight />}
                onClick={scrollToCatalog}
                px={{ base: 4, md: 5 }}
                boxShadow={softShadow}
                transition="all 0.22s ease"
                _hover={{ transform: "translateY(-2px)", boxShadow: floatingShadow }}
              >
                Explore courses
              </Button>

              <HStack spacing={1.5} color={softText} display={{ base: "none", sm: "flex" }}>
                <Icon as={FiBookOpen} />
                <Text fontSize="sm" fontWeight="700">
                  {publicCoursesMeta.total} available
                </Text>
              </HStack>
            </HStack>
          </Box>

          <Box
            display={{ base: "none", md: "block" }}
            position="relative"
            h="180px"
            aria-hidden="true"
          >
            <Box
              position="absolute"
              top="8px"
              right="8px"
              w="215px"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow={floatingShadow}
              animation={`${floatAnimation} 6s ease-in-out infinite`}
            >
              <Box
                position="absolute"
                inset={0}
                bgImage="url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=60')"
                bgSize="cover"
                bgPosition="center"
              />
              <Box
                position="relative"
                p={4}
                borderWidth="1px"
                borderColor={glassBorderColor}
                backdropFilter="blur(1px) saturate(160%) brightness(0.75)"
              >
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={2}>
                    <Box
                      w="34px"
                      h="34px"
                      display="grid"
                      placeItems="center"
                      bg="brand.100"
                      color="brand.700"
                      borderRadius="xl"
                      backdropFilter="blur(6px)"
                    >
                      <Icon as={FiPlayCircle} />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color={'white'}>
                        Start learning
                      </Text>
                      <Text fontSize="sm" fontWeight="800" color="white">
                        Pick your next skill
                      </Text>
                    </Box>
                  </HStack>
                  <Icon as={FiArrowRight} color="brand.500" />
                </HStack>

                <Box h="7px" bg="whiteAlpha.600" borderRadius="full" overflow="hidden">
                  <Box h="full" w="68%" bg="brand.500" borderRadius="full" />
                </Box>
              </Box>
            </Box>

            <Box
              position="absolute"
              left="4px"
              bottom="10px"
              w="175px"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow={softShadow}
              animation={`${floatReverseAnimation} 7s ease-in-out infinite`}
            >
              <Box
                position="absolute"
                inset={0}
                bgImage="url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=60')"
                bgSize="cover"
                bgPosition="center"
              />
              <Box
                position="relative"
                p={3.5}
                borderWidth="1px"
                borderColor={glassBorderColor}
                backdropFilter="blur(1px) saturate(160%) brightness(0.75)"
              >
                <HStack spacing={2.5}>
                  <Box
                    w="34px"
                    h="34px"
                    display="grid"
                    placeItems="center"
                    bg="whiteAlpha.700"
                    color="white.700"
                    borderRadius="xl"
                    backdropFilter="blur(6px)"
                  >
                    <Icon as={FiZap} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="800" color="white">
                      Learn your way
                    </Text>
                    <Text fontSize="xs" color={'white'}>
                      Simple and flexible
                    </Text>
                  </Box>
                </HStack>
              </Box>
            </Box>

            <Box
              position="absolute"
              left="155px"
              bottom="2px"
              w="38px"
              h="38px"
              borderRadius="full"
              borderWidth="1px"
              borderColor="brand.200"
              bg="brand.50"
              opacity={0.9}
            />
          </Box>
        </Grid>
      </Box> */}

      <Box maxW="full" mx="auto" px={{ base: 4, md: 8, lg: 12, xl: 16 }} py={{ base: 6, md: 9 }}>
        {isLearner && featuredAssignedCourses.length > 0 ? (
          <Box mb={{ base: 8, md: 11 }}>
            <Flex justify="space-between" align="center" mb={{ base: 4, md: 5 }} gap={3}>
              <Box minW={0}>
                <HStack spacing={2} mb={1}>
                  <Box w="18px" h="3px" borderRadius="full" bg="brand.500" />
                  <Text
                    fontSize="xs"
                    fontWeight="800"
                    color="brand.600"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                  >
                    Your learning
                  </Text>
                </HStack>
                <Heading size={{ base: "md", md: "lg" }}>Continue learning</Heading>
              </Box>

              <Button
                size="sm"
                variant="ghost"
                colorScheme="brand"
                borderRadius="full"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push(`/course?courseId=${featuredAssignedCourses[0].courseId}`)}
                flexShrink={0}
              >
                Resume latest
              </Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 4, md: 5 }}>
              {featuredAssignedCourses.map((course) => (
                <Box
                  key={course.courseId}
                  transition="transform 0.22s ease"
                  _hover={{ transform: "translateY(-3px)" }}
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
                          ? Math.min(
                              5,
                              Math.max(0, Number(course.assessmentSummary.scorePercentage) / 20)
                            )
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

        <Box ref={catalogSectionRef} scrollMarginTop="18px">
          <Flex
            justify="space-between"
            align={{ base: "flex-start", md: "flex-end" }}
            direction={{ base: "column", md: "row" }}
            gap={{ base: 3, md: 5 }}
            mb={{ base: 5, md: 7 }}
          >
            <Box minW={0}>
              <HStack spacing={2} mb={1}>
                <Box w="18px" h="3px" borderRadius="full" bg="brand.500" />
                <Text
                  fontSize="xs"
                  fontWeight="900"
                  color="brand.600"
                  textTransform="uppercase"
                  letterSpacing="0.12em"
                >
                  Explore
                </Text>
              </HStack>
              <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" letterSpacing="tight">
                Public{" "}
                <Box as="span" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text">
                  Learning Catalog
                </Box>
              </Heading>
              <Text mt={1.5} color={mutedText} fontSize="sm" fontWeight="700">
                {publicCoursesMeta.total} course{publicCoursesMeta.total === 1 ? "" : "s"} match your current view.
              </Text>
            </Box>

            <HStack
              display={{ base: "none", md: "flex" }}
              spacing={2}
              color="brand.500"
              cursor="pointer"
              _hover={{ color: "brand.600" }}
              transition="color 0.2s"
            >
              <Icon as={FiGlobe} />
              <Text fontSize="sm" fontWeight="800">
                Browse the complete catalog
              </Text>
              <Icon as={FiArrowRight} />
            </HStack>
          </Flex>

          <Flex display={{ base: "flex", lg: "none" }} gap={2.5} mb={4} align="center">
            <InputGroup flex="1" minW={0}>
              <InputLeftElement h="42px" pointerEvents="none">
                <Icon as={FiSearch} color={softText} />
              </InputLeftElement>
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search courses..."
                pl={10}
                {...searchInputStyles}
              />
            </InputGroup>

            <IconButton
              aria-label="Open course filters"
              icon={<FiFilter size={18} />}
              onClick={onOpen}
              h="42px"
              w="42px"
              borderRadius="xl"
              variant={activeFilterCount > 0 ? "solid" : "outline"}
              colorScheme="brand"
              bg={activeFilterCount > 0 ? "brand.500" : useColorModeValue("brand.50", "whiteAlpha.100")}
              color={activeFilterCount > 0 ? "white" : "brand.600"}
              borderColor={activeFilterCount > 0 ? "brand.500" : useColorModeValue("brand.100", "whiteAlpha.200")}
              _hover={{ transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.95)" }}
              transition="all 0.2s"
              position="relative"
            >
              {activeFilterCount > 0 && (
                <Box
                  position="absolute"
                  top="-6px"
                  right="-6px"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  w="18px"
                  h="18px"
                  fontSize="10px"
                  fontWeight="900"
                  display="grid"
                  placeItems="center"
                  boxShadow="md"
                >
                  {activeFilterCount}
                </Box>
              )}
            </IconButton>
          </Flex>

          {activeFilterLabels.length > 0 ? (
            <Flex
              display={{ base: "flex", lg: "none" }}
              mb={4}
              gap={2}
              flexWrap="wrap"
              align="center"
            >
              {activeFilterLabels.map((filter) => (
                <Button
                  key={filter.key}
                  size="xs"
                  h="28px"
                  variant="outline"
                  colorScheme="brand"
                  borderRadius="full"
                  rightIcon={<FiX />}
                  onClick={filter.clear}
                  maxW="180px"
                >
                  <Text as="span" noOfLines={1}>
                    {filter.label}
                  </Text>
                </Button>
              ))}
            </Flex>
          ) : null}

          <Grid
            templateColumns={{ base: "1fr", lg: "320px minmax(0, 1fr)" }}
            gap={{ base: 5, lg: 6 }}
            alignItems="start"
          >
            <Box
              display={{ base: "none", lg: "block" }}
              position="sticky"
              top="96px"
              alignSelf="start"
              p={5}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="3xl"
              bg={cardBg}
              boxShadow={softShadow}
            >
              
              <CourseFilterControls
                showSearch={true}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                pricingFilter={pricingFilter}
                setPricingFilter={setPricingFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                languageFilter={languageFilter}
                setLanguageFilter={setLanguageFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                availableCategories={availableCategories}
                availableLanguages={availableLanguages}
                softText={softText}
                borderColor={borderColor}
                searchInputStyles={searchInputStyles}
              />
            </Box>

            <Box minW={0}>
              <Flex
                mb={4}
                px={{ base: 0, md: 1 }}
                justify="space-between"
                align="center"
                gap={3}
              >
                <HStack spacing={2.5} minW={0}>
                  <Box
                    w="34px"
                    h="34px"
                    display="grid"
                    placeItems="center"
                    flexShrink={0}
                    borderRadius="xl"
                    bg="brand.50"
                    color="brand.700"
                    borderWidth="1px"
                    borderColor="brand.100"
                  >
                    <Icon as={FiBookOpen} />
                  </Box>
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight="800" lineHeight="1.2">
                      Course collection
                    </Text>
                    <Text fontSize="xs" color={softText} noOfLines={1}>
                      Showing the best matches for your selection
                    </Text>
                  </Box>
                </HStack>

                <Badge
                  borderRadius="full"
                  bg="brand.50"
                  color="brand.700"
                  px={3}
                  py={1.5}
                  textTransform="none"
                  flexShrink={0}
                >
                  {publicCoursesMeta.total} results
                </Badge>
              </Flex>

              {isPublicCoursesLoading ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 5 }}>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <CourseCardSkeleton key={`course-card-skeleton-${index}`} />
                  ))}
                </SimpleGrid>
              ) : publicCourses.length === 0 ? (
                <Box
                  textAlign="center"
                  py={{ base: 12, md: 16 }}
                  px={5}
                  borderRadius="3xl"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  boxShadow={softShadow}
                >
                  <Box
                    w="54px"
                    h="54px"
                    mx="auto"
                    display="grid"
                    placeItems="center"
                    borderRadius="2xl"
                    bg="brand.50"
                    color="brand.600"
                  >
                    <Icon as={FiBookOpen} boxSize={6} />
                  </Box>
                  <Heading size="md" mt={4}>
                    No courses found
                  </Heading>
                  <Text mt={2} color={mutedText} fontSize="sm">
                    Try a different search or clear some filters to see more courses.
                  </Text>
                  <Button
                    mt={5}
                    size="sm"
                    colorScheme="brand"
                    variant="outline"
                    borderRadius="full"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Button>
                </Box>
              ) : (
                <>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 5 }}>
                    {publicCourses.map((course) => (
                      <Box
                        key={course._id}
                        transition="transform 0.22s ease"
                        _hover={{ transform: "translateY(-3px)" }}
                      >
                        <CourseCard
                          course={course}
                          enrolled={enrolledCourseIds.has(String(course._id))}
                          onClick={() => setSelectedPreviewCourse(course)}
                        />
                      </Box>
                    ))}

                    {isPublicCoursesLoadingMore
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <CourseCardSkeleton key={`course-card-loading-more-${index}`} />
                        ))
                      : null}
                  </SimpleGrid>

                  <Box ref={loadMoreRef} h="1px" mt={6} />

                  {!publicCoursesMeta.hasMore && publicCourses.length > 0 ? (
                    <HStack mt={7} justify="center" color={softText} spacing={2}>
                      <Box w="28px" h="1px" bg={borderColor} />
                      <Text fontSize="sm">You&apos;ve reached the end of the catalog.</Text>
                      <Box w="28px" h="1px" bg={borderColor} />
                    </HStack>
                  ) : null}
                </>
              )}
            </Box>
          </Grid>
        </Box>
      </Box>

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="full">
        <DrawerOverlay backdropFilter="blur(8px)" />
        <DrawerContent borderTopRadius="none" bg={drawerBg} h="100vh">
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} py={4} px={5}>
            <HStack spacing={4} align="center">
              <IconButton
                aria-label="Back"
                icon={<FiArrowLeft size={18} />}
                onClick={onClose}
                variant="solid"
                borderRadius="full"
                w="38px"
                h="38px"
                bg={useColorModeValue("brand.50", "whiteAlpha.100")}
                color="brand.600"
                _hover={{ bg: useColorModeValue("brand.100", "whiteAlpha.200"), transform: "scale(1.05)" }}
                _active={{ transform: "scale(0.95)" }}
                border="none"
                transition="all 0.2s"
              />
              <Box>
                <Text fontSize="lg" fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                  <Box as="span" color={useColorModeValue("gray.800", "white")}>FILTER </Box>
                  <Box as="span" bgGradient={useColorModeValue("linear(to-r, brand.500, brand.700)", "linear(to-r, brand.300, brand.500)")} bgClip="text">
                    COURSES
                  </Box>
                </Text>
                <Text fontSize="9px" color={softText} fontWeight="700" letterSpacing="0.2em" mt={0.5} textTransform="uppercase">
                  Refine learning catalog
                </Text>
              </Box>
            </HStack>
          </DrawerHeader>
          <DrawerBody
            py={5}
            overflowY="auto"
            css={{
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "#ccc", borderRadius: "4px" },
            }}
          >
            <CourseFilterControls
              showSearch={false}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              pricingFilter={pricingFilter}
              setPricingFilter={setPricingFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              languageFilter={languageFilter}
              setLanguageFilter={setLanguageFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              availableCategories={availableCategories}
              availableLanguages={availableLanguages}
              softText={softText}
              borderColor={borderColor}
              searchInputStyles={searchInputStyles}
            />
          </DrawerBody>
          <Box
            p={4}
            borderTopWidth="1px"
            borderColor={borderColor}
            bg={drawerBg}
            zIndex={2}
          >
            <Button
              w="full"
              h="52px"
              colorScheme="brand"
              bgGradient="linear(to-r, brand.500, brand.600)"
              borderRadius="xl"
              fontWeight="900"
              fontSize="sm"
              letterSpacing="0.05em"
              onClick={onClose}
              _hover={{ bgGradient: "linear(to-r, brand.600, brand.700)" }}
              transition="all 0.2s"
            >
              Show matching courses
            </Button>
          </Box>
        </DrawerContent>
      </Drawer>

      <CoursePreviewDrawer
        course={selectedPreviewCourse}
        onClose={() => setSelectedPreviewCourse(null)}
      />
    </Box>
  );
});

export default CoursesPage;
