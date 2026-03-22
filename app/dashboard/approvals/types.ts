"use client";

export const APPROVAL_TABS = ["pending", "approved", "rejected"] as const;
export const APPROVAL_TAB_PRIORITY = ["pending", "rejected", "approved"] as const;

export type ApprovalTabKey = (typeof APPROVAL_TABS)[number];
export type ApprovalAction = "approved" | "rejected";
export type DrawerIntent = "view" | ApprovalAction;

export interface ApprovalHistoryEntry {
  _id?: string;
  level?: number | string;
  action?: ApprovalAction;
  status?: string;
  comment?: string;
  name?: string;
  user?: string | { _id?: string; name?: string; username?: string; code?: string };
  userId?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApprovalDocument {
  _id: string;
  documentId?: string;
  workflow?: string;
  workflowName?: string;
  workflowIdentifier?: string;
  currentLevel?: number;
  status?: string;
  canEdit?: boolean;
  canTakeAction?: boolean;
  created_At?: string;
  updated_At?: string;
  createdBy?:
    | string
    | {
        _id?: string;
        name?: string;
        username?: string;
        code?: string;
      };
  fileUrl?: string | null;
  createdByUser?: {
    _id?: string;
    name?: string;
    username?: string;
    code?: string;
  };
  values?: {
    fields?: Record<string, any>;
    tables?: Record<string, any[]>;
    level?: string;
    values?: Record<string, any>;
  };
  originalValues?: Record<string, any>;
  approval?: ApprovalHistoryEntry[];
  matchedApproval?: ApprovalHistoryEntry;
  lastApproval?: ApprovalHistoryEntry;
  file?: {
    _id?: string;
    filename?: string;
    metadata?: Record<string, any>;
  } | string | null;
}

export interface TabState {
  data: ApprovalDocument[];
  loading: boolean;
  loaded: boolean;
}

export type TabStateMap = Record<ApprovalTabKey, TabState>;

export interface ActionResponse {
  status: string;
  statusCode: number;
  message: string;
  data?: {
    document?: ApprovalDocument;
    nextStatus?: string;
    nextLevel?: number;
    currentLevel?: number;
    userLevel?: number;
    canEdit?: boolean;
  };
}

export interface UpdateDocumentResponse {
  status: string;
  statusCode: number;
  message: string;
  data?: ApprovalDocument;
}

function normalizeComparableValue(value: any): any {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeComparableValue(item));
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeComparableValue(value[key]);
        return acc;
      }, {} as Record<string, any>);
  }

  return value;
}

function areEquivalentValues(left: any, right: any) {
  const normalizedLeft = normalizeComparableValue(left);
  const normalizedRight = normalizeComparableValue(right);

  if (
    (normalizedLeft && typeof normalizedLeft === "object") ||
    (normalizedRight && typeof normalizedRight === "object")
  ) {
    return JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
  }

  return normalizedLeft === normalizedRight;
}

export function buildEditableValueState(currentValue: any, nextValue: any) {
  const existingValue =
    currentValue && typeof currentValue === "object" && "originalValue" in currentValue
      ? currentValue
      : { originalValue: currentValue ?? null, editedValue: null };

  if (nextValue === undefined) {
    return existingValue;
  }

  const normalizedNextValue = typeof nextValue === "string" ? nextValue.trim() : nextValue;

  return {
    ...existingValue,
    originalValue: existingValue.originalValue ?? null,
    editedValue: areEquivalentValues(normalizedNextValue, existingValue.originalValue)
      ? null
      : normalizedNextValue,
  };
}

export function resolvePersistedValue(value: any) {
  if (value && typeof value === "object" && "originalValue" in value) {
    return value.editedValue ?? value.originalValue ?? null;
  }

  return value ?? null;
}

export function resolveFieldMap(document?: ApprovalDocument | null) {
  if (!document) return {};
  return document.values?.fields || document.values?.values || document.originalValues || {};
}

export function resolveTableMap(document?: ApprovalDocument | null) {
  if (!document) return {};
  return document.values?.tables || {};
}

