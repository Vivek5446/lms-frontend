"use client";

import { Badge, Box, Flex, Image, Switch, Text, useToast } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import useDebounce from "../../../component/config/component/customHooks/useDebounce";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../component/config/utils/variable";
import stores from "../../../store/stores";
import WorkflowForm from "../component/WorkflowForm";
import DeleteWorkflowModal from "./DeleteWorkflowModal";

const WorkflowTable = observer(() => {
  const { workflowStore } = stores;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);
  const toast = useToast();

  // const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState<false | "add" | "edit">(false);
const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  // --------------------------------------------
  // Fetch Workflows
  // --------------------------------------------
  const fetchWorkflows = useCallback(async () => {
    await workflowStore.getWorkflows({
      page: currentPage,
      limit: tablePageLimit,
      search: debouncedSearch,
    });
  }, [currentPage, debouncedSearch, workflowStore]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const resetTable = () => {
    setSearch("");
    setCurrentPage(1);
    fetchWorkflows();
  };

  // --------------------------------------------
  // Toggle Status
  // --------------------------------------------
  const handleToggleStatus = async (workflow: any) => {
    try {
      await workflowStore.toggleWorkflowStatus(workflow._id);
      toast({
        title: "Status Updated",
        description: `Workflow is now ${workflow.status === "active" ? "inactive" : "active"}`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    } catch {
      toast({
        title: "Failed to update status",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const workflowData = workflowStore.workflows.data || [];
  const totalPages = workflowStore.workflows.totalPages || 1;

  // --------------------------------------------
  // Columns
  // --------------------------------------------
  // const WorkflowColumns = [
  //   {
  //     headerName: "Logo",
  //     key: "logoUrl",
  //     type: "component",
  //     metaData: {
  //       component: (dt: any) => (
  //         <Flex justify="center">
  //           {dt?.logoUrl ? (
  //             <Image
  //               src={dt.logoUrl}
  //               alt="logo"
  //               boxSize="36px"
  //               rounded="md"
  //               objectFit="cover"
  //             />
  //           ) : (
  //             <Box
  //               boxSize="36px"
  //               rounded="md"
  //               bg="blue.100"
  //               display="flex"
  //               alignItems="center"
  //               justifyContent="center"
  //             >
  //               <Text fontSize="xs" color="blue.500" fontWeight="bold">
  //                 {dt?.workflowData?.workflowName?.charAt(0)?.toUpperCase() || "W"}
  //               </Text>
  //             </Box>
  //           )}
  //         </Flex>
  //       ),
  //     },
  //     props: { row: { textAlign: "center" } },
  //   },
  //   {
  //     headerName: "Workflow Name",
  //     key: "workflowData.workflowName",
  //     type: "component",
  //     metaData: {
  //       component: (dt: any) => (
  //         <Text fontWeight="medium">{dt?.workflowData?.workflowName || "-"}</Text>
  //       ),
  //     },
  //     props: { row: { textAlign: "center" } },
  //   },
  //   {
  //     headerName: "Flow Name",
  //     key: "workflowData.flowName",
  //     type: "component",
  //     metaData: {
  //       component: (dt: any) => (
  //         <Text>{dt?.workflowData?.flowName || "-"}</Text>
  //       ),
  //     },
  //     props: { row: { textAlign: "center" } },
  //   },
  //   {
  //     headerName: "Levels",
  //     key: "workflowData.noOfLevels",
  //     type: "component",
  //     metaData: {
  //       component: (dt: any) => (
  //         <Badge colorScheme="purple" px={2} py={1} rounded="full">
  //           {dt?.workflowData?.noOfLevels || 0} Levels
  //         </Badge>
  //       ),
  //     },
  //     props: { row: { textAlign: "center" } },
  //   },
  //   {
  //     headerName: "Process",
  //     key: "workflowData.processType",
  //     type: "component",
  //     metaData: {
  //       component: (dt: any) => (
  //         <Badge
  //           colorScheme={dt?.workflowData?.processType === "sequential" ? "blue" : "orange"}
  //           px={2} py={1} rounded="full"
  //         >
  //           {dt?.workflowData?.processType || "-"}
  //         </Badge>
  //       ),
  //     },
  //     props: { row: { textAlign: "center" } },
  //   },
  //   {
  //     headerName: "Status",
  //     key: "status",
  //     type: "component",
  //     metaData: {
  //       component: (dt: any) => (
  //         <Flex justify="center" align="center" gap={2}>
  //           <Switch
  //             isChecked={dt?.status === "active"}
  //             colorScheme="green"
  //             onChange={() => handleToggleStatus(dt)}
  //           />
  //           <Badge
  //             colorScheme={dt?.status === "active" ? "green" : "red"}
  //             px={2} py={1} rounded="full"
  //           >
  //             {dt?.status}
  //           </Badge>
  //         </Flex>
  //       ),
  //     },
  //     props: { row: { textAlign: "center" } },
  //   },
  //   {
  //     headerName: "Actions",
  //     key: "table-actions",
  //     type: "table-actions",
  //     props: {
  //       row: { minW: 180, textAlign: "center" },
  //       column: { textAlign: "center" },
  //     },
  //   },
  // ];

  const WorkflowColumns = [
  {
    headerName: "Logo",
    key: "logoUrl",
    type: "component",
    metaData: {
      component: (dt: any) => (
        <Flex justify="center">
          {dt?.logoUrl ? (
            <Image src={dt.logoUrl} alt="logo" boxSize="36px" rounded="md" objectFit="cover" />
          ) : (
            <Box
              boxSize="36px" rounded="md" bg="blue.100"
              display="flex" alignItems="center" justifyContent="center"
            >
              <Text fontSize="xs" color="blue.500" fontWeight="bold">
                {dt?.workFlowName?.charAt(0)?.toUpperCase() || "W"}
              </Text>
            </Box>
          )}
        </Flex>
      ),
    },
    props: { row: { textAlign: "center" } },
  },
  {
    headerName: "Workflow Name",
    key: "workFlowName",
    type: "component",
    metaData: {
      component: (dt: any) => (
        <Text fontWeight="medium">{dt?.workFlowName || "-"}</Text>
      ),
    },
    props: { row: { textAlign: "center" } },
  },
  {
    headerName: "Flow Name",
    key: "values[0].flowName",
    type: "component",
    metaData: {
      component: (dt: any) => (
        <Text>{dt?.values?.[0]?.flowName || "-"}</Text>
      ),
    },
    props: { row: { textAlign: "center" } },
  },
  {
    headerName: "Levels",
    key: "values[0].levels",
    type: "component",
    metaData: {
      component: (dt: any) => (
        <Badge colorScheme="purple" px={2} py={1} rounded="full">
          {dt?.values?.[0]?.levels || 0} Levels
        </Badge>
      ),
    },
    props: { row: { textAlign: "center" } },
  },
  {
    headerName: "Process",
    key: "values[0].processType",
    type: "component",
    metaData: {
      component: (dt: any) => (
        <Badge
          colorScheme={dt?.values?.[0]?.processType === "sequential" ? "blue" : "orange"}
          px={2} py={1} rounded="full"
        >
          {dt?.values?.[0]?.processType || "-"}
        </Badge>
      ),
    },
    props: { row: { textAlign: "center" } },
  },
   {
      headerName: "Status",
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex justify="center" align="center" gap={2}>
            <Switch
              isChecked={dt?.status === "active"}
              colorScheme="green"
              onChange={() => handleToggleStatus(dt)}
            />
            <Badge
              colorScheme={dt?.status === "active" ? "green" : "red"}
              px={2} py={1} rounded="full"
            >
              {dt?.status}
            </Badge>
          </Flex>
        ),
      },
      props: { row: { textAlign: "center" } },
    },
    {
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 180, textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
];

  return (
    <>
      <CustomTable
        title="Workflows"
        data={workflowData}
        columns={WorkflowColumns}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: true,
              function: () => {
                setSelectedWorkflow(null);
                setIsDrawerOpen("add");
              },
            },
            editKey: {
  showEditButton: true,
  function: (w: any) => {
    setSelectedWorkflow(w);
    setIsDrawerOpen("edit");
  },
},
            deleteKey: {
              showDeleteButton: true,
              function: (w: any) => {
                setSelectedWorkflow(w);
                setIsDeleteOpen(true);
              },
            },
          },

          search: {
            show: true,
            searchValue: search,
            onSearchChange: (e: any) => setSearch(e.target.value),
          },

          resetData: {
            show: true,
            text: "Reset",
            function: resetTable,
          },

          pagination: {
            show: true,
            currentPage,
            totalPages,
            onClick: (p: number) => setCurrentPage(p),
          },
        }}
        loading={workflowStore.workflows.loading}
      />

      {/* Create Workflow Drawer */}
    <CustomDrawer
  open={!!isDrawerOpen}
  close={() => setIsDrawerOpen(false)}
  title={isDrawerOpen === "edit" ? "Edit Workflow" : "Create Workflow"}
  // size="70vw"
  width={"80vw"}
>
  <WorkflowForm
    isEdit={isDrawerOpen === "edit"}
    initialValues={isDrawerOpen === "edit" ? selectedWorkflow : undefined}
    onSuccess={() => {
      setIsDrawerOpen(false);
      fetchWorkflows();
    }}
  />
</CustomDrawer>

      {/* Delete Modal */}
      <DeleteWorkflowModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        data={selectedWorkflow}
        refresh={fetchWorkflows}
      />
    </>
  );
});

export default WorkflowTable;