// components/course/CourseCatalogHero.tsx

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
    Stack,
    Text,
    useColorModeValue,
    usePrefersReducedMotion,
    VStack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import React from "react";
import {
    FiArrowRight,
    FiBookOpen,
    FiCheckCircle,
    FiCompass,
    FiPlay,
    FiStar,
    FiTrendingUp,
    FiZap,
} from "react-icons/fi";

interface CourseCatalogHeroProps {
  totalCourses: number;
  onExploreCourses: () => void;
}

const floatAnimation = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(-2deg);
  }
  50% {
    transform: translate3d(0, -12px, 0) rotate(0deg);
  }
`;

const reverseFloatAnimation = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(3deg);
  }
  50% {
    transform: translate3d(0, 10px, 0) rotate(1deg);
  }
`;

const glowAnimation = keyframes`
  0%, 100% {
    opacity: 0.45;
    transform: scale(1);
  }
  50% {
    opacity: 0.75;
    transform: scale(1.12);
  }
`;

const orbitAnimation = keyframes`
  0% {
    transform: rotate(0deg) translateX(6px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(6px) rotate(-360deg);
  }
`;

const shimmerAnimation = keyframes`
  0% {
    transform: translateX(-140%) skewX(-18deg);
  }
  100% {
    transform: translateX(220%) skewX(-18deg);
  }
`;

