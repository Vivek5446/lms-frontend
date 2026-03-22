"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import {
  APPROVAL_TABS,
  ActionResponse,
  ApprovalAction,
  ApprovalDocument,
  ApprovalTabKey,
  DrawerIntent,
  TabStateMap,
  UpdateDocumentResponse,
  buildOptimisticHistoryEntry,
  normalizeApprovalTabs,
} from "../types";

const TAB_ENDPOINTS: Record<ApprovalTabKey, string> = {
  pending: "/document/pending",
  approved: "/document/approved",
  rejected: "/document/rejected",
};

const createInitialState = (): TabStateMap => ({
  pending: { data: [], loading: false, loaded: false },
  approved: { data: [], loading: false, loaded: false },
  rejected: { data: [], loading: false, loaded: false },
});

const upsertDocument = (documents: ApprovalDocument[], document: ApprovalDocument) => {
  const withoutCurrent = documents.filter((item) => item._id !== document._id);
  return [document, ...withoutCurrent];
};

const removeDocument = (documents: ApprovalDocument[], documentId?: string) =>
  documents.filter((item) => item._id !== documentId);

export function useApproval(workflowId?: string | null) {
  const toast = useToast();
  const [tabs, setTabs] = useState<TabStateMap>(createInitialState);
  const [activeTabState, setActiveTabState] = useState<ApprovalTabKey>("pending");
  const [selectedDocument, setSelectedDocument] = useState<ApprovalDocument | null>(null);
  const [selectedSourceTab, setSelectedSourceTab] = useState<ApprovalTabKey>("pending");
  const [drawerIntent, setDrawerIntent] = useState<DrawerIntent>("view");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<ApprovalAction | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const fetchTab = async (
    tab: ApprovalTabKey,
    options?: { silent?: boolean; force?: boolean; workflowId?: string | null }
  ) => {
    const isSilent = options?.silent === true;
    const shouldForce = options?.force === true;
    const activeWorkflowId = options?.workflowId ?? workflowId;

    if (!activeWorkflowId) {
      return [];
    }

    if (!shouldForce && tabs[tab].loaded) {
      return tabs[tab].data;
    }

    if (!isSilent) {
      setTabs((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], loading: true },
      }));
    }

    try {
      const response = await axios.get(TAB_ENDPOINTS[tab], {
        params: { workflowId: activeWorkflowId },
      });
      const documents = response?.data?.data || [];

      setTabs((prev) => ({
        ...prev,
        [tab]: {
          data: documents,
          loading: false,
          loaded: true,
        },
      }));

      if (selectedDocument) {
        const refreshedSelection = documents.find(
          (document: ApprovalDocument) => document._id === selectedDocument._id
        );

        if (refreshedSelection && selectedSourceTab === tab) {
          setSelectedDocument(refreshedSelection);
        }
      }

      return documents;
    } catch (error: any) {
      if (!isSilent) {
        setTabs((prev) => ({
          ...prev,
          [tab]: { ...prev[tab], loading: false },
        }));
      }

      toast({
        title: `Failed to load ${tab} documents`,
        description: error?.response?.data?.message || error?.message || "Unknown error",
        status: "error",
        duration: 4000,
        position: "top-right",
      });

      return [];
    }
  };

  const refreshAllTabs = async (
    options?: { silent?: boolean; force?: boolean; workflowId?: string | null }
  ) => {
    const isSilent = options?.silent === true;
    const activeWorkflowId = options?.workflowId ?? workflowId;
    if (!activeWorkflowId) {
      return;
    }

    if (!isSilent) {
      setRefreshingAll(true);
    }

    try {
      await Promise.all(
        APPROVAL_TABS.map((tab) =>
          fetchTab(tab, {
            silent: isSilent,
            force: options?.force ?? true,
            workflowId: activeWorkflowId,
          })
        )
      );
    } finally {
      if (!isSilent) {
        setRefreshingAll(false);
      }
    }
  };

  const setActiveTab = (tab: ApprovalTabKey) => {
    setActiveTabState(tab);

    if (!tabs[tab].loaded && workflowId) {
      void fetchTab(tab, { workflowId });
    }
  };

  useEffect(() => {
    setTabs(createInitialState());
    setActiveTabState("pending");
    setSelectedDocument(null);
    setSelectedSourceTab("pending");
    setDrawerIntent("view");
    setIsDrawerOpen(false);

    if (workflowId) {
      void fetchTab("pending", { workflowId, force: true });
    }
  }, [workflowId]);

  const openDrawer = (
    document: ApprovalDocument,
    sourceTab: ApprovalTabKey,
    intent: DrawerIntent = "view"
  ) => {
    setSelectedDocument(document);
    setSelectedSourceTab(sourceTab);
    setDrawerIntent(intent);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerIntent("view");
  };

  const applyOptimisticAction = (
    action: ApprovalAction,
    updatedDocument: ApprovalDocument,
    comment: string,
    nextStatus?: string
  ) => {
    const optimisticDocument: ApprovalDocument = {
      ...updatedDocument,
      status: nextStatus || updatedDocument.status,
      approval: [
        ...(updatedDocument.approval || []),
        buildOptimisticHistoryEntry(action, comment, updatedDocument),
      ],
    };

    setTabs((prev) => {
      const nextState: TabStateMap = {
        pending: {
          ...prev.pending,
          data: removeDocument(prev.pending.data, updatedDocument._id),
        },
        approved: {
          ...prev.approved,
          data: removeDocument(prev.approved.data, updatedDocument._id),
        },
        rejected: {
          ...prev.rejected,
          data: removeDocument(prev.rejected.data, updatedDocument._id),
        },
      };

      if (action === "rejected") {
        nextState.rejected.data = upsertDocument(nextState.rejected.data, optimisticDocument);
      } else {
        nextState.approved.data = upsertDocument(nextState.approved.data, optimisticDocument);
      }

      return nextState;
    });
  };

  const updateDocument = async (
    documentId: string,
    payload: { fields?: Record<string, any>; tables?: Record<string, any[]> }
  ) => {
    const response = await axios.patch<UpdateDocumentResponse>(
      `/document/${documentId}`,
      payload
    );

    return response?.data?.data;
  };

  const submitAction = async (
    action: ApprovalAction,
    comment: string,
    payload?: { fields?: Record<string, any>; tables?: Record<string, any[]> }
  ) => {
    if (!selectedDocument?._id) {
      return false;
    }

    setActionLoading(action);

    try {
      let workingDocument = selectedDocument;

      if (payload?.fields || payload?.tables) {
        const updatedDocument = await updateDocument(selectedDocument._id, payload);
        if (updatedDocument) {
          workingDocument = updatedDocument;
          setSelectedDocument(updatedDocument);
        }
      }

      const response = await axios.post<ActionResponse>(
        `/document/${selectedDocument._id}/${action === "approved" ? "approve" : "reject"}`,
        { comment }
      );

      const updatedDocument =
        response?.data?.data?.document || workingDocument;

      applyOptimisticAction(
        action,
        updatedDocument,
        comment,
        response?.data?.data?.nextStatus
      );
      setSelectedDocument(updatedDocument);

      toast({
        title: action === "approved" ? "Document approved" : "Document rejected",
        description: response?.data?.message || "Action completed successfully",
        status: "success",
        duration: 3500,
        position: "top-right",
      });

      closeDrawer();
      void refreshAllTabs({ silent: true, force: true });
      return true;
    } catch (error: any) {
      toast({
        title: action === "approved" ? "Approval failed" : "Rejection failed",
        description: error?.response?.data?.message || error?.message || "Unknown error",
        status: "error",
        duration: 4000,
        position: "top-right",
      });
      void refreshAllTabs({ silent: true, force: true });

      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const normalizedTabs = useMemo(() => normalizeApprovalTabs(tabs), [tabs]);
  const counts = useMemo(
    () => ({
      pending: normalizedTabs.pending.data.length,
      approved: normalizedTabs.approved.data.length,
      rejected: normalizedTabs.rejected.data.length,
    }),
    [normalizedTabs]
  );

  return {
    tabs: normalizedTabs,
    activeTab: activeTabState,
    setActiveTab,
    selectedDocument,
    selectedSourceTab,
    drawerIntent,
    isDrawerOpen,
    actionLoading,
    refreshingAll,
    counts,
    openDrawer,
    closeDrawer,
    fetchTab,
    refreshAllTabs,
    approveDocument: (
      comment: string,
      payload?: { fields?: Record<string, any>; tables?: Record<string, any[]> }
    ) => submitAction("approved", comment, payload),
    rejectDocument: (
      comment: string,
      payload?: { fields?: Record<string, any>; tables?: Record<string, any[]> }
    ) => submitAction("rejected", comment, payload),
  };
}
