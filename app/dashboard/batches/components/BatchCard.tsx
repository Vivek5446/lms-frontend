"use client";

import { Badge, Box, HStack, Icon, Progress, SimpleGrid, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { FiBookOpen, FiCalendar, FiChevronRight, FiClock, FiUsers } from "react-icons/fi";
import type { BatchListItem } from "@/app/store/batchStore/batchStore";

function getStatusColor(status: string) {
  if (status === "expired") {
    return "red";
  }

  if (status === "completed") {
    return "green";
  }

  if (status === "expiring_soon") {
    return "orange";
  }

  return "blue";
}

function formatDuration(batch: BatchListItem) {
  if (batch.durationLabel) {
    return batch.durationLabel;
  }

  const start = batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "Not set";
  const end = batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "Open ended";
  return `${start} - ${end}`;
}

type BatchCardProps = {
  batch: BatchListItem;
  onClick: () => void;
  isLearner?: boolean;
};

export default function BatchCard({ batch, onClick, isLearner = false }: BatchCardProps) {
  const mutedText = useColorModeValue("gray.600", "gray.300");
  const softCard = useColorModeValue("gray.50", "whiteAlpha.100");
  const highlightCard = useColorModeValue("blue.50", "blue.900");
  const completionPercent =
    batch.courseCount > 0 ? Math.round(((batch.completedCount || 0) / batch.courseCount) * 100) : 0;

  if (isLearner) {
    return (
      <Box
        bg="white"
        borderWidth="1px"
        borderRadius="3xl"
        p={6}
        boxShadow="sm"
        cursor="pointer"
        transition="all 0.2s ease"
        _hover={{ transform: "translateY(-3px)", boxShadow: "lg", borderColor: "blue.200" }}
        onClick={onClick}
      >
        <Stack spacing={5}>
          <HStack justify="space-between" align="start" spacing={4}>
            <Stack spacing={2}>
              <Badge colorScheme="blue" borderRadius="full" w="fit-content" px={3} py={1}>
                Learning Batch
              </Badge>
              <Text fontSize="xl" fontWeight="bold" color="gray.900">
                {batch.name}
              </Text>
              <Text color={mutedText} fontSize="sm">
                {batch.company?.company_name || "Assigned learning group"}
              </Text>
            </Stack>

            <Badge colorScheme={getStatusColor(batch.status)} borderRadius="full" px={3} py={1}>
              {batch.status === "expiring_soon" ? "Expiring soon" : batch.status.replace(/_/g, " ")}
            </Badge>
          </HStack>

          <Box borderRadius="2xl" bg={highlightCard} p={4}>
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="semibold" color="blue.800">
                Batch progress
              </Text>
              <Text fontSize="sm" color="blue.700">
                {batch.completedCount || 0}/{batch.courseCount} completed
              </Text>
            </HStack>
            <Progress value={completionPercent} colorScheme="blue" borderRadius="full" h="10px" />
          </Box>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            <Box borderRadius="2xl" bg={softCard} p={3}>
              <HStack spacing={2} color={mutedText}>
                <Icon as={FiBookOpen} />
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                  Courses
                </Text>
              </HStack>
              <Text mt={2} fontSize="lg" fontWeight="semibold">
                {batch.courseCount}
              </Text>
            </Box>

            <Box borderRadius="2xl" bg={softCard} p={3}>
              <HStack spacing={2} color={mutedText}>
                <Icon as={FiClock} />
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                  Status
                </Text>
              </HStack>
              <Text mt={2} fontSize="sm" fontWeight="semibold" textTransform="capitalize">
                {batch.status.replace(/_/g, " ")}
              </Text>
            </Box>

            <Box borderRadius="2xl" bg={softCard} p={3}>
              <HStack spacing={2} color={mutedText}>
                <Icon as={FiCalendar} />
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                  Duration
                </Text>
              </HStack>
              <Text mt={2} fontSize="sm" fontWeight="medium" noOfLines={2}>
                {formatDuration(batch)}
              </Text>
            </Box>

            <Box borderRadius="2xl" bg={softCard} p={3}>
              <HStack spacing={2} color={mutedText}>
                <Icon as={FiUsers} />
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                  Owner
                </Text>
              </HStack>
              <Text mt={2} fontSize="sm" fontWeight="medium" noOfLines={2}>
                {batch.createdBy?.name || batch.createdBy?.email || "Team"}
              </Text>
            </Box>
          </SimpleGrid>

          <HStack justify="space-between" color={mutedText}>
            <Text fontSize="sm">Open this batch to review courses and launch material.</Text>
            <HStack spacing={1} fontSize="sm" color="blue.600">
              <Text>View batch</Text>
              <Icon as={FiChevronRight} />
            </HStack>
          </HStack>
        </Stack>
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
      _hover={{ transform: "translateY(-2px)", boxShadow: "md", borderColor: "blue.200" }}
      onClick={onClick}
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
              {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : "Recently"}
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
