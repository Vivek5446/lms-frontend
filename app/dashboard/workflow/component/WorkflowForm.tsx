import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  useToast,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { BellIcon } from "@chakra-ui/icons";
import { BiChevronLeft, BiChevronRight, BiSave, BiTable, BiCodeAlt } from "react-icons/bi";
import { BsShieldCheck } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { FiZap } from "react-icons/fi";
import { GiTreeBranch } from "react-icons/gi";
import { LuLayoutDashboard } from "react-icons/lu";
import { defaultWorkflowConfig, WorkflowConfig } from "../types/config";
import { mapDocumentToConfig } from "../utils/mapDocumentToConfig";
import ApprovalSection from "./ApprovalSection/ApprovalSection";
import DashboardFilterSection from "./DashboardFilterSection/DashboardFilterSection";
import FlowSection from "./FlowSection/FlowSection";
import NotificationSection from "./NotificationSection/NotificationSection";
import TableSection from "./TableSection/TableSection";
import TriggersSection from "./TriggersSection.tsx/TriggersSection";
import UserApprovalsSection from "./UserApprovalsSection/UserApprovalsSection";
import SchemaSection from "./SchemaSection/SchemaSection";
import stores from "../../../store/stores";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

type SectionId = "flow" | "approvals" | "notifications" | "approval-config" | "table" | "dashboard" | "triggers" | "schema";

interface WorkflowFormProps {
  isEdit?: boolean;
  initialValues?: any;
  onSuccess?: () => void;
}

