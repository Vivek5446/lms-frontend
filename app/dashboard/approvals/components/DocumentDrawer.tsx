"use client";

import axios from "axios";
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Input,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import ApprovalHistory from "./ApprovalHistory";
import {
  ApprovalDocument,
  ApprovalHistoryEntry,
  DrawerIntent,
  buildFieldUpdatePayload,
  buildTableUpdatePayload,
  buildEditableValueState,
  formatDate,
  formatLevel,
  isEditedValue,
  resolveCreatorLabel,
  resolveEditedValue,
  resolveFieldMap,
  resolveFileId,
  resolveInputValue,
  resolveOriginalValue,
  resolveTableMap,
} from "../types";

interface DocumentDrawerProps {
  document: ApprovalDocument | null;
  isOpen: boolean;
  onClose: () => void;
  intent: DrawerIntent;
  actionLoading: "approved" | "rejected" | null;
  onApprove: (
    comment: string,
    payload?: { fields?: Record<string, any>; tables?: Record<string, any[]> }
  ) => Promise<boolean>;
  onReject: (
    comment: string,
    payload?: { fields?: Record<string, any>; tables?: Record<string, any[]> }
  ) => Promise<boolean>;
}

export default function DocumentDrawer({
  document,
  isOpen,
  onClose,
  intent,
  actionLoading,
  onApprove,
  onReject,
}: DocumentDrawerProps) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const fieldBg = useColorModeValue("white", "gray.800");
  const editedBg = useColorModeValue("yellow.50", "rgba(236, 201, 75, 0.18)");
  const editedBorder = useColorModeValue("yellow.300", "yellow.500");
  const previewPlaceholderBg = useColorModeValue("gray.100", "gray.800");
  const [comment, setComment] = useState("");
  const [fieldDraft, setFieldDraft] = useState<Record<string, any>>({});
  const [tableDraft, setTableDraft] = useState<Record<string, any[]>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string>("");

  useEffect(() => {
    setComment("");
    setFieldDraft(resolveFieldMap(document));
    setTableDraft(resolveTableMap(document));
  }, [document]);

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      const fileId = resolveFileId(document?.file);
      if (!fileId) {
        setPreviewUrl(null);
        setPreviewMimeType("");
        return;
      }

      try {
        const response = await axios.get(document?.fileUrl || `/file/view/${fileId}`, {
          responseType: "blob",
        });
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
        setPreviewMimeType(response.data?.type || "");
      } catch (error) {
        setPreviewUrl(null);
        setPreviewMimeType("");
      }
    };

    if (isOpen) {
      void loadPreview();
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [document, isOpen]);

  const fields = useMemo(() => Object.entries(fieldDraft || {}), [fieldDraft]);
  const tables = useMemo(() => Object.entries(tableDraft || {}), [tableDraft]);
  const canTakeAction = Boolean(
    document && document.canTakeAction !== false && intent !== "view"
  );
  const canEdit = Boolean(document?.canEdit && canTakeAction);
  const approvalHistory: ApprovalHistoryEntry[] = document?.approval || [];
  const hasPreviewFile = Boolean(resolveFileId(document?.file));

  const updatePayload = useMemo(() => {
    if (!canEdit) return undefined;

    return {
      fields: buildFieldUpdatePayload(fieldDraft),
      tables: buildTableUpdatePayload(tableDraft),
    };
  }, [canEdit, fieldDraft, tableDraft]);

  const handleFieldChange = (key: string, value: string) => {
    setFieldDraft((prev) => ({
      ...prev,
      [key]: buildEditableValueState(prev[key], value),
    }));
  };

  const handleTableChange = (
    tableName: string,
    rowIndex: number,
    columnName: string,
    value: string
  ) => {
    setTableDraft((prev) => {
      const nextRows = [...(prev[tableName] || [])];
      const nextRow = { ...(nextRows[rowIndex] || {}) };
      const previousCell = nextRow[columnName];

      nextRow[columnName] = buildEditableValueState(previousCell, value);

      nextRows[rowIndex] = nextRow;
      return { ...prev, [tableName]: nextRows };
    });
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />

        <DrawerHeader borderBottom="1px solid" borderColor={borderColor}>
          <VStack align="stretch" spacing={2} pr={8}>
            <HStack justify="space-between" align="start" flexWrap="wrap">
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  {document?.documentId || "Document Detail"}
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  {document?.workflowName || "Workflow approval detail"}
                </Text>
              </Box>

              <HStack spacing={2} flexWrap="wrap">
                <Badge colorScheme="blue" rounded="full" px={2.5}>
                  {formatLevel(document?.currentLevel)}
                </Badge>
                <Badge
                  colorScheme={
                    document?.lastApproval?.action === "rejected" || document?.status === "rejected"
                      ? "red"
                      : document?.status === "completed" || document?.status === "approved"
                        ? "green"
                        : "orange"
                  }
                  rounded="full"
                  px={2.5}
                  textTransform="capitalize"
                >
                  {document?.status || "pending"}
                </Badge>
                {document?.canEdit && (
                  <Badge colorScheme="purple" rounded="full" px={2.5}>
                    Editable
                  </Badge>
                )}
              </HStack>
            </HStack>

            <HStack spacing={6} flexWrap="wrap" color={mutedText} fontSize="sm">
              <Text>Creator: {document ? resolveCreatorLabel(document) : "-"}</Text>
              <Text>Created: {formatDate(document?.created_At)}</Text>
            </HStack>
          </VStack>
        </DrawerHeader>

        <DrawerBody py={6} overflow="hidden">
          <Flex direction={{ base: "column", xl: "row" }} gap={6} h="100%">
            <Box
              w={{ base: "100%", xl: "50%" }}
              minH={{ base: "320px", xl: "100%" }}
              border="1px solid"
              borderColor={borderColor}
              rounded="2xl"
              bg={sectionBg}
              p={5}
            >
              <Text fontSize="sm" fontWeight="bold" mb={4}>
                PDF Preview
              </Text>

              <Box
                h={{ base: "360px", xl: "calc(100vh - 240px)" }}
                border="1px solid"
                borderColor={borderColor}
                rounded="xl"
                overflow="hidden"
                bg={fieldBg}
              >
                {hasPreviewFile && previewUrl ? (
                  previewMimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <iframe
                      src={previewUrl}
                      title="Document preview"
                      style={{ width: "100%", height: "100%", border: 0 }}
                    />
                  )
                ) : (
                  <Flex
                    h="100%"
                    align="center"
                    justify="center"
                    direction="column"
                    bg={previewPlaceholderBg}
                    px={6}
                    textAlign="center"
                  >
                    <Text fontWeight="semibold">No PDF available</Text>
                    <Text fontSize="sm" color={mutedText} mt={2}>
                      The document will appear here automatically whenever a file is attached.
                    </Text>
                  </Flex>
                )}
              </Box>
            </Box>

            <Box
              w={{ base: "100%", xl: "50%" }}
              overflowY="auto"
              pr={{ base: 0, xl: 1 }}
            >
              <VStack align="stretch" spacing={6}>
                <Box bg={sectionBg} rounded="2xl" border="1px solid" borderColor={borderColor} p={5}>
                  <Text fontSize="sm" fontWeight="bold" mb={4}>
                    Dynamic Fields
                  </Text>

                  {fields.length ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {fields.map(([key, value]) => {
                        const editedValue = resolveEditedValue(value);
                        const hasEditedValue = isEditedValue(value);

                        return (
                          <Box
                            key={key}
                            bg={hasEditedValue ? editedBg : fieldBg}
                            border="1px solid"
                            borderColor={hasEditedValue ? editedBorder : borderColor}
                            rounded="xl"
                            p={4}
                          >
                            <Text
                              fontSize="xs"
                              fontWeight="semibold"
                              color={mutedText}
                              textTransform="uppercase"
                              letterSpacing="wide"
                              mb={3}
                            >
                              {key.replace(/_/g, " ")}
                            </Text>

                            {canEdit ? (
                              <VStack align="stretch" spacing={3}>
                                <Input
                                  value={resolveInputValue(value)}
                                  onChange={(event) => handleFieldChange(key, event.target.value)}
                                  bg={fieldBg}
                                />
                                <VStack align="stretch" spacing={1}>
                                  <Text fontSize="xs" color={mutedText}>
                                    Original: {String(resolveOriginalValue(value))}
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color={hasEditedValue ? "orange.500" : mutedText}
                                  >
                                    Edited: {editedValue !== null ? String(editedValue) : "-"}
                                  </Text>
                                </VStack>
                              </VStack>
                            ) : (
                              <VStack align="stretch" spacing={2}>
                                <Text fontSize="sm">
                                  <Text as="span" fontWeight="semibold">
                                    Original:
                                  </Text>{" "}
                                  {String(resolveOriginalValue(value))}
                                </Text>
                                <Text fontSize="sm" color={hasEditedValue ? "orange.500" : mutedText}>
                                  <Text as="span" fontWeight="semibold">
                                    Edited:
                                  </Text>{" "}
                                  {editedValue !== null ? String(editedValue) : "-"}
                                </Text>
                              </VStack>
                            )}
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  ) : (
                    <Text fontSize="sm" color={mutedText}>
                      No dynamic fields found for this document.
                    </Text>
                  )}
                </Box>

                <Box bg={sectionBg} rounded="2xl" border="1px solid" borderColor={borderColor} p={5}>
                  <Text fontSize="sm" fontWeight="bold" mb={4}>
                    Dynamic Tables
                  </Text>

                  {tables.length ? (
                    <VStack align="stretch" spacing={5}>
                      {tables.map(([tableName, rows]) => {
                        const tableRows = Array.isArray(rows) ? rows : [];
                        const columns = tableRows.length ? Object.keys(tableRows[0]) : [];

                        return (
                          <Box key={tableName}>
                            <Text fontWeight="semibold" mb={3} textTransform="capitalize">
                              {tableName.replace(/_/g, " ")}
                            </Text>

                            {tableRows.length ? (
                              <TableContainer
                                border="1px solid"
                                borderColor={borderColor}
                                rounded="xl"
                                bg={fieldBg}
                              >
                                <Table size="sm">
                                  <Thead>
                                    <Tr>
                                      {columns.map((column) => (
                                        <Th key={column} textTransform="capitalize">
                                          {column.replace(/_/g, " ")}
                                        </Th>
                                      ))}
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {tableRows.map((row, rowIndex) => (
                                      <Tr key={`${tableName}-${rowIndex}`}>
                                        {columns.map((column) => {
                                          const cellValue = row[column];
                                          const hasEditedValue = isEditedValue(cellValue);
                                          const editedValue = resolveEditedValue(cellValue);

                                          return (
                                            <Td
                                              key={column}
                                              bg={hasEditedValue ? editedBg : undefined}
                                              borderColor={hasEditedValue ? editedBorder : undefined}
                                            >
                                              {canEdit ? (
                                                <VStack align="stretch" spacing={2}>
                                                  <Input
                                                    size="sm"
                                                    value={resolveInputValue(cellValue)}
                                                    onChange={(event) =>
                                                      handleTableChange(
                                                        tableName,
                                                        rowIndex,
                                                        column,
                                                        event.target.value
                                                      )
                                                    }
                                                  />
                                                  <Text fontSize="xs" color={mutedText}>
                                                    Original: {String(resolveOriginalValue(cellValue))}
                                                  </Text>
                                                  <Text
                                                    fontSize="xs"
                                                    color={hasEditedValue ? "orange.500" : mutedText}
                                                  >
                                                    Edited: {editedValue !== null ? String(editedValue) : "-"}
                                                  </Text>
                                                </VStack>
                                              ) : (
                                                <VStack align="stretch" spacing={1}>
                                                  <Text fontSize="xs" color={mutedText}>
                                                    Original: {String(resolveOriginalValue(cellValue))}
                                                  </Text>
                                                  <Text
                                                    fontSize="sm"
                                                    color={hasEditedValue ? "orange.500" : "inherit"}
                                                  >
                                                    Edited: {editedValue !== null ? String(editedValue) : "-"}
                                                  </Text>
                                                </VStack>
                                              )}
                                            </Td>
                                          );
                                        })}
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </TableContainer>
                            ) : (
                              <Text fontSize="sm" color={mutedText}>
                                No rows available for this table.
                              </Text>
                            )}
                          </Box>
                        );
                      })}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color={mutedText}>
                      No dynamic tables found for this document.
                    </Text>
                  )}
                </Box>

                <Box bg={sectionBg} rounded="2xl" border="1px solid" borderColor={borderColor} p={5}>
                  <Text fontSize="sm" fontWeight="bold" mb={4}>
                    Approval History
                  </Text>
                  <ApprovalHistory history={approvalHistory} />
                </Box>

                {canTakeAction && (
                  <Box bg={sectionBg} rounded="2xl" border="1px solid" borderColor={borderColor} p={5}>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      Review Comment
                    </Text>
                    <Text fontSize="sm" color={mutedText} mb={4}>
                      A comment is required before you approve or reject this document.
                    </Text>
                    <Textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Add your review notes..."
                      minH="140px"
                      bg={fieldBg}
                    />
                  </Box>
                )}
              </VStack>
            </Box>
          </Flex>
        </DrawerBody>

        <DrawerFooter borderTop="1px solid" borderColor={borderColor}>
          <HStack w="100%" justify="space-between">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>

            {canTakeAction ? (
              <HStack>
                <Button
                  colorScheme="red"
                  variant={intent === "rejected" ? "solid" : "outline"}
                  isLoading={actionLoading === "rejected"}
                  isDisabled={!comment.trim() || actionLoading !== null}
                  onClick={() => onReject(comment.trim(), updatePayload)}
                >
                  Reject
                </Button>
                <Button
                  colorScheme="green"
                  variant={intent === "approved" ? "solid" : "outline"}
                  isLoading={actionLoading === "approved"}
                  isDisabled={!comment.trim() || actionLoading !== null}
                  onClick={() => onApprove(comment.trim(), updatePayload)}
                >
                  Approve
                </Button>
              </HStack>
            ) : (
              <Badge colorScheme="gray" rounded="full" px={3} py={1}>
                Read only
              </Badge>
            )}
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
