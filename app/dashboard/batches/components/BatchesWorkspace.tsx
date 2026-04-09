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
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import stores from "@/app/store/stores";
import { batchStore } from "@/app/store/batchStore/batchStore";
import { isLearnerRole } from "@/app/config/utils/roleAccess";
import BatchCard from "./BatchCard";
import BatchCreationModal from "./BatchCreationModal";
import BatchDetailsDrawer from "./BatchDetailsDrawer";
import GlassSearchInput from "@/app/component/common/GlassSearch/GlassSearchInput";

type BatchesWorkspaceProps = {
  courseBasePath?: string;
};

const BatchesWorkspace = observer(
  ({
    courseBasePath = "/dashboard/course/my-courses",
  }: BatchesWorkspaceProps) => {
    const { auth, companyStore } = stores;
    const role = String(auth.userType || auth.user?.role || "").toLowerCase();
    const currentUserId = String(auth.user?._id || "");
    const router = useRouter();
    const toast = useToast();
    const isLearner = isLearnerRole(role);
    const isSuperadmin = role === "superadmin";
    const canCreate = ["superadmin", "admin", "departmenthead"].includes(role);
    const canManage = ["superadmin", "admin", "departmenthead"].includes(role);
    const creationDisclosure = useDisclosure();
    const detailsDisclosure = useDisclosure();
    const editDisclosure = useDisclosure();
    const [editStep, setEditStep] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const companyId = isSuperadmin
      ? companyStore.getActiveCompanyId()
      : auth.company;
    const companies = companyStore.companies.data || [];
    const activeCompany =
      companies.find((company: any) => company._id === companyId) ||
      auth.user?.companyDetails ||
      null;

    useEffect(() => {
      if (isSuperadmin) {
        companyStore.getManagedCompanies().catch(() => undefined);
      }
    }, [companyStore, isSuperadmin]);

    useEffect(() => {
      if (isLearner) {
        batchStore.fetchMyBatches().catch(() => undefined);
        return;
      }

      if (!companyId && isSuperadmin) {
        return;
      }

      batchStore
        .fetchBatches({ companyId: companyId || undefined })
        .catch(() => undefined);
    }, [companyId, isSuperadmin, isLearner]);

    const items = isLearner ? batchStore.myBatches : batchStore.batches;
    const isLoading = isLearner
      ? batchStore.isMyBatchesLoading
      : batchStore.isLoading;
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
      if (isLearner) {
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

    const canDeleteActiveBatch = Boolean(
      canManage &&
      batchStore.activeBatch?._id &&
      currentUserId &&
      String(batchStore.activeBatch.createdBy?._id || "") === currentUserId
    );

    const handleDeleteBatch = async () => {
      if (!batchStore.activeBatch?._id) {
        return;
      }

      const confirmed = window.confirm(
        `Delete "${batchStore.activeBatch.name}"? Learners will lose access to this batch and its batch-based course access.`
      );
      if (!confirmed) {
        return;
      }

      try {
        await batchStore.deleteBatch(batchStore.activeBatch._id);
        toast({
          title: "Batch deleted",
          description: "The batch and its batch-based learner access have been removed.",
          status: "success",
          duration: 4000,
        });
        detailsDisclosure.onClose();
        batchStore.clearActiveBatch();
        await refreshBatches();
      } catch (error: any) {
        toast({
          title: "Unable to delete batch",
          description: error?.message || error?.error || "Please try again.",
          status: "error",
          duration: 4500,
        });
      }
    };

    return (
      <Box
        minH="100vh"
        bg={isLearner ? "transparent" : "gray.50"}
        p={{ base: 4, md: 6 }}
      >
        <Stack spacing={6}>
          {/* 🔷 HEADER BOX */}
          <Box
            borderRadius="3xl"
            px={{ base: 5, md: 7 }}
            py={{ base: 6, md: 7 }}
            bg={
              isLearner
                ? "linear-gradient(135deg, #0f172a 0%, #1d4ed8 52%, #dbeafe 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #eff6ff 45%, #f8fafc 100%)"
            }
            borderWidth="1px"
            borderColor={isLearner ? "transparent" : "blue.100"}
            boxShadow="sm"
            color={isLearner ? "white" : "inherit"}
          >
            <Stack spacing={4}>
              <HStack
                justify="space-between"
                align={{ base: "start", md: "center" }}
                flexWrap="wrap"
                gap={4}
              >
                <Box maxW="3xl">
                  <Heading size="md">
                    {isLearner ? "My Batches" : "Batch Workspace"}
                  </Heading>
                  <Text
                    mt={2}
                    color={isLearner ? "whiteAlpha.900" : "gray.600"}
                  >
                    {isLearner
                      ? "Open your learning groups, track what is already completed, and launch the courses bundled inside each batch."
                      : `Manage multi-course learning cohorts for ${
                          activeCompany?.company_name || "the selected company"
                        } with clearer cards, quick drill-in, and smoother member updates.`}
                  </Text>
                </Box>

                {canCreate && (
                  <Button
                    colorScheme="blue"
                    onClick={creationDisclosure.onOpen}
                    isDisabled={!companyId && isSuperadmin}
                  >
                    Create Batch
                  </Button>
                )}
              </HStack>

              {/* 🔍 SEARCH INSIDE HEADER */}
              <GlassSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search batches..."
                isLearner={isLearner}
              />
            </Stack>
          </Box>

          {/* 🔻 BELOW HEADER (SEPARATE SECTION) */}
          {filteredItems.length === 0 ? (
            <Box bg="white" borderWidth="1px" borderRadius="3xl" p={8}>
              <Text fontWeight="semibold">No batches match that search</Text>
              <Text mt={2} color="gray.600">
                Try a different keyword...
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
              {filteredItems.map((batch) => (
                <BatchCard
                  key={batch._id}
                  batch={batch}
                  onClick={() => handleBatchClick(batch._id)}
                  isLearner={isLearner}
                />
              ))}
            </SimpleGrid>
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
          canManage={canManage && !isLearner}
          canDelete={canDeleteActiveBatch}
          isLearner={isLearner}
          isDeleteLoading={batchStore.isSubmitting}
          onEditBatch={() => handleEditOpen(0)}
          onDeleteBatch={handleDeleteBatch}
          onManageUsers={() => handleEditOpen(2)}
          onOpenCourse={
            isLearner
              ? (courseId) =>
                  router.push(`${courseBasePath}?courseId=${courseId}`)
              : undefined
          }
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
  },
);

export default BatchesWorkspace;