const WorkflowForm = observer(({ isEdit = false, initialValues, onSuccess }: WorkflowFormProps) => {
  const [config, setConfig] = useState<WorkflowConfig>(defaultWorkflowConfig);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const { workflowStore } = stores;

  const dynamicSections = useMemo(() => {
    const base = [
      { id: "flow", label: "Flow Detail", description: "Config", icon: GiTreeBranch },
      { id: "approvals", label: "User", description: "Approvals", icon: FaUsers },
      { id: "notifications", label: "Notifications", description: "Settings", icon: BellIcon },
      { id: "approval-config", label: "Approval", description: "Config", icon: BsShieldCheck },
    ];
    if (config.flowType === "schema" || config.flowType === "Schema") {
      base.push({ id: "schema", label: "Schema", description: "JSON", icon: BiCodeAlt });
    }
    base.push(
      { id: "table", label: "Table", description: "View", icon: BiTable },
      { id: "dashboard", label: "Dashboard", description: "Filters", icon: LuLayoutDashboard },
      { id: "triggers", label: "Triggers", description: "Events", icon: FiZap }
    );
    return base;
  }, [config.flowType]);

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: dynamicSections.length,
  });

  const activeSection = (dynamicSections[activeStep]?.id as SectionId) || "flow";
  const isLastStep = activeStep === dynamicSections.length - 1;

  useEffect(() => {
    if (isEdit && initialValues) {
      // Map the structured MongoDB document back into the flat WorkflowConfig
      const mapped = mapDocumentToConfig(initialValues);
      setConfig(mapped);
      setActiveStep(0);
    } else {
      setConfig({
        ...defaultWorkflowConfig,
        identifier: uuidv4(),
      });
      setActiveStep(0);
    }
  }, [isEdit, initialValues, setActiveStep]);

  const updateConfig = (updates: Partial<WorkflowConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    // Clear errors when updating related fields could be added here if mapping was direct
    setErrors({});
  };

  const syncNotificationsWithLevels = (levels: number) => {
    const sync = (obj: any) => {
      const updated: any = {};
      for (let i = 1; i <= levels; i++) {
        updated[i] = obj[i] || { email: false, notification: false, sms: false };
      }
      return updated;
    };
    updateConfig({
      notifications: {
        onApproved: sync(config.notifications.onApproved),
        onRejected: sync(config.notifications.onRejected),
      },
    });
  };

  const validateStep = (section: SectionId): { valid: boolean; message?: string; newErrors?: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    let valid = true;
    let message = "";

    switch (section) {
      case "flow": {
        if (!config.workflowName?.trim()) {
          newErrors.workflowName = "Workflow Name is required";
          valid = false;
        }
        if (!config.flowName?.trim()) {
          newErrors.flowName = "Flow Name is required";
          valid = false;
        }
        if (!config.identifier?.trim()) {
          newErrors.identifier = "Identifier is required";
          valid = false;
        }
        if (!config.noOfLevels || config.noOfLevels < 1) {
          newErrors.noOfLevels = "Number of levels must be at least 1";
          valid = false;
        }
        if (!valid) message = "Please fill in all required flow fields.";
        break;
      }
      case "approvals": {
        if (!config.userApprovals.length) {
          valid = false;
          message = "Please add at least one approver";
        }
        const invalidUser = config.userApprovals.find((u) => !u.email || !u.role || !u.level);
        if (invalidUser) {
          valid = false;
          message = "Each user must have email, role and level filled";
        }
        break;
      }
      case "approval-config": {
        if (!config.flowType) {
          valid = false;
          newErrors.flowType = "Please select a flow type";
          message = "Please select a flow type";
        }
        break;
      }
      case "schema": {
        if (!config.schemaConfig || !config.schemaConfig.trim()) {
          valid = false;
          message = "Schema JSON is required";
        } else {
          try {
            JSON.parse(config.schemaConfig);
          } catch (e) {
            valid = false;
            message = "Invalid JSON schema";
          }
        }
        break;
      }
      case "table": {
        if (config.showTable && !config.tableColumns.length) {
          valid = false;
          message = "Please define at least one table column";
        }
        break;
      }
      case "triggers": {
        const invalidTrigger = config.triggers.find((t) => t.isActive && !t.action);
        if (invalidTrigger) {
          valid = false;
          message = "Active triggers must have an action";
        }
        break;
      }
    }

    setErrors(newErrors);
    return { valid, message, newErrors };
  };

  const handleSave = async () => {
    const result = validateStep(activeSection);
    if (!result.valid) {
      toast({
        title: "Please complete this step",
        description: result.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Parse schemaConfig from string into a JSON object before saving
      const configToSave = { ...config };
      if (configToSave.schemaConfig && typeof configToSave.schemaConfig === "string" && configToSave.schemaConfig.trim()) {
        try {
          (configToSave as any).schemaConfig = JSON.parse(configToSave.schemaConfig);
        } catch {
          // If parse fails (shouldn't happen since we validated), leave as-is
        }
      }

      if (isEdit && initialValues?._id) {
        await workflowStore.updateWorkflow(initialValues._id, configToSave);
        toast({
          title: "Workflow Updated!",
          description: "Your workflow has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await workflowStore.createWorkflow(configToSave);
        toast({
          title: "Workflow Created!",
          description: "Your workflow has been saved successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setConfig(defaultWorkflowConfig);
        setActiveStep(0);
      }
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: isEdit ? "Failed to update workflow" : "Failed to save workflow",
        description: err?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const goNext = () => {
    const result = validateStep(activeSection);
    if (!result.valid) {
      toast({
        title: "Please complete this step",
        description: result.message,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const goPrev = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const renderSection = () => {
    const commonProps = { config, onChange: updateConfig, errors };
    switch (activeSection) {
      case "flow":
        return <FlowSection {...commonProps} syncNotificationsWithLevels={syncNotificationsWithLevels} />;
      case "approvals":
        return <UserApprovalsSection {...commonProps} />;
      case "notifications":
        return <NotificationSection {...commonProps} />;
      case "approval-config":
        return <ApprovalSection {...commonProps} />;
      case "schema":
        return <SchemaSection {...commonProps} />;
      case "table":
        return <TableSection {...commonProps} />;
      case "dashboard":
        return <DashboardFilterSection {...commonProps} />;
      case "triggers":
        return <TriggersSection {...commonProps} />;
      default:
        return null;
    }
  };

  const bgContainer = useColorModeValue("whiteAlpha.800", "blackAlpha.600");
  const bgMain = useColorModeValue("white", "gray.800");

  return (
    <VStack
      w="100%"
      minH="100vh"
      bg={useColorModeValue("gray.50", "gray.900")}
      // py={8}
      // px={{ base: 4, md: 8 }}
      align="stretch"
    >
      <VStack
        // w={{ base: "100%", xl: "80%" }}
        bg={bgContainer}
        backdropFilter="blur(16px)"
        // boxShadow="2xl"
        // borderRadius="2xl"
        overflow="hidden"
        spacing={0}
        border="1px solid"
        borderColor={useColorModeValue("whiteAlpha.500", "whiteAlpha.200")}
      >
        {/* Header */}
        <Flex
          w="100%"
          px={{ base: 4, md: 8 }}
          py={{ base: 4, md: 6 }}
          bg={bgMain}
          borderBottom="1px solid"
          borderColor={useColorModeValue("gray.100", "gray.700")}
          justify="space-between"
          align="center"
          gap={3}
          wrap="wrap"
        >
          <HStack spacing={{ base: 2, md: 4 }}>
            <Box
              bgGradient={isEdit ? "linear(to-r, orange.400, pink.500)" : "linear(to-r, brand.500, purple.500)"}
              p={{ base: 2, md: 3 }}
              rounded="xl"
              boxShadow="lg"
              flexShrink={0}
            >
              <Icon as={GiTreeBranch} color="white" boxSize={{ base: 4, md: 6 }} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize={{ base: "md", md: "xl" }} fontWeight="bold" letterSpacing="tight">
                {isEdit ? "Edit Workflow" : "Flow Builder"}
              </Text>
              <Text fontSize="xs" color="gray.500" display={{ base: "none", sm: "block" }}>
                {isEdit ? "Update your workflow configuration" : "Configure your new automated workflow process"}
              </Text>
            </VStack>
          </HStack>

          {isLastStep && (
            <Button
              leftIcon={<Icon as={BiSave} />}
              colorScheme={isEdit ? "orange" : "brand"}
              onClick={handleSave}
              isLoading={workflowStore.createLoading}
              loadingText={isEdit ? "Updating..." : "Saving..."}
              shadow="md"
              rounded="full"
              size={{ base: "sm", md: "md" }}
              px={{ base: 4, md: 8 }}
            >
              {isEdit ? "Update" : "Save"}
            </Button>
          )}
        </Flex>

        {/* Stepper — horizontal on md+, scrollable icon-only on mobile */}
        <Box
          w="100%"
          px={{ base: 4, md: 8 }}
          pt={{ base: 4, md: 6 }}
          pb={{ base: 2, md: 6 }}
          bg={bgMain}
          borderBottom="1px solid"
          borderColor={useColorModeValue("gray.100", "gray.700")}
          overflowX={{ base: "auto", md: "visible" }}
        >
          {/* Mobile: pill-style tab bar */}
          <Flex display={{ base: "flex", md: "none" }} gap={2} pb={2} minW="max-content">
            {dynamicSections.map((step, index) => {
              const isActive = index === activeStep;
              const isDone = index < activeStep;
              return (
                <Flex
                  key={index}
                  onClick={() => index <= activeStep && setActiveStep(index)}
                  cursor={index <= activeStep ? "pointer" : "default"}
                  align="center"
                  gap={1.5}
                  px={3}
                  py={1.5}
                  rounded="full"
                  fontSize="xs"
                  fontWeight="semibold"
                  bg={isActive ? "brand.500" : isDone ? "brand.50" : "gray.100"}
                  color={isActive ? "white" : isDone ? "brand.600" : "gray.500"}
                  border="1px solid"
                  borderColor={isActive ? "brand.500" : isDone ? "brand.200" : "gray.200"}
                  transition="all 0.15s"
                  whiteSpace="nowrap"
                  flexShrink={0}
                >
                  <Icon as={step.icon} boxSize={3} />
                  {step.label}
                </Flex>
              );
            })}
          </Flex>

          {/* Desktop: standard Stepper */}
          <Stepper
            display={{ base: "none", md: "flex" }}
            index={activeStep}
            colorScheme="brand"
            size="sm"
            flexWrap="wrap"
            gap={4}
          >
            {dynamicSections.map((step, index) => (
              <Step key={index} onClick={() => index <= activeStep && setActiveStep(index)} style={{ cursor: index <= activeStep ? 'pointer' : 'default' }}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>
                <Box flexShrink='0' display={{ base: 'none', lg: 'block' }}>
                  <StepTitle>{step.label}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>
                <StepSeparator />
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content Area with Animation */}
        <Box
          w="100%"
          px={{ base: 2, sm: 6, md: 8 }}
          py={{ base: 4, md: 8 }}
          bg={bgMain}
          minH={{ base: "60vh", md: "500px" }}
          position="relative"
          overflow="hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Footer Actions */}
        <Flex
          w="100%"
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 6 }}
          bg={useColorModeValue("gray.50", "gray.800")}
          borderTop="1px solid"
          borderColor={useColorModeValue("gray.100", "gray.700")}
          justify="space-between"
          align="center"
          gap={3}
        >
          <Button
            leftIcon={<BiChevronLeft size={20} />}
            onClick={goPrev}
            isDisabled={activeStep === 0}
            variant="ghost"
            rounded="full"
            size={{ base: "sm", md: "md" }}
            px={{ base: 3, md: 6 }}
            _hover={{ bg: useColorModeValue("gray.200", "gray.700") }}
          >
            <Text display={{ base: "none", sm: "inline" }}>Previous</Text>
          </Button>

          {/* Step progress indicator on mobile */}
          <Text
            display={{ base: "block", md: "none" }}
            fontSize="xs"
            color="gray.500"
            fontWeight="medium"
          >
            {activeStep + 1} / {dynamicSections.length}
          </Text>

          {isLastStep ? (
            <Button
              leftIcon={<Icon as={BiSave} />}
              onClick={handleSave}
              isLoading={workflowStore.createLoading}
              loadingText={isEdit ? "Updating..." : "Saving..."}
              colorScheme={isEdit ? "orange" : "brand"}
              rounded="full"
              size={{ base: "sm", md: "md" }}
              px={{ base: 4, md: 8 }}
              shadow="md"
            >
              <Text display={{ base: "none", sm: "inline" }}>{isEdit ? "Complete Update" : "Complete & Save"}</Text>
              <Text display={{ base: "inline", sm: "none" }}>{isEdit ? "Update" : "Save"}</Text>
            </Button>
          ) : (
            <Button
              rightIcon={<BiChevronRight size={20} />}
              onClick={goNext}
              colorScheme="brand"
              rounded="full"
              size={{ base: "sm", md: "md" }}
              px={{ base: 4, md: 8 }}
              shadow="md"
              _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
            >
              Next
            </Button>
          )}
        </Flex>
      </VStack>
    </VStack>
  );
});

export default WorkflowForm;