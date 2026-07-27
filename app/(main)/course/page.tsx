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
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
  useToken,
  VStack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiClock,
  FiCompass,
  FiDollarSign,
  FiFilter,
  FiGlobe,
  FiGrid,
  FiPlayCircle,
  FiSearch,
  FiStar,
  FiTag,
  FiTrendingUp,
  FiX,
  FiZap,
} from "react-icons/fi";

type CatalogSort = "latest" | "popularity" | "price_asc" | "price_desc" | "highest_rated";
type PricingFilter = "all" | "free" | "paid";

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

  const catalogSectionRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const pageBg = useColorModeValue("gray.50", "gray.900");
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

  const renderFilterControls = (showSearch: boolean) => (
    <VStack align="stretch" spacing={5}>
      {showSearch ? (
        <Box>
          <Text
            mb={2}
            fontSize="xs"
            fontWeight="800"
            color={softText}
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            Find a course
          </Text>
          <InputGroup>
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
        </Box>
      ) : null}

      <Box>
        <HStack mb={2.5} spacing={2}>
          <Box
            w="28px"
            h="28px"
            display="grid"
            placeItems="center"
            borderRadius="lg"
            bg="brand.50"
            color="brand.700"
          >
            <Icon as={FiDollarSign} fontSize="sm" />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="800" lineHeight="1.1">
              Pricing
            </Text>
            <Text fontSize="xs" color={softText}>
              Choose what suits you
            </Text>
          </Box>
        </HStack>

        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
          {[
            { value: "all" as PricingFilter, label: "All" },
            { value: "free" as PricingFilter, label: "Free" },
            { value: "paid" as PricingFilter, label: "Paid" },
          ].map((option) => {
            const isActive = pricingFilter === option.value;

            return (
              <Button
                key={option.value}
                h="36px"
                px={2}
                size="sm"
                borderRadius="xl"
                variant={isActive ? "solid" : "outline"}
                colorScheme="brand"
                borderColor={isActive ? "brand.500" : borderColor}
                fontSize="xs"
                onClick={() => setPricingFilter(option.value)}
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-1px)", borderColor: "brand.300" }}
              >
                {option.label}
              </Button>
            );
          })}
        </Grid>
      </Box>

      <Box>
        <HStack mb={2.5} spacing={2}>
          <Box
            w="28px"
            h="28px"
            display="grid"
            placeItems="center"
            borderRadius="lg"
            bg="brand.50"
            color="brand.700"
          >
            <Icon as={FiGrid} fontSize="sm" />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="800" lineHeight="1.1">
              Categories
            </Text>
            <Text fontSize="xs" color={softText}>
              Pick an area to explore
            </Text>
          </Box>
        </HStack>

        <Flex
          gap={2}
          flexWrap="wrap"
          maxH="148px"
          overflowY="auto"
          pr={1}
          css={hiddenScrollbarCss}
        >
          {availableCategories.map((category) => {
            const isActive = categoryFilter === category;

            return (
              <Button
                key={category}
                size="xs"
                h="30px"
                px={3}
                maxW="100%"
                borderRadius="full"
                variant={isActive ? "solid" : "outline"}
                colorScheme="brand"
                borderColor={isActive ? "brand.500" : borderColor}
                leftIcon={category === "all" ? <FiGrid /> : <FiTag />}
                onClick={() => setCategoryFilter(category)}
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-1px)", borderColor: "brand.300" }}
              >
                <Text as="span" noOfLines={1}>
                  {category === "all" ? "All topics" : category}
                </Text>
              </Button>
            );
          })}
        </Flex>
      </Box>

      <Box>
        <HStack mb={2.5} spacing={2}>
          <Box
            w="28px"
            h="28px"
            display="grid"
            placeItems="center"
            borderRadius="lg"
            bg="brand.50"
            color="brand.700"
          >
            <Icon as={FiGlobe} fontSize="sm" />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="800" lineHeight="1.1">
              Language
            </Text>
            <Text fontSize="xs" color={softText}>
              Learn in your preferred language
            </Text>
          </Box>
        </HStack>

        <Flex
          gap={2}
          flexWrap="wrap"
          maxH="112px"
          overflowY="auto"
          pr={1}
          css={hiddenScrollbarCss}
        >
          {availableLanguages.map((language) => {
            const isActive = languageFilter === language;

            return (
              <Button
                key={language}
                size="xs"
                h="30px"
                px={3}
                maxW="100%"
                borderRadius="full"
                variant={isActive ? "solid" : "outline"}
                colorScheme="brand"
                borderColor={isActive ? "brand.500" : borderColor}
                onClick={() => setLanguageFilter(language)}
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-1px)", borderColor: "brand.300" }}
              >
                <Text as="span" noOfLines={1}>
                  {language === "all" ? "Every language" : language}
                </Text>
              </Button>
            );
          })}
        </Flex>
      </Box>

      <Box>
        <HStack mb={2.5} spacing={2}>
          <Box
            w="28px"
            h="28px"
            display="grid"
            placeItems="center"
            borderRadius="lg"
            bg="brand.50"
            color="brand.700"
          >
            <Icon as={FiZap} fontSize="sm" />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="800" lineHeight="1.1">
              Arrange courses
            </Text>
            <Text fontSize="xs" color={softText}>
              Set the order that feels right
            </Text>
          </Box>
        </HStack>

        <VStack align="stretch" spacing={2}>
          {sortOptions.map((option) => {
            const isActive = sortBy === option.value;

            return (
              <Button
                key={option.value}
                h="auto"
                minH="52px"
                py={2.5}
                px={3}
                justifyContent="flex-start"
                textAlign="left"
                borderRadius="xl"
                variant="outline"
                borderColor={isActive ? "brand.400" : borderColor}
                bg={isActive ? "brand.50" : "transparent"}
                color={isActive ? "brand.700" : undefined}
                onClick={() => setSortBy(option.value)}
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateX(2px)",
                  borderColor: "brand.300",
                  bg: "brand.50",
                }}
              >
                <Box
                  w="31px"
                  h="31px"
                  flexShrink={0}
                  display="grid"
                  placeItems="center"
                  borderRadius="lg"
                  bg={isActive ? "brand.500" : "brand.50"}
                  color={isActive ? "white" : "brand.700"}
                >
                  <Icon as={option.icon} fontSize="sm" />
                </Box>

                <Box ml={2.5} minW={0} flex="1">
                  <Text fontSize="xs" fontWeight="800" lineHeight="1.15">
                    {option.label}
                  </Text>
                  <Text mt={0.5} fontSize="10px" color={isActive ? "brand.600" : softText}>
                    {option.description}
                  </Text>
                </Box>

                <Box
                  w="20px"
                  h="20px"
                  ml={2}
                  flexShrink={0}
                  display="grid"
                  placeItems="center"
                  borderRadius="full"
                  bg={isActive ? "brand.500" : "transparent"}
                  color="white"
                  borderWidth="1px"
                  borderColor={isActive ? "brand.500" : borderColor}
                >
                  {isActive ? <Icon as={FiCheck} fontSize="11px" /> : null}
                </Box>
              </Button>
            );
          })}
        </VStack>
      </Box>

      <Button
        w="full"
        h="40px"
        variant="ghost"
        color={mutedText}
        borderRadius="xl"
        leftIcon={<FiX />}
        onClick={resetFilters}
        isDisabled={activeFilterCount === 0}
      >
        Clear all filters
      </Button>
    </VStack>
  );

  return (
    <Box minH="100vh" bg={pageBg}>
      <Box
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
          maxW="8xl"
          mx="auto"
          px={{ base: 4, md: 8 }}
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

          {/* Floating glass cards with photo backgrounds */}
          <Box
            display={{ base: "none", md: "block" }}
            position="relative"
            h="180px"
            aria-hidden="true"
          >
            {/* Card 1: Start learning */}
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
              {/* <Box position="absolute" inset={0} bgGradient={glassOverlayGradient} /> */}
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

            {/* Card 2: Learn your way */}
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
              {/* <Box position="absolute" inset={0} bgGradient={glassOverlayGradient} /> */}
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
      </Box>

      <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 9 }}>
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
            mb={{ base: 4, md: 6 }}
          >
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
                  Explore
                </Text>
              </HStack>
              <Heading size={{ base: "md", md: "lg" }}>Public learning catalog</Heading>
              <Text mt={1.5} color={mutedText} fontSize={{ base: "sm", md: "md" }}>
                {publicCoursesMeta.total} course{publicCoursesMeta.total === 1 ? "" : "s"} match your current view.
              </Text>
            </Box>

            <HStack display={{ base: "none", md: "flex" }} spacing={2} color={softText}>
              <Icon as={FiGlobe} />
              <Text fontSize="sm" fontWeight="700">
                Browse the complete catalog
              </Text>
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

            <Button
              h="42px"
              minW="42px"
              px={activeFilterCount > 0 ? 3 : 0}
              colorScheme="brand"
              variant={activeFilterCount > 0 ? "solid" : "outline"}
              borderRadius="xl"
              leftIcon={<FiFilter />}
              onClick={onOpen}
              aria-label="Open course filters"
            >
              {activeFilterCount > 0 ? activeFilterCount : ""}
            </Button>
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
            templateColumns={{ base: "1fr", lg: "300px minmax(0, 1fr)" }}
            gap={{ base: 5, lg: 6 }}
            alignItems="start"
          >
            <Box
              display={{ base: "none", lg: "block" }}
      position="sticky"
      top="20px"
   alignSelf="start"
      maxH="calc(100vh - 40px)"
      overflowY="auto"
      p={4}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="3xl"
      bg={cardBg}
      boxShadow={softShadow}
      css={hiddenScrollbarCss}
            >
              
              {renderFilterControls(true)}
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
                          onClick={() => router.push(`/course?courseId=${course._id}`)}
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

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(8px)" />
        <DrawerContent borderTopRadius="3xl" bg={drawerBg} maxH="86vh">
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} pr={12}>
            <HStack spacing={3}>
              <Box
                w="36px"
                h="36px"
                display="grid"
                placeItems="center"
                borderRadius="xl"
                bg="brand.50"
                color="brand.700"
              >
                <Icon as={FiFilter} />
              </Box>
              <Box>
                <Text fontSize="md" fontWeight="800">
                  Filter courses
                </Text>
                <Text fontSize="xs" color={softText} fontWeight="500">
                  Refine the catalog without leaving the courses.
                </Text>
              </Box>
            </HStack>
          </DrawerHeader>
          <DrawerBody py={5}>
            {renderFilterControls(false)}
            <Button
              mt={5}
              w="full"
              colorScheme="brand"
              borderRadius="xl"
              onClick={onClose}
            >
              Show matching courses
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
});

export default CoursesPage;