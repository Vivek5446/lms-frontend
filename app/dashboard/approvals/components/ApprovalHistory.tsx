"use client";

import {
  Badge,
  Box,
  Flex,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ApprovalHistoryEntry,
  formatDate,
  formatLevel,
  resolveApprovalActor,
} from "../types";

interface ApprovalHistoryProps {
  history: ApprovalHistoryEntry[];
}

const getActionColor = (action?: string) => {
  if (action === "approved") return "green";
  if (action === "rejected") return "red";
  return "gray";
};

export default function ApprovalHistory({ history }: ApprovalHistoryProps) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const dotBg = useColorModeValue("white", "gray.900");

  if (!history.length) {
    return (
      <Box
        border="1px dashed"
        borderColor={borderColor}
        rounded="xl"
        p={4}
      >
        <Text fontSize="sm" color={mutedText}>
          No approval activity recorded yet.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={0}>
      {history.map((entry, index) => {
        const action = entry.action || entry.status;
        const isLast = index === history.length - 1;

        return (
          <Flex key={entry._id || `${entry.level}-${index}`} gap={4}>
            <VStack spacing={0} minW="18px">
              <Box
                w="12px"
                h="12px"
                rounded="full"
                border="3px solid"
                borderColor={`${getActionColor(action)}.400`}
                bg={dotBg}
                mt={1}
              />
              {!isLast && (
                <Box flex={1} w="2px" bg={borderColor} minH="56px" />
              )}
            </VStack>

            <Box
              flex={1}
              pb={isLast ? 0 : 6}
              borderBottom={isLast ? "none" : "1px solid"}
              borderColor={isLast ? "transparent" : borderColor}
            >
              <HStack justify="space-between" align="start" mb={2} flexWrap="wrap">
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme="purple" rounded="full" px={2}>
                    {formatLevel(entry.level)}
                  </Badge>
                  <Badge
                    colorScheme={getActionColor(action)}
                    textTransform="capitalize"
                    rounded="full"
                    px={2}
                  >
                    {action || "pending"}
                  </Badge>
                </HStack>

                <Text fontSize="xs" color={mutedText}>
                  {formatDate(entry.date || entry.createdAt)}
                </Text>
              </HStack>

              <Text fontWeight="semibold" fontSize="sm">
                {resolveApprovalActor(entry)}
              </Text>

              <Text fontSize="sm" color={mutedText} mt={1}>
                {entry.comment?.trim() || "No comment provided."}
              </Text>
            </Box>
          </Flex>
        );
      })}
    </VStack>
  );
}
