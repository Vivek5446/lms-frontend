"use client";

import StatCard from "@/app/component/common/StatCard/StatCard";
import type { BatchListItem } from "@/app/store/batchStore/batchStore";
import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import type { KeyboardEvent } from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiUsers,
} from "react-icons/fi";

type Status = "active" | "expired" | "expiring_soon" | "completed";

function getStatusColor(status: Status) {
  if (status === "expired") return "red";
  if (status === "completed") return "green";
  if (status === "expiring_soon") return "orange";
  return "green";
}

function formatDuration(batch: BatchListItem) {
  if (batch.durationLabel) {
    return batch.durationLabel;
  }

  const start = batch.startDate
    ? new Date(batch.startDate).toLocaleDateString()
    : "Not set";
  const end = batch.endDate
    ? new Date(batch.endDate).toLocaleDateString()
    : "Open ended";
  return `${start} - ${end}`;
}

type BatchCardProps = {
  batch: BatchListItem;
  onClick: () => void;
  isLearner?: boolean;
};

export default function BatchCard({
  batch,
  onClick,
  isLearner = false,
}: BatchCardProps) {
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const completionPercent =
    batch.courseCount > 0
      ? Math.round(((batch.completedCount || 0) / batch.courseCount) * 100)
      : 0;
  const statusColor = getStatusColor(batch.status as Status);

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  if (isLearner) {
    return (
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Open ${batch.name}`}
        borderRadius="2xl"
        overflow="hidden"
        cursor="pointer"
        transition="all 0.22s ease"
        onClick={onClick}
        onKeyDown={handleCardKeyDown}
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        _hover={{
          transform: "translateY(-3px)",
          boxShadow: "0 16px 34px rgba(37, 99, 235, 0.12)",
          borderColor: "blue.300",
        }}
        _active={{ transform: "scale(0.98)" }}
      >
        <Box
          bg="linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 58%, #dbeafe 100%)"
          color="gray.800"
          p={{ base: 3, md: 5 }}
        >
          <HStack justify="space-between" align="start" gap={3}>
            <Box minW={0}>
              <Badge
                bg="blue.200"
                color="blue.700"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                mb={2}
              >
                Batch
              </Badge>
              <Text
                fontSize={{ base: "md", md: "2xl" }}
                fontWeight="800"
                lineHeight="1.2"
                noOfLines={2}
              >
                {batch.name}
              </Text>
              <Text mt={1} fontSize="xs" opacity={0.8} noOfLines={1}>
                {batch.company?.company_name || "Assigned learning group"}
              </Text>
            </Box>

            <Badge
              bg={`${statusColor}.100`}
              color={`${statusColor}.700`}
              borderRadius="full"
              px={3}
              py={1}
              flexShrink={0}
            >
              {batch.status.replace(/_/g, " ")}
            </Badge>
          </HStack>

          <Box mt={{ base: 3, md: 5 }}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" fontWeight="700" opacity={0.9}>
                Progress
              </Text>
              <Text fontSize="xs" fontWeight="800">
                {batch.completedCount || 0}/{batch.courseCount}
              </Text>
            </HStack>
            <Progress
              value={completionPercent}
              size="sm"
              borderRadius="full"
              bg="whiteAlpha.800"
              sx={{
                "& > div": {
                  background: "linear-gradient(90deg, #2563eb, #22c55e)",
                },
              }}
            />
          </Box>
        </Box>

        <Box p={{ base: 3, md: 5 }}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 2, md: 4 }}>
            <StatCard
              label="Courses"
              value={batch.courseCount}
              icon={FiBookOpen}
              colorScheme="blue"
            />
            <StatCard
              label="Status"
              value={batch.status.replace(/_/g, " ")}
              icon={FiClock}
              colorScheme="green"
            />
            <Box display={{ base: "none", md: "block" }}>
              <StatCard
                label="Duration"
                value={formatDuration(batch)}
                icon={FiCalendar}
                colorScheme="orange"
              />
            </Box>
            <Box display={{ base: "none", md: "block" }}>
              <StatCard
                label="Owner"
                value={batch.createdBy?.name || "Team"}
                icon={FiUsers}
                colorScheme="purple"
              />
            </Box>
          </SimpleGrid>

          <HStack mt={{ base: 3, md: 5 }} justify="space-between" gap={3}>
            <Text fontSize="sm" color="gray.500" display={{ base: "none", sm: "block" }}>
              Continue learning from this batch
            </Text>
            <Button
              size="sm"
              h={{ base: "38px", md: "40px" }}
              px={5}
              bg="blue.600"
              color="white"
              borderRadius="lg"
              fontWeight="700"
              w={{ base: "full", sm: "auto" }}
              _hover={{ bg: "blue.700" }}
              rightIcon={<Icon as={FiChevronRight} />}
            >
              View
            </Button>
          </HStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Open ${batch.name}`}
      bg="white"
      borderWidth="1px"
      borderRadius="3xl"
      p={5}
      boxShadow="sm"
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: "blue.200",
      }}
      onClick={onClick}
      onKeyDown={handleCardKeyDown}
    >
      <Stack spacing={5}>
        <HStack justify="space-between" align="start">
          <Stack spacing={2}>
            <Badge colorScheme="gray" borderRadius="full" w="fit-content" px={3} py={1}>
              Batch
            </Badge>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {batch.name}
            </Text>
            <Text color={mutedText} fontSize="sm">
              {batch.company?.company_name || "Company batch"}
            </Text>
          </Stack>

          <Badge colorScheme={getStatusColor(batch.status)} borderRadius="full" px={3} py={1}>
            {batch.status === "expiring_soon" ? "Expiring soon" : batch.status}
          </Badge>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          <Box borderRadius="2xl" bg="blue.50" p={3}>
            <HStack spacing={2} color="blue.700">
              <Icon as={FiBookOpen} />
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                Courses
              </Text>
            </HStack>
            <Text mt={2} fontSize="lg" fontWeight="semibold">
              {batch.courseCount}
            </Text>
          </Box>

          <Box borderRadius="2xl" bg="purple.50" p={3}>
            <HStack spacing={2} color="purple.700">
              <Icon as={FiUsers} />
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                Users
              </Text>
            </HStack>
            <Text mt={2} fontSize="lg" fontWeight="semibold">
              {batch.userCount ?? 0}
            </Text>
          </Box>

          <Box borderRadius="2xl" bg="orange.50" p={3}>
            <HStack spacing={2} color="orange.700">
              <Icon as={FiCalendar} />
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                Duration
              </Text>
            </HStack>
            <Text mt={2} fontSize="sm" fontWeight="medium" noOfLines={2}>
              {formatDuration(batch)}
            </Text>
          </Box>

          <Box borderRadius="2xl" bg="gray.50" p={3}>
            <HStack spacing={2} color="gray.700">
              <Icon as={FiClock} />
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                Created
              </Text>
            </HStack>
            <Text mt={2} fontSize="sm" fontWeight="medium" noOfLines={2}>
              {batch.createdAt
                ? new Date(batch.createdAt).toLocaleDateString()
                : "Recently"}
            </Text>
          </Box>
        </SimpleGrid>

        <HStack justify="space-between" color={mutedText}>
          <Text fontSize="sm">
            {batch.createdBy?.name || batch.createdBy?.email || "Unknown creator"}
          </Text>
          <HStack spacing={1} fontSize="sm" color="blue.600">
            <Text>Open details</Text>
            <Icon as={FiChevronRight} />
          </HStack>
        </HStack>
      </Stack>
    </Box>
  );
}
