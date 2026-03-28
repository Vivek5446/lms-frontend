"use client";

import {
  Badge,
  Box,
  Button,
  HStack,
  Link,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import {
  ApprovalDocument,
  ApprovalTabKey,
  formatDate,
  formatLevel,
  resolveCreatorLabel,
} from "../types";

interface DocumentTableProps {
  tabKey: ApprovalTabKey;
  documents: ApprovalDocument[];
  loading: boolean;
  onView: (document: ApprovalDocument) => void;
  onApprove: (document: ApprovalDocument) => void;
  onReject: (document: ApprovalDocument) => void;
}

const getStatusColor = (status?: string) => {
  if (status === "completed" || status === "approved") return "green";
  if (status === "rejected") return "red";
  return "orange";
};

export default function DocumentTable({
  tabKey,
  documents,
  loading,
  onView,
  onApprove,
  onReject,
}: DocumentTableProps) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const tableBg = useColorModeValue("white", "gray.800");
  const headBg = useColorModeValue("gray.50", "gray.900");

  if (loading) {
    return (
      <VStack minH="280px" justify="center" spacing={3}>
        <Spinner size="lg" color="brand.500" thickness="3px" />
        <Text fontSize="sm" color={mutedText}>
          Loading {tabKey} documents...
        </Text>
      </VStack>
    );
  }

  if (!documents.length) {
    return (
      <Box
        border="1px dashed"
        borderColor={borderColor}
        rounded="2xl"
        p={10}
        textAlign="center"
        bg={tableBg}
      >
        <Text fontWeight="semibold" mb={1}>
          No {tabKey} documents
        </Text>
        <Text fontSize="sm" color={mutedText}>
          {tabKey === "pending"
            ? "Documents awaiting your level will appear here."
            : `Documents you have ${tabKey === "approved" ? "approved" : "rejected"} will appear here.`}
        </Text>
      </Box>
    );
  }

  return (
    <TableContainer
      border="1px solid"
      borderColor={borderColor}
      rounded="2xl"
      bg={tableBg}
      overflowX="auto"
    >
      <Table variant="simple">
        <Thead bg={headBg}>
          <Tr>
            <Th>Document ID</Th>
            <Th>Creator</Th>
            <Th>Created Date</Th>
            <Th>Current Level</Th>
            <Th>Status</Th>
            {tabKey !== "rejected" && <Th textAlign="right">Actions</Th>}
          </Tr>
        </Thead>

        <Tbody>
          {documents.map((document) => (
            <Tr key={document._id}>
              <Td>
                <VStack align="start" spacing={0}>
                  <Link
                    color="brand.600"
                    fontWeight="semibold"
                    onClick={() => onView(document)}
                  >
                    {document.documentId || document._id.slice(-8)}
                  </Link>
                  {document.workflowName && (
                    <Text fontSize="xs" color={mutedText}>
                      {document.workflowName}
                    </Text>
                  )}
                </VStack>
              </Td>

              <Td>{resolveCreatorLabel(document)}</Td>
              <Td>{formatDate(document.created_At)}</Td>
              <Td>{formatLevel(document.currentLevel)}</Td>
              <Td>
                <Badge
                  colorScheme={getStatusColor(document.status)}
                  rounded="full"
                  px={2.5}
                  textTransform="capitalize"
                >
                  {document.status || "pending"}
                </Badge>
              </Td>

              {tabKey !== "rejected" && (
                <Td textAlign="right">
                  <HStack justify="flex-end" spacing={2}>
                    <Button size="sm" variant="ghost" onClick={() => onView(document)}>
                      View
                    </Button>

                    {tabKey === "pending" && (
                      <>
                        <Button
                          size="sm"
                          colorScheme="green"
                          variant="outline"
                          onClick={() => onApprove(document)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => onReject(document)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </HStack>
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
