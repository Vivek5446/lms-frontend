"use client";

import {
  Badge,
  Box, Button, Flex, HStack, Icon,
  Spinner, Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { FiFileText, FiPlus, FiRefreshCw } from "react-icons/fi";
import stores from "../../store/stores";
import DocumentDrawer from "./components/DocumentDrawer";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import useDebounce from "../../component/config/component/customHooks/useDebounce";
import { tablePageLimit } from "../../component/config/utils/variable";

const DocumentsView = observer(() => {
  const { workflowStore, documentStore } = stores;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingDoc, setEditingDoc] = useState<any>(null);

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  // ── Load assigned workflows on mount ──────────────────────────────────────
  useEffect(() => {
    workflowStore.getAssignedWorkflows();
    workflowStore.getDefaultWorkflow();
  }, []);

  // ── Fetch documents when workflow changes ─────────────────────────────────
  useEffect(() => {
    if (workflowStore.activeWorkflow?._id) {
      documentStore.getDocumentsByWorkflow(workflowStore.activeWorkflow._id);
      setCurrentPage(1); // Reset page on workflow change
    }
  }, [workflowStore.activeWorkflow, documentStore]);

  // ── Prepare Dynamic Columns from Configuration ─────────────────────────────
  const configuredColumns = useMemo(() => {
    return workflowStore.activeWorkflow?.values?.[0]?.table?.[0]?.columnName || [];
  }, [workflowStore.activeWorkflow]);

  const CustomTableColumns = useMemo(() => {
    if (!configuredColumns.length) return [];

    const dynamicCols = configuredColumns
      .filter((col: any) => col.isActive) // Only include active columns
      .map((col: any) => ({
        headerName: col.label,
        key: col.key,
        type: "component",
        metaData: {
          component: (dt: any) => {
            const val = dt?.values?.fields?.[col.key];
            let displayVal = "—";
            if (val && typeof val === "object" && "originalValue" in val) {
              displayVal = String(val.editedValue ?? val.originalValue ?? "—");
            } else if (val !== undefined && val !== null) {
              displayVal = String(val);
            }
            return (
              <Text isTruncated={col.truncate} maxW={col.truncate ? "240px" : undefined}>
                {displayVal}
              </Text>
            );
          },
        },
        props: {
          row: { textAlign: col.rowAlign || "left" },
          column: { textAlign: col.labelAlign || "left" },
        },
      }));

    // Add Status Column
    dynamicCols.push({
      headerName: "Status",
      key: "status",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Badge
            colorScheme={
              dt.status === "approved"
                ? "green"
                : dt.status === "rejected"
                ? "red"
                : "yellow"
            }
            rounded="full"
            px={2}
            py={0.5}
            fontSize="xs"
            textTransform="capitalize"
          >
            {dt.status || "pending"}
          </Badge>
        ),
      },
      props: { row: { textAlign: "center" }, column: { textAlign: "center" } },
    });

    // Add Actions Column
    dynamicCols.push({
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      props: {
        row: { minW: 100, textAlign: "center" },
        column: { textAlign: "center" },
      },
    });

    return dynamicCols;
  }, [configuredColumns]);

  // ── Local Search & Pagination on docs ──────────────────────────────────────
  const allDocs = documentStore.documents.data || [];

  const filteredDocs = useMemo(() => {
    if (!debouncedSearch) return allDocs;
    const lowerSearch = debouncedSearch.toLowerCase();
    
    return allDocs.filter((doc: any) => {
      // Check status
      if (doc.status?.toLowerCase().includes(lowerSearch)) return true;
      
      // Check field values based on configured columns
      return configuredColumns.some((col: any) => {
        const val = doc?.values?.fields?.[col.key];
        let displayVal = "";
        if (val && typeof val === "object" && "originalValue" in val) {
          displayVal = String(val.editedValue ?? val.originalValue ?? "");
        } else if (val !== undefined && val !== null) {
          displayVal = String(val);
        }
        return displayVal.toLowerCase().includes(lowerSearch);
      });
    });
  }, [allDocs, debouncedSearch, configuredColumns]);

  const totalPages = Math.ceil(filteredDocs.length / tablePageLimit) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * tablePageLimit;
    return filteredDocs.slice(start, start + tablePageLimit);
  }, [filteredDocs, currentPage]);


  return (
    <Box p={{ base: 4, md: 6 }} minH="100vh">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <VStack align="start" spacing={0}>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            Documents
          </Text>
          <Text fontSize="sm" color={mutedText}>
            Dynamic table driven by your workflow schema
          </Text>
        </VStack>

        <HStack>
          <Button
            leftIcon={<FiRefreshCw />}
            variant="ghost"
            size="sm"
            onClick={() => {
               if (workflowStore.activeWorkflow) {
                  documentStore.getDocumentsByWorkflow(workflowStore.activeWorkflow._id);
                  setSearch("");
               }
            }}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            rounded="full"
            shadow="sm"
            onClick={() => { setEditingDoc(null); onOpen(); }}
            isDisabled={!workflowStore.activeWorkflow}
            _hover={{ transform: "translateY(-1px)", shadow: "md" }}
          >
            Add Document
          </Button>
        </HStack>
      </Flex>


      {/* ── Dynamic Table ─────────────────────────────────────────────── */}
      {!workflowStore.activeWorkflow ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={20}
          border="2px dashed"
          borderColor={borderColor}
          rounded="2xl"
          bg={useColorModeValue("gray.50", "gray.900")}
        >
          <Icon as={FiFileText} boxSize={10} color={mutedText} mb={3} />
          <Text fontWeight="medium" color={mutedText}>
            Select a workflow to view documents
          </Text>
        </Flex>
      ) : (
        <Box>
           <CustomTable
              data={paginatedDocs}
              columns={CustomTableColumns}
              loading={documentStore.documents.loading}
              serial={{ show: true, text: "S.No." }}
              actions={{
                actionBtn: {
                  viewKey: {
                    showViewButton: true,
                    title: "View Document",
                    function: (doc: any) => {
                      setEditingDoc(doc);
                      onOpen();
                    },
                  },
                },
                search: {
                  show: true,
                  searchValue: search,
                  placeholder: "Search documents...",
                  onSearchChange: (e: any) => {
                     setSearch(e.target.value);
                     setCurrentPage(1); // Reset page on search
                  },
                },
                resetData: {
                  show: true,
                  text: "Reset",
                  function: () => {
                     setSearch("");
                     setCurrentPage(1);
                  },
                },
                pagination: {
                  show: true,
                  currentPage,
                  totalPages,
                  onClick: (p: number) => setCurrentPage(p),
                },
              }}
           />
        </Box>
      )}

      {isOpen && workflowStore.activeWorkflow && (
        <DocumentDrawer
          isOpen={isOpen}
          onClose={onClose}
          workflow={workflowStore.activeWorkflow}
          editDoc={editingDoc}
          onSuccess={() => {
            onClose();
            documentStore.getDocumentsByWorkflow(workflowStore.activeWorkflow._id);
          }}
        />
      )}
    </Box>
  );
});

export default DocumentsView;
