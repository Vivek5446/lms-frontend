export interface UserApproval {
  id: string;
  email: string;
  designation: string;
  role: 'approver' | 'viewer' | 'rejecter' | 'all';
  level: number;
  active: boolean;
  canViewDocument: boolean;
  canDownloadDocument: boolean;
}

export interface NotificationConfig {
  onApproved: { email: boolean; notification: boolean; sms: boolean };
  onRejected: { email: boolean; notification: boolean; sms: boolean };
}

export interface TableColumn {
  id: string;
  label: string;
  key: string;
  active: boolean;
  labelAlign: 'left' | 'center' | 'right';
  rowAlign: 'left' | 'center' | 'right';
  truncate: boolean;
  truncateLabel: string;
  isFile: boolean;
}

export interface TableAction {
  action: string;
  enabled: boolean;
  levels: number[];
}

// export interface TriggerConfig {
//   id: string;
//   type: 'approved' | 'rejected';
//   level: number;
//   isActive: boolean;
//   action: 'url' | 'email';
//   method: string;
//   authType: 'token' | 'credentials';
//   authToken: string;
//   credentials: { key: string; value: string }[];
// }

  // types/config.ts
export interface TriggerConfig {
  id: string;
  type: "approved" | "rejected";
  level: number;
  isActive: boolean;
  action: "url" | "email";
  method: string;

  // 👇 new
  hasAuth: boolean;

  authType: "token" | "credentials";
  authToken: string;
  credentials: { key: string; value: string }[];
}

export type NotificationChannels = {
  email: boolean;
  notification: boolean;
  sms: boolean;
};

export type LevelNotifications = Record<number, NotificationChannels>;

export interface DashboardFilter {
  dateFilters: string[];
  filterKeys: string[];
}

export interface WorkflowConfig {
  workflowName: string;
  flowName: string;
  identifier: string;
  noOfLevels: number;
  documentType: string;
  processName: string;
  processType: string;
  logo: File | null;
  logoPreview: string;
  userApprovals: UserApproval[];
  notifications: {
    onApproved: LevelNotifications;
    onRejected: LevelNotifications;
  };
//   notifications: NotificationConfig;
  flowType: string;
  editableMode: number[];
  onRejectLevel: number | null;
  additionalFormLink: string;
  additionalDocumentLevels: number[];
  fastForwardLevel: number | null;
  bulkApprovalLevels: number[];
  bulkRejectLevels: number[];
  showTable: boolean;
  showPagination: boolean;
  paginationPages: number;
  tableHeaders: { label: string; show: boolean }[];
  showFilter: boolean;
  filterOptions: string[];
  showSearchBox: boolean;
  searchByFields: string[];
  tableActions: TableAction[];
  tableColumns: TableColumn[];
  dashboardFilter: DashboardFilter;
  triggers: TriggerConfig[];
  notifyCreator: boolean;
  notifyFinalCompletion: boolean;
  schemaConfig?: string;
}

const createDefaultLevelNotifications = (levels: number) => {
  const obj: any = {};
  for (let i = 1; i <= levels; i++) {
    obj[i] = { email: false, notification: false, sms: false };
  }
  return obj;
};

export const defaultWorkflowConfig: WorkflowConfig = {
  workflowName: '',
  flowName: '',
  identifier: '',
  noOfLevels: 1,
  documentType: '',
  processName: '',
  processType: '',
  logo: null,
  logoPreview: '',
  userApprovals: [],
  notifications: {
    onApproved: createDefaultLevelNotifications(1),
    onRejected: createDefaultLevelNotifications(1),
  },
//   notifications: {
//     onApproved: { email: false, notification: false, sms: false },
//     onRejected: { email: false, notification: false, sms: false },
//   },
  flowType: '',
  editableMode: [],
  onRejectLevel: null,
  additionalFormLink: '',
  additionalDocumentLevels: [],
  fastForwardLevel: null,
  bulkApprovalLevels: [],
  bulkRejectLevels: [],
  showTable: true,
  showPagination: true,
  paginationPages: 10,
  tableHeaders: [],
  showFilter: false,
  filterOptions: [],
  showSearchBox: false,
  searchByFields: [],
  tableActions: [
    { action: 'delete', enabled: false, levels: [] },
    { action: 'view', enabled: false, levels: [] },
    { action: 'edit', enabled: false, levels: [] },
    { action: 'download_pdf', enabled: false, levels: [] },
    { action: 'download_report', enabled: false, levels: [] },
  ],
  tableColumns: [],
  dashboardFilter: { dateFilters: [], filterKeys: [] },
  triggers: [],
  notifyCreator: true,
  notifyFinalCompletion: true,
  schemaConfig: "",
};

