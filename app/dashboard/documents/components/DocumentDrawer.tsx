"use client";

import {
  Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent,
  DrawerFooter, DrawerHeader, DrawerOverlay, Flex, Grid, HStack,
  Icon, Input, Tab, TabList, TabPanel, TabPanels, Tabs, Text,
  Textarea, useColorModeValue, useToast, VStack, Badge, IconButton,
  Spinner,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiFile, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import stores from "../../../store/stores";
import axios from "axios";
import {
  extractSchema,
  fieldTypeToInputType,
  generateDummyFields,
  generateDummyTableRow,
  getAllFields,
  parseSavedFieldValues,
  parseSavedOriginalFieldValues,
  parseSavedTableValues,
  parseSavedOriginalTableValues,
  buildFieldPayload,
  buildTablePayload,
} from "../utils/schemaUtils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workflow: any;
  editDoc?: any;
  onSuccess: () => void;
}

const DocumentDrawer = observer(({ isOpen, onClose, workflow, editDoc, onSuccess }: Props) => {
  const { documentStore } = stores;
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fields, tables } = extractSchema(workflow);
  const allFields = getAllFields(fields);

  // ── File state ─────────────────────────────────────────────────────────────
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileMimeType, setFileMimeType] = useState<string>("");

  // ── Field/Table tracking — separating original from edited ──────────────
  const [originalFieldValues] = useState<Record<string, any>>(() => {
    return parseSavedOriginalFieldValues(editDoc?.values?.fields, () => generateDummyFields(fields));
  });
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    return parseSavedFieldValues(editDoc?.values?.fields, () => originalFieldValues);
  });

  const [originalTableRowData] = useState<Record<string, any[]>>(() => {
    return parseSavedOriginalTableValues(editDoc?.values?.tables, () => {
      const initial: Record<string, any[]> = {};
      tables.forEach((tableObj: any) => {
        const tableName = Object.keys(tableObj)[0];
        const cols = tableObj[tableName]?.columns || [];
        initial[tableName] = [generateDummyTableRow(cols)];
      });
      return initial;
    });
  });
  const [tableRowData, setTableRowData] = useState<Record<string, any[]>>(() => {
    return parseSavedTableValues(editDoc?.values?.tables, () => originalTableRowData);
  });

  const bg = useColorModeValue("white", "gray.800");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const highlightColor = "orange.400";

  // ── Sync saved file preview (Blob-based) ───────────────────────────
  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchFileBlob = async (fileId: string) => {
      try {
        const response = await axios.get(`/file/view/${fileId}`, {
          responseType: "blob",
        });
        const blob = response.data;
        objectUrl = URL.createObjectURL(blob);
        setFilePreviewUrl(objectUrl);
        
        // Try to determine mime type from blob
        if (blob.type) {
          setFileMimeType(blob.type);
        }
      } catch (err) {
        console.error("Failed to fetch file blob:", err);
      }
    };

    if (editDoc?.file) {
      const fileData = editDoc.file;
      const fileId = typeof fileData === "string" 
        ? fileData 
        : fileData?._id || fileData?.$oid || fileData?.toString();
      
      if (fileId) {
        fetchFileBlob(fileId);
        if (typeof fileData === "object" && fileData.filename) {
          setFileName(fileData.filename);
        }
      }
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [editDoc]);

  // ── File upload handler ────────────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setFileMimeType(f.type);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setFileBase64(result);
      setFilePreviewUrl(result);
    };
    reader.readAsDataURL(f);
  }, []);

  // ── Field value change ─────────────────────────────────────────────────
  const handleFieldChange = (key: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  // ── Table row operations ───────────────────────────────────────────────
  const addTableRow = (tableName: string, columns: any[]) => {
    setTableRowData((prev) => ({
      ...prev,
      [tableName]: [...(prev[tableName] || []), generateDummyTableRow(columns)],
    }));
  };

  const removeTableRow = (tableName: string, rowIdx: number) => {
    setTableRowData((prev) => ({
      ...prev,
      [tableName]: prev[tableName].filter((_, i) => i !== rowIdx),
    }));
  };

  const handleTableCellChange = (tableName: string, rowIdx: number, colName: string, value: any) => {
    setTableRowData((prev) => {
      const rows = [...(prev[tableName] || [])];
      rows[rowIdx] = { ...rows[rowIdx], [colName]: value };
      return { ...prev, [tableName]: rows };
    });
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const parsedFieldData = buildFieldPayload(originalFieldValues, fieldValues);
      const parsedTableData = buildTablePayload(originalTableRowData, tableRowData);

      await documentStore.createDocument({
        workflowId: workflow._id,
        documentData: parsedFieldData,
        tableData: parsedTableData,
        ...(fileBase64
          ? { file: { base64: fileBase64, name: fileName, mimeType: fileMimeType } }
          : {}),
      });
      toast({ title: "Document saved successfully", status: "success", duration: 2500, position: "top-right" });
      onSuccess();
    } catch (err: any) {
      toast({
        title: "Failed to save document",
        description: err?.message || "Unknown error",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const isEditing = !!editDoc;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="full" placement="right">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent maxW={{ base: "100vw", lg: "90vw" }} mx="auto">
        <DrawerCloseButton top={4} right={4} />
        <DrawerHeader
          borderBottom="1px solid"
          borderColor={borderColor}
          fontSize="lg"
          fontWeight="bold"
          px={6}
          py={4}
        >
          <HStack>
            <Icon as={FiFile} color="brand.500" />
            <Text>{isEditing ? "View Document" : "Add Document"}</Text>
            <Badge colorScheme="brand" rounded="full" px={2} fontSize="xs">
              {workflow?.workFlowName}
            </Badge>
          </HStack>
        </DrawerHeader>

        <DrawerBody p={0} overflow="hidden">
          {/* ── Split-screen layout ───────────────────────────────────── */}
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            h={{ base: "auto", lg: "calc(100vh - 130px)" }}
            overflow="hidden"
          >
            {/* ─── LEFT — File preview ──────────────────────────── */}
            <Box
              borderRight={{ base: "none", lg: "1px solid" }}
              borderBottom={{ base: "1px solid", lg: "none" }}
              borderColor={borderColor}
              display="flex"
              flexDirection="column"
              overflow="hidden"
              minH={{ base: "300px", lg: "auto" }}
            >
              {/* Upload drop zone */}
              <Box
                p={4}
                borderBottom="1px solid"
                borderColor={borderColor}
                bg={inputBg}
              >
                <Flex align="center" gap={3}>
                  <Button
                    leftIcon={<FiUpload />}
                    size="sm"
                    variant="outline"
                    colorScheme="brand"
                    onClick={() => fileInputRef.current?.click()}
                    isDisabled={isEditing}
                  >
                    {filePreviewUrl ? "Replace File" : "Upload File"}
                  </Button>
                  {fileName && (
                    <Text fontSize="xs" color={mutedText} noOfLines={1} maxW="180px">
                      {fileName}
                    </Text>
                  )}
                </Flex>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </Box>

              {/* Preview area */}
              <Box flex={1} overflow="hidden" bg={useColorModeValue("gray.100", "gray.900")}>
                {filePreviewUrl ? (
                  (fileMimeType?.startsWith("image/") || (!fileMimeType && !filePreviewUrl.toLowerCase().endsWith(".pdf"))) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={filePreviewUrl}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        // If image fails, maybe it's a PDF without extension
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <object
                      data={filePreviewUrl}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                      style={{ minHeight: "400px" }}
                    >
                      <Flex align="center" justify="center" h="100%">
                        <Text color={mutedText} fontSize="sm">
                          PDF preview not available in this browser.
                        </Text>
                      </Flex>
                    </object>
                  )
                ) : (
                  <Flex direction="column" align="center" justify="center" h="100%" gap={3}>
                    <Icon as={FiFile} boxSize={14} color={mutedText} />
                    <Text color={mutedText} fontSize="sm">
                      Upload a PDF or image to preview
                    </Text>
                  </Flex>
                )}
              </Box>
            </Box>

            {/* ─── RIGHT — Dynamic form ─────────────────────────── */}
            <Box overflow="auto" p={{ base: 4, md: 6 }}>
              <Tabs variant="soft-rounded" colorScheme="brand" size="sm">
                <TabList mb={5}>
                  <Tab>Fields</Tab>
                  {tables.length > 0 && <Tab>Tables ({tables.length})</Tab>}
                </TabList>

                <TabPanels>
                  {/* ── Tab 1: Fields ──────────────────────────── */}
                  <TabPanel p={0}>
                    <VStack spacing={4} align="stretch">
                      {allFields.length === 0 ? (
                        <Text color={mutedText} fontSize="sm">
                          No fields defined in workflow schema.
                        </Text>
                      ) : (
                        allFields.filter(f => f.def.visible !== false).map(({ key, def }) => {
                          const inputType = fieldTypeToInputType(def.type);
                          const isReadOnly = def.isEditable === false;
                          const isEdited = fieldValues[key] !== originalFieldValues[key];

                          return (
                            <Box key={key}>
                              <HStack justify="space-between" mb={1}>
                                <Text
                                  fontSize="xs"
                                  fontWeight="semibold"
                                  color={isEdited ? highlightColor : mutedText}
                                  textTransform="capitalize"
                                >
                                  {key.replace(/_/g, " ")}
                                </Text>
                                {isEdited && (
                                  <Badge colorScheme="orange" variant="subtle" fontSize="2xs" rounded="full">
                                    Edited
                                  </Badge>
                                )}
                              </HStack>
                              <Input
                                size="sm"
                                type={inputType}
                                bg={inputBg}
                                value={fieldValues[key] ?? ""}
                                isReadOnly={isReadOnly}
                                onChange={(e) => handleFieldChange(key, e.target.value)}
                                rounded="lg"
                                borderColor={isEdited ? highlightColor : borderColor}
                                borderWidth={isEdited ? "1.5px" : "1px"}
                                _focus={{ borderColor: isEdited ? highlightColor : "brand.500", bg }}
                              />
                            </Box>
                          );
                        })
                      )}
                    </VStack>
                  </TabPanel>

                  {/* ── Tab 2: Tables ──────────────────────────── */}
                  {tables.length > 0 && (
                    <TabPanel p={0}>
                      <VStack spacing={6} align="stretch">
                        {tables.map((tableObj: any) => {
                          const tableName = Object.keys(tableObj)[0];
                          const cols: any[] = tableObj[tableName]?.columns || [];
                          const visibleCols = cols.filter((c) => c.visible !== false);
                          const rows = tableRowData[tableName] || [];

                          return (
                            <Box
                              key={tableName}
                              p={4}
                              border="1px solid"
                              borderColor={borderColor}
                              rounded="xl"
                              bg={bg}
                            >
                              <Flex justify="space-between" align="center" mb={3}>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  textTransform="capitalize"
                                  color="brand.600"
                                >
                                  {tableName.replace(/_/g, " ")}
                                </Text>
                                  <Button
                                    size="xs"
                                    leftIcon={<FiPlus />}
                                    colorScheme="brand"
                                    variant="ghost"
                                    onClick={() => addTableRow(tableName, cols)}
                                  >
                                    Add Row
                                  </Button>
                              </Flex>

                              {/* Table grid */}
                              <Box overflowX="auto">
                                <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
                                  <Box as="thead">
                                    <Box as="tr">
                                      {visibleCols.map((col) => (
                                        <Box
                                          as="th"
                                          key={col.name}
                                          px={3}
                                          py={2}
                                          fontSize="xs"
                                          fontWeight="bold"
                                          color={mutedText}
                                          textAlign="left"
                                          bg={inputBg}
                                          borderBottom="1px solid"
                                          borderColor={borderColor}
                                          whiteSpace="nowrap"
                                          textTransform="capitalize"
                                        >
                                          {col.name.replace(/_/g, " ")}
                                        </Box>
                                      ))}
                                      <Box
                                        as="th"
                                        px={3}
                                        py={2}
                                        bg={inputBg}
                                        borderBottom="1px solid"
                                        borderColor={borderColor}
                                      />
                                    </Box>
                                  </Box>

                                  <Box as="tbody">
                                    {rows.map((row: any, rowIdx: number) => (
                                      <Box as="tr" key={rowIdx}>
                                        {visibleCols.map((col) => (
                                          <Box
                                            as="td"
                                            key={col.name}
                                            px={2}
                                            py={2}
                                            borderBottom="1px solid"
                                            borderColor={borderColor}
                                          >
                                            {(() => {
                                              const curVal = row[col.name] ?? "";
                                              const origRow = originalTableRowData[tableName]?.[rowIdx] || {};
                                              const origVal = origRow[col.name] ?? "";
                                              const isCellEdited = curVal !== origVal;
                                              
                                              return (
                                                <Input
                                                  size="xs"
                                                  bg={inputBg}
                                                  type={fieldTypeToInputType(col.type)}
                                                  value={curVal}
                                                  isReadOnly={col.isEditable === false}
                                                  onChange={(e) =>
                                                    handleTableCellChange(tableName, rowIdx, col.name, e.target.value)
                                                  }
                                                  rounded="md"
                                                  minW="100px"
                                                  borderColor={isCellEdited ? highlightColor : borderColor}
                                                  borderWidth={isCellEdited ? "1.5px" : "1px"}
                                                  color={isCellEdited ? highlightColor : "inherit"}
                                                  fontWeight={isCellEdited ? "bold" : "normal"}
                                                  _focus={{ borderColor: isCellEdited ? highlightColor : "brand.500" }}
                                                />
                                              );
                                            })()}
                                          </Box>
                                        ))}
                                        <Box
                                          as="td"
                                          px={2}
                                          py={2}
                                          borderBottom="1px solid"
                                          borderColor={borderColor}
                                        >
                                          <IconButton
                                            aria-label="Remove row"
                                            icon={<FiTrash2 />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={() => removeTableRow(tableName, rowIdx)}
                                          />
                                        </Box>
                                      </Box>
                                    ))}

                                    {rows.length === 0 && (
                                      <Box as="tr">
                                        <Box
                                          as="td"
                                          colSpan={visibleCols.length + 1}
                                          textAlign="center"
                                          py={6}
                                          fontSize="xs"
                                          color={mutedText}
                                        >
                                          No rows yet.
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </VStack>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </Box>
          </Grid>
        </DrawerBody>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        {!isEditing && (
          <DrawerFooter
            borderTop="1px solid"
            borderColor={borderColor}
            px={6}
            py={4}
            gap={3}
          >
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              rounded="full"
              px={8}
              isLoading={documentStore.createLoading}
              onClick={handleSubmit}
            >
              Save Document
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
});

export default DocumentDrawer;
