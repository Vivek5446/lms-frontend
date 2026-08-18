'use client';

import {
  Box,
  Badge,
  Heading,
  Text,
  Image,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Center,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiStar,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiCode,
  FiPenTool,
  FiTarget,
} from 'react-icons/fi';
import type { ReactNode } from 'react';
import CourseBookmarkButton from './CourseBookmarkButton';

const MotionBox = motion(Box);

function formatCurrency(value?: number | null) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 'Free';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericValue);
}

interface CourseCardProps {
  course: any;
  enrolled?: boolean;
  onClick: () => void;
  primaryBadgeLabel?: string;
  secondaryBadgeLabel?: string | null;
  topRightBadge?: ReactNode;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  isBookmarkLoading?: boolean;
  onToggleBookmark?: () => void;
}

const getCardTheme = (title: string = '') => {
  const lower = title.toLowerCase();
  if (lower.includes('lead'))
    return { gradient: 'linear(to-br, #00c875, #00a862)', icon: FiTrendingUp };
  if (lower.includes('web') || lower.includes('code') || lower.includes('dev'))
    return { gradient: 'linear(to-br, #2f80ed, #1e6fd9)', icon: FiCode };
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux'))
    return { gradient: 'linear(to-br, #a855f7, #9333ea)', icon: FiPenTool };
  if (lower.includes('market') || lower.includes('digital'))
    return { gradient: 'linear(to-br, #ff7a00, #f2660a)', icon: FiTarget };

  const themes = [
    { gradient: 'linear(to-br, #00c875, #00a862)', icon: FiTrendingUp },
    { gradient: 'linear(to-br, #2f80ed, #1e6fd9)', icon: FiCode },
    { gradient: 'linear(to-br, #a855f7, #9333ea)', icon: FiPenTool },
    { gradient: 'linear(to-br, #ff7a00, #f2660a)', icon: FiTarget },
  ];
  return themes[Math.abs(title.charCodeAt(0) || 0) % themes.length];
};