const CourseCatalogHero: React.FC<CourseCatalogHeroProps> = ({
  totalCourses,
  onExploreCourses,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const heroBackground = useColorModeValue("white", "gray.900");
  const cardBackground = useColorModeValue(
    "rgba(255, 255, 255, 0.72)",
    "rgba(23, 25, 35, 0.78)",
  );
  const subtleCardBackground = useColorModeValue(
    "rgba(255, 255, 255, 0.9)",
    "rgba(26, 32, 44, 0.88)",
  );
  const borderColor = useColorModeValue(
    "rgba(255, 255, 255, 0.72)",
    "whiteAlpha.200",
  );
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const subtleText = useColorModeValue("gray.500", "gray.400");
  const imageOverlay = useColorModeValue(
    "linear(to-r, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.66) 42%, rgba(255,255,255,0.25) 72%, rgba(255,255,255,0.18) 100%)",
    "linear(to-r, rgba(17,24,39,0.89) 0%, rgba(17,24,39,0.76) 42%, rgba(17,24,39,0.58) 72%, rgba(17,24,39,0.28) 100%)",
  );

  const mobileOverlay = useColorModeValue(
    "linear(to-b, rgba(255,255,255,0.96), rgba(255,255,255,0.9))",
    "linear(to-b, rgba(17,24,39,0.95), rgba(17,24,39,0.9))",
  );

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg={heroBackground}
      borderRadius={{ base: "none", md: "3xl" }}
      minH={{ base: "410px", md: "440px", xl: "470px" }}
      isolation="isolate"
    >
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=85"
        alt=""
        aria-hidden="true"
        position="absolute"
        inset={0}
        w="100%"
        h="100%"
        objectFit="cover"
        objectPosition={{ base: "66% center", md: "center" }}
        transform="scale(1.02)"
        transition="transform 0.8s ease"
        _groupHover={{
          transform: "scale(1.05)",
        }}
      />

      {/* Responsive image overlay */}
      <Box
        position="absolute"
        inset={0}
        bgGradient={{ base: mobileOverlay, md: imageOverlay }}
      />

      {/* Decorative color wash */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-br, brand.50, transparent 45%, brand.100)"
        opacity={useColorModeValue(0.54, 0.14)}
        pointerEvents="none"
      />

      {/* Animated glowing shapes */}
      {/* <Box
        position="absolute"
        top={{ base: "-90px", md: "-130px" }}
        left={{ base: "-100px", md: "34%" }}
        w={{ base: "240px", md: "360px" }}
        h={{ base: "240px", md: "360px" }}
        borderRadius="full"
        bg="brand.300"
        opacity={0.2}
        filter="blur(72px)"
        pointerEvents="none"
        animation={
          prefersReducedMotion
            ? undefined
            : `${glowAnimation} 7s ease-in-out infinite`
        }
      /> */}

      <Box
        position="absolute"
        right={{ base: "-80px", md: "10%" }}
        bottom={{ base: "-100px", md: "-150px" }}
        w={{ base: "230px", md: "360px" }}
        h={{ base: "230px", md: "360px" }}
        borderRadius="full"
        bg="brand.500"
        opacity={0.15}
        filter="blur(80px)"
        pointerEvents="none"
      />

      <Grid
        position="relative"
        zIndex={2}
        maxW="1480px"
        minH="inherit"
        mx="auto"
        px={{ base: 4, sm: 6, md: 9, lg: 12, xl: 16 }}
        py={{ base: 7, md: 9, lg: 12 }}
        templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 500px" }}
        gap={{ base: 6, md: 8, lg: 12 }}
        alignItems="center"
      >
        {/* Hero content */}
        <VStack
          align="flex-start"
          spacing={0}
          maxW={{ base: "100%", lg: "720px" }}
        >
          <HStack
            spacing={2}
            mb={{ base: 4, md: 5 }}
            px={2.5}
            py={1.5}
            borderRadius="full"
            bg={cardBackground}
            borderWidth="1px"
            borderColor={borderColor}
            backdropFilter="blur(16px)"
            boxShadow="0 8px 28px rgba(15, 23, 42, 0.08)"
          >
            <Box
              display="grid"
              placeItems="center"
              w="26px"
              h="26px"
              borderRadius="full"
              bg="brand.500"
              color="white"
            >
              <Icon as={FiCompass} fontSize="xs" />
            </Box>

            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="800"
              color="brand.700"
              letterSpacing="0.01em"
            >
              Explore the learning catalog
            </Text>

            <Badge
              borderRadius="full"
              colorScheme="brand"
              textTransform="none"
              fontSize="10px"
              px={2}
            >
              New
            </Badge>
          </HStack>

          <Heading
            fontSize={{
              base: "3xl",
              sm: "4xl",
              md: "4xl",
              xl: "5xl",
            }}
            lineHeight={{ base: "1.1", md: "1.02" }}
            letterSpacing={{ base: "-0.035em", md: "-0.052em" }}
            maxW="720px"
          >
            Turn your curiosity into{" "}
            <Box
              as="span"
              position="relative"
              display="inline-block"
              color="brand.600"
            >
              real skills.
              <Box
                position="absolute"
                left="2%"
                right="0"
                bottom={{ base: "-4px", md: "-7px" }}
                h={{ base: "7px", md: "10px" }}
                bg="brand.200"
                opacity={0.65}
                borderRadius="full"
                transform="rotate(-1.5deg)"
                zIndex={-1}
              />
            </Box>
          </Heading>

          <Text
            mt={{ base: 4, md: 5 }}
            maxW="620px"
            color={mutedText}
            fontSize={{ base: "sm", sm: "md", md: "lg" }}
            lineHeight={{ base: "1.7", md: "1.75" }}
          >
            Discover practical courses, continue where you left off, and learn
            at a pace that fits your day.
          </Text>

          <Stack
            direction={{ base: "column", sm: "row" }}
            mt={{ base: 5, md: 7 }}
            spacing={3}
            w={{ base: "100%", sm: "auto" }}
            align={{ base: "stretch", sm: "center" }}
          >
            <Button
              colorScheme="brand"
              size={{ base: "md", md: "lg" }}
              borderRadius="full"
              rightIcon={<FiArrowRight />}
              onClick={onExploreCourses}
              px={{ base: 5, md: 6 }}
              minH={{ base: "40px", md: "46px" }}
              boxShadow="0 14px 30px rgba(0, 0, 0, 0.14)"
              overflow="hidden"
              position="relative"
              transition="all 0.25s ease"
              _before={{
                content: '""',
                position: "absolute",
                top: "-40%",
                bottom: "-40%",
                left: "-35%",
                width: "25%",
                bg: "whiteAlpha.500",
                transform: "skewX(-18deg)",
                animation: prefersReducedMotion
                  ? undefined
                  : `${shimmerAnimation} 4.5s ease-in-out infinite`,
              }}
              _hover={{
                transform: "translateY(-3px)",
                boxShadow: "0 18px 38px rgba(0, 0, 0, 0.2)",
              }}
              _active={{
                transform: "translateY(-1px)",
              }}
            >
              Explore courses
            </Button>

            <HStack
              justify={{ base: "center", sm: "flex-start" }}
              spacing={3}
              px={{ base: 3, md: 4 }}
              py={2}
              borderRadius="full"
              bg={cardBackground}
              borderWidth="1px"
              borderColor={borderColor}
              backdropFilter="blur(14px)"
            >
              <HStack spacing="-6px">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=70",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=70",
                  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&q=70",
                ].map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    objectFit="cover"
                    borderWidth="2px"
                    borderColor={useColorModeValue("white", "gray.800")}
                  />
                ))}
              </HStack>

              <Box>
                <Text fontSize="xs" fontWeight="800" lineHeight="1.1">
                  {totalCourses.toLocaleString()} courses
                </Text>
                <Text fontSize="10px" color={subtleText}>
                  Ready to explore
                </Text>
              </Box>
            </HStack>
          </Stack>

          <SimpleGrid
            columns={{ base: 3 }}
            spacing={{ base: 2, sm: 3 }}
            mt={{ base: 6, md: 8 }}
            w={{ base: "100%", sm: "auto" }}
          >
            {[
              {
                icon: FiBookOpen,
                value: totalCourses.toLocaleString(),
                label: "Courses",
              },
              {
                icon: FiZap,
                value: "Flexible",
                label: "Learning",
              },
              {
                icon: FiCheckCircle,
                value: "Practical",
                label: "Skills",
              },
            ].map((item) => (
              <HStack
                key={item.label}
                spacing={2}
                minW={{ sm: "130px" }}
                p={{ base: 2.5, md: 3 }}
                borderRadius="xl"
                bg={cardBackground}
                borderWidth="1px"
                borderColor={borderColor}
                backdropFilter="blur(15px)"
                boxShadow="0 10px 30px rgba(15, 23, 42, 0.06)"
              >
                <Box
                  flexShrink={0}
                  w={{ base: "29px", md: "34px" }}
                  h={{ base: "29px", md: "34px" }}
                  display="grid"
                  placeItems="center"
                  borderRadius="lg"
                  bg="brand.50"
                  color="brand.600"
                >
                  <Icon as={item.icon} fontSize={{ base: "xs", md: "sm" }} />
                </Box>

                <Box minW={0}>
                  <Text
                    fontSize={{ base: "10px", md: "xs" }}
                    fontWeight="800"
                    noOfLines={1}
                  >
                    {item.value}
                  </Text>
                  <Text
                    fontSize={{ base: "9px", md: "10px" }}
                    color={subtleText}
                    noOfLines={1}
                  >
                    {item.label}
                  </Text>
                </Box>
              </HStack>
            ))}
          </SimpleGrid>
        </VStack>

        {/* Desktop visual composition */}
        <Box
          display={{ base: "none", lg: "block" }}
          position="relative"
          h={{ lg: "360px", xl: "390px" }}
          aria-hidden="true"
        >
          {/* Circular orbit */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            w="330px"
            h="330px"
            borderRadius="full"
            borderWidth="1px"
            borderColor="whiteAlpha.500"
            transform="translate(-50%, -50%)"
            opacity={0.75}
          />

          <Box
            position="absolute"
            top="50%"
            left="50%"
            w="250px"
            h="250px"
            borderRadius="full"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="brand.200"
            transform="translate(-50%, -50%)"
            animation={
              prefersReducedMotion
                ? undefined
                : `${orbitAnimation} 20s linear infinite`
            }
          />

          {/* Main card */}
          <Box
            position="absolute"
            top="28px"
            left="75px"
            w="330px"
            borderRadius="3xl"
            overflow="hidden"
            bg={subtleCardBackground}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="0 32px 80px rgba(15, 23, 42, 0.24)"
            backdropFilter="blur(18px)"
            animation={
              prefersReducedMotion
                ? undefined
                : `${floatAnimation} 6.5s ease-in-out infinite`
            }
          >
            <Box position="relative" h="184px" overflow="hidden">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85"
                alt=""
                w="100%"
                h="100%"
                objectFit="cover"
              />

              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, blackAlpha.700, transparent 65%)"
              />

              <Badge
                position="absolute"
                top={4}
                left={4}
                borderRadius="full"
                colorScheme="green"
                textTransform="none"
                px={3}
                py={1}
              >
                Popular course
              </Badge>

              <Box
                position="absolute"
                right={4}
                bottom={4}
                display="grid"
                placeItems="center"
                w="44px"
                h="44px"
                bg="white"
                color="brand.600"
                borderRadius="full"
                boxShadow="lg"
              >
                <Icon as={FiPlay} ml="2px" />
              </Box>
            </Box>

            <Box p={5}>
              <HStack justify="space-between" align="flex-start">
                <Box>
                  <Text
                    color={subtleText}
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                  >
                    Featured learning
                  </Text>
                  <Text mt={1} fontSize="lg" fontWeight="900">
                    Build your next skill
                  </Text>
                </Box>

                <HStack spacing={1} color="orange.400">
                  <Icon as={FiStar} fill="currentColor" />
                  <Text fontSize="sm" fontWeight="800">
                    4.9
                  </Text>
                </HStack>
              </HStack>

              <HStack mt={4} spacing={3}>
                <Box
                  flex={1}
                  h="8px"
                  borderRadius="full"
                  bg={useColorModeValue("gray.100", "whiteAlpha.200")}
                  overflow="hidden"
                >
                  <Box
                    w="72%"
                    h="full"
                    bgGradient="linear(to-r, brand.400, brand.600)"
                    borderRadius="full"
                  />
                </Box>
                <Text fontSize="xs" fontWeight="800" color="brand.600">
                  72%
                </Text>
              </HStack>
            </Box>
          </Box>

          {/* Floating activity card */}
          <HStack
            position="absolute"
            top="10px"
            right="0"
            spacing={3}
            p={3}
            w="190px"
            borderRadius="2xl"
            bg={cardBackground}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="0 20px 45px rgba(15, 23, 42, 0.16)"
            backdropFilter="blur(18px)"
            animation={
              prefersReducedMotion
                ? undefined
                : `${reverseFloatAnimation} 7s ease-in-out infinite`
            }
          >
            <Box
              w="38px"
              h="38px"
              display="grid"
              placeItems="center"
              borderRadius="xl"
              bg="green.100"
              color="green.600"
              flexShrink={0}
            >
              <Icon as={FiTrendingUp} />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="900">
                Keep growing
              </Text>
              <Text fontSize="xs" color={subtleText}>
                One lesson at a time
              </Text>
            </Box>
          </HStack>

          {/* Small notification card */}
          <HStack
            position="absolute"
            left="0"
            bottom="18px"
            spacing={3}
            p={3}
            w="205px"
            borderRadius="2xl"
            bg={cardBackground}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="0 20px 45px rgba(15, 23, 42, 0.17)"
            backdropFilter="blur(18px)"
            animation={
              prefersReducedMotion
                ? undefined
                : `${floatAnimation} 7.5s ease-in-out infinite`
            }
          >
            <Box
              position="relative"
              w="42px"
              h="42px"
              display="grid"
              placeItems="center"
              borderRadius="full"
              bg="brand.500"
              color="white"
              flexShrink={0}
            >
              <Icon as={FiZap} />
              <Box
                position="absolute"
                top="-1px"
                right="-1px"
                w="11px"
                h="11px"
                borderRadius="full"
                bg="green.400"
                borderWidth="2px"
                borderColor="white"
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="900">
                Learn your way
              </Text>
              <Text fontSize="xs" color={subtleText}>
                Simple and flexible
              </Text>
            </Box>
          </HStack>
        </Box>
      </Grid>
    </Box>
  );
};

export default CourseCatalogHero;