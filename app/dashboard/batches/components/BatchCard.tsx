"use client";

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
import {
  FiBookOpen,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiUsers,
} from "react-icons/fi";
import type { BatchListItem } from "@/app/store/batchStore/batchStore";
import StatCard from "@/app/component/common/StatCard/StatCard";


type Status = "active" | "expired" | "expiring_soon" | "completed";

function getStatusColor(status: Status) {
  if (status === "expired") return "red";
  if (status === "completed") return "green";
  if (status === "expiring_soon") return "orange";
  return "green"; // active
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
  const softCard = useColorModeValue("gray.50", "whiteAlpha.100");
  const highlightCard = useColorModeValue("blue.50", "blue.900");
  const completionPercent =
    batch.courseCount > 0
      ? Math.round(((batch.completedCount || 0) / batch.courseCount) * 100)
      : 0;
  const statusColor = getStatusColor(batch.status as Status);

  if (isLearner) {
    return (
      <Box
        borderRadius={{ base: "2xl", md: "3xl" }}
        overflow="hidden"
        cursor="pointer"
        transition="all 0.25s ease"
        onClick={onClick}
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        _hover={{
          transform: "translateY(-4px)",
          boxShadow: "0 20px 40px rgba(0, 145, 255, 0.1)",
          borderColor: "blue.300",
        }}
      >
        {/* 🔵 HERO */}
        <Box
          bg="linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 60%, #dbeafe 100%)"
          color="gray.800" // ✅ FIX
          p={{ base: 4, md: 6 }}
        >
          <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            spacing={4}
          >
            <Stack spacing={2}>
              <Box
                bg="blue.200"
                color="blue.700"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="semibold"
                w="fit-content"
              >
                Learning Batch
              </Box>

              <Text
                fontSize={{ base: "lg", md: "2xl" }}
                fontWeight="bold"
                lineHeight="short"
              >
                {batch.name}
              </Text>

              <Text fontSize={{ base: "xs", md: "sm" }} opacity={0.85}>
                {batch.company?.company_name || "Assigned learning group"}
              </Text>
            </Stack>

            <Badge
              bg={`${statusColor}.100`}
              color={`${statusColor}.700`}
              borderRadius="full"
              px={3}
              alignSelf={{ base: "flex-start", md: "auto" }}
            >
              {batch.status.replace(/_/g, " ")}
            </Badge>
          </Stack>

          {/* 🔥 Progress */}
          <Box mt={{ base: 4, md: 5 }}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize={{ base: "xs", md: "sm" }} opacity={0.9}>
                Progress
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }}>
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
                  background: "linear-gradient(90deg, #22c55e, #4ade80)",
                },
              }}
            />
          </Box>
        </Box>

        {/* ⚪ CONTENT */}
        <Box p={{ base: 4, md: 5 }}>
          <SimpleGrid
            columns={{ base: 2, sm: 2, md: 4 }}
            spacing={{ base: 3, md: 4 }}
          >
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

            <StatCard
              label="Duration"
              value={formatDuration(batch)}
              icon={FiCalendar}
              colorScheme="orange"
            />

            <StatCard
              label="Owner"
              value={batch.createdBy?.name || "Team"}
              icon={FiUsers}
              colorScheme="purple"
            />
          </SimpleGrid>

          {/* 🚀 CTA */}
          <Stack
            mt={5}
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            spacing={3}
          >
            <Text fontSize="sm" color="gray.500">
              Open this batch to continue learning
            </Text>

            <Button
              size={{ base: "sm", md: "md" }}
              px={5}
              bg="blue.600"
              color="white"
              borderRadius="lg"
              fontWeight="semibold"
              w={{ base: "full", sm: "auto" }}
              _hover={{ bg: "blue.700" }}
            >
              View →
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
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
    >
      <Stack spacing={5}>
        <HStack justify="space-between" align="start">
          <Stack spacing={2}>
            <Badge
              colorScheme="gray"
              borderRadius="full"
              w="fit-content"
              px={3}
              py={1}
            >
              Batch
            </Badge>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {batch.name}
            </Text>
            <Text color={mutedText} fontSize="sm">
              {batch.company?.company_name || "Company batch"}
            </Text>
          </Stack>

          <Badge
            colorScheme={getStatusColor(batch.status)}
            borderRadius="full"
            px={3}
            py={1}
          >
            {batch.status === "expiring_soon" ? "Expiring soon" : batch.status}
          </Badge>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          <Box borderRadius="2xl" bg="blue.50" p={3}>
            <HStack spacing={2} color="blue.700">
              <Icon as={FiBookOpen} />
              <Text
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
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
              <Text
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
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
              <Text
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
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
              <Text
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
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
            {batch.createdBy?.name ||
              batch.createdBy?.email ||
              "Unknown creator"}
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
