"use client";

import { HStack, Select, Text, Box, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";
import { FiLayout } from "react-icons/fi";
import { useEffect } from "react";

const HeaderWorkflowSelector = observer(() => {
  const { workflowStore } = stores;
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (workflowStore.assignedWorkflows.length === 0) {
      workflowStore.getAssignedWorkflows();
    }
    if (!workflowStore.activeWorkflow) {
      workflowStore.getDefaultWorkflow();
    }
  }, []);

  if (workflowStore.assignedWorkflows.length === 0) return null;

  return (
    <HStack spacing={3} mx={4} display={{ base: "none", md: "flex" }}>
      <Box color="brand.500">
        <FiLayout size={18} />
      </Box>
      <Select
        size="sm"
        maxW="250px"
        rounded="full"
        bg={useColorModeValue("white", "gray.700")}
        borderColor={borderColor}
        value={workflowStore.activeWorkflow?._id || ""}
        onChange={(e) => {
          const wf = workflowStore.assignedWorkflows.find(
            (w: any) => w._id === e.target.value
          );
          workflowStore.setActiveWorkflow(wf || null);
        }}
      >
        {workflowStore.assignedWorkflows.map((wf: any) => (
          <option key={wf._id} value={wf._id}>
            {wf.workFlowName}
          </option>
        ))}
      </Select>
    </HStack>
  );
});

export default HeaderWorkflowSelector;
