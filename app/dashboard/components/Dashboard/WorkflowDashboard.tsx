"use client";

import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiLayers, FiXCircle } from "react-icons/fi";
import stores from "../../../store/stores";

const CountCard = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: any;
  accent: string;
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      rounded="2xl"
      p={5}
      shadow="sm"
    >
      <Flex justify="space-between" align="start">
        <Box>
          <Text fontSize="sm" color={mutedText} textTransform="uppercase" letterSpacing="wide">
            {label}
          </Text>
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" mt={2}>
            {value.toLocaleString()}
          </Text>
        </Box>

        <Flex
          align="center"
          justify="center"
          w={12}
          h={12}
          rounded="xl"
          bg={`${accent}.50`}
          color={`${accent}.500`}
        >
          <Icon size={22} />
        </Flex>
      </Flex>
    </Box>
  );
};

const EmptyState = ({ title, description }: { title: string; description: string }) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const surfaceBg = useColorModeValue("white", "gray.800");

  return (
    <Box
      bg={surfaceBg}
      border="1px dashed"
      borderColor={borderColor}
      rounded="2xl"
      p={10}
      textAlign="center"
    >
      <Text fontWeight="semibold">{title}</Text>
      <Text fontSize="sm" color={mutedText} mt={2}>
        {description}
      </Text>
    </Box>
  );
};

const WorkflowDashboard = observer(() => {
  const { auth, workflowStore, dashboardStore } = stores;
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin = useMemo(() => {
    const role = String(auth.user?.role || "").toLowerCase();
    const userType = String(auth.user?.userType || "").toLowerCase();
    return role === "admin" || role === "superadmin" || userType === "admin" || userType === "superadmin";
  }, [auth.user?.role, auth.user?.userType]);

  const activeWorkflowId = workflowStore.activeWorkflow?._id || "";
  const activeWorkflowName = workflowStore.activeWorkflow?.workFlowName || "Workflow Dashboard";

  useEffect(() => {
    if (workflowStore.assignedWorkflows.length === 0) {
      void workflowStore.getAssignedWorkflows();
    }

    if (!workflowStore.activeWorkflow) {
      void workflowStore.getDefaultWorkflow();
    }
  }, [workflowStore]);

  useEffect(() => {
    if (!activeWorkflowId) {
      return;
    }

    setErrorMessage("");

    const loadDashboard = async () => {
      try {
        if (isAdmin) {
          await Promise.all([
            dashboardStore.getWorkflowAdminSummary(activeWorkflowId),
            dashboardStore.getWorkflowAdminLevelCount(activeWorkflowId),
          ]);
          return;
        }

        await dashboardStore.getWorkflowUserCount(activeWorkflowId);
      } catch (error: any) {
        setErrorMessage(error?.message || error?.response?.data?.message || "Failed to load dashboard data");
      }
    };

    void loadDashboard();
  }, [activeWorkflowId, dashboardStore, isAdmin]);

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const surfaceBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headBg = useColorModeValue("gray.50", "gray.900");

  const userCards = [
    {
      label: "Pending",
      value: dashboardStore.workflowUserCount.data.pending || 0,
      icon: FiClock,
      accent: "orange",
    },
    {
      label: "Approved",
      value: dashboardStore.workflowUserCount.data.approved || 0,
      icon: FiCheckCircle,
      accent: "green",
    },
    {
      label: "Rejected",
      value: dashboardStore.workflowUserCount.data.rejected || 0,
      icon: FiXCircle,
      accent: "red",
    },
    {
      label: "Total",
      value: dashboardStore.workflowUserCount.data.total || 0,
      icon: FiLayers,
      accent: "blue",
    },
  ];

  const adminCards = [
    {
      label: "Total",
      value: dashboardStore.workflowAdminSummary.data.total || 0,
      icon: FiLayers,
      accent: "blue",
    },
    {
      label: "Approved",
      value: dashboardStore.workflowAdminSummary.data.approved || 0,
      icon: FiCheckCircle,
      accent: "green",
    },
    {
      label: "Rejected",
      value: dashboardStore.workflowAdminSummary.data.rejected || 0,
      icon: FiXCircle,
      accent: "red",
    },
    {
      label: "Pending",
      value: dashboardStore.workflowAdminSummary.data.pending || 0,
      icon: FiClock,
      accent: "orange",
    },
  ];

  const cardItems = isAdmin ? adminCards : userCards;
  const cardsLoading = isAdmin
    ? dashboardStore.workflowAdminSummary.loading
    : dashboardStore.workflowUserCount.loading;

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
        <Heading size="lg">{activeWorkflowName}</Heading>
        <Text color={mutedText} mt={2} maxW="3xl">
          {isAdmin
            ? "Track workflow-wide totals and compare approval activity across all configured levels."
            : "See the documents waiting at your level and the actions you have already completed in the selected workflow."}
        </Text>

        {!activeWorkflowId ? (
          <Box mt={8}>
            <EmptyState
              title="No workflow selected"
              description="Choose a workflow from the header selector to load the dashboard counts."
            />
          </Box>
        ) : errorMessage ? (
          <Box mt={8}>
            <EmptyState title="Unable to load dashboard" description={errorMessage} />
          </Box>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} mt={8}>
              {cardItems.map((item) => (
                <Skeleton key={item.label} isLoaded={!cardsLoading} rounded="2xl">
                  <CountCard {...item} />
                </Skeleton>
              ))}
            </SimpleGrid>

            {isAdmin && (
              <Box mt={8}>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Level Breakdown
                </Text>

                <Skeleton isLoaded={!dashboardStore.workflowAdminLevelCount.loading} rounded="2xl">
                  {dashboardStore.workflowAdminLevelCount.data.length ? (
                    <TableContainer
                      border="1px solid"
                      borderColor={borderColor}
                      rounded="2xl"
                      bg={surfaceBg}
                    >
                      <Table variant="simple">
                        <Thead bg={headBg}>
                          <Tr>
                            <Th>User</Th>
                            <Th>Level</Th>
                            <Th isNumeric>Pending</Th>
                            <Th isNumeric>Approved</Th>
                            <Th isNumeric>Rejected</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {dashboardStore.workflowAdminLevelCount.data.map((item: any) => (
                            <Tr key={`${item.userId}-${item.level}`}>
                              <Td>{item.username || "Unknown"}</Td>
                              <Td>{item.level || "-"}</Td>
                              <Td isNumeric>{item.pending || 0}</Td>
                              <Td isNumeric>{item.approved || 0}</Td>
                              <Td isNumeric>{item.rejected || 0}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <EmptyState
                      title="No workflow participants found"
                      description="This workflow does not have any active approval assignments yet."
                    />
                  )}
                </Skeleton>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
});

export default WorkflowDashboard;
