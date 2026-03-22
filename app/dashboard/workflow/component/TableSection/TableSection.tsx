import { Box, Flex, Grid, Stack, Text, Button, Divider, VStack } from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiList, FiCheckSquare, FiFilter, FiSettings, FiColumns } from "react-icons/fi";
import { TableAction, TableColumn, WorkflowConfig } from "../../types/config";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

interface TableSectionProps {
  config: WorkflowConfig;
  onChange: (updates: Partial<WorkflowConfig>) => void;
  errors?: Record<string, string>;
}

const TableSection = ({ config, onChange, errors = {} }: TableSectionProps) => {
  const levelOptions = Array.from({ length: config.noOfLevels }, (_, i) => ({
    label: `Level ${i + 1}`,
    value: String(i + 1),
  }));

  const updateAction = (index: number, updates: Partial<TableAction>) => {
    const actions = [...config.tableActions];
    actions[index] = { ...actions[index], ...updates };
    onChange({ tableActions: actions });
  };

  const toggleActionLevel = (actionIndex: number, level: number) => {
    const action = config.tableActions[actionIndex];
    const levels = action.levels.includes(level)
      ? action.levels.filter((l) => l !== level)
      : [...action.levels, level];
    updateAction(actionIndex, { levels });
  };

  const addColumn = () => {
    const newCol: TableColumn = {
      id: crypto.randomUUID(),
      label: "",
      key: "",
      active: true,
      labelAlign: "left",
      rowAlign: "left",
      truncate: false,
      truncateLabel: "",
      isFile: false,
    };
    onChange({ tableColumns: [...config.tableColumns, newCol] });
  };

  const updateColumn = (id: string, updates: Partial<TableColumn>) => {
    onChange({
      tableColumns: config.tableColumns.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const removeColumn = (id: string) => {
    onChange({
      tableColumns: config.tableColumns.filter((c) => c.id !== id),
    });
  };

  const addHeader = () => {
    onChange({ tableHeaders: [...config.tableHeaders, { label: "", show: true }] });
  };

  const updateHeader = (
    index: number,
    updates: Partial<{ label: string; show: boolean }>
  ) => {
    const headers = [...config.tableHeaders];
    headers[index] = { ...headers[index], ...updates };
    onChange({ tableHeaders: headers });
  };

  const removeHeader = (index: number) => {
    onChange({
      tableHeaders: config.tableHeaders.filter((_, i) => i !== index),
    });
  };

  const addFilterOption = () => {
    onChange({ filterOptions: [...config.filterOptions, ""] });
  };

  const updateFilterOption = (index: number, value: string) => {
    const opts = [...config.filterOptions];
    opts[index] = value;
    onChange({ filterOptions: opts });
  };

  const removeFilterOption = (index: number) => {
    onChange({
      filterOptions: config.filterOptions.filter((_, i) => i !== index),
    });
  };

  const addSearchField = () => {
    onChange({ searchByFields: [...config.searchByFields, ""] });
  };

  const updateSearchField = (index: number, value: string) => {
    const fields = [...config.searchByFields];
    fields[index] = value;
    onChange({ searchByFields: fields });
  };

  const removeSearchField = (index: number) => {
    onChange({
      searchByFields: config.searchByFields.filter((_, i) => i !== index),
    });
  };

  const renderSectionHeader = (title: string, icon: any) => (
    <Flex align="center" gap={3} mb={{base:0,md:4}}>
      <Box p={2} bg="brand.50" color="brand.500" rounded="lg">
        {icon}
      </Box>
      <Text fontSize="md" fontWeight="bold" color="gray.800">
        {title}
      </Text>
    </Flex>
  );

  return (
    <VStack align="stretch" spacing={{base:2,md:8}}>
      {/* Header */}
      <Box mb={2}>
        <Text fontSize="xl" fontWeight="bold">
          Table Configuration
        </Text>
        <Text fontSize="sm" color="gray.500">
          Configure how data is displayed and interacted with
        </Text>
      </Box>

      {/* Show Table & Pagination */}
      <Box p={{base:2,md:6}} bg="white" border="1px solid" borderColor="gray.200" rounded="xl" shadow="sm">
        {renderSectionHeader("Display & Pagination", <FiList size={18} />)}

        <Stack spacing={4}>
          <Box p={2} border="1px solid" borderColor={config.showTable ? "brand.400" : "gray.200"} bg={config.showTable ? "brand.50" : "transparent"} rounded="lg" transition="0.2s">
            <Flex justify={"space-between"} align="center">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={config.showTable ? "brand.700" : "gray.700"}>Show Table</Text>
                <Text fontSize="xs" color={config.showTable ? "brand.600" : "gray.500"} mt={1}>Toggle to display as a table formatting</Text>
              </Box>
              <CustomInput
                name="showTable"
                type="switch"
                value={config.showTable}
                onChange={(e: any) => onChange({ showTable: e.target.checked })}
              />
            </Flex>
          </Box>

          <Box p={4} border="1px solid" borderColor={config.showPagination ? "brand.400" : "gray.200"} bg={config.showPagination ? "brand.50" : "transparent"} rounded="lg" transition="0.2s">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={config.showPagination ? "brand.700" : "gray.700"}>Show Pagination</Text>
                <Text fontSize="xs" color={config.showPagination ? "brand.600" : "gray.500"} mt={1}>Enable structured paging for data</Text>
              </Box>
              <CustomInput
                name="showPagination"
                type="switch"
                value={config.showPagination}
                onChange={(e: any) => onChange({ showPagination: e.target.checked })}
              />
            </Flex>

            {config.showPagination && (
              <Box mt={4} maxW="250px">
                <CustomInput
                  label="Items per page"
                  name="paginationPages"
                  type="number"
                  placeholder="e.g. 10"
                  value={config.paginationPages}
                  onChange={(e: any) =>
                    onChange({ paginationPages: parseInt(e.target.value) || 10 })
                  }
                />
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Headers */}
      <Box p={{base:2,md:6}} bg="white" border="1px solid" borderColor="gray.200" rounded="xl" shadow="sm">
        <Flex justify="space-between" align="center" mb={5}>
          {renderSectionHeader("Table Headers", <FiList size={18} />)}
          <Button size="sm" colorScheme="brand" leftIcon={<FiPlus />} onClick={addHeader} rounded="full">
            Add Header
          </Button>
        </Flex>

        {config.tableHeaders.length === 0 ? (
          <Box textAlign="center" py={8} border="2px dashed" borderColor="gray.200" rounded="xl" bg="gray.50">
             <Text fontSize="sm" color="gray.500">No headers defined.</Text>
          </Box>
        ) : (
          <Stack spacing={3}>
            {config.tableHeaders.map((header, index) => (
              <Flex key={index} gap={4} align="center" p={3} border="1px solid" borderColor="gray.200" rounded="lg" bg="gray.50">
                <Box flex="1">
                  <CustomInput
                    name={`header-${index}`}
                    placeholder="Header label"
                    value={header.label}
                    onChange={(e: any) =>
                      updateHeader(index, { label: e.target.value })
                    }
                  />
                </Box>

                <Flex align="center" gap={3} px={4}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">Show</Text>
                  <CustomInput
                    name={`header-show-${index}`}
                    type="switch"
                    value={header.show}
                    onChange={(e: any) =>
                      updateHeader(index, { show: e.target.checked })
                    }
                  />
                </Flex>

                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => removeHeader(index)}
                  rounded="full"
                >
                  <FiTrash2 />
                </Button>
              </Flex>
            ))}
          </Stack>
        )}
      </Box>

      {/* Filters & Search */}
      <Box p={6} bg="white" border="1px solid" borderColor="gray.200" rounded="xl" shadow="sm">
        {renderSectionHeader("Search & Filters", <FiFilter size={18} />)}

        <Stack spacing={6}>
          {/* Main Toggles */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
             <Box p={4} border="1px solid" borderColor={config.showFilter ? "brand.400" : "gray.200"} bg={config.showFilter ? "brand.50" : "transparent"} rounded="lg" transition="0.2s">
                <Flex justify="space-between" align="baseline" gap={2}>
                  <Box>
                    <Text fontSize="sm" whiteSpace={'nowrap'} fontWeight="medium" color={config.showFilter ? "brand.700" : "gray.700"}>Show Filters</Text>
                  </Box>
                  <CustomInput
                    name="showFilter"
                    type="switch"
                    value={config.showFilter}
                    onChange={(e: any) => onChange({ showFilter: e.target.checked })}
                  />
                </Flex>
              </Box>

              <Box p={4} border="1px solid" borderColor={config.showSearchBox ? "brand.400" : "gray.200"} bg={config.showSearchBox ? "brand.50" : "transparent"} rounded="lg" transition="0.2s">
                <Flex justify="space-between" align="baseline" gap={2}>
                  <Box>
                    <Text fontSize="sm" whiteSpace={'nowrap'} fontWeight="medium" color={config.showSearchBox ? "brand.700" : "gray.700"}>Show Search Box</Text>
                  </Box>
                  <CustomInput
                    name="showSearchBox"
                    type="switch"
                    value={config.showSearchBox}
                    onChange={(e: any) =>
                      onChange({ showSearchBox: e.target.checked })
                    }
                  />
                </Flex>
              </Box>
          </Grid>

          {config.showFilter && (
            <Box p={4} border="1px solid" borderColor="gray.200" rounded="lg" bg="gray.50">
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">Custom Filter Options</Text>
                <Button size="xs" colorScheme="blue" leftIcon={<FiPlus />} onClick={addFilterOption} rounded="full">
                  Add Option
                </Button>
              </Flex>

              {config.filterOptions.length === 0 ? (
                 <Text fontSize="xs" color="gray.500" fontStyle="italic">No filter options added.</Text>
              ) : (
                <Stack spacing={2}>
                  {config.filterOptions.map((opt, i) => (
                    <Flex key={i} gap={2}>
                      <Box flex="1">
                        <CustomInput
                          name={`filter-${i}`}
                          placeholder="e.g. Status"
                          value={opt}
                          onChange={(e: any) =>
                            updateFilterOption(i, e.target.value)
                          }
                        />
                      </Box>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeFilterOption(i)}
                      >
                        <FiTrash2 />
                      </Button>
                    </Flex>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {config.showSearchBox && (
            <Box p={4} border="1px solid" borderColor="gray.200" rounded="lg" bg="gray.50">
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">Searchable Fields Key Mapping</Text>
                <Button size="xs" colorScheme="blue" leftIcon={<FiPlus />} onClick={addSearchField} rounded="full">
                  Add Field
                </Button>
              </Flex>

              {config.searchByFields.length === 0 ? (
                <Text fontSize="xs" color="gray.500" fontStyle="italic">No fields added for searching.</Text>
              ) : (
                <Stack spacing={2}>
                  {config.searchByFields.map((field, i) => (
                    <Flex key={i} gap={2}>
                      <Box flex="1">
                        <CustomInput
                          name={`search-${i}`}
                          placeholder="Field key e.g. title"
                          value={field}
                          onChange={(e: any) =>
                            updateSearchField(i, e.target.value)
                          }
                        />
                      </Box>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeSearchField(i)}
                      >
                        <FiTrash2 />
                      </Button>
                    </Flex>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Stack>
      </Box>

      {/* Table Actions */}
      <Box p={{base:2,md:6}} bg="white" border="1px solid" borderColor="gray.200" rounded="xl" shadow="sm">
        {renderSectionHeader("Table Interactivity Actions", <FiSettings size={18} />)}

        <Stack spacing={4}>
          {config.tableActions.map((action, index) => (
            <Box key={action.action} p={{base:3,md:4}} border="1px solid" borderColor="gray.200" rounded="lg" bg={action.enabled ? "blue.50" : "white"} transition="0.2s">
              <Flex justify="space-between" align="center" mb={action.enabled ? 4 : 0} gap={2}>
                <Flex align="center" gap={3} >
                   <Box p={2} bg={action.enabled ? "white" : "gray.50"} color={action.enabled ? "blue.500" : "gray.400"} rounded="full" shadow={action.enabled ? "sm" : "none"}>
                      <FiCheckSquare size={14} />
                   </Box>
                   <Text fontSize="sm" fontWeight="bold" textTransform="capitalize" whiteSpace={'nowrap'} color={action.enabled ? "blue.800" : "gray.600"}>
                    {action.action.replace("_", " ")}
                  </Text>
                </Flex>
                
                <CustomInput
                  name={`action-${action.action}`}
                  type="switch"
                  value={action.enabled}
                  onChange={(e: any) =>
                    updateAction(index, { enabled: e.target.checked })
                  }
                />
              </Flex>

              {action.enabled && (
                <Box pl={{ base: 0, md: 10 }}>
                   <Text fontSize="xs" color="gray.600" mb={3} fontWeight="medium">Visible to Following Levels:</Text>
                  <Flex wrap="wrap" gap={4}>
                    {levelOptions.map((opt) => {
                      const level = parseInt(opt.value);
                      const checked = action.levels.includes(level);
                      return (
                        <Flex
                          key={opt.value}
                          align="center"
                          gap={2}
                          px={3}
                          py={1}
                          bg="white"
                          border="1px solid"
                          borderColor={checked ? "blue.300" : "gray.200"}
                          rounded="md"
                          cursor="pointer"
                          shadow="xs"
                          _hover={{ bg: "blue.50", borderColor: "blue.300" }}
                          onClick={() => toggleActionLevel(index, level)}
                          transition="all 0.2s"
                        >
                          <CustomInput
                            name={`action-${action.action}-${level}`}
                            type="checkbox"
                            value={checked}
                            onChange={() => toggleActionLevel(index, level)}
                          />
                          <Text fontSize="sm" fontWeight="medium" whiteSpace={'nowrap'} color={checked ? "blue.700" : "gray.600"}>Level {level}</Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Columns */}
      <Box p={{base:2,md:6}} bg="white" border="1px solid" borderColor="gray.200" rounded="xl" shadow="sm">
        <Flex justify="space-between" align="center" mb={5}>
           {renderSectionHeader("Define Columns", <FiColumns size={18} />)}
          <Button size="sm" colorScheme="brand" leftIcon={<FiPlus />} onClick={addColumn} rounded="full">
            Add Column
          </Button>
        </Flex> 

        {config.tableColumns.length === 0 ? (
          <Box textAlign="center" py={8} border="2px dashed" borderColor="gray.200" rounded="xl" bg="gray.50">
             <Text fontSize="sm" color="gray.500" whiteSpace={'nowrap'}>No columns defined.</Text>
          </Box>
        ) : (
          <Stack spacing={4}>
            {config.tableColumns.map((col) => (
              <Box key={col.id} p={5} border="1px solid" borderColor="gray.200" bg="gray.50" rounded="xl">
                <Flex justify="space-between" align="center" mb={5} borderBottom="1px solid" borderColor="gray.200" pb={3}>
                  <Flex align="baseline" gap={3}>
                    <CustomInput
                      name={`col-active-${col.id}`}
                      type="switch"
                      value={col.active}
                      onChange={(e: any) =>
                        updateColumn(col.id, { active: e.target.checked })
                      }
                    />
                    <Text fontSize="sm" fontWeight="bold" color={col.active ? "gray.800" : "gray.500"} whiteSpace={'nowrap'}>
                      Column Status: {col.active ? 'Active' : 'Hidden'}
                    </Text>
                  </Flex>

                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeColumn(col.id)}
                    rounded="full"
                  >
                    <FiTrash2 />
                  </Button>
                </Flex>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={4}>
                  <CustomInput
                    label="Label"
                    name={`col-label-${col.id}`}
                    placeholder="e.g. Created At"
                    value={col.label}
                    onChange={(e: any) =>
                      updateColumn(col.id, { label: e.target.value })
                    }
                  />
                  <CustomInput
                    label="Data Key"
                    name={`col-key-${col.id}`}
                    placeholder="e.g. createdAt"
                    value={col.key}
                    onChange={(e: any) =>
                      updateColumn(col.id, { key: e.target.value })
                    }
                  />
                </Grid>
                
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <CustomInput
                    label="Label Alignment"
                    name={`col-label-align-${col.id}`}
                    type="select"
                    value={{ label: col.labelAlign, value: col.labelAlign }}
                    onChange={(opt: any) =>
                      updateColumn(col.id, { labelAlign: opt?.value })
                    }
                    options={[
                      { label: "Left", value: "left" },
                      { label: "Center", value: "center" },
                      { label: "Right", value: "right" },
                    ]}
                  />
                  <CustomInput
                    label="Row Value Alignment"
                    name={`col-row-align-${col.id}`}
                    type="select"
                    value={{ label: col.rowAlign, value: col.rowAlign }}
                    onChange={(opt: any) =>
                      updateColumn(col.id, { rowAlign: opt?.value })
                    }
                    options={[
                      { label: "Left", value: "left" },
                      { label: "Center", value: "center" },
                      { label: "Right", value: "right" },
                    ]}
                  />
                </Grid>

                <Box mt={4} p={4} border="1px solid" borderColor="gray.200" bg="white" rounded="lg">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb={3}>Column Behaviors</Text>
                  <Flex wrap="wrap" gap={6}>
                    <Flex align="center" gap={2}>
                      <CustomInput
                        name={`truncate-${col.id}`}
                        type="checkbox"
                        value={col.truncate}
                        onChange={(e: any) =>
                          updateColumn(col.id, { truncate: e.target.checked })
                        }
                      />
                      <Text fontSize="sm" fontWeight="medium" whiteSpace={'nowrap'} color="gray.700">Truncate Text</Text>
                    </Flex>

                    {col.truncate && (
                      <Box minW="200px">
                        <CustomInput
                          name={`truncate-label-${col.id}`}
                          placeholder="Max length or css e.g. 20"
                          value={col.truncateLabel}
                          onChange={(e: any) =>
                            updateColumn(col.id, { truncateLabel: e.target.value })
                          }
                        />
                      </Box>
                    )}

                    <Flex align="center" gap={2}>
                      <CustomInput
                        name={`is-file-${col.id}`}
                        type="checkbox"
                        value={col.isFile}
                        onChange={(e: any) =>
                          updateColumn(col.id, { isFile: e.target.checked })
                        }
                      />
                      <Text fontSize="sm" fontWeight="medium" whiteSpace={'nowrap'} color="gray.700">Treat Data as Viewable File Link</Text>
                    </Flex>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </VStack>
  );
};

export default TableSection;