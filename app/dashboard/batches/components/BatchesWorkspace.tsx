"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import stores from "@/app/store/stores";
import { batchStore } from "@/app/store/batchStore/batchStore";
import BatchCard from "./BatchCard";
import BatchCreationModal from "./BatchCreationModal";
import BatchDetailsDrawer from "./BatchDetailsDrawer";

const BatchesWorkspace = observer(() => {
  const { auth, companyStore } = stores;
  const role = String(auth.userType || auth.user?.role || "").toLowerCase();
  const isUser = role === "user";
  const isSuperadmin = role === "superadmin";
  const canCreate = ["superadmin", "admin", "departmenthead"].includes(role);
  const canManage = ["superadmin", "admin", "departmenthead"].includes(role);
  const creationDisclosure = useDisclosure();
  const detailsDisclosure = useDisclosure();
  const editDisclosure = useDisclosure();
  const [editStep, setEditStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const companyId = isSuperadmin ? companyStore.getActiveCompanyId() : auth.company;
  const companies = companyStore.companies.data || [];
  const activeCompany =
    companies.find((company: any) => company._id === companyId) || auth.user?.companyDetails || null;

  useEffect(() => {
    if (isSuperadmin) {
      companyStore.getManagedCompanies().catch(() => undefined);
    }
  }, [companyStore, isSuperadmin]);

  useEffect(() => {
    if (isUser) {
      batchStore.fetchMyBatches().catch(() => undefined);
      return;
    }

    if (!companyId && isSuperadmin) {
      return;
    }

    batchStore.fetchBatches({ companyId: companyId || undefined }).catch(() => undefined);
  }, [companyId, isSuperadmin, isUser]);

  const items = isUser ? batchStore.myBatches : batchStore.batches;
  const isLoading = isUser ? batchStore.isMyBatchesLoading : batchStore.isLoading;
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((batch) => {
      const searchableText = [
        batch.name,
        batch.company?.company_name,
        batch.createdBy?.name,
        batch.createdBy?.email,
        batch.createdBy?.username,
        batch.status,
        batch.durationLabel,
        batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "",
        batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "",
        String(batch.courseCount ?? ""),
        String(batch.userCount ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [items, searchQuery]);

  const refreshBatches = async () => {
    if (isUser) {
      await batchStore.fetchMyBatches();
      return;
    }

    await batchStore.fetchBatches({ companyId: companyId || undefined });
  };

  const handleBatchClick = async (batchId: string) => {
    detailsDisclosure.onOpen();
    await batchStore.fetchBatchDetails(batchId).catch(() => undefined);
  };

  const handleEditOpen = (initialStep = 0) => {
    setEditStep(initialStep);
    detailsDisclosure.onClose();
    editDisclosure.onOpen();
  };

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <Box
          borderRadius="3xl"
          px={{ base: 5, md: 7 }}
          py={{ base: 6, md: 7 }}
          bg="linear-gradient(135deg, #ffffff 0%, #eff6ff 45%, #f8fafc 100%)"
          borderWidth="1px"
          borderColor="blue.100"
          boxShadow="sm"
        >
          <Stack spacing={4}>
            <HStack justify="space-between" align={{ base: "start", md: "center" }} flexWrap="wrap">
              <Box maxW="3xl">
                <Heading size="md">{isUser ? "My Batches" : "Batch Workspace"}</Heading>
                <Text mt={2} color="gray.600">
                  {isUser
                    ? "Review the batches assigned to you and inspect the course bundle inside each one."
                    : `Manage multi-course learning cohorts for ${activeCompany?.company_name || "the selected company"} with clearer cards, quick drill-in, and smoother member updates.`}
                </Text>
              </Box>

              {canCreate ? (
                <Button colorScheme="blue" onClick={creationDisclosure.onOpen} isDisabled={!companyId && isSuperadmin}>
                  Create Batch
                </Button>
              ) : null}
            </HStack>
          </Stack>
        </Box>

        {!companyId && isSuperadmin && !isUser ? (
          <Alert status="info" borderRadius="2xl">
            <AlertIcon />
            <Box>
              <AlertTitle>Select a company</AlertTitle>
              <AlertDescription>
                Use the header company selector to load or create batches for a company.
              </AlertDescription>
            </Box>
          </Alert>
        ) : isLoading ? (
          <HStack justify="center" py={20}>
            <Spinner />
            <Text color="gray.600">Loading batches...</Text>
          </HStack>
        ) : items.length === 0 ? (
          <Box bg="white" borderWidth="1px" borderRadius="3xl" p={8}>
            <Text fontWeight="semibold">No batches yet</Text>
            <Text mt={2} color="gray.600">
              {isUser
                ? "You have not been added to a batch yet."
                : "Create your first batch to assign multiple courses to a group of learners in one flow."}
            </Text>
          </Box>
        ) : (
          <Stack spacing={5}>
            <Box bg="white" borderWidth="1px" borderRadius="3xl" p={{ base: 4, md: 5 }} boxShadow="sm">
              <InputGroup maxW={{ base: "full", md: "420px" }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search batches by name, company, creator, or status"
                  borderRadius="xl"
                />
              </InputGroup>
            </Box>

            {filteredItems.length === 0 ? (
              <Box bg="white" borderWidth="1px" borderRadius="3xl" p={8}>
                <Text fontWeight="semibold">No batches match that search</Text>
                <Text mt={2} color="gray.600">
                  Try a different keyword or clear the search to see all created batches again.
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
                {filteredItems.map((batch) => (
                  <BatchCard key={batch._id} batch={batch} onClick={() => handleBatchClick(batch._id)} />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        )}
      </Stack>

      <BatchDetailsDrawer
        isOpen={detailsDisclosure.isOpen}
        onClose={() => {
          detailsDisclosure.onClose();
          batchStore.clearActiveBatch();
        }}
        batch={batchStore.activeBatch}
        isLoading={batchStore.isDetailsLoading}
        canManage={canManage && !isUser}
        onEditBatch={() => handleEditOpen(0)}
        onManageUsers={() => handleEditOpen(2)}
      />

      <BatchCreationModal
        isOpen={creationDisclosure.isOpen}
        onClose={creationDisclosure.onClose}
        companyId={companyId || undefined}
        onCreated={refreshBatches}
      />

      <BatchCreationModal
        isOpen={editDisclosure.isOpen}
        onClose={editDisclosure.onClose}
        companyId={companyId || undefined}
        onCreated={async () => {
          await refreshBatches();
          if (batchStore.activeBatch?._id) {
            await batchStore.fetchBatchDetails(batchStore.activeBatch._id);
          }
        }}
        mode="edit"
        initialBatch={batchStore.activeBatch}
        initialStep={editStep}
      />
    </Box>
  );
});

export default BatchesWorkspace;