export const CourseCard = ({
  course,
  enrolled,
  onClick,
  // primaryBadgeLabel = 'Public',
  // secondaryBadgeLabel = course?.courseType === 'scorm' ? 'SCORM' : 'Standard',
  topRightBadge,
  showBookmark = false,
  isBookmarked,
  isBookmarkLoading = false,
  onToggleBookmark,
}: CourseCardProps) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const mutedText = useColorModeValue('gray.500', 'gray.400');
  const textPrimary = useColorModeValue('gray.800', 'whiteAlpha.900');
  const footerBorder = useColorModeValue('gray.100', 'gray.700');
  const tagBg = useColorModeValue('blue.50', 'blue.900');
  const tagColor = useColorModeValue('blue.700', 'blue.200');

  const theme = getCardTheme(course?.title);

  const level = course?.taxonomy?.level || 'Beginner';
  return (
    <MotionBox
      role="group"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="sm"
      _hover={{ boxShadow: 'xl' }}
      display="flex"
      flexDirection="column"
      height="100%"
      w="full"
      cursor="pointer"
      onClick={onClick}
      position="relative"
    >
      {/* THUMBNAIL / TOP BANNER AREA */}
      <Box
        position="relative"
        overflow="hidden"
        h={{ base: '140px', md: '176px' }}
        bgGradient={course.thumbnailUrl ? undefined : theme.gradient}
        flexShrink={0}
      >
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            w="full"
            h="full"
            objectFit="cover"
            transition="all 0.5s ease"
            _groupHover={{ transform: 'scale(1.04)' }}
          />
        ) : (
          <>
            <Box
              position="absolute"
              inset={0}
              bgGradient="radial(circle at 20% 20%, rgba(255,255,255,0.35), transparent 50%)"
            />
            <Center h="full" w="full" position="relative">
              <Center
                w={{ base: '52px', md: '64px' }}
                h={{ base: '52px', md: '64px' }}
                borderRadius="2xl"
                bg="rgba(255,255,255,0.25)"
                backdropFilter="blur(8px)"
                transition="transform 0.5s ease"
                _groupHover={{ transform: 'scale(1.1) rotate(3deg)' }}
              >
                <Icon as={theme.icon} boxSize={{ base: 6, md: 8 }} color="white" />
              </Center>
            </Center>
          </>
        )}

        {/* OVERLAY BADGES */}
        <HStack position="absolute" top={3} left={3} spacing={1.5} zIndex={1}>
          <Badge
            bg="rgba(255,255,255,0.95)"
            color="green.600"
            borderRadius="full"
            px={2.5}
            py={1}
            fontSize="10px"
            fontWeight="bold"
            textTransform="uppercase"
            boxShadow="0 1px 3px rgba(0,0,0,0.08)"
          >
            {level}
          </Badge>
          {/* {category ? (
            <Badge
              bg="rgba(255,255,255,0.95)"
              color="gray.700"
              borderRadius="full"
              px={2.5}
              py={1}
              fontSize="10px"
              fontWeight="bold"
              textTransform="uppercase"
              boxShadow="0 1px 3px rgba(0,0,0,0.08)"
            >
              {category}
            </Badge>
          ) : null} */}
        </HStack>

        {showBookmark && onToggleBookmark ? (
          <Box position="absolute" top={3} right={3} zIndex={2}>
            <CourseBookmarkButton
              size="sm"
              isBookmarked={Boolean(isBookmarked ?? course?.isBookmarked)}
              isLoading={isBookmarkLoading}
              onToggle={onToggleBookmark}
            />
          </Box>
        ) : null}

        {topRightBadge ? (
          <Box position="absolute" top={3} right={showBookmark ? 14 : 3} zIndex={1}>
            {topRightBadge}
          </Box>
        ) : enrolled ? (
          <Badge
            position="absolute"
            top={3}
            right={showBookmark ? 14 : 3}
            zIndex={1}
            bg="purple.500"
            color="white"
            borderRadius="full"
            px={2.5}
            py={1}
            fontSize="10px"
            fontWeight="bold"
            textTransform="uppercase"
            boxShadow="0 1px 3px rgba(0,0,0,0.15)"
          >
            Enrolled
          </Badge>
        ) : null}
      </Box>

      {/* CONTENT AREA */}
      <VStack
        p={{ base: 4, md: 5 }}
        align="stretch"
        spacing={{ base: 2.5, md: 3 }}
        flex="1"
        justify={{ base: 'flex-start', md: 'space-between' }}
      >
        <Box>
          {/* CATEGORY & LEVEL BADGES */}
          <HStack spacing={1.5} mb={{ base: 2, md: 3 }} flexWrap="wrap">
            {(course.taxonomy?.categories || []).slice(0, 1).map((category: string) => (
              <Badge
                key={category}
                bg={tagBg}
                color={tagColor}
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="10px"
                fontWeight="semibold"
                textTransform="uppercase"
              >
                {category}
              </Badge>
            ))}
            <Badge
              bg={tagBg}
              color={tagColor}
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="10px"
              fontWeight="semibold"
              textTransform="uppercase"
            >
              {course.taxonomy?.level || 'Beginner'}
            </Badge>
          </HStack>

          {/* COURSE TITLE */}
          <Heading
            fontSize={{ base: 'md', md: 'lg' }}
            mb={{ base: 1, md: 2 }}
            color={textPrimary}
            noOfLines={1}
            fontWeight="bold"
            transition="color 0.2s ease"
            _groupHover={{ color: 'blue.600' }}
          >
            {course.title}
          </Heading>

          {/* DESCRIPTION + STATS — desktop only, hidden on mobile */}
          <Box display={{ base: 'none', md: 'block' }}>
            <Text fontSize="sm" color={mutedText} noOfLines={2} mb={3}>
              {course.description?.text ||
                'Explore this course to review the curriculum, pricing, and assessments.'}
            </Text>

            <HStack spacing={4} color="gray.500">
              <HStack spacing={1}>
                <Icon as={FiUsers} boxSize={3.5} />
                <Text fontSize="xs" fontWeight="medium">
                  {course.metrics?.enrolledCount
                    ? `${(course.metrics.enrolledCount / 1000).toFixed(1)}k`
                    : '1.2k'}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FiClock} boxSize={3.5} />
                <Text fontSize="xs" fontWeight="medium">
                  {course.duration || '8h'}
                </Text>
              </HStack>
            </HStack>
          </Box>
        </Box>

        {/* FOOTER ROW */}
        <HStack
          justify="space-between"
          align="center"
          pt={{ base: 3, md: 4 }}
          mt={{ base: 2, md: 0 }}
          borderTopWidth="1px"
          borderColor={footerBorder}
        >
          <Text fontWeight="extrabold" fontSize={{ base: 'sm', md: 'md' }} color="green.500">
            {formatCurrency(course.commerce?.amountInRupees)}
          </Text>

          <HStack spacing={1}>
            <Icon as={FiStar} color="orange.400" fill="orange.400" boxSize={3.5} />
            <Text fontWeight="bold" fontSize="sm" color={textPrimary}>
              {course.metrics?.averageRating ? course.metrics.averageRating.toFixed(1) : '4.5'}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </MotionBox>
  );
};

export const CourseCardSkeleton = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const footerBorder = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius={{ base: 'xl', md: '2xl' }}
      overflow="hidden"
      boxShadow="sm"
      display="flex"
      flexDirection="column"
      height="100%"
      w="full"
    >
      <Skeleton h={{ base: '140px', md: '176px' }} />

      <VStack
        p={{ base: 4, md: 5 }}
        align="stretch"
        spacing={{ base: 2.5, md: 3 }}
        flex="1"
      >
        <HStack spacing={1.5}>
          <Skeleton h="20px" w="74px" borderRadius="full" />
          <Skeleton h="20px" w="82px" borderRadius="full" />
        </HStack>

        <Box>
          <Skeleton h={{ base: '20px', md: '24px' }} w="78%" mb={2} />
          <Box display={{ base: 'none', md: 'block' }}>
            <SkeletonText noOfLines={2} spacing={3} skeletonHeight={3} />
            <HStack spacing={4} mt={3}>
              <Skeleton h="14px" w="44px" />
              <Skeleton h="14px" w="36px" />
            </HStack>
          </Box>
        </Box>

        <HStack
          justify="space-between"
          align="center"
          pt={{ base: 3, md: 4 }}
          mt="auto"
          borderTopWidth="1px"
          borderColor={footerBorder}
        >
          <Skeleton h="18px" w="72px" />
          <Skeleton h="18px" w="44px" />
        </HStack>
      </VStack>
    </Box>
  );
};
