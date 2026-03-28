import { defaultWorkflowConfig, WorkflowConfig } from "../types/config";

/**
 * Converts a MongoDB workflow document (structured format from the backend)
 * back into the flat WorkflowConfig shape used by the form.
 *
 * Backend structure:
 *  - doc.workFlowName
 *  - doc.identifier
 *  - doc.schema        (parsed JSON or null)
 *  - doc.logoUrl
 *  - doc.values[0]     (the main config sub-document)
 *    - .flowName, .levels, .processName, .processType, .documentType
 *    - .approvals[]
 *    - .notification[]
 *    - .table[0]
 *    - .dateFilter
 *    - .filters[]
 *    - .triggers[]
 *    - .editableMode, .onRejectLevel, .fastForwardLevel
 *    - .bulkApprovalLevels, .bulkRejectLevels, .additionalDocumentLevels
 *    - .notifyCreator, .notifyFinalCompletion
 */
export function mapDocumentToConfig(doc: any): WorkflowConfig {
  const v = doc?.values?.[0] || {};
  const tableConfig = v.table?.[0] || {};
  const dateFilter = v.dateFilter || {};
  const levelCount = v.levels || 1;

  // ── User Approvals
  const userApprovals = (v.approvals || []).map((a: any, idx: number) => ({
    id: a.user || a._id || String(idx),
    email: a.username || "",
    name: a.name || a.username || "",    // for UserSearchInput display
    designation: a.designation || "",
    role: a.role || "approver",
    level: typeof a.level === "string" ? parseInt(a.level.replace("level-", "")) || 1 : a.level || 1,
    active: a.isActive ?? true,
    canViewDocument: a.canViewDocument ?? true,
    canDownloadDocument: a.canDownloadDocument ?? false,
    userId: a.user || "",               // reference to the actual DB user _id
  }));

  // ── Notifications: stored as array like [{level:["level-1"],approval:["approved"],type:["email"]}]
  // Reverse back to {onApproved:{1:{email:true,...}}, onRejected:{1:{...}}}
  const onApproved: any = {};
  const onRejected: any = {};
  for (let lvl = 1; lvl <= levelCount; lvl++) {
    onApproved[lvl] = { email: false, notification: false, sms: false };
    onRejected[lvl] = { email: false, notification: false, sms: false };
  }

  (v.notification || []).forEach((n: any) => {
    const levels: string[] = n.level || [];
    const approvalTypes: string[] = n.approval || [];
    const types: string[] = n.type || [];

    levels.forEach((lvlStr: string) => {
      const lvlNum = parseInt(lvlStr.replace("level-", "")) || 1;
      if (approvalTypes.includes("approved")) {
        if (!onApproved[lvlNum]) onApproved[lvlNum] = { email: false, notification: false, sms: false };
        types.forEach((t: string) => { if (t in onApproved[lvlNum]) onApproved[lvlNum][t] = true; });
      }
      if (approvalTypes.includes("rejected")) {
        if (!onRejected[lvlNum]) onRejected[lvlNum] = { email: false, notification: false, sms: false };
        types.forEach((t: string) => { if (t in onRejected[lvlNum]) onRejected[lvlNum][t] = true; });
      }
    });
  });

  // ── Table columns
  const tableColumns = (tableConfig.columnName || []).map((col: any) => ({
    id: col._id || col.key || String(Math.random()),
    label: col.label || "",
    key: col.key || "",
    active: col.isActive ?? true,
    labelAlign: col.labelAlign || "left",
    rowAlign: col.rowAlign || "left",
    truncate: col.truncate ?? false,
    truncateLabel: col.tooltipLabel || "",
    isFile: col.rowType === "file",
  }));

  // ── Table actions
  const tableActionsDefault = defaultWorkflowConfig.tableActions.map((a) => {
    const serverKey: Record<string, keyof typeof tableConfig.action> = {
      view: "view",
      edit: "edit",
      delete: "delete",
      download_pdf: "downloadPDF",
      download_report: "downloadExcel",
    };
    return {
      ...a,
      enabled: tableConfig.action?.[serverKey[a.action]] ?? false,
      levels: [],
    };
  });

  // ── Table headers
  const tableHeaders = tableConfig.header
    ? [{ label: tableConfig.header.label || "", show: tableConfig.header.isActive ?? true }]
    : [];

  // ── Dashboard filters from dateFilter + filters[]
  const filterKeys = (v.filters || []).map((f: any) => f.key || f.label || "");
  const dashboardFilter = {
    dateFilters: dateFilter.activeFilters || [],
    filterKeys,
  };

  // ── Schema: store as JSON string for the textarea editor
  let schemaConfig = "";
  if (doc.schema && typeof doc.schema === "object") {
    try { schemaConfig = JSON.stringify(doc.schema, null, 2); } catch {}
  } else if (typeof doc.schema === "string" && doc.schema) {
    schemaConfig = doc.schema;
  }

  // ── Triggers
  const triggers = (v.triggers || []).map((t: any) => ({
    id: t.id || t._id || String(Math.random()),
    type: t.type || "approved",
    level: t.level || 1,
    isActive: t.isActive ?? true,
    action: t.action || "url",
    method: t.method || "",
    hasAuth: t.hasAuth ?? false,
    authType: t.authType || "token",
    authToken: t.authToken || "",
    credentials: t.credentials || [],
  }));

  return {
    ...defaultWorkflowConfig,
    // ── Top-level meta
    workflowName: doc.workFlowName || "",
    identifier: doc.identifier || "",
    logoPreview: doc.logoUrl || "",
    logo: null,

    // ── Values sub-doc
    flowName: v.flowName || "",
    noOfLevels: levelCount,
    processName: v.processName || "",
    processType: v.processType || "sequential",
    documentType: v.documentType || "",

    // flowType came from documentType on save, so restore it
    flowType: v.documentType || "",

    // ── Approval config
    editableMode: (v.editableMode || []).map(Number),
    onRejectLevel: v.onRejectLevel ?? null,
    fastForwardLevel: v.fastForwardLevel ?? null,
    bulkApprovalLevels: (v.bulkApprovalLevels || []).map(Number),
    bulkRejectLevels: (v.bulkRejectLevels || []).map(Number),
    additionalDocumentLevels: (v.additionalDocumentLevels || []).map(Number),
    additionalFormLink: v.additionalFormLink || "",

    // ── Approvals
    userApprovals,

    // ── Notifications
    notifications: { onApproved, onRejected },
    notifyCreator: v.notifyCreator ?? true,
    notifyFinalCompletion: v.notifyFinalCompletion ?? true,

    // ── Table
    showTable: tableConfig.isActive ?? true,
    showPagination: tableConfig.isPaginate?.isActive ?? true,
    paginationPages: tableConfig.isPaginate?.paginationLimit ?? 10,
    showFilter: tableConfig.filterActive ?? false,
    showSearchBox: tableConfig.searchActive ?? false,
    tableHeaders,
    tableColumns,
    tableActions: tableActionsDefault,
    filterOptions: [],
    searchByFields: [],

    // ── Dashboard filters
    dashboardFilter,

    // ── Triggers
    triggers,

    // ── Schema
    schemaConfig,
  };
}
