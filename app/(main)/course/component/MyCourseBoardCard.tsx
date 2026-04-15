import React from "react";
import {
  Box,
  Image,
  Text,
  Progress,
  HStack,
  VStack,
  AspectRatio,
  Icon,
  Circle,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiBookOpen, FiClock, FiPlayCircle, FiStar } from "react-icons/fi";

const MotionBox = motion(Box);

interface CourseCardProps {
  course: any;
  index: number;
  handleOpenCourse: (id: string) => void;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
}

function truncateText(value?: string, limit = 60) {
  const text = String(value || "").trim();
  if (!text) return "No description available yet.";
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
}

const MYCourseBoardCard: React.FC<CourseCardProps> = ({
  course,
  index,
  handleOpenCourse,
  getStatusColor,
  formatDate,
}) => {
  const cardBg = useColorModeValue("white", "#1c1c2e");
  const subduedText = useColorModeValue("gray.500", "gray.400");
  const titleColor = useColorModeValue("gray.900", "white");
  const dividerColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const metricsBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const metricsValueColor = useColorModeValue("gray.800", "white");
  const metricsLabelColor = useColorModeValue("gray.400", "gray.500");
  const shadowColor = useColorModeValue(
    "0 2px 16px rgba(0,0,0,0.07)",
    "0 2px 20px rgba(0,0,0,0.5)",
  );
  const hoverShadow = useColorModeValue(
    "0 8px 32px rgba(0,0,0,0.12)",
    "0 8px 32px rgba(0,0,0,0.7)",
  );

  const statusLabel = course.isExpired
    ? "Expired"
    : course.visibilityStatus === "expiring_soon"
      ? "Expiring Soon"
      : "Active";

  const statusColorKey = getStatusColor(course.visibilityStatus);
  const dotColor =
    statusColorKey === "green"
      ? "#22c55e"
      : statusColorKey === "yellow"
        ? "#eab308"
        : "#ef4444";

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      role="group"
      bg={cardBg}
      borderRadius="24px"
      overflow="hidden"
      boxShadow={shadowColor}
      _hover={{ boxShadow: hoverShadow, cursor: "pointer" }}
      onClick={() => handleOpenCourse(course.courseId)}
      w="full"
    >
      {/* ── Banner ── */}
      <Box position="relative" overflow="hidden">
        <AspectRatio ratio={16 / 9}>
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              objectFit="cover"
              transition="transform 0.5s ease"
              _groupHover={{ transform: "scale(1.06)" }}
            />
          ) : (
            <Box
              bgGradient="linear(135deg, #667eea 0%, #764ba2 55%, #f093fb 100%)"
              w="full"
              h="full"
            />
          )}
        </AspectRatio>

        {/* Scrim */}
        <Box
          position="absolute"
          bottom={0}
          w="full"
          h="60%"
          bgGradient="linear(to-t, blackAlpha.600, transparent)"
          pointerEvents="none"
        />

        {/* Status pill */}
        <HStack
          position="absolute"
          bottom="10px"
          right="12px"
          bg="rgba(0,0,0,0.40)"
          backdropFilter="blur(12px)"
          border="1px solid rgba(255,255,255,0.18)"
          px={3}
          py={1}
          borderRadius="full"
          spacing={1.5}
          flexShrink={0}
        >
          <Circle size="7px" flexShrink={0} bg={dotColor} />
          <Text
            fontSize="11px"
            fontWeight="700"
            color="white"
            letterSpacing="0.03em"
            whiteSpace="nowrap"
          >
            {statusLabel}
          </Text>
        </HStack>
      </Box>

      {/* ── Body ── */}
      <Box px={5} pb={5} pt={0}>
        {/* Avatar overlapping banner */}
        <Box mt="-22px" mb={3} zIndex={2} position="relative">
          <Circle
            size="50px"
            border="3px solid"
            borderColor={cardBg}
            bg={useColorModeValue("blue.50", "blue.900")}
            color="blue.400"
            boxShadow="0 3px 10px rgba(0,0,0,0.15)"
          >
            <Icon as={FiBookOpen} boxSize={5} />
          </Circle>
        </Box>

        {/* Title + description */}
        <VStack align="start" spacing={0.5} mb={3}>
          <Text
            fontWeight="800"
            fontSize="lg"
            lineHeight="1.2"
            color={titleColor}
            noOfLines={1}
            letterSpacing="-0.01em"
          >
            {course.title}
          </Text>
          <Text color={subduedText} fontSize="sm" noOfLines={1}>
            {truncateText(course.description?.text, 55)}
          </Text>
        </VStack>

        {/* Progress */}
        <Box mb={4}>
          <HStack justify="space-between" mb={1.5}>
            <Text
              fontSize="10px"
              color={subduedText}
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              Progress
            </Text>
            <Text fontSize="10px" fontWeight="800" color="blue.400">
              {course.progress}%
            </Text>
          </HStack>
          <Progress
            value={course.progress}
            size="xs"
            borderRadius="full"
            bg={useColorModeValue("gray.100", "whiteAlpha.100")}
            sx={{
              "& > div": {
                background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
                borderRadius: "full",
              },
            }}
          />
        </Box>

        {/* Metrics row */}
        <Box
          bg={metricsBg}
          borderRadius="16px"
          py={2.5}
          px={0} // ← ensure this is 0
          display="grid"
          gridTemplateColumns="1fr 1px 1fr 1px 1fr"
          alignItems="center"
        >
          <MetricItem
            icon={FiStar}
            iconColor="yellow.400"
            label="Modules"
            value={course.curriculum?.totalModules ?? 0}
            valueColor={metricsValueColor}
            labelColor={metricsLabelColor}
          />
          <Box h="26px" bg={dividerColor} />
          <MetricItem
            icon={FiPlayCircle}
            iconColor="blue.400"
            label="Status"
            value={course.status?.replace(/_/g, " ") ?? "—"}
            valueColor={metricsValueColor}
            labelColor={metricsLabelColor}
          />
          <Box h="26px" bg={dividerColor} />
          <MetricItem
            icon={FiClock}
            iconColor="purple.400"
            label="Valid Till"
            value={formatDate(course.validTill)}
            valueColor={metricsValueColor}
            labelColor={metricsLabelColor}
          />
        </Box>
      </Box>
    </MotionBox>
  );
};

export default MYCourseBoardCard;

/* ── Metric sub-component ── */
const MetricItem = ({
  icon,
  label,
  value,
  iconColor,
  valueColor,
  labelColor,
}: {
  icon: any;
  label: string;
  value: string | number;
  iconColor: string;
  valueColor: string;
  labelColor: string;
}) => (
  <VStack
    spacing={0.5}
    align="center"
    justify="center"
    w="100%"
    minW={0}
    px={0}
  >
    <HStack spacing={1} justify="center" w="100%" px={2}>
      <Icon as={icon} color={iconColor} boxSize={3.5} flexShrink={0} />
      <Text
        fontSize="xs"
        fontWeight="700"
        color={valueColor}
        textTransform="capitalize"
        noOfLines={1}
      >
        {value}
      </Text>
    </HStack>
    <Text
      fontSize="10px"
      color={labelColor}
      fontWeight="500"
      textAlign="center"
    >
      {label}
    </Text>
  </VStack>
);
