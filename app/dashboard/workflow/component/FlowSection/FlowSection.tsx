import { Box, Flex, Grid, Image, Text, VStack, HStack, IconButton } from "@chakra-ui/react";
import { FiUpload, FiMinus, FiPlus } from "react-icons/fi";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { WorkflowConfig } from "../../types/config";

interface FlowSectionProps {
  config: WorkflowConfig;
  onChange: (updates: Partial<WorkflowConfig>) => void;
  syncNotificationsWithLevels: (levels: number) => void;
  errors?: Record<string, string>;
}

const FlowSection = ({ config, onChange, syncNotificationsWithLevels, errors = {} }: FlowSectionProps) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ logo: file, logoPreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextFieldId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(nextFieldId)?.focus();
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Box mb={2}>
        <Text fontSize="xl" fontWeight="bold">
          Flow Configuration
        </Text>
        <Text fontSize="sm" color="gray.500">
          Define the basic details of your workflow
        </Text>
      </Box>

      {/* Form */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>
        <CustomInput
          id="workflowName"
          label="Workflow Name"
          name="workflowName"
          placeholder="e.g. Invoice Approval"
          value={config.workflowName}
          onChange={(e: any) => onChange({ workflowName: e.target.value })}
          onKeyDown={(e: any) => handleKeyDown(e, "flowName")}
          type="text"
          error={errors.workflowName}
          showError={!!errors.workflowName}
        />

        <CustomInput
          id="flowName"
          label="Flow Name"
          name="flowName"
          placeholder="e.g. invoice-flow"
          value={config.flowName}
          onChange={(e: any) => onChange({ flowName: e.target.value })}
          onKeyDown={(e: any) => handleKeyDown(e, "noOfLevels")}
          type="text"
          error={errors.flowName}
          showError={!!errors.flowName}
        />

        <CustomInput
          label="Identifier"
          name="identifier"
          disabled
          placeholder="e.g. INV-FLOW-001"
          value={config.identifier}
          onChange={(e: any) => onChange({ identifier: e.target.value })}
          type="text"
          error={errors.identifier}
          showError={!!errors.identifier}
        />

        {/* Number of Levels Interactive Counter */}
        <Box>
          <Text fontSize="sm" fontWeight="500" mb={1}>
            Number of Levels
          </Text>
          <HStack
            w="100%"
            border="1px solid"
            borderColor="gray.200"
            rounded="xl"
            bg="white"
            h="40px"
            px={1}
            justify="space-between"
            _focusWithin={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
          >
            <IconButton
              aria-label="Decrease levels"
              icon={<FiMinus />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              isDisabled={config.noOfLevels <= 1}
              onClick={() => {
                const newLevels = Math.max(1, config.noOfLevels - 1);
                onChange({ noOfLevels: newLevels });
                syncNotificationsWithLevels(newLevels);
              }}
              _active={{ transform: "scale(0.95)" }}
            />
            <Text fontWeight="bold" fontSize="md" color="gray.800" w="40px" textAlign="center">
              {config.noOfLevels}
            </Text>
            <IconButton
              aria-label="Increase levels"
              icon={<FiPlus />}
              size="sm"
              variant="ghost"
              colorScheme="brand"
              onClick={() => {
                const newLevels = config.noOfLevels + 1;
                onChange({ noOfLevels: newLevels });
                syncNotificationsWithLevels(newLevels);
              }}
              _active={{ transform: "scale(0.95)" }}
            />
          </HStack>
          {errors.noOfLevels && (
            <Text color="red.500" fontSize="xs" mt={1}>
              {errors.noOfLevels}
            </Text>
          )}
        </Box>
        
        <CustomInput
          id="documentType"
          label="Document Type"
          name="documentType"
          placeholder="e.g. Purchase Order"
          value={config.documentType}
          onChange={(e: any) => onChange({ documentType: e.target.value })}
          onKeyDown={(e: any) => handleKeyDown(e, "processName")}
          type="text"
        />

        <CustomInput
          id="processName"
          label="Process Name"
          name="processName"
          placeholder="e.g. Procurement"
          value={config.processName}
          onChange={(e: any) => onChange({ processName: e.target.value })}
          type="text"
        />

        <CustomInput
          label="Process Type"
          name="processType"
          type="select"
          placeholder="Select process type"
          value={
            config.processType
              ? { label: config.processType, value: config.processType }
              : null
          }
          onChange={(opt: any) =>
            onChange({ processType: opt?.value || "" })
          }
          options={[
            { label: "Sequential", value: "sequential" },
            { label: "Parallel", value: "parallel" },
            { label: "Conditional", value: "conditional" },
          ]}
        />

        {/* Logo Upload */}
        <Box>
          <Text fontSize="sm" fontWeight="500" mb={1}>
            Upload Logo
          </Text>

          <Flex
            align="center"
            gap={3}
            p={3}
            border="1px dashed"
            borderColor="brand.300"
            rounded="xl"
            cursor="pointer"
            bg="white"
            transition="all 0.2s"
            _hover={{ bg: "brand.50", borderColor: "brand.500", transform: "translateY(-1px)" }}
            onClick={() =>
              document.getElementById("workflow-logo-upload")?.click()
            }
          >
            {config.logoPreview ? (
              <Image
                src={config.logoPreview}
                alt="Logo"
                boxSize="32px"
                objectFit="cover"
                rounded="md"
              />
            ) : (
              <Flex w="32px" h="32px" align="center" justify="center" rounded="md" bg="brand.100" color="brand.500">
                <FiUpload size={16} />
              </Flex>
            )}

            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              {config.logo ? config.logo.name : "Choose file..."}
            </Text>

            <input
              id="workflow-logo-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={handleLogoUpload}
            />
          </Flex>
        </Box>
      </Grid>
    </VStack>
  );
};

export default FlowSection;