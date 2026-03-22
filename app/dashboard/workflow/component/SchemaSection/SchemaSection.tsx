import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Textarea,
  Badge,
  Grid,
  GridItem,
  Icon,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiUploadCloud, FiEyeOff, FiCheckCircle, FiAlignLeft } from "react-icons/fi";
import { WorkflowConfig } from "../../types/config";

interface SchemaSectionProps {
  config: WorkflowConfig;
  onChange: (updates: Partial<WorkflowConfig>) => void;
  errors?: Record<string, string>;
}

const SchemaSection = ({ config, onChange, errors = {} }: SchemaSectionProps) => {
  const [jsonInput, setJsonInput] = useState(config.schemaConfig || "");
  const [parsedSchema, setParsedSchema] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validate and parse JSON whenever input changes
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedSchema(null);
      setParseError(null);
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      setParsedSchema(parsed);
      setParseError(null);
      // Sync back to config
      onChange({ schemaConfig: jsonInput });
    } catch (err: any) {
      setParsedSchema(null);
      setParseError(err.message || "Invalid JSON structure");
    }
  }, [jsonInput]); // don't add onChange to dependencies to avoid loops

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      try {
        const text = await file.text();
        setJsonInput(text);
      } catch (err) {
        setParseError("Could not read file");
      }
    } else {
      setParseError("Please upload a valid JSON file");
    }
  };

  const bgPreview = useColorModeValue("whiteAlpha.800", "blackAlpha.600");
  const borderColorPreview = useColorModeValue("gray.200", "gray.700");
  const dropzoneBg = useColorModeValue(isDragging ? "brand.50" : "white", isDragging ? "brand.900" : "whiteAlpha.100");

  return (
    <VStack align="stretch" spacing={8}>
      {/* Header */}
      <Box mb={2}>
        <Text fontSize="xl" fontWeight="bold">
          Dynamic Schema Setup
        </Text>
        <Text fontSize="sm" color="gray.500">
          Upload or paste your JSON schema to dynamically build your form
        </Text>
      </Box>

      {/* Input Section (Dual Mode) */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Upload Zone */}
        <GridItem>
          <Box
            p={8}
            h="100%"
            border="2px dashed"
            borderColor={isDragging ? "brand.500" : useColorModeValue("gray.300", "gray.600")}
            rounded="xl"
            bg={dropzoneBg}
            transition="all 0.2s"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            onClick={() => document.getElementById("schema-file-upload")?.click()}
            _hover={{ bg: useColorModeValue("gray.50", "whiteAlpha.200") }}
          >
            <Box p={4} rounded="full" bg={useColorModeValue("brand.50", "brand.900")} color="brand.500" mb={4}>
              <FiUploadCloud size={32} />
            </Box>
            <Text fontWeight="semibold" mb={1} textAlign="center">
              Drag & Drop your JSON file
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              or click here to browse
            </Text>
            <input
              id="schema-file-upload"
              type="file"
              accept=".json,application/json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const text = await file.text();
                    setJsonInput(text);
                  } catch (err) {
                    setParseError("Could not read file");
                  }
                }
              }}
            />
          </Box>
        </GridItem>

        {/* Textarea Zone */}
        <GridItem>
          <VStack align="stretch" h="100%">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Or paste JSON directly:
            </Text>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{\n  "fields": [],\n  "tables": []\n}`}
              fontFamily="monospace"
              fontSize="sm"
              minH={{ base: "200px", lg: "100%" }}
              rounded="xl"
              bg={useColorModeValue("gray.50", "gray.800")}
              borderColor={parseError ? "red.400" : borderColorPreview}
              _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
            />
          </VStack>
        </GridItem>
      </Grid>

      {/* Validation Feedback */}
      {parseError && (
        <Alert status="error" rounded="md" shadow="sm">
          <AlertIcon />
          <AlertDescription fontSize="sm">{parseError}</AlertDescription>
        </Alert>
      )}
      {!parseError && parsedSchema && (
        <Alert status="success" rounded="md" shadow="sm" bg={useColorModeValue("green.50", "green.900")} color={useColorModeValue("green.800", "green.100")}>
          <AlertIcon color={useColorModeValue("green.500", "green.300")} />
          <AlertDescription fontSize="sm">Valid schema detected.</AlertDescription>
        </Alert>
      )}

      {/* Live Preview Section */}
      {parsedSchema && !parseError && (
        <Box
          p={6}
          bg={bgPreview}
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={borderColorPreview}
          rounded="xl"
          shadow="lg"
        >
          <Box mb={6} pb={4} borderBottom="1px solid" borderColor={borderColorPreview}>
            <Flex align="center" gap={3}>
              <Box p={2} bgGradient="linear(to-r, brand.500, purple.500)" color="white" rounded="lg" shadow="sm">
                <FiAlignLeft size={18} />
              </Box>
              <Text fontSize="lg" fontWeight="bold" bgGradient="linear(to-r, brand.600, purple.600)" bgClip="text">
                Live Schema Visualization
              </Text>
            </Flex>
          </Box>

          <Tabs variant="soft-rounded" colorScheme="brand">
            <TabList mb={4} gap={2} flexWrap="wrap">
              <Tab fontSize="sm" rounded="full" px={6}>
                Fields
                {parsedSchema.fields && (
                  <Badge ml={2} rounded="full" colorScheme="gray">
                    {Array.isArray(parsedSchema.fields)
                      ? parsedSchema.fields.length
                      : Object.keys(parsedSchema.fields).length}
                  </Badge>
                )}
              </Tab>
              <Tab fontSize="sm" rounded="full" px={6}>
                Tables
                {Array.isArray(parsedSchema.tables) && (
                  <Badge ml={2} rounded="full" colorScheme="gray">
                    {parsedSchema.tables.length}
                  </Badge>
                )}
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                {!parsedSchema.fields || (Array.isArray(parsedSchema.fields) ? parsedSchema.fields.length === 0 : Object.keys(parsedSchema.fields).length === 0) ? (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">No fields found in schema.</Text>
                ) : (
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={4}>
                    {(Array.isArray(parsedSchema.fields)
                      ? parsedSchema.fields
                      : Object.keys(parsedSchema.fields).map((k) => ({
                          key: k,
                          ...parsedSchema.fields[k]
                        }))
                    ).map((field: any, idx: number) => (
                      <Box
                        key={idx}
                        p={4}
                        border="1px solid"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                        rounded="lg"
                        bg={useColorModeValue("white", "gray.800")}
                        shadow="sm"
                        transition="transform 0.2s"
                        _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                      >
                        <Flex justify="space-between" align="start" mb={3}>
                          <Box flex="1" mr={2}>
                            <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={1} title={field.key}>
                              {field.label || field.key || "Unnamed Field"}
                            </Text>
                            <Text fontSize="xs" color="gray.500" fontFamily="monospace">
                              {field.key}
                            </Text>
                          </Box>
                          <HStack spacing={1}>
                            {field.visible === false && (
                              <Icon as={FiEyeOff} color="red.400" title="Hidden Field" />
                            )}
                            <Badge colorScheme={
                              field.type === "string" ? "blue" :
                              field.type === "number" ? "green" :
                              field.type === "boolean" ? "purple" : "gray"
                            } rounded="md" fontSize="2xs">
                              {field.type || "unknown"}
                            </Badge>
                          </HStack>
                        </Flex>

                        <HStack mt={3} gap={2} flexWrap="wrap">
                          {field.required && <Badge colorScheme="red" variant="subtle" fontSize="2xs">Required</Badge>}
                          {field.isEditable === false && <Badge colorScheme="orange" variant="subtle" fontSize="2xs">Read Only</Badge>}
                          {field.options && <Badge colorScheme="cyan" variant="subtle" fontSize="2xs">Dropdown</Badge>}
                        </HStack>
                      </Box>
                    ))}
                  </Grid>
                )}
              </TabPanel>

              <TabPanel px={0}>
                {!Array.isArray(parsedSchema.tables) || parsedSchema.tables.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">No tables found in schema.</Text>
                ) : (
                  <VStack spacing={6} align="stretch">
                    {parsedSchema.tables.map((rawTable: any, idx: number) => {
                      // Normalize table structure
                      let table = rawTable;
                      let columns = rawTable.columns;
                      let name = rawTable.name || rawTable.dbKey || `Table ${idx + 1}`;
                      
                      const keys = Object.keys(rawTable);
                      if (keys.length === 1 && rawTable[keys[0]]?.columns) {
                        table = rawTable[keys[0]];
                        columns = table.columns;
                        name = keys[0];
                      }

                      return (
                      <Box
                        key={idx}
                        p={5}
                        border="1px solid"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                        rounded="xl"
                        bg={useColorModeValue("gray.50", "gray.900")}
                      >
                        <Flex align="center" gap={3} mb={4}>
                          <Text fontWeight="bold" fontSize="md" color="gray.800">
                            {name}
                          </Text>
                          {table.dbKey && (
                            <Badge colorScheme="purple" variant="outline" rounded="md" fontSize="xs">
                              {table.dbKey}
                            </Badge>
                          )}
                        </Flex>
                        
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={3}>
                          Columns ({Array.isArray(columns) ? columns.length : 0})
                        </Text>
                        
                        {Array.isArray(columns) && columns.length > 0 ? (
                           <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={3}>
                             {columns.map((col: any, cIdx: number) => (
                               <Flex key={cIdx} p={3} bg={useColorModeValue("white", "gray.800")} rounded="md" border="1px solid" borderColor={borderColorPreview} align="center" justify="space-between">
                                 <Box overflow="hidden">
                                    <Text fontSize="sm" fontWeight="medium" noOfLines={1} title={col.label || col.name}>{col.label || col.name || col.key}</Text>
                                    <Text fontSize="xs" color="gray.500" fontFamily="monospace">{col.name || col.key}</Text>
                                 </Box>
                                 <Badge colorScheme={col.type === "number" ? "green" : "blue"} fontSize="2xs">
                                   {col.type || "string"}
                                 </Badge>
                               </Flex>
                             ))}
                           </Grid>
                        ) : (
                           <Text fontSize="sm" color="gray.400" fontStyle="italic">No columns defined.</Text>
                        )}
                      </Box>
                    );
                    })}
                  </VStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </VStack>
  );
};

export default SchemaSection;
