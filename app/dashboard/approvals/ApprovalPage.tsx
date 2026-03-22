"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";
import stores from "../../store/stores";
import ApprovalTabs from "./components/ApprovalTabs";
import DocumentDrawer from "./components/DocumentDrawer";
import { useApproval } from "./hooks/useApproval";

function ApprovalPage() {
  const { workflowStore } = stores;
  const {
    tabs,
    activeTab,
    setActiveTab,
    selectedDocument,
    drawerIntent,
    isDrawerOpen,
    actionLoading,
    refreshingAll,
    openDrawer,
    closeDrawer,
    refreshAllTabs,
    approveDocument,
    rejectDocument,
  } = useApproval(workflowStore.activeWorkflow?._id || null);

  useEffect(() => {
    if (workflowStore.assignedWorkflows.length === 0) {
      void workflowStore.getAssignedWorkflows();
    }

    if (!workflowStore.activeWorkflow) {
      void workflowStore.getDefaultWorkflow();
    }
  }, [workflowStore]);

  const surfaceBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  return (
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 6 }}>
      <Box
        bg={surfaceBg}
        border="1px solid"
        borderColor={borderColor}
        rounded="3xl"
        p={{ base: 5, md: 6 }}
        shadow="sm"
      >
        <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} mb={6} flexWrap="wrap">
          <Box>
            <Heading size="lg">Approval Dashboard</Heading>
            <Text color={mutedText} mt={2} maxW="2xl">
              Review documents assigned to your workflow level, inspect dynamic form data, and move items forward with a tracked approval history.
            </Text>
          </Box>

          <Button
            leftIcon={<FiRefreshCw />}
            onClick={() => void refreshAllTabs()}
            isLoading={refreshingAll}
            variant="outline"
            isDisabled={!workflowStore.activeWorkflow?._id}
          >
            Refresh
          </Button>
        </Flex>

        <ApprovalTabs
          activeTab={activeTab}
          counts={{
            pending: tabs.pending.data.length,
            approved: tabs.approved.data.length,
            rejected: tabs.rejected.data.length,
          }}
          tabs={tabs}
          onTabChange={setActiveTab}
          onView={(document, sourceTab) => openDrawer(document, sourceTab, "view")}
          onApprove={(document) => openDrawer(document, "pending", "approved")}
          onReject={(document) => openDrawer(document, "pending", "rejected")}
        />
      </Box>

      <DocumentDrawer
        document={selectedDocument}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        intent={drawerIntent}
        actionLoading={actionLoading}
        onApprove={approveDocument}
        onReject={rejectDocument}
      />
    </Box>
  );
}

export default observer(ApprovalPage);