export function resolveDisplayValue(value: any) {
  const persistedValue = resolvePersistedValue(value);

  if (persistedValue === null || persistedValue === undefined || persistedValue === "") {
    return "-";
  }

  if (Array.isArray(persistedValue)) {
    return persistedValue.length ? persistedValue.join(", ") : "-";
  }

  if (persistedValue && typeof persistedValue === "object") {
    try {
      return JSON.stringify(persistedValue);
    } catch (error) {
      return "-";
    }
  }

  if (typeof persistedValue === "boolean") {
    return persistedValue ? "Yes" : "No";
  }

  return persistedValue;
}

export function resolveInputValue(value: any) {
  const persistedValue = resolvePersistedValue(value);

  if (persistedValue === null || persistedValue === undefined) {
    return "";
  }

  if (typeof persistedValue === "string") {
    return persistedValue;
  }

  return String(persistedValue);
}

export function resolveOriginalValue(value: any) {
  if (value && typeof value === "object" && "originalValue" in value) {
    return value.originalValue ?? "-";
  }

  return resolveDisplayValue(value);
}

export function resolveEditedValue(value: any) {
  if (value && typeof value === "object" && "originalValue" in value) {
    return value.editedValue ?? null;
  }

  return null;
}

export function isEditedValue(value: any) {
  const editedValue = resolveEditedValue(value);
  return editedValue !== null && editedValue !== undefined;
}

export function resolveCreatorLabel(document: ApprovalDocument) {
  const createdByValue = document.createdBy;
  const createdByLabel =
    createdByValue && typeof createdByValue === "object"
      ? createdByValue.name || createdByValue.username || createdByValue.code || createdByValue._id
      : createdByValue;

  const resolvedLabel =
    document.createdByUser?.name ||
    document.createdByUser?.username ||
    document.createdByUser?.code ||
    createdByLabel ||
    "Unknown";

  return String(resolvedLabel);
}

export function resolveApprovalActor(entry: ApprovalHistoryEntry) {
  if (entry.name) return entry.name;

  if (entry.user && typeof entry.user === "object") {
    return entry.user.name || entry.user.username || entry.user.code || "Unknown";
  }

  return String(entry.userId || entry.user || "Unknown");
}

export function formatLevel(level?: number | string) {
  if (level === undefined || level === null || level === "") {
    return "Level -";
  }

  const numericLevel =
    typeof level === "string" ? Number(level.replace(/level-/i, "")) : level;

  if (Number.isFinite(numericLevel)) {
    return `Level ${numericLevel}`;
  }

  return String(level);
}

export function formatDate(value?: string) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function buildOptimisticHistoryEntry(
  action: ApprovalAction,
  comment: string,
  document: ApprovalDocument
): ApprovalHistoryEntry {
  return {
    _id: `local-${Date.now()}`,
    action,
    status: action,
    comment,
    level: document.currentLevel,
    date: new Date().toISOString(),
  };
}

export function buildFieldUpdatePayload(fields: Record<string, any>) {
  const payload: Record<string, any> = {};

  Object.entries(fields || {}).forEach(([key, value]) => {
    payload[key] = resolvePersistedValue(value);
  });

  return payload;
}

export function buildTableUpdatePayload(tables: Record<string, any[]>) {
  const payload: Record<string, any[]> = {};

  Object.entries(tables || {}).forEach(([tableName, rows]) => {
    payload[tableName] = (rows || []).map((row) => {
      const nextRow: Record<string, any> = {};

      Object.entries(row || {}).forEach(([columnName, value]) => {
        nextRow[columnName] = resolvePersistedValue(value);
      });

      return nextRow;
    });
  });

  return payload;
}

export function resolveFileId(file?: ApprovalDocument["file"]) {
  if (!file) return null;
  if (typeof file === "string") return file;
  return file._id || null;
}

export function normalizeApprovalTabs(tabs: TabStateMap): TabStateMap {
  const seenDocumentIds = new Set<string>();
  const normalizedState: TabStateMap = {
    pending: { ...tabs.pending, data: [] },
    approved: { ...tabs.approved, data: [] },
    rejected: { ...tabs.rejected, data: [] },
  };

  APPROVAL_TAB_PRIORITY.forEach((tabKey) => {
    tabs[tabKey].data.forEach((document) => {
      if (!seenDocumentIds.has(document._id)) {
        seenDocumentIds.add(document._id);
        normalizedState[tabKey].data.push(document);
      }
    });
  });

  return normalizedState;
}
