import { Box, Button, Flex, Grid, Stack, Tag, TagLabel, TagLeftIcon, Text, VStack } from "@chakra-ui/react";
import { FiCalendar, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { WorkflowConfig } from "../../types/config";

interface DashboardFilterSectionProps {
  config: WorkflowConfig;
  onChange: (updates: Partial<WorkflowConfig>) => void;
  errors?: Record<string, string>;
}

const predefinedDateFilters = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "Last Month",
  "This Quarter",
  "This Year",
  "Custom Range",
];

const DashboardFilterSection = ({
  config,
  onChange,
  errors = {}
}: DashboardFilterSectionProps) => {
  const toggleDateFilter = (filter: string) => {
    const current = config.dashboardFilter.dateFilters;
    const updated = current.includes(filter)
      ? current.filter((f) => f !== filter)
      : [...current, filter];

    onChange({
      dashboardFilter: {
        ...config.dashboardFilter,
        dateFilters: updated,
      },
    });
  };

  const addFilterKey = () => {
    onChange({
      dashboardFilter: {
        ...config.dashboardFilter,
        filterKeys: [...config.dashboardFilter.filterKeys, ""],
      },
    });
  };

  const updateFilterKey = (index: number, value: string) => {
    const keys = [...config.dashboardFilter.filterKeys];
    keys[index] = value;
    onChange({
      dashboardFilter: { ...config.dashboardFilter, filterKeys: keys },
    });
  };

  const removeFilterKey = (index: number) => {
    onChange({
      dashboardFilter: {
        ...config.dashboardFilter,
        filterKeys: config.dashboardFilter.filterKeys.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <VStack align="stretch" spacing={{base:4,md:6}}>
      {/* Header */}
      <Box mb={2}>
        <Text fontSize="xl" fontWeight="bold">
          Dashboard Filters
        </Text>
        <Text fontSize="sm" color="gray.500">
          Define date filters and data keys for the dashboard
        </Text>
      </Box>

      <Stack spacing={{base:4,md:6}}>
        {/* Date Filters */}
        <Box p={{base:2,md:5}} border="1px solid" borderColor="gray.200" rounded="xl" bg="white">
          <Flex align="center" gap={2} mb={4}>
            <FiCalendar size={16} color="#718096" />
            <Text fontSize="sm" fontWeight="semibold">
              Date Filters
            </Text>
          </Flex>

          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={3}>
            {predefinedDateFilters.map((filter) => {
              const checked = config.dashboardFilter.dateFilters.includes(filter);
              return (
                <Tag
                  key={filter}
                  size="lg"
                  variant={checked ? "solid" : "outline"}
                  colorScheme={checked ? "brand" : "gray"}
                  cursor="pointer"
                  onClick={() => toggleDateFilter(filter)}
                  p={3}
                  borderRadius="full"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-1px)", shadow: "sm", bg: checked ? "brand.600" : "brand.50" }}
                  _active={{ transform: "scale(0.95)" }}
                >
                  {checked && <TagLeftIcon boxSize="12px" as={FiCheck} />}
                  <TagLabel fontWeight="medium" fontSize="sm">{filter}</TagLabel>
                </Tag>
              );
            })}
          </Grid>
        </Box>

        {/* Filter Keys */}
        <Box p={{base:2,md:5}} border="1px solid" borderColor="gray.200" rounded="xl" bg="white">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="sm" fontWeight="semibold">
              Filter by Data Keys
            </Text>
            <Button size="sm" variant="outline" leftIcon={<FiPlus />} onClick={addFilterKey}>
              Add Key
            </Button>
          </Flex>

          <Stack spacing={{base:2,md:4}}>
            {config.dashboardFilter.filterKeys.length === 0 ? (
              <Box p={{base:2,md:6}} border="1px dashed" borderColor="gray.300" rounded="lg" bg="gray.50" textAlign="center">
                <Text fontSize="sm" color="gray.500">No filter keys added yet.</Text>
                <Button size="sm" mt={3} variant="ghost" colorScheme="brand" onClick={addFilterKey} leftIcon={<FiPlus />}>
                  Add your first key
                </Button>
              </Box>
            ) : (
              config.dashboardFilter.filterKeys.map((key, i) => (
                <Flex key={i} gap={3} align="center" p={{base:2,md:3}} border="1px solid" borderColor="gray.100" rounded="lg" bg="gray.50" transition="all 0.2s" _hover={{ bg: "white", shadow: "sm", borderColor: "brand.200" }}>
                  <Box flex="1">
                    <CustomInput
                      name={`filter-key-${i}`}
                      type="text"
                      placeholder="e.g. status, department, category"
                      value={key}
                      onChange={(e: any) => updateFilterKey(i, e.target.value)}
                    />
                  </Box>

                  <Button
                    size="md"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeFilterKey(i)}
                    rounded="full"
                    _hover={{ bg: "red.50" }}
                  >
                    <FiTrash2 />
                  </Button>
                </Flex>
              ))
            )}
          </Stack>
        </Box>
      </Stack>
    </VStack>
  );
};

export default DashboardFilterSection;