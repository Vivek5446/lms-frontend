import {
  Box,
  Button,
  Flex,
  HStack,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { WorkflowConfig } from "../../types/config";
import { flowTypes } from "./constant";

interface ApprovalSectionProps {
  config: WorkflowConfig;
  onChange: (updates: Partial<WorkflowConfig>) => void;
  errors?: Record<string, string>;
}

const ApprovalSection = ({ config, onChange, errors = {} }: ApprovalSectionProps) => {
  // value is string to satisfy CustomInput's { label: string; value: string }[] type
  const levelOptions: { label: string; value: string }[] = Array.from(
    { length: config.noOfLevels },
    (_, i) => ({
      label: `Level ${i + 1}`,
      value: String(i + 1),
    })
  );

  const toggleLevel = (
    field:
      | "editableMode"
      | "additionalDocumentLevels"
      | "bulkApprovalLevels"
      | "bulkRejectLevels",
    level: number
  ) => {
    const current = (config[field] as number[]) || [];

    const updated = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];

    onChange({ [field]: updated });
  };

  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const enableAll = (field: any) => {
    blurActiveElement();
    // Convert back to number[] for config storage
    const all = levelOptions.map((l) => Number(l.value));
    onChange({ [field]: all });
  };

  const disableAll = (field: any) => {
    blurActiveElement();
    onChange({ [field]: [] });
  };

  const LevelSelector = ({
    field,
    values,
    title,
    description,
  }: {
    field:
      | "editableMode"
      | "additionalDocumentLevels"
      | "bulkApprovalLevels"
      | "bulkRejectLevels";
    values: number[];
    title: string;
    description: string;
  }) => (
    <Box
      p={{base:3,md:6}}
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      rounded="xl"
      shadow="sm"
    >
      <Flex justify={{md:"space-between"}} mb={4} align="center" direction={{base:"column",md:"row"}}>
        <Box>
          <Text fontSize="sm" fontWeight="semibold">
            {title}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {description}
          </Text>
        </Box>

        <HStack spacing={2} justify={{base:"end",md:"end"}} w={'100%'} mt={{base:2,md:0}}>
          <Button
            size="xs"
            variant="outline"
            colorScheme="brand"
            onMouseDown={(e) => e.preventDefault()}
            rounded={"full"}
            onClick={() => enableAll(field)}
          >
            Enable All
          </Button>

          <Button
            size="xs"
            variant="outline"
            rounded={"full"}
            colorScheme="gray"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => disableAll(field)}
          >
            Disable All
          </Button>
        </HStack>
      </Flex>

      <Flex wrap="wrap" gap={3}>
        {levelOptions.map((opt) => {
          const numValue = Number(opt.value);
          const checked = values.includes(numValue);

          return (
            <Flex
              key={opt.value}
              align="center"
              gap={2}
              px={2}
              py={1}
              border="1px solid"
              borderColor={checked ? "brand.400" : "gray.200"}
              bg={checked ? "brand.50" : "gray.50"}
              rounded="md"
              cursor="pointer"
              transition="0.2s"
              _hover={{ bg: checked ? "brand.100" : "gray.100" }}
              onClick={() => toggleLevel(field, numValue)}
            >
              <CustomInput
                name={`${field}-${opt.value}`}
                type="checkbox"
                value={checked}
                onChange={() => toggleLevel(field, numValue)}
                colorScheme="brand"
              />

              <Text fontSize="sm" whiteSpace="nowrap">
                {opt.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Box mb={2}>
        <Text fontSize="xl" fontWeight="bold">
          Approval Configuration
        </Text>

        <Text fontSize="sm" color="gray.500">
          Configure approval workflow behaviour
        </Text>
      </Box>

      <Stack spacing={6}>
        {/* Flow Type */}
        <Box
          p={{base:4,md:6}}
          border="1px solid"
          borderColor="gray.200"
          rounded="xl"
          bg="white"
          shadow="sm"
        >
          <Text fontSize="sm" fontWeight="semibold" mb={3}>
            Flow Type
          </Text>

          <CustomInput
            name="flowType"
            type="select"
            placeholder="Select flow type"
            value={
              config.flowType
                ? {
                    label: flowTypes.find(
                      (f) => f.value === config.flowType
                    )?.label,
                    value: config.flowType,
                  }
                : null
            }
            onChange={(opt: any) => onChange({ flowType: opt?.value })}
            options={flowTypes}
            parentStyle={{ maxWidth: 360 }}
            error={errors.flowType}
            showError={!!errors.flowType}
          />
        </Box>

        {/* Editable Mode */}
        <LevelSelector
          field="editableMode"
          values={config.editableMode}
          title="Editable Mode"
          description="Select which levels can edit the document"
        />

        {/* Additional Document */}
        <LevelSelector
          field="additionalDocumentLevels"
          values={config.additionalDocumentLevels}
          title="Additional Document Levels"
          description="Select which levels can upload additional documents"
        />

        {/* Bulk Approve */}
        <LevelSelector
          field="bulkApprovalLevels"
          values={config.bulkApprovalLevels}
          title="Bulk Approve Levels"
          description="Levels that can bulk approve documents"
        />

        {/* Bulk Reject */}
        <LevelSelector
          field="bulkRejectLevels"
          values={config.bulkRejectLevels}
          title="Bulk Reject Levels"
          description="Levels that can bulk reject documents"
        />

        {/* On Reject — Return To Level */}
        {/* <Box p={{base:4,md:6}} bg="white" border="1px solid" borderColor="gray.200" rounded="xl" shadow="sm">
          <Text fontSize="sm" fontWeight="semibold" mb={1}>
            On Reject — Return To Level
          </Text>
          <Text fontSize="xs" color="gray.500" mb={4}>
            If not selected, the document returns to the previous level
          </Text>
          <CustomInput
            name="onRejectLevel"
            type="select"
            placeholder="Previous level (default)"
            isClear
            value={
              config.onRejectLevel !== null && config.onRejectLevel !== undefined
                ? { label: `Level ${config.onRejectLevel}`, value: String(config.onRejectLevel) }
                : null
            }
            onChange={(opt: any) => onChange({ onRejectLevel: opt ? Number(opt.value) : null })}
            options={levelOptions}
            parentStyle={{ maxWidth: 360 }}
          />
        </Box> */}

          {/* On Reject — Return To Level */}
<Box p={{base:4,md:6}} bg="white" border="1px solid" borderColor="gray.200" rounded="xl" shadow="sm">
  <Text fontSize="sm" fontWeight="semibold" mb={1}>
    On Reject — Return To Level
  </Text>
  <Text fontSize="xs" color="gray.500" mb={4}>
    The document will return to this level. Default is the previous level.
  </Text>
  <CustomInput
    name="onRejectLevel"
    type="select"
    placeholder="Select level"
    isClear
    // Logic: If config value exists, show that level. 
    // If it's null/undefined, show the "Previous Level" label visually.
    value={
      config.onRejectLevel !== null && config.onRejectLevel !== undefined
        ? { label: `Level ${config.onRejectLevel}`, value: String(config.onRejectLevel) }
        : { label: "Previous Level (Default)", value: "default" }
    }
    onChange={(opt: any) => {
      // If user clears it or selects the default option, we store null
      const newValue = (opt && opt.value !== "default") ? Number(opt.value) : null;
      onChange({ onRejectLevel: newValue });
    }}
    // Add the "Previous Level" option to the top of the list
    options={[
      { label: "Previous Level (Default)", value: "default" },
      ...levelOptions
    ]}
    parentStyle={{ maxWidth: 360 }}
  />
</Box>

        {/* Fast Forward To End */}
        <Box p={{base:4,md:6}} bg="white" border="1px solid" borderColor="gray.200" rounded="xl" shadow="sm">
          <Text fontSize="sm" fontWeight="semibold" mb={1}>
            Fast Forward To End
          </Text>
          <Text fontSize="xs" color="gray.500" mb={4}>
            After this level, the document skips remaining approvals and goes to completion
          </Text>
          <CustomInput
            name="fastForwardLevel"
            type="select"
            placeholder="None (disabled)"
            isClear
            value={
              config.fastForwardLevel !== null && config.fastForwardLevel !== undefined
                ? { label: `Level ${config.fastForwardLevel}`, value: String(config.fastForwardLevel) }
                : null
            }
            onChange={(opt: any) => onChange({ fastForwardLevel: opt ? Number(opt.value) : null })}
            options={levelOptions}
            parentStyle={{ maxWidth: 360 }}
          />
        </Box>
      </Stack>
    </VStack>
  );
};

export default ApprovalSection;