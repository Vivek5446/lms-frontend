"use client";

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
    Text,
    useColorModeValue,
    usePrefersReducedMotion,
    VStack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import React, {
    KeyboardEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    FiArrowRight,
    FiAward,
    FiBookOpen,
    FiCheckCircle,
    FiClock,
    FiPlay,
    FiSearch,
    FiStar,
    FiTrendingUp,
    FiZap,
} from "react-icons/fi";
export interface LandingHeroSlide {
  backgroundImage: string;
  illustration: string;
  floatingTitle: string;
  floatingText: string;
  statValue: string;
  statLabel: string;
}

interface LandingHeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onExplore: () => void;
  heroImageSrc?: string;
  backgroundImageSrc?: string;
  backgroundImages?: string[];
  totalCourses?: number | string;
  transitionInterval?: number;
  slides?: LandingHeroSlide[];
}

interface HeroSceneContent {
  title: string;
  description: string;
  statValue: string;
  statLabel: string;
}

const floatImage = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(-1deg);
  }

  50% {
    transform: translate3d(0, -10px, 0) rotate(1deg);
  }
`;

const floatCard = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -8px, 0);
  }
`;

const floatCardReverse = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(1deg);
  }

  50% {
    transform: translate3d(0, 7px, 0) rotate(-1deg);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    opacity: 0.18;
    transform: scale(1);
  }

  50% {
    opacity: 0.3;
    transform: scale(1.15);
  }
`;

const rotateRing = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const reverseRotateRing = keyframes`
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
`;

const shimmer = keyframes`
  0% {
    transform: translateX(-170%) skewX(-18deg);
  }

  100% {
    transform: translateX(280%) skewX(-18deg);
  }
`;

const morphShape = keyframes`
  0%, 100% {
    border-radius: 44% 56% 48% 52% / 48% 44% 56% 52%;
    transform: rotate(0deg) scale(1);
  }

  33% {
    border-radius: 56% 44% 58% 42% / 42% 58% 44% 56%;
    transform: rotate(1.5deg) scale(1.015);
  }

  66% {
    border-radius: 48% 52% 42% 58% / 58% 42% 55% 45%;
    transform: rotate(-1deg) scale(0.99);
  }
`;

const movingGlow = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(-18px, 13px, 0) scale(1.14);
  }
`;

const orbitDot = keyframes`
  from {
    transform: rotate(0deg) translateX(145px) rotate(0deg);
  }

  to {
    transform: rotate(360deg) translateX(145px) rotate(-360deg);
  }
`;

const pulseDot = keyframes`
  0%, 100% {
    opacity: 0.65;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.3);
  }
`;

const DEFAULT_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=85",
];

const HERO_SCENES: HeroSceneContent[] = [
  {
    title: "Keep progressing",
    description: "Small steps every day",
    statValue: "120+ courses",
    statLabel: "Discover something new",
  },
  {
    title: "Learn your way",
    description: "Flexible and self-paced",
    statValue: "Learn anywhere",
    statLabel: "Continue across devices",
  },
  {
    title: "Build real skills",
    description: "Grow with every lesson",
    statValue: "Track progress",
    statLabel: "Move closer to your goals",
  },
];

const LandingHero: React.FC<LandingHeroProps> = ({
  searchQuery,
  onSearchChange,
  onExplore,
  heroImageSrc = "/images/heroimg-Photoroom.png",
  backgroundImageSrc = DEFAULT_BACKGROUNDS[0],
  backgroundImages,
  totalCourses = "120+",
  transitionInterval = 7000,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const [activeBackground, setActiveBackground] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const resolvedBackgrounds = useMemo(() => {
    const providedImages = (backgroundImages ?? []).filter(Boolean);

    const images =
      providedImages.length > 0
        ? providedImages
        : [backgroundImageSrc, ...DEFAULT_BACKGROUNDS];

    return Array.from(new Set(images));
  }, [backgroundImageSrc, backgroundImages]);

  const activeScene =
    HERO_SCENES[activeBackground % HERO_SCENES.length];

  const sectionBg = useColorModeValue("white", "gray.900");
  const primaryText = useColorModeValue("gray.900", "white");
  const secondaryText = useColorModeValue("gray.600", "gray.300");
  const subtleText = useColorModeValue("gray.500", "gray.400");

  const activeBackgroundOpacity = useColorModeValue(0.72, 0.4);

  const heroOverlay = useColorModeValue(
    "linear-gradient(90deg, rgba(248,250,252,0.94) 0%, rgba(248,250,252,0.85) 42%, rgba(248,250,252,0.57) 68%, rgba(248,250,252,0.30) 100%)",
    "linear-gradient(90deg, rgba(17,24,39,0.96) 0%, rgba(17,24,39,0.89) 42%, rgba(17,24,39,0.64) 68%, rgba(17,24,39,0.37) 100%)",
  );

  const mobileOverlay = useColorModeValue(
    "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(248,250,252,0.91))",
    "linear-gradient(180deg, rgba(17,24,39,0.97), rgba(17,24,39,0.93))",
  );

  const glassBg = useColorModeValue(
    "rgba(255,255,255,0.76)",
    "rgba(17,24,39,0.72)",
  );

  const strongGlassBg = useColorModeValue(
    "rgba(255,255,255,0.92)",
    "rgba(26,32,44,0.9)",
  );

  const glassBorder = useColorModeValue(
    "rgba(255,255,255,0.88)",
    "whiteAlpha.200",
  );

  const lightBorder = useColorModeValue(
    "gray.200",
    "whiteAlpha.200",
  );

  const playButtonBorder = useColorModeValue(
    "white",
    "gray.800",
  );

  const inactiveIndicatorBg = useColorModeValue(
    "blackAlpha.300",
    "whiteAlpha.400",
  );

  useEffect(() => {
    if (
      prefersReducedMotion ||
      isHeroPaused ||
      resolvedBackgrounds.length <= 1
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveBackground(
        (current) =>
          (current + 1) % resolvedBackgrounds.length,
      );
    }, transitionInterval);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    isHeroPaused,
    prefersReducedMotion,
    resolvedBackgrounds.length,
    transitionInterval,
  ]);

  useEffect(() => {
    if (activeBackground >= resolvedBackgrounds.length) {
      setActiveBackground(0);
    }
  }, [activeBackground, resolvedBackgrounds.length]);

  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      onExplore();
    }
  };

  const features = [
    {
      icon: FiClock,
      title: "Flexible learning",
      description: "Learn at your pace",
    },
    {
      icon: FiAward,
      title: "Build real skills",
      description: "Practical courses",
    },
    {
      icon: FiCheckCircle,
      title: "Track progress",
      description: "Stay motivated",
    },
  ];

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      isolation="isolate"
      bg={sectionBg}
      minH={{ base: "auto", md: "500px", xl: "530px" }}
      borderBottomWidth="1px"
      borderColor={lightBorder}
      onMouseEnter={() => setIsHeroPaused(true)}
      onMouseLeave={() => setIsHeroPaused(false)}
    >
      {/* Smoothly changing background images */}
      {resolvedBackgrounds.map((background, index) => {
        const isActive = index === activeBackground;

        return (
          <Image
            key={background}
            src={background}
            alt=""
            aria-hidden="true"
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition={{
              base: "center",
              lg: "center",
            }}
            opacity={isActive ? activeBackgroundOpacity : 0}
            transform={
              isActive ? "scale(1.09)" : "scale(1.025)"
            }
            transition="
              opacity 1.35s ease-in-out,
              transform 8s ease-out
            "
            pointerEvents="none"
            willChange="opacity, transform"
          />
        );
      })}

      {/* Readability overlay */}
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        bg={{
          base: mobileOverlay,
          lg: heroOverlay,
        }}
        pointerEvents="none"
      />

      {/* Soft brand wash */}
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        bgGradient="
          linear(
            to-br,
            brand.50,
            transparent 45%,
            brand.100
          )
        "
        opacity={useColorModeValue(0.34, 0.11)}
        pointerEvents="none"
      />

      {/* Subtle dot pattern */}

      {/* Animated background glows */}
      <Box
        position="absolute"
        top={{ base: "-130px", md: "-180px" }}
        left={{ base: "-100px", md: "26%" }}
        zIndex={1}
        w={{ base: "300px", md: "430px" }}
        h={{ base: "300px", md: "430px" }}
        borderRadius="full"
        bg="brand.300"
        filter="blur(95px)"
        animation={
          prefersReducedMotion
            ? undefined
            : `${pulseGlow} 8s ease-in-out infinite`
        }
        pointerEvents="none"
      />

      <Box
        position="absolute"
        right={{ base: "-170px", md: "-120px" }}
        bottom={{ base: "-190px", md: "-250px" }}
        zIndex={1}
        w={{ base: "380px", md: "530px" }}
        h={{ base: "380px", md: "530px" }}
        borderRadius="full"
        bg="brand.500"
        opacity={0.13}
        filter="blur(105px)"
        pointerEvents="none"
      />

      <Grid
        position="relative"
        zIndex={2}
        maxW="1480px"
        minH="inherit"
        mx="auto"
        px={{
          base: 4,
          sm: 6,
          md: 9,
          lg: 12,
          xl: 16,
        }}
        py={{
          base: 7,
          md: 8,
          lg: 9,
        }}
        templateColumns={{
          base: "1fr",
          lg: "minmax(0, 1fr) 410px",
          xl: "minmax(0, 1fr) 450px",
        }}
        gap={{
          base: 7,
          md: 9,
          lg: 10,
        }}
        alignItems="center"
      >
        {/* Left content */}
        <VStack
          align="flex-start"
          spacing={0}
          maxW={{ base: "100%", lg: "700px" }}
        >
          <HStack
            spacing={2}
            mb={{ base: 4, md: 5 }}
            px={2.5}
            py={1.5}
            borderRadius="full"
            bg={glassBg}
            borderWidth="1px"
            borderColor={glassBorder}
            backdropFilter="blur(18px)"
            boxShadow="0 10px 35px rgba(15, 23, 42, 0.08)"
          >
            <Circle
              size="26px"
              bg="brand.500"
              color="white"
            >
              <Icon as={FiZap} fontSize="xs" />
            </Circle>

            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="800"
              color="brand.700"
            >
              Your space to learn and grow
            </Text>

            <Badge
              colorScheme="brand"
              borderRadius="full"
              textTransform="none"
              px={2}
              fontSize="10px"
            >
              Explore
            </Badge>
          </HStack>

          <Heading
            as="h1"
            color={primaryText}
            fontSize={{
              base: "3xl",
              sm: "4xl",
              md: "4xl",
              xl: "5xl",
            }}
            lineHeight={{ base: "1.1", md: "1.04" }}
            letterSpacing={{
              base: "-0.04em",
              md: "-0.05em",
            }}
            maxW="680px"
          >
            Learn today. Grow into{" "}
            <Box
              as="span"
              position="relative"
              display="inline-block"
              color="brand.600"
              whiteSpace={{ md: "nowrap" }}
            >
              what&apos;s next.
              <Box
                position="absolute"
                left="2%"
                right="0"
                bottom={{ base: "-3px", md: "-6px" }}
                h={{ base: "8px", md: "9px" }}
                bg="brand.200"
                opacity={0.65}
                borderRadius="full"
                transform="rotate(-1.5deg)"
                zIndex={-1}
              />
            </Box>
          </Heading>

          <Text
            mt={{ base: 3.5, md: 4 }}
            color={secondaryText}
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.75"
            maxW="590px"
          >
            Discover useful courses, strengthen your skills, and
            move forward with learning designed around your
            schedule.
          </Text>

          {/* Search */}
          <Flex
            mt={{ base: 5, md: 6 }}
            w="full"
            maxW="630px"
            p={1.5}
            align="center"
            gap={2}
            bg={strongGlassBg}
            borderWidth="1px"
            borderColor={glassBorder}
            borderRadius={{ base: "2xl", md: "full" }}
            backdropFilter="blur(22px)"
            boxShadow="0 16px 44px rgba(15, 23, 42, 0.13)"
            transition="all 0.25s ease"
            _focusWithin={{
              borderColor: "brand.300",
              boxShadow:
                "0 19px 50px rgba(15, 23, 42, 0.17)",
            }}
          >
            <Flex
              align="center"
              gap={3}
              flex={1}
              minW={0}
              pl={{ base: 2, md: 3 }}
            >
              <Circle
                size={{ base: "30px", md: "32px" }}
                bg="brand.50"
                color="brand.600"
                flexShrink={0}
              >
                <Icon as={FiSearch} fontSize="sm" />
              </Circle>

              <Input
                value={searchQuery}
                onChange={(event) =>
                  onSearchChange(event.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="What would you like to learn?"
                variant="unstyled"
                h={{ base: "38px", md: "42px" }}
                fontSize={{ base: "sm", md: "md" }}
                color={primaryText}
                _placeholder={{
                  color: subtleText,
                }}
              />
            </Flex>

            <Button
              colorScheme="brand"
              borderRadius="full"
              h={{ base: "40px", md: "44px" }}
              px={{ base: 4, md: 6 }}
              fontSize="sm"
              rightIcon={<FiArrowRight />}
              onClick={onExplore}
              flexShrink={0}
              overflow="hidden"
              position="relative"
              boxShadow="0 11px 27px rgba(0, 0, 0, 0.14)"
              transition="all 0.23s ease"
              _before={{
                content: '""',
                position: "absolute",
                top: "-50%",
                bottom: "-50%",
                left: "-35%",
                w: "24%",
                bg: "whiteAlpha.500",
                transform: "skewX(-18deg)",
                animation: prefersReducedMotion
                  ? undefined
                  : `${shimmer} 5s ease-in-out infinite`,
              }}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow:
                  "0 15px 32px rgba(0, 0, 0, 0.19)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
            >
              Explore
            </Button>
          </Flex>

          {/* Compact feature cards */}
          <SimpleGrid
            columns={{ base: 1, sm: 3 }}
            spacing={{ base: 2, md: 2.5 }}
            mt={{ base: 4, md: 5 }}
            w="full"
            maxW="630px"
            display={{ base: "none", sm: "grid" }}
          >
            {features.map((feature) => (
              <HStack
                key={feature.title}
                spacing={2}
                p={2.5}
                bg={glassBg}
                borderWidth="1px"
                borderColor={glassBorder}
                borderRadius="xl"
                backdropFilter="blur(16px)"
                boxShadow="
                  0 8px 24px rgba(15, 23, 42, 0.05)
                "
                transition="all 0.22s ease"
                _hover={{
                  transform: "translateY(-3px)",
                  bg: strongGlassBg,
                  boxShadow:
                    "0 13px 30px rgba(15, 23, 42, 0.1)",
                }}
              >
                <Circle
                  size="31px"
                  bg="brand.50"
                  color="brand.600"
                  flexShrink={0}
                >
                  <Icon as={feature.icon} fontSize="xs" />
                </Circle>

                <Box minW={0}>
                  <Text
                    color={primaryText}
                    fontSize="xs"
                    fontWeight="800"
                    noOfLines={1}
                  >
                    {feature.title}
                  </Text>

                  <Text
                    color={subtleText}
                    fontSize="9px"
                    noOfLines={1}
                  >
                    {feature.description}
                  </Text>
                </Box>
              </HStack>
            ))}
          </SimpleGrid>
        </VStack>

        {/* Right visual */}
        <Box
          display={{ base: "none", lg: "block" }}
          position="relative"
          h={{ lg: "380px", xl: "405px" }}
        >
          {/* Smaller morphing organic shape */}
          <Box
            position="absolute"
            inset={{
              lg: "34px 25px 29px 43px",
              xl: "29px 26px 24px 43px",
            }}
            bgGradient="
              linear(
                to-br,
                brand.50,
                brand.100,
                whiteAlpha.800
              )
            "
            borderWidth="1px"
            borderColor={glassBorder}
            backdropFilter="blur(24px)"
            boxShadow="
              0 28px 70px rgba(15, 23, 42, 0.16)
            "
            animation={
              prefersReducedMotion
                ? undefined
                : `${morphShape} 11s ease-in-out infinite`
            }
          />

          {/* Outer rotating ring */}
          <Box
            position="absolute"
            top="50%"
            left="52%"
            w={{ lg: "285px", xl: "305px" }}
            h={{ lg: "285px", xl: "305px" }}
            mt={{ lg: "-142px", xl: "-152px" }}
            ml={{ lg: "-142px", xl: "-152px" }}
            borderRadius="full"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="brand.300"
            opacity={0.7}
            animation={
              prefersReducedMotion
                ? undefined
                : `${rotateRing} 30s linear infinite`
            }
          >
            <Circle
              position="absolute"
              top="-6px"
              left="50%"
              size="11px"
              bg="brand.500"
              boxShadow="
                0 0 0 6px rgba(49, 130, 206, 0.13)
              "
            />

            <Circle
              position="absolute"
              right="18px"
              bottom="32px"
              size="8px"
              bg="orange.400"
            />
          </Box>

          {/* Inner rotating decorative ring */}
          <Box
            position="absolute"
            top="50%"
            left="52%"
            w="225px"
            h="225px"
            mt="-112px"
            ml="-112px"
            borderRadius="full"
            borderWidth="1px"
            borderStyle="dotted"
            borderColor="brand.200"
            opacity={0.5}
            animation={
              prefersReducedMotion
                ? undefined
                : `${reverseRotateRing} 24s linear infinite`
            }
          />

          {/* Moving glow */}
          <Circle
            position="absolute"
            top="50%"
            left="52%"
            size="225px"
            mt="-112px"
            ml="-112px"
            bg="brand.200"
            opacity={0.28}
            filter="blur(48px)"
            animation={
              prefersReducedMotion
                ? undefined
                : `${movingGlow} 7s ease-in-out infinite`
            }
          />

          {/* Decorative learning path */}
          <Box
            position="absolute"
            inset={{
              lg: "63px 50px 55px 54px",
              xl: "69px 53px 58px 57px",
            }}
            color="brand.400"
            opacity={0.37}
            pointerEvents="none"
          >
            <svg
              viewBox="0 0 400 290"
              width="100%"
              height="100%"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="
                  M26 235
                  C92 175, 126 225, 180 157
                  C229 96, 292 147, 365 62
                "
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="7 9"
              />

              <circle
                cx="26"
                cy="235"
                r="5"
                fill="currentColor"
              />

              <circle
                cx="180"
                cy="157"
                r="5"
                fill="currentColor"
              />

              <circle
                cx="365"
                cy="62"
                r="5"
                fill="currentColor"
              />
            </svg>
          </Box>

          {/* Orbiting dot */}
          <Box
            position="absolute"
            top="50%"
            left="52%"
            w="10px"
            h="10px"
            mt="-5px"
            ml="-5px"
            borderRadius="full"
            bg="brand.500"
            boxShadow="
              0 0 0 6px rgba(49, 130, 206, 0.12)
            "
            animation={
              prefersReducedMotion
                ? undefined
                : `${orbitDot} 17s linear infinite`
            }
          />

          {/* Original graduation-cap image kept in place */}
          <Box
            position="absolute"
            inset={{
              lg: "30px 37px 23px 48px",
              xl: "25px 40px 20px 48px",
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            animation={
              prefersReducedMotion
                ? undefined
                : `${floatImage} 7s ease-in-out infinite`
            }
          >
            <Image
              src={heroImageSrc}
              alt="Graduation cap on stack of books"
              w="full"
              maxH="100%"
              objectFit="contain"
              filter="
                drop-shadow(
                  0 20px 30px rgba(0,0,0,0.15)
                )
              "
            />
          </Box>

          {/* Changing top floating card */}
          <HStack
            key={`top-${activeBackground}`}
            position="absolute"
            top="20px"
            right="-4px"
            spacing={2.5}
            w="180px"
            p={2.5}
            bg={strongGlassBg}
            borderWidth="1px"
            borderColor={glassBorder}
            borderRadius="2xl"
            backdropFilter="blur(20px)"
            boxShadow="
              0 16px 40px rgba(15, 23, 42, 0.15)
            "
            animation={
              prefersReducedMotion
                ? undefined
                : `${floatCard} 6.5s ease-in-out infinite`
            }
          >
            <Circle
              size="36px"
              bg="green.100"
              color="green.600"
              flexShrink={0}
            >
              <Icon as={FiTrendingUp} fontSize="sm" />
            </Circle>

            <Box minW={0}>
              <Text
                color={primaryText}
                fontSize="xs"
                fontWeight="900"
                noOfLines={2}
              >
                {activeScene.title}
              </Text>

              <Text
                mt={0.5}
                color={subtleText}
                fontSize="10px"
                noOfLines={2}
              >
                {activeScene.description}
              </Text>
            </Box>
          </HStack>

          {/* Changing bottom floating card */}
          <HStack
            key={`bottom-${activeBackground}`}
            position="absolute"
            left="0"
            bottom="32px"
            spacing={2.5}
            w="185px"
            p={2.5}
            bg={strongGlassBg}
            borderWidth="1px"
            borderColor={glassBorder}
            borderRadius="2xl"
            backdropFilter="blur(20px)"
            boxShadow="
              0 16px 40px rgba(15, 23, 42, 0.15)
            "
            animation={
              prefersReducedMotion
                ? undefined
                : `${floatCardReverse} 7.5s ease-in-out infinite`
            }
          >
            <Circle
              size="36px"
              bg="brand.100"
              color="brand.700"
              flexShrink={0}
            >
              <Icon as={FiBookOpen} fontSize="sm" />
            </Circle>

            <Box minW={0}>
              <Text
                color={primaryText}
                fontSize="xs"
                fontWeight="900"
                noOfLines={1}
              >
                {activeBackground === 0
                  ? `${totalCourses} courses`
                  : activeScene.statValue}
              </Text>

              <Text
                mt={0.5}
                color={subtleText}
                fontSize="10px"
                noOfLines={2}
              >
                {activeScene.statLabel}
              </Text>
            </Box>
          </HStack>

          {/* Play button */}
          <Circle
            position="absolute"
            right="34px"
            bottom="45px"
            size="49px"
            bg="brand.500"
            color="white"
            borderWidth="4px"
            borderColor={playButtonBorder}
            boxShadow="
              0 15px 35px rgba(0, 0, 0, 0.2)
            "
            transition="all 0.24s ease"
            _hover={{
              transform: "scale(1.08)",
              boxShadow:
                "0 18px 40px rgba(0, 0, 0, 0.24)",
            }}
          >
            <Icon as={FiPlay} ml="2px" />
          </Circle>

          {/* Floating star */}
          <Circle
            position="absolute"
            top="47%"
            left="18px"
            size="32px"
            bg="orange.100"
            color="orange.500"
            boxShadow="lg"
            animation={
              prefersReducedMotion
                ? undefined
                : `${floatCard} 5.5s ease-in-out infinite`
            }
          >
            <Icon
              as={FiStar}
              fill="currentColor"
              fontSize="sm"
            />
          </Circle>

          {/* Pulse dot */}
          <Circle
            position="absolute"
            top="29%"
            right="31px"
            size="8px"
            bg="brand.500"
            animation={
              prefersReducedMotion
                ? undefined
                : `${pulseDot} 2.5s ease-in-out infinite`
            }
          />

          {/* Desktop background selectors */}
          {resolvedBackgrounds.length > 1 ? (
            <HStack
              position="absolute"
              left="50%"
              bottom="0"
              transform="translateX(-50%)"
              spacing={1.5}
              p={1.5}
              bg={glassBg}
              borderWidth="1px"
              borderColor={glassBorder}
              borderRadius="full"
              backdropFilter="blur(14px)"
              boxShadow="
                0 8px 20px rgba(15, 23, 42, 0.08)
              "
            >
              {resolvedBackgrounds.map((background, index) => {
                const isActive = index === activeBackground;

                return (
                  <Box
                    key={`${background}-${index}`}
                    as="button"
                    type="button"
                    aria-label={`Show hero background ${index + 1}`}
                    w={isActive ? "22px" : "7px"}
                    h="7px"
                    borderRadius="full"
                    bg={
                      isActive
                        ? "brand.500"
                        : inactiveIndicatorBg
                    }
                    transition="all 0.3s ease"
                    cursor="pointer"
                    onClick={() => setActiveBackground(index)}
                    _hover={{
                      bg: isActive
                        ? "brand.600"
                        : "brand.200",
                    }}
                  />
                );
              })}
            </HStack>
          ) : null}
        </Box>
      </Grid>

      {/* Mobile background selectors */}
      {resolvedBackgrounds.length > 1 ? (
        <HStack
          display={{ base: "flex", lg: "none" }}
          position="absolute"
          right={4}
          bottom={3}
          zIndex={4}
          spacing={1.5}
          p={1.5}
          bg={glassBg}
          borderWidth="1px"
          borderColor={glassBorder}
          borderRadius="full"
          backdropFilter="blur(14px)"
        >
          {resolvedBackgrounds.map((background, index) => {
            const isActive = index === activeBackground;

            return (
              <Box
                key={`mobile-${background}-${index}`}
                as="button"
                type="button"
                aria-label={`Show hero background ${index + 1}`}
                w={isActive ? "20px" : "7px"}
                h="7px"
                borderRadius="full"
                bg={
                  isActive
                    ? "brand.500"
                    : inactiveIndicatorBg
                }
                transition="all 0.3s ease"
                onClick={() => setActiveBackground(index)}
              />
            );
          })}
        </HStack>
      ) : null}
    </Box>
  );
};

export default LandingHero;