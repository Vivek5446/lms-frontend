import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";

const COURSE_ASSET_CHUNK_SIZE_BYTES = 3.5 * 1024 * 1024;
const COURSE_UPLOAD_PROGRESS_MAX = 82;

export interface CourseVisibilityConfig {
  type: "private" | "public";
}

export interface CourseAssessmentConfig {
  totalMarks: number | null;
  passingMarks: number | null;
  passingPercentage: number;
}

export interface CourseAssessmentCriteriaInput {
  passingPercentage?: number | null;
}

export interface CourseAssessmentSummary extends CourseAssessmentConfig {
  earnedMarks: number | null;
  scorePercentage: number | null;
  outcome: "passed" | "failed" | "pending" | "not_configured";
}

export interface CourseCertificateSummary {
  enabled: boolean;
  status: "disabled" | "not_eligible" | "eligible" | "issued";
  canIssue: boolean;
  reason: string;
  certificateNo?: string;
  issuedAt?: string | null;
  downloadUrl?: string;
  templateId?: string;
  templateName?: string;
}

export interface EarnedCertificateListItem {
  _id: string;
  courseId: string;
  certificateNo: string;
  certificateName: string;
  courseName: string;
  issuedAt?: string | null;
  status: string;
  downloadUrl?: string;
  templateId?: string;
  templateName?: string;
}

export interface CourseMetrics {
  averageRating: number | null;
  popularityScore: number;
  totalEnrollments: number;
}

export interface CourseInstructor {
  name?: string;
  designation?: string;
  companyName?: string;
  avatarUrl?: string;
}

export interface CourseHighlights {
  learningOutcomes?: string[];
}

export interface CourseCategoryItem {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isMaster?: boolean;
  company?: { _id: string; name: string } | string | null;
  parentCategory?: { _id: string; name: string } | string | null;
  courseCount: number;
  createdAt?: string;
}

export interface CourseLibraryFolderItem {
  _id: string;
  name: string;
  normalizedName: string;
  description?: string;
  owner?: string;
  company?: string | null;
  courseCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseFolderAssignmentItem {
  _id: string;
  course: string;
  folder: string;
  owner?: string;
  company?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseListItem {
  _id: string;
  courseCode?: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  scormFilePath?: string;
  status: string;
  highlights?: CourseHighlights;
  instructor?: CourseInstructor;
  taxonomy?: {
    categories?: string[];
    languages?: string[];
    level?: string;
  };
  progression?: {
    completionWindowDays?: number | null;
    certificateEnabled?: boolean;
    certificateTemplateId?: string | null;
    mandatoryModules?: boolean;
  };
  curriculum: {
    totalModules: number;
    totalSections: number;
  };
  commerce: {
    pricingModel: string;
    amountInRupees: number | null;
    currency?: string;
    accessDurationDays?: number | null;
  };
  company?: {
    _id?: string;
    company_name?: string;
    companyCode?: string;
  } | string | null;
  visibility?: CourseVisibilityConfig;
  assessment?: CourseAssessmentConfig;
  metrics?: CourseMetrics;
  price?: number;
  courseType?: "standard" | "scorm";
  enrollmentCount?: number;
  isBookmarked?: boolean;
  bookmarkId?: string;
  bookmarkedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourseListSummary {
  total: number;
  published: number;
  privateCount: number;
  publicCount: number;
  paidCount: number;
}

export interface CourseAccessScopeSummary {
  _id: string;
  accessLevel: "company" | "department" | "user";
  allowFurtherAssignment: boolean;
  label: string;
  validityStatus?: "active" | "expired" | "expiring_soon";
  validFrom?: string | null;
  validTill?: string | null;
  grantedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    username?: string;
    role?: string;
  } | null;
  company?: {
    _id?: string;
    company_name?: string;
  } | null;
  department?: {
    _id?: string;
    title?: string;
    code?: string;
  } | null;
  grantedAt?: string;
}

export interface AccessibleCourseItem extends CourseListItem {
  description?: {
    text?: string;
    html?: string;
  };
  taxonomy?: {
    categories?: string[];
    languages?: string[];
    level?: string;
  };
  access: {
    canAssign: boolean;
    matchedScopes: CourseAccessScopeSummary[];
  };
  enrollment?: {
    _id: string;
    status: "not_started" | "in_progress" | "completed";
    dueDate?: string | null;
    assignedAt?: string;
    assignedBy?: {
      _id?: string;
      name?: string;
      email?: string;
      username?: string;
      role?: string;
    } | null;
  } | null;
}

export interface AssignedCourseAccessItem {
  _id: string;
  courseId: string;
  courseName: string;
  assignedTo: string;
  assignmentType: "company" | "department" | "user";
  validFrom?: string | null;
  validTill?: string | null;
  status: "active" | "expired" | "expiring_soon";
  allowFurtherAssignment: boolean;
  assignedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    username?: string;
    role?: string;
  } | null;
  company?: {
    _id?: string;
    company_name?: string;
  } | null;
  department?: {
    _id?: string;
    title?: string;
    code?: string;
  } | null;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    username?: string;
    department?: string;
  } | null;
}

export interface MyCourseSourceItem {
  type: "direct" | "batch" | "self";
  batchId?: string | null;
  batchName?: string | null;
  label: string;
  validFrom?: string | null;
  validTill?: string | null;
  dueDate?: string | null;
  assignedAt?: string | null;
  isExpired?: boolean;
  status?: "active" | "expired" | "expiring_soon";
}

export interface MyCourseItem {
  _id?: string;
  courseId: string;
  title: string;
  description?: {
    text?: string;
    html?: string;
  };
  thumbnailUrl?: string;
  curriculum?: {
    totalModules?: number;
    totalSections?: number;
  };
  commerce?: {
    pricingModel?: string;
    amountInRupees?: number | null;
  };
  progress: number;
  sources: MyCourseSourceItem[];
  status: "not_started" | "in_progress" | "completed";
  validTill?: string | null;
  isExpired: boolean;
  visibilityStatus: "active" | "expired" | "expiring_soon";
  taxonomy?: {
    categories?: string[];
    languages?: string[];
    level?: string;
  };
  highlights?: CourseHighlights;
  instructor?: CourseInstructor;
  progression?: {
    completionWindowDays?: number | null;
    certificateEnabled?: boolean;
    certificateTemplateId?: string | null;
    mandatoryModules?: boolean;
  };
  visibility?: CourseVisibilityConfig;
  assessment?: CourseAssessmentConfig;
  assessmentSummary?: CourseAssessmentSummary;
  certificate?: CourseCertificateSummary;
  isBookmarked?: boolean;
  bookmarkId?: string;
  bookmarkedAt?: string;
}

export interface BookmarkedCourseItem extends PublicCourseItem {
  courseId?: string;
  bookmarkId: string;
  bookmarkedAt?: string;
  progress?: number;
  status: string;
}

export interface MyCourseSectionProgressItem {
  sectionId: string;
  title: string;
  progress: number;
  score: number | null;
  attempts: number;
  lessonStatus: string;
  totalTime: string;
  lastAccessed?: string | null;
  contentType?: "scorm" | "video" | "document" | "other";
  completedAt?: string | null;
  currentTime?: number;
  duration?: number;
}

export interface MyCourseModuleProgressItem {
  moduleId: string;
  title: string;
  thumbnailUrl?: string;
  progress: number;
  score: number | null;
  attempts: number;
  lessonStatus: string;
  totalTime: string;
  lastAccessed?: string | null;
  sectionsCompleted: number;
  sectionCount: number;
  sections: MyCourseSectionProgressItem[];
}

export interface MyCourseDetailItem extends CourseListItem {
  courseId?: string;
  description?: {
    text?: string;
    html?: string;
  };
  taxonomy?: {
    categories?: string[];
    languages?: string[];
    level?: string;
  };
  progression?: {
    completionWindowDays?: number | null;
    certificateEnabled?: boolean;
    certificateTemplateId?: string | null;
    mandatoryModules?: boolean;
  };
  highlights?: CourseHighlights;
  instructor?: CourseInstructor;
  sources: MyCourseSourceItem[];
  progress: number;
  validTill?: string | null;
  isExpired: boolean;
  visibilityStatus: "active" | "expired" | "expiring_soon";
  assessmentSummary?: CourseAssessmentSummary;
  certificate?: CourseCertificateSummary;
  progressModules?: MyCourseModuleProgressItem[];
}

export interface PublicCourseItem extends CourseListItem {
  description?: {
    text?: string;
    html?: string;
  };
}

export interface PublicCourseCatalogMeta {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  availableCategories: string[];
  availableLanguages: string[];
}

export interface CourseAssignmentAuditItem {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    username?: string;
    department?: string;
  } | null;
  course?: {
    _id?: string;
    title?: string;
    status?: string;
  } | null;
  source: "direct" | "batch";
  batchId?: string | null;
  batchName?: string | null;
  assignedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    username?: string;
    role?: string;
  } | null;
  validTill?: string | null;
  isExpired: boolean;
  status: "active" | "expired" | "expiring_soon";
  courseStatus?: "not_started" | "in_progress" | "completed";
}

export interface CourseQuizOption {
  optionId: string;
  label: string;
  text: string;
}

export interface CourseQuizQuestion {
  questionId: string;
  sn: number;
  question: string;
  marks: number;
  options: CourseQuizOption[];
}

export interface CourseQuizAttemptAnswer {
  questionId: string;
  question: string;
  options?: Array<{ optionId: string; label: string; text: string }>;
  selectedOptionId: string;
  selectedOptionLabel: string;
  selectedAnswerText: string;
  correctOptionId: string;
  correctOptionLabel: string;
  correctAnswerText: string;
  explanation?: string;
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
}

export interface CourseQuizAttempt {
  _id: string;
  quizId: string;
  quizTitle: string;
  scope: "module" | "final";
  moduleId: string;
  moduleTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  questionCount: number;
  attemptNumber: number;
  passingPercentage?: number;
  isPassed?: boolean;
  startedAt?: string | null;
  submittedAt?: string | null;
  durationSeconds?: number;
  answers: CourseQuizAttemptAnswer[];
}

export interface CourseQuizForLearner {
  quizId: string;
  title: string;
  scope: "module" | "final";
  moduleId: string;
  moduleTitle: string;
  questionCount: number;
  totalMarks: number;
  isUnlocked?: boolean;
  unlockReason?: string;
  unlockThreshold?: number;
  unlockProgress?: number;
  questions: CourseQuizQuestion[];
  attempt?: CourseQuizAttempt | null;
  attemptCount?: number;
  attemptHistory?: Array<{
    _id: string;
    attemptNumber: number;
    score: number;
    maxScore: number;
    percentage: number;
    isPassed: boolean;
    submittedAt?: string | null;
    durationSeconds?: number;
  }>;
}

export interface CourseModuleListItem {
  _id: string;
  moduleId?: string;
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  order: number;
  sectionCount: number;
  studyMaterial?: any[];
  assessments?: {
    quizEnabled?: boolean;
    testEnabled?: boolean;
    quiz?: any;
  };
  sections?: CourseSectionItem[];
}

export interface CourseSectionItem {
  _id: string;
  sectionId?: string;
  moduleId: string;
  order: number;
  title: string;
  description?: string;
  content?: any;
  studyMaterial?: any[];
}

interface CreateCourseInput {
  payload: Record<string, unknown>;
  thumbnailFile?: File | null;
  scormFiles: File[];
  contentFiles: File[];
  studyMaterialFiles: File[];
}

interface ChunkedCourseUpload {
  uploadId: string;
  fileName: string;
  totalChunks: number;
  contentType: string;
  sizeInBytes: number;
}

type ChunkUploadFieldName = "scormChunkUploads" | "contentChunkUploads" | "studyMaterialChunkUploads";

type ChunkedCourseUploadMap = Record<ChunkUploadFieldName, ChunkedCourseUpload[]>;

const multipartRequestConfig = {
  headers: {
    "Content-Type": undefined,
  },
} as const;

function clampProgressValue(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function isCompletedLessonStatus(value: unknown) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return normalizedValue === "completed" || normalizedValue === "passed";
}

function deriveEnrollmentStatusFromLessonStatus(
  lessonStatus: unknown,
  progress: number
): MyCourseItem["status"] {
  const normalizedValue = String(lessonStatus || "").trim().toLowerCase();
  if (isCompletedLessonStatus(normalizedValue)) {
    return "completed";
  }

  if (normalizedValue === "incomplete" || normalizedValue === "failed" || normalizedValue === "browsed") {
    return "in_progress";
  }

  if (progress > 0) return "in_progress";

  return "not_started";
}

function deriveAggregateLessonStatus(statuses: unknown[]) {
  const normalizedStatuses = statuses
    .map((status) => String(status || "").trim().toLowerCase())
    .filter(Boolean);

  if (!normalizedStatuses.length) {
    return "not_attempted";
  }

  if (normalizedStatuses.every((status) => status === "completed" || status === "passed")) {
    return normalizedStatuses.some((status) => status === "passed") ? "passed" : "completed";
  }

  if (
    normalizedStatuses.every((status) => status === "completed" || status === "passed" || status === "failed") &&
    normalizedStatuses.some((status) => status === "failed")
  ) {
    return "failed";
  }

  if (normalizedStatuses.some((status) => status !== "not_attempted")) {
    return "incomplete";
  }

  return "not_attempted";
}

function averageNullableNumbers(values: Array<number | null | undefined>) {
  const finiteValues = values.filter((value): value is number => Number.isFinite(value));
  if (!finiteValues.length) {
    return null;
  }

  const total = finiteValues.reduce((sum, value) => sum + value, 0);
  return Math.round((total / finiteValues.length) * 100) / 100;
}

function parseScormDuration(value: string | null | undefined) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return 0;
  }

  const scorm12Match = normalizedValue.match(/^(\d{1,4}):([0-5]?\d):([0-5]?\d)(?:\.(\d{1,2}))?$/);
  if (scorm12Match) {
    const hours = Number(scorm12Match[1]);
    const minutes = Number(scorm12Match[2]);
    const seconds = Number(scorm12Match[3]);
    const centiseconds = Number((scorm12Match[4] || "").padEnd(2, "0").slice(0, 2) || "0");
    return ((((hours * 60) + minutes) * 60) + seconds) * 100 + centiseconds;
  }

  const scorm2004Match = normalizedValue.toUpperCase().match(
    /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/
  );
  if (!scorm2004Match) {
    return 0;
  }

  const hours = Number(scorm2004Match[1] || 0);
  const minutes = Number(scorm2004Match[2] || 0);
  const seconds = Number(scorm2004Match[3] || 0);
  return Math.round((((hours * 60) + minutes) * 60 + seconds) * 100);
}

function formatScormDuration(totalCentiseconds: number) {
  const safeValue = Math.max(0, Math.floor(totalCentiseconds || 0));
  const hours = Math.floor(safeValue / 360000);
  const remainderAfterHours = safeValue % 360000;
  const minutes = Math.floor(remainderAfterHours / 6000);
  const remainderAfterMinutes = remainderAfterHours % 6000;
  const seconds = Math.floor(remainderAfterMinutes / 100);
  const centiseconds = remainderAfterMinutes % 100;
  const baseValue = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return centiseconds > 0 ? `${baseValue}.${String(centiseconds).padStart(2, "0")}` : baseValue;
}

function normalizeDateValue(value: unknown) {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || null;
}

function recalculateModuleProgress(moduleRecord: MyCourseModuleProgressItem): MyCourseModuleProgressItem {
  const sections = Array.isArray(moduleRecord.sections) ? moduleRecord.sections : [];
  const completedCount = sections.filter((sectionRecord) => {
    return isCompletedLessonStatus(sectionRecord.lessonStatus) || Boolean(sectionRecord.completedAt) || Number(sectionRecord.progress || 0) >= 100;
  }).length;
  const latestAccessValue = sections.reduce((latest, sectionRecord) => {
    const currentValue = sectionRecord.lastAccessed ? new Date(sectionRecord.lastAccessed).getTime() : 0;
    return Math.max(latest, currentValue);
  }, 0);
  const averageProgress = sections.length
    ? Math.round(
        sections.reduce((total, sectionRecord) => total + clampProgressValue(sectionRecord.progress), 0) / sections.length
      )
    : 0;

  return {
    ...moduleRecord,
    progress: averageProgress,
    score: averageNullableNumbers(sections.map((sectionRecord) => sectionRecord.score)),
    attempts: sections.reduce((highest, sectionRecord) => Math.max(highest, Number(sectionRecord.attempts || 0)), 0),
    lessonStatus: deriveAggregateLessonStatus(sections.map((sectionRecord) => sectionRecord.lessonStatus)),
    totalTime: formatScormDuration(
      sections.reduce((total, sectionRecord) => total + parseScormDuration(sectionRecord.totalTime), 0)
    ),
    lastAccessed: latestAccessValue ? new Date(latestAccessValue).toISOString() : null,
    sectionsCompleted: completedCount,
    sectionCount: sections.length,
  };
}

function createClientUploadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function serializeCatalogParams(params: Record<string, unknown>) {
  const normalizedEntries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

  return JSON.stringify(normalizedEntries);
}

function mergeUniquePublicCourses(items: PublicCourseItem[]) {
  const uniqueItems = new Map<string, PublicCourseItem>();

  items.forEach((item) => {
    const courseId = String(item?._id || "").trim();
    if (courseId) {
      uniqueItems.set(courseId, item);
    }
  });

  return Array.from(uniqueItems.values());
}

function getCourseRecordId(course: any) {
  return String(course?._id || course?.courseId || "").trim();
}

class CourseStoreClass {
  courses: CourseListItem[] = [];
  categories: CourseCategoryItem[] = [];
  masterCategories: CourseCategoryItem[] = [];
  courseLibraryFolders: CourseLibraryFolderItem[] = [];
  courseFolderAssignments: CourseFolderAssignmentItem[] = [];
  isCategoriesLoading: boolean = false;
  isCourseFoldersLoading: boolean = false;
  publicCourses: PublicCourseItem[] = [];
  publicCoursesMeta: PublicCourseCatalogMeta = {
    total: 0,
    offset: 0,
    limit: 12,
    hasMore: false,
    availableCategories: [],
    availableLanguages: [],
  };
  accessibleCourses: AccessibleCourseItem[] = [];
  assignedCourseAccesses: AssignedCourseAccessItem[] = [];
  myCourses: MyCourseItem[] = [];
  bookmarkedCourses: BookmarkedCourseItem[] = [];
  myCertificates: EarnedCertificateListItem[] = [];
  courseAssignmentAudit: CourseAssignmentAuditItem[] = [];
  currentCourse: MyCourseDetailItem | null = null;
  modules: CourseModuleListItem[] = [];
  nextModuleCursor: string | null = null;
  hasMoreModules: boolean = false;
  loadingModules: boolean = false;
  sectionsByModule: Record<string, CourseSectionItem[]> = {};
  sectionLoadingByModule: Record<string, boolean> = {};
  sectionLoadedByModule: Record<string, boolean> = {};
  sectionErrorByModule: Record<string, string | null> = {};
  courseQuizzes: CourseQuizForLearner[] = [];
  isLoading: boolean = false;
  isPublicCoursesLoading: boolean = false;
  isPublicCoursesLoadingMore: boolean = false;
  isAccessLoading: boolean = false;
  isAssignedCoursesLoading: boolean = false;
  isMyCoursesLoading: boolean = false;
  isBookmarksLoading: boolean = false;
  isMyCertificatesLoading: boolean = false;
  isMyCourseDetailLoading: boolean = false;
  isCourseQuizzesLoading: boolean = false;
  certificateDownloadCourseId: string | null = null;
  isQuizSubmitting: boolean = false;
  isCourseAssignmentAuditLoading: boolean = false;
  isSubmitting: boolean = false;
  publishingCourseId: string | null = null;
  isAccessSubmitting: boolean = false;
  enrollmentCourseId: string | null = null;
  bookmarkActionCourseIds: string[] = [];
  isAssignmentSubmitting: boolean = false;
  submissionProgress: number = 0;
  submissionStage: string = "";
  submissionDetail: string = "";
  error: string | null = null;
  accessError: string | null = null;
  bookmarksError: string | null = null;
  myCertificatesError: string | null = null;
  draftCourseCode: string = "";
  currentPublicCourseParams: Record<string, unknown> = {};
  private publicCoursesRequestId: number = 0;
  private publicCoursesQueryKey: string = "";
  coursePagination: CourseListPagination = {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  };
  courseSummary: CourseListSummary = {
    total: 0,
    published: 0,
    privateCount: 0,
    publicCount: 0,
    paidCount: 0,
  };

  constructor() {
    makeAutoObservable(this);
  }

  fetchCourses = async (params: Record<string, unknown> = {}) => {
    this.isLoading = true;
    this.error = null;
    try {
      const { data } = await axios.get("/course", { params });
      runInAction(() => {
        this.courses = data.data || [];
        const pagination = data?.meta?.pagination;
        this.coursePagination = pagination
          ? {
              page: Number(pagination.page) || 1,
              limit: Number(pagination.limit) || 8,
              total: Number(pagination.total) || 0,
              totalPages: Number(pagination.totalPages) || 1,
            }
          : {
              page: 1,
              limit: Math.max(1, Number(data?.data?.length || 0) || 1),
              total: Array.isArray(data?.data) ? data.data.length : 0,
              totalPages: 1,
            };
        this.courseSummary = data?.meta?.summary || {
          total: Array.isArray(data?.data) ? data.data.length : 0,
          published: Array.isArray(data?.data)
            ? data.data.filter((course: CourseListItem) => course.status === "published").length
            : 0,
          privateCount: Array.isArray(data?.data)
            ? data.data.filter((course: CourseListItem) => (course.visibility?.type || "private") === "private").length
            : 0,
          publicCount: Array.isArray(data?.data)
            ? data.data.filter((course: CourseListItem) => course.visibility?.type === "public").length
            : 0,
          paidCount: Array.isArray(data?.data)
            ? data.data.filter((course: CourseListItem) => course.commerce?.pricingModel === "paid").length
            : 0,
        };
      });
      return data.data || [];
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.error || "Failed to fetch courses";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  fetchCategories = async () => {
    this.isCategoriesLoading = true;
    try {
      const { data } = await axios.get("/course/categories");
      runInAction(() => {
        this.categories = data.data || [];
      });
      return data.data || [];
    } catch (err: any) {
      console.error("Failed to fetch categories", err);
      return [];
    } finally {
      runInAction(() => {
        this.isCategoriesLoading = false;
      });
    }
  };

  fetchMasterCategories = async () => {
    try {
      const { data } = await axios.get("/course/categories", { params: { type: "master" } });
      runInAction(() => {
        this.masterCategories = data.data || [];
      });
      return data.data || [];
    } catch (err: any) {
      console.error("Failed to fetch master categories", err);
      return [];
    }
  };

  fetchCourseLibraryFolders = async () => {
    this.isCourseFoldersLoading = true;
    try {
      const { data } = await axios.get("/course/folders");
      runInAction(() => {
        this.courseLibraryFolders = data.data || [];
        this.courseFolderAssignments = data.assignments || [];
      });
      return data.data || [];
    } catch (err: any) {
      console.error("Failed to fetch course folders", err);
      return [];
    } finally {
      runInAction(() => {
        this.isCourseFoldersLoading = false;
      });
    }
  };

  createCourseLibraryFolder = async (payload: { name: string; description?: string }) => {
    try {
      const { data } = await axios.post("/course/folders", payload);
      const folder = data.data;
      runInAction(() => {
        if (folder) {
          this.courseLibraryFolders.push(folder);
          this.courseLibraryFolders.sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      return folder;
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to create folder";
      throw new Error(msg);
    }
  };

  updateCourseLibraryFolder = async (id: string, payload: { name?: string; description?: string }) => {
    try {
      const { data } = await axios.put(`/course/folders/${id}`, payload);
      const folder = data.data;
      runInAction(() => {
        if (folder) {
          this.courseLibraryFolders = this.courseLibraryFolders
            .map((item) => (item._id === id ? { ...item, ...folder } : item))
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      return folder;
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to update folder";
      throw new Error(msg);
    }
  };

  deleteCourseLibraryFolder = async (id: string) => {
    try {
      await axios.delete(`/course/folders/${id}`);
      runInAction(() => {
        this.courseLibraryFolders = this.courseLibraryFolders.filter((folder) => folder._id !== id);
        this.courseFolderAssignments = this.courseFolderAssignments.filter((assignment) => assignment.folder !== id);
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to delete folder";
      throw new Error(msg);
    }
  };

  createCategory = async (
    name: string,
    description?: string,
    options?: { isMaster?: boolean; parentCategory?: string }
  ) => {
    try {
      const { data } = await axios.post("/course/categories", {
        name,
        description,
        isMaster: options?.isMaster,
        parentCategory: options?.parentCategory,
      });
      const newCat = data.data;
      runInAction(() => {
        if (newCat) {
          const index = this.categories.findIndex(
            (c) => c._id === newCat._id || c.name.toLowerCase() === newCat.name.toLowerCase()
          );
          if (index >= 0) {
            this.categories[index] = newCat;
          } else {
            this.categories.push(newCat);
          }
          this.categories.sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      return newCat;
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to create category";
      throw new Error(msg);
    }
  };

  updateCategory = async (
    id: string,
    payload: { name?: string; description?: string; parentCategory?: string }
  ) => {
    try {
      const { data } = await axios.put(`/course/categories/${id}`, payload);
      const updatedCat = data.data;
      runInAction(() => {
        if (updatedCat) {
          const index = this.categories.findIndex((c) => c._id === id);
          if (index >= 0) {
            this.categories[index] = { ...this.categories[index], ...updatedCat };
          }
        }
      });
      return updatedCat;
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to update category";
      throw new Error(msg);
    }
  };

  deleteCategory = async (id: string) => {
    try {
      await axios.delete(`/course/categories/${id}`);
      runInAction(() => {
        this.categories = this.categories.filter((c) => c._id !== id);
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to delete category";
      throw new Error(msg);
    }
  };

  fetchCourse = async (id: string, options: { includeCurriculum?: boolean } = {}) => {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
      const normalizedTargetId = String(id || "").trim();
      const currentId = String(this.currentCourse?._id || this.currentCourse?.courseId || "").trim();
      if (normalizedTargetId && currentId !== normalizedTargetId) {
        this.currentCourse = null;
        this.modules = [];
      }
    });
    try {
      const { data } = await axios.get(`/course/${id}`, {
        params: options.includeCurriculum ? { includeCurriculum: true } : undefined,
      });
      runInAction(() => {
        this.currentCourse = data.data ? this.withKnownBookmarkState(data.data) : data.data;
        this.modules = Array.isArray(data.data?.curriculum?.modules) ? data.data.curriculum.modules : [];
        this.nextModuleCursor = null;
        this.hasMoreModules = false;
        this.sectionsByModule = {};
        this.sectionLoadingByModule = {};
        this.sectionLoadedByModule = {};
        this.sectionErrorByModule = {};
      });
      return data.data;
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.error || "Failed to fetch course";
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  fetchCourseModules = async (
    courseId: string,
    options: { reset?: boolean; limit?: number; includeSections?: boolean } = {}
  ) => {
    if (this.loadingModules) {
      return this.modules;
    }

    const shouldReset = options.reset === true;
    this.loadingModules = true;
    try {
      const { data } = await axios.get(`/course/${courseId}/modules`, {
        params: {
          limit: options.limit || 5,
          cursor: shouldReset ? undefined : this.nextModuleCursor || undefined,
          includeSections: options.includeSections === false ? false : undefined,
        },
      });
      const items: CourseModuleListItem[] = data?.data?.items || [];
      runInAction(() => {
        const existingById = new Map(
          (shouldReset ? [] : this.modules).map((moduleRecord) => [
            String(moduleRecord.moduleId || moduleRecord._id),
            moduleRecord,
          ])
        );
        items.forEach((moduleRecord) => {
          const key = String(moduleRecord.moduleId || moduleRecord._id);
          const cachedSections = this.sectionsByModule[key];
          const incomingSections = Array.isArray(moduleRecord.sections)
            ? moduleRecord.sections
            : undefined;
          const sections = cachedSections || incomingSections;

          existingById.set(String(moduleRecord.moduleId || moduleRecord._id), {
            ...moduleRecord,
            ...(sections ? { sections } : {}),
          });
        });
        this.modules = Array.from(existingById.values()).sort((left, right) => {
          const orderDelta = Number(left.order || 0) - Number(right.order || 0);
          return orderDelta || String(left._id).localeCompare(String(right._id));
        });
        this.nextModuleCursor = data?.data?.pagination?.nextCursor || null;
        this.hasMoreModules = Boolean(data?.data?.pagination?.hasMore);
        if (this.currentCourse) {
          this.currentCourse = {
            ...this.currentCourse,
            curriculum: {
              ...(this.currentCourse.curriculum || {}),
              modules: this.modules,
            } as any,
          };
        }
      });
      return this.modules;
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.error || "Failed to fetch course modules";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.loadingModules = false;
      });
    }
  };

  fetchCourseModule = async (courseId: string, moduleId: string) => {
    const { data } = await axios.get(`/course/${courseId}/modules/${moduleId}`);
    const moduleRecord: CourseModuleListItem | null = data?.data || null;
    if (moduleRecord) {
      runInAction(() => {
        const key = String(moduleRecord.moduleId || moduleRecord._id);
        const nextModules = this.modules.filter((entry) => String(entry.moduleId || entry._id) !== key);
        nextModules.push({
          ...moduleRecord,
          sections: this.sectionsByModule[key] || moduleRecord.sections || [],
        });
        this.modules = nextModules.sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
        if (this.currentCourse) {
          this.currentCourse = {
            ...this.currentCourse,
            curriculum: {
              ...(this.currentCourse.curriculum || {}),
              modules: this.modules,
            } as any,
          };
        }
      });
    }
    return moduleRecord;
  };

  fetchCourseSections = async (courseId: string, moduleId: string, options: { force?: boolean } = {}) => {
    if (!options.force && this.sectionLoadedByModule[moduleId]) {
      return this.sectionsByModule[moduleId] || [];
    }
    if (this.sectionLoadingByModule[moduleId]) {
      return this.sectionsByModule[moduleId] || [];
    }

    runInAction(() => {
      this.sectionLoadingByModule = { ...this.sectionLoadingByModule, [moduleId]: true };
      this.sectionErrorByModule = { ...this.sectionErrorByModule, [moduleId]: null };
    });

    try {
      const { data } = await axios.get(`/course/${courseId}/modules/${moduleId}/sections`);
      const sections: CourseSectionItem[] = data?.data || [];
      runInAction(() => {
        this.sectionsByModule = { ...this.sectionsByModule, [moduleId]: sections };
        this.sectionLoadedByModule = { ...this.sectionLoadedByModule, [moduleId]: true };
        this.modules = this.modules.map((moduleRecord) =>
          String(moduleRecord.moduleId || moduleRecord._id) === moduleId
            ? { ...moduleRecord, sections }
            : moduleRecord
        );
        if (this.currentCourse) {
          this.currentCourse = {
            ...this.currentCourse,
            curriculum: {
              ...(this.currentCourse.curriculum || {}),
              modules: this.modules,
            } as any,
          };
        }
      });
      return sections;
    } catch (err: any) {
      const message = err?.response?.data?.error || "Failed to fetch module sections";
      runInAction(() => {
        this.sectionErrorByModule = { ...this.sectionErrorByModule, [moduleId]: message };
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.sectionLoadingByModule = { ...this.sectionLoadingByModule, [moduleId]: false };
      });
    }
  };

  fetchAccessibleCourses = async () => {
    this.isAccessLoading = true;
    this.accessError = null;
    try {
      const { data } = await axios.get("/courses/accessible");
      runInAction(() => {
        this.accessibleCourses = data.data || [];
      });
      return data.data || [];
    } catch (err: any) {
      runInAction(() => {
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch accessible courses";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isAccessLoading = false;
      });
    }
  };

  createCourseAccess = async (payload: {
    courseId: string;
    accessLevel: "company" | "department" | "user";
    companyId?: string;
    departmentId?: string;
    departmentName?: string;
    userIds?: string[];
    passingPercentage?: number | null;
    allowFurtherAssignment?: boolean;
    assignToAllUsers?: boolean;
  }) => {
    this.isAccessSubmitting = true;
    this.accessError = null;
    try {
      const { data } = await axios.post("/course-access", payload);
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to create course access";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isAccessSubmitting = false;
      });
    }
  };

  assignCourse = async (payload: {
    courseId: string;
    assignmentType: "users" | "department";
    userIds?: string[];
    departmentId?: string;
    departmentName?: string;
    dueDate?: string | null;
  }) => {
    this.isAssignmentSubmitting = true;
    this.accessError = null;
    try {
      const { data } = await axios.post("/course-assign", payload);
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to assign course";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isAssignmentSubmitting = false;
      });
    }
  };

  assignCourseByCsv = async (payload: {
    courseId: string;
    file: File;
    dueDate?: string | null;
  }) => {
    this.isAssignmentSubmitting = true;
    this.accessError = null;
    try {
      const formData = new FormData();
      formData.append("courseId", payload.courseId);
      formData.append("assignmentType", "csv");
      formData.append("file", payload.file);

      if (payload.dueDate) {
        formData.append("dueDate", payload.dueDate);
      }

      const { data } = await axios.post("/course-assign", formData, multipartRequestConfig);
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to assign course by CSV";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isAssignmentSubmitting = false;
      });
    }
  };

  fetchAssignedCourseAccesses = async (params: {
    companyId?: string;
    courseId?: string;
    department?: string;
    userId?: string;
    assignmentType?: "company" | "department" | "user";
  } = {}) => {
    this.isAssignedCoursesLoading = true;
    this.accessError = null;
    try {
      const { data } = await axios.get("/courses/assigned", { params });
      runInAction(() => {
        this.assignedCourseAccesses = data.data || [];
      });
      return data.data || [];
    } catch (err: any) {
      runInAction(() => {
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch assigned courses";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isAssignedCoursesLoading = false;
      });
    }
  };

  private setBookmarkActionLoading(courseId: string, loading: boolean) {
    const normalizedCourseId = String(courseId || "").trim();
    if (!normalizedCourseId) {
      return;
    }

    if (loading) {
      if (!this.bookmarkActionCourseIds.includes(normalizedCourseId)) {
        this.bookmarkActionCourseIds = [...this.bookmarkActionCourseIds, normalizedCourseId];
      }
      return;
    }

    this.bookmarkActionCourseIds = this.bookmarkActionCourseIds.filter((id) => id !== normalizedCourseId);
  }

  private applyBookmarkStateToCollections(options: {
    courseId: string;
    isBookmarked: boolean;
    bookmarkId?: string;
    bookmarkedAt?: string;
  }) {
    const normalizedCourseId = String(options.courseId || "").trim();
    if (!normalizedCourseId) {
      return;
    }

    const applyState = <T extends Record<string, any>>(course: T): T => {
      if (getCourseRecordId(course) !== normalizedCourseId) {
        return course;
      }

      return {
        ...course,
        isBookmarked: options.isBookmarked,
        bookmarkId: options.isBookmarked ? options.bookmarkId || (course as any)?.bookmarkId : undefined,
        bookmarkedAt: options.isBookmarked ? options.bookmarkedAt || (course as any)?.bookmarkedAt : undefined,
      };
    };

    this.publicCourses = this.publicCourses.map(applyState);
    this.myCourses = this.myCourses.map(applyState);
    this.accessibleCourses = this.accessibleCourses.map(applyState);

    if (this.currentCourse && getCourseRecordId(this.currentCourse) === normalizedCourseId) {
      this.currentCourse = applyState(this.currentCourse);
    }

    if (!options.isBookmarked) {
      this.bookmarkedCourses = this.bookmarkedCourses.filter(
        (course) => getCourseRecordId(course) !== normalizedCourseId
      );
      return;
    }

    this.bookmarkedCourses = this.bookmarkedCourses.map(applyState);
  }

  private findCourseSnapshot(courseId: string) {
    const normalizedCourseId = String(courseId || "").trim();
    return (
      this.publicCourses.find((course) => getCourseRecordId(course) === normalizedCourseId) ||
      this.myCourses.find((course) => getCourseRecordId(course) === normalizedCourseId) ||
      this.bookmarkedCourses.find((course) => getCourseRecordId(course) === normalizedCourseId) ||
      (this.currentCourse && getCourseRecordId(this.currentCourse) === normalizedCourseId ? this.currentCourse : null)
    );
  }

  private isKnownBookmarkedCourse(courseId: string) {
    const normalizedCourseId = String(courseId || "").trim();
    return Boolean(
      normalizedCourseId &&
      this.bookmarkedCourses.some((course) => getCourseRecordId(course) === normalizedCourseId)
    );
  }

  private withKnownBookmarkState<T extends Record<string, any>>(course: T): T {
    const courseId = getCourseRecordId(course);
    if (!courseId) {
      return course;
    }

    return {
      ...course,
      isBookmarked: Boolean(course?.isBookmarked || this.isKnownBookmarkedCourse(courseId)),
    };
  }

  fetchBookmarks = async () => {
    this.isBookmarksLoading = true;
    this.bookmarksError = null;
    try {
      const { data } = await axios.get("/bookmarks");
      const bookmarks = Array.isArray(data.data) ? data.data : [];
      const bookmarkedIds = new Set(bookmarks.map((course: any) => getCourseRecordId(course)).filter(Boolean));

      runInAction(() => {
        this.bookmarkedCourses = bookmarks;
        this.publicCourses = this.publicCourses.map((course) => ({
          ...course,
          isBookmarked: bookmarkedIds.has(getCourseRecordId(course)),
        }));
        this.myCourses = this.myCourses.map((course) => ({
          ...course,
          isBookmarked: bookmarkedIds.has(getCourseRecordId(course)),
        }));
        if (this.currentCourse) {
          this.currentCourse = {
            ...this.currentCourse,
            isBookmarked: bookmarkedIds.has(getCourseRecordId(this.currentCourse)),
          };
        }
      });

      return bookmarks;
    } catch (err: any) {
      runInAction(() => {
        this.bookmarksError =
          err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch bookmarks";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isBookmarksLoading = false;
      });
    }
  };

  bookmarkCourse = async (courseId: string) => {
    const normalizedCourseId = String(courseId || "").trim();
    if (!normalizedCourseId) {
      return Promise.reject({ message: "Course is required" });
    }

    this.setBookmarkActionLoading(normalizedCourseId, true);
    this.bookmarksError = null;
    try {
      const { data } = await axios.post(`/bookmarks/${normalizedCourseId}`);
      const bookmarkData = data?.data || {};
      runInAction(() => {
        const snapshot = this.findCourseSnapshot(normalizedCourseId);
        if (snapshot && !this.bookmarkedCourses.some((course) => getCourseRecordId(course) === normalizedCourseId)) {
          this.bookmarkedCourses = [
            {
              ...(snapshot as any),
              courseId: normalizedCourseId,
              _id: normalizedCourseId,
              bookmarkId: bookmarkData.bookmarkId,
              isBookmarked: true,
              bookmarkedAt: new Date().toISOString(),
            },
            ...this.bookmarkedCourses,
          ];
        }
        this.applyBookmarkStateToCollections({
          courseId: normalizedCourseId,
          isBookmarked: true,
          bookmarkId: bookmarkData.bookmarkId,
          bookmarkedAt: new Date().toISOString(),
        });
      });
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.bookmarksError =
          err?.response?.data?.message || err?.response?.data?.error || "Unable to bookmark this course";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.setBookmarkActionLoading(normalizedCourseId, false);
      });
    }
  };

  unbookmarkCourse = async (courseId: string) => {
    const normalizedCourseId = String(courseId || "").trim();
    if (!normalizedCourseId) {
      return Promise.reject({ message: "Course is required" });
    }

    this.setBookmarkActionLoading(normalizedCourseId, true);
    this.bookmarksError = null;
    try {
      const { data } = await axios.delete(`/bookmarks/${normalizedCourseId}`);
      runInAction(() => {
        this.applyBookmarkStateToCollections({
          courseId: normalizedCourseId,
          isBookmarked: false,
        });
      });
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.bookmarksError =
          err?.response?.data?.message || err?.response?.data?.error || "Unable to remove this bookmark";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.setBookmarkActionLoading(normalizedCourseId, false);
      });
    }
  };

  toggleBookmark = async (courseId: string, nextState?: boolean) => {
    const snapshot = this.findCourseSnapshot(courseId);
    const shouldBookmark = typeof nextState === "boolean" ? nextState : !Boolean((snapshot as any)?.isBookmarked);
    return shouldBookmark ? this.bookmarkCourse(courseId) : this.unbookmarkCourse(courseId);
  };

  fetchMyCourses = async () => {
    this.isMyCoursesLoading = true;
    this.accessError = null;
    try {
      const { data } = await axios.get("/my-courses");
      runInAction(() => {
        this.myCourses = (data.data || []).map((course: MyCourseItem) => this.withKnownBookmarkState(course));
      });
      return data.data || [];
    } catch (err: any) {
      runInAction(() => {
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch my courses";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isMyCoursesLoading = false;
      });
    }
  };

  enrollInPublishedCourse = async (courseId: string) => {
    const normalizedCourseId = String(courseId || "").trim();
    if (!normalizedCourseId) {
      return Promise.reject({ message: "Course is required" });
    }

    this.enrollmentCourseId = normalizedCourseId;
    this.accessError = null;
    try {
      const { data } = await axios.post(`/courses/${normalizedCourseId}/enroll`);
      await Promise.all([
        this.fetchMyCourses(),
        this.fetchPublicCourses(this.currentPublicCourseParams),
      ]);
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.accessError =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to enroll in this course";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.enrollmentCourseId = null;
      });
    }
  };

  fetchMyCourseDetail = async (courseId: string) => {
    runInAction(() => {
      this.isMyCourseDetailLoading = true;
      this.accessError = null;
      const normalizedTargetId = String(courseId || "").trim();
      const currentId = String(this.currentCourse?._id || this.currentCourse?.courseId || "").trim();
      if (normalizedTargetId && currentId !== normalizedTargetId) {
        this.currentCourse = null;
      }
    });
    try {
      const { data } = await axios.get(`/my-courses/${courseId}`);
      runInAction(() => {
        this.currentCourse = data.data ? this.withKnownBookmarkState(data.data) : null;
      });
      return data.data || null;
    } catch (err: any) {
      runInAction(() => {
        this.currentCourse = null;
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch course details";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isMyCourseDetailLoading = false;
      });
    }
  };

  clearCurrentCourse = () => {
    this.currentCourse = null;
    this.courseQuizzes = [];
  };

  applyCertificateSnapshot = (courseId: string, certificate: CourseCertificateSummary) => {
    const normalizedCourseId = String(courseId || "").trim();
    if (!normalizedCourseId) {
      return;
    }

    this.myCourses = this.myCourses.map((course) =>
      String(course.courseId || "").trim() === normalizedCourseId
        ? {
            ...course,
            certificate,
          }
        : course
    );

    const currentCourseId = String(this.currentCourse?._id || this.currentCourse?.courseId || "").trim();
    if (this.currentCourse && currentCourseId === normalizedCourseId) {
      this.currentCourse = {
        ...this.currentCourse,
        certificate,
      };
    }

    if (certificate.status === "issued") {
      this.myCertificates = this.myCertificates.map((issuedCertificate) =>
        String(issuedCertificate.courseId || "").trim() === normalizedCourseId
          ? {
              ...issuedCertificate,
              certificateNo: certificate.certificateNo || issuedCertificate.certificateNo,
              issuedAt: certificate.issuedAt ?? issuedCertificate.issuedAt ?? null,
              status: certificate.status,
              downloadUrl: certificate.downloadUrl || issuedCertificate.downloadUrl,
              templateId: certificate.templateId || issuedCertificate.templateId,
              templateName: certificate.templateName || issuedCertificate.templateName,
              certificateName:
                certificate.templateName || issuedCertificate.certificateName || "Certificate of Completion",
            }
          : issuedCertificate
      );
    }
  };

  private buildIssuedCertificateSummary = (
    certificate: Pick<
      EarnedCertificateListItem,
      "certificateNo" | "issuedAt" | "downloadUrl" | "templateId" | "templateName"
    >
  ): CourseCertificateSummary => ({
    enabled: true,
    status: "issued",
    canIssue: false,
    reason: "Certificate issued",
    certificateNo: certificate.certificateNo,
    issuedAt: certificate.issuedAt ?? null,
    downloadUrl: certificate.downloadUrl,
    templateId: certificate.templateId,
    templateName: certificate.templateName,
  });

  private syncIssuedCertificatesToCourses = (certificates: EarnedCertificateListItem[]) => {
    const issuedCertificatesByCourseId = new Map(
      certificates.map((certificate) => [String(certificate.courseId || "").trim(), certificate])
    );

    this.myCourses = this.myCourses.map((course) => {
      const matchedCertificate = issuedCertificatesByCourseId.get(String(course.courseId || "").trim());
      if (!matchedCertificate) {
        return course;
      }

      return {
        ...course,
        certificate: this.buildIssuedCertificateSummary(matchedCertificate),
      };
    });

    const currentCourseId = String(this.currentCourse?._id || this.currentCourse?.courseId || "").trim();
    const currentCourseCertificate = issuedCertificatesByCourseId.get(currentCourseId);
    if (this.currentCourse && currentCourseCertificate) {
      this.currentCourse = {
        ...this.currentCourse,
        certificate: this.buildIssuedCertificateSummary(currentCourseCertificate),
      };
    }
  };

  fetchMyCertificates = async () => {
    runInAction(() => {
      this.isMyCertificatesLoading = true;
      this.myCertificatesError = null;
    });

    try {
      const { data } = await axios.get("/certificates/my");
      const certificates = Array.isArray(data?.data) ? data.data : [];

      runInAction(() => {
        this.myCertificates = certificates;
        this.syncIssuedCertificatesToCourses(certificates);
      });

      return certificates;
    } catch (err: any) {
      runInAction(() => {
        this.myCertificatesError =
          err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch certificates";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isMyCertificatesLoading = false;
      });
    }
  };

  fetchMyCertificate = async (courseId: string) => {
    try {
      const { data } = await axios.get(`/certificates/my/${courseId}`);
      const certificate = data?.data || null;
      if (certificate) {
        runInAction(() => {
          this.applyCertificateSnapshot(courseId, certificate);
        });
      }
      return certificate;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  issueMyCertificate = async (courseId: string) => {
    try {
      const { data } = await axios.post(`/certificates/my/${courseId}/issue`);
      const certificate = data?.data || null;
      if (certificate) {
        runInAction(() => {
          this.applyCertificateSnapshot(courseId, certificate);
        });
      }
      return certificate;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  parseCertificateDownloadError = async (err: any) => {
    const responseData = err?.response?.data;
    if (responseData instanceof Blob) {
      const text = await responseData.text().catch(() => "");
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return parsed?.message || parsed?.error || text;
        } catch {
          return text;
        }
      }
    }

    return responseData?.message || responseData?.error || err?.message || "Please try again.";
  };

  downloadMyCertificate = async (courseId: string) => {
    this.certificateDownloadCourseId = courseId;
    try {
      const response = await axios.get(`/certificates/my/${courseId}/download`, {
        responseType: "blob",
      });
      const disposition = response.headers?.["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const fileName = match?.[1] || "certificate.pdf";
      const blob = new Blob([response.data], {
        type: response.data?.type || "application/pdf",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      await this.fetchMyCertificate(courseId).catch(() => undefined);
      await this.fetchMyCertificates().catch(() => undefined);
      return true;
    } catch (err: any) {
      return Promise.reject(new Error(await this.parseCertificateDownloadError(err)));
    } finally {
      runInAction(() => {
        this.certificateDownloadCourseId = null;
      });
    }
  };

  clearCourseQuizzes = () => {
    this.courseQuizzes = [];
  };

  previewQuizExcel = async (file: File) => {
    const formData = new FormData();
    formData.append("quizExcel", file);

    try {
      const { data } = await axios.post("/course/quiz/preview-excel", formData, multipartRequestConfig);
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  fetchCourseQuizzes = async (courseId: string) => {
    this.isCourseQuizzesLoading = true;
    try {
      const { data } = await axios.get(`/course/${courseId}/quizzes`);
      runInAction(() => {
        this.courseQuizzes = data.data || [];
      });
      return data.data || [];
    } catch (err: any) {
      runInAction(() => {
        this.courseQuizzes = [];
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isCourseQuizzesLoading = false;
      });
    }
  };

  submitCourseQuiz = async (
    courseId: string,
    quizId: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>,
    metadata?: { submissionId: string; startedAt: string; durationSeconds: number },
  ) => {
    this.isQuizSubmitting = true;
    try {
      const { data } = await axios.post(`/course/${courseId}/quizzes/${quizId}/submit`, {
        answers,
        ...(metadata || {}),
      });
      await this.fetchCourseQuizzes(courseId).catch(() => undefined);
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isQuizSubmitting = false;
      });
    }
  };

  applyRealtimeSectionProgressUpdate = (options: {
    courseId: string;
    moduleId: string;
    sectionId: string;
    data: any;
  }) => {
    const normalizedCourseId = String(options.courseId || "").trim();
    if (!normalizedCourseId) {
      return;
    }

    const sectionProgress = options.data?.sectionProgress || options.data || null;
    const courseProgress = options.data?.courseProgress || sectionProgress?.courseProgress || null;

    runInAction(() => {
      let derivedCourseProgress = courseProgress ? clampProgressValue(courseProgress.progress) : 0;
      let derivedCourseStatus = courseProgress
        ? deriveEnrollmentStatusFromLessonStatus(courseProgress.lessonStatus, derivedCourseProgress)
        : "not_started";

      const currentCourseId = String(this.currentCourse?._id || this.currentCourse?.courseId || "").trim();
      if (this.currentCourse && currentCourseId === normalizedCourseId) {
        const normalizedModuleId = String(options.moduleId || "").trim();
        const normalizedSectionId = String(options.sectionId || "").trim();
        const visibleModule = this.modules.find((moduleRecord) =>
          String(moduleRecord.moduleId || moduleRecord._id || "").trim() === normalizedModuleId
        );
        const visibleSection = (this.sectionsByModule[normalizedModuleId] || []).find((sectionRecord) =>
          String(sectionRecord.sectionId || sectionRecord._id || "").trim() === normalizedSectionId
        );
        const existingProgressModules = Array.isArray(this.currentCourse.progressModules)
          ? this.currentCourse.progressModules
          : [];
        let didPatchSection = false;

        const buildSectionProgress = (
          sectionRecord?: Partial<MyCourseSectionProgressItem> | null
        ): MyCourseSectionProgressItem => ({
          sectionId: normalizedSectionId,
          title: String(sectionRecord?.title || visibleSection?.title || sectionProgress?.sectionTitle || "Section"),
          progress: clampProgressValue(sectionProgress?.progress ?? sectionRecord?.progress),
          score: sectionProgress?.score ?? sectionRecord?.score ?? null,
          attempts: Number(sectionProgress?.attempts ?? sectionRecord?.attempts ?? 0),
          lessonStatus: String(sectionProgress?.lessonStatus || sectionRecord?.lessonStatus || "not_attempted"),
          totalTime: String(sectionProgress?.totalTime || sectionRecord?.totalTime || "00:00:00"),
          lastAccessed: Object.prototype.hasOwnProperty.call(sectionProgress || {}, "lastAccessed")
            ? normalizeDateValue(sectionProgress?.lastAccessed)
            : sectionRecord?.lastAccessed ?? null,
          contentType: sectionProgress?.contentType || sectionRecord?.contentType || "other",
          completedAt: Object.prototype.hasOwnProperty.call(sectionProgress || {}, "completedAt")
            ? normalizeDateValue(sectionProgress?.completedAt)
            : sectionRecord?.completedAt ?? null,
          currentTime: Number(sectionProgress?.currentTime ?? sectionRecord?.currentTime ?? 0),
          duration: Number(sectionProgress?.duration ?? sectionRecord?.duration ?? 0),
        });

        let nextModules = existingProgressModules.map((moduleRecord) => {
          if (String(moduleRecord.moduleId || "").trim() !== normalizedModuleId) {
            return moduleRecord;
          }

          let hasSection = false;
          const nextSections = (moduleRecord.sections || []).map((sectionRecord) => {
            if (String(sectionRecord.sectionId || "").trim() !== normalizedSectionId) {
              return sectionRecord;
            }

            hasSection = true;
            didPatchSection = true;
            return buildSectionProgress(sectionRecord);
          });

          if (!hasSection) {
            didPatchSection = true;
          }

          return recalculateModuleProgress({
            ...moduleRecord,
            sections: hasSection ? nextSections : [...nextSections, buildSectionProgress()],
          });
        });

        if (!nextModules.some((moduleRecord) => String(moduleRecord.moduleId || "").trim() === normalizedModuleId)) {
          nextModules = [
            ...nextModules,
            recalculateModuleProgress({
              moduleId: normalizedModuleId,
              title: String(visibleModule?.title || sectionProgress?.moduleTitle || "Module"),
              thumbnailUrl: String(visibleModule?.thumbnailUrl || sectionProgress?.moduleThumbnailUrl || ""),
              progress: 0,
              score: null,
              attempts: 0,
              lessonStatus: "not_attempted",
              totalTime: "00:00:00",
              lastAccessed: null,
              sectionsCompleted: 0,
              sectionCount: 1,
              sections: [buildSectionProgress()],
            }),
          ];
          didPatchSection = true;
        }

        const allSections = nextModules.flatMap((moduleRecord) => moduleRecord.sections || []);

        if (!courseProgress) {
          derivedCourseProgress = allSections.length
            ? Math.round(
                allSections.reduce((total, sectionRecord) => total + clampProgressValue(sectionRecord.progress), 0) /
                  allSections.length
              )
            : 0;
          derivedCourseStatus = deriveEnrollmentStatusFromLessonStatus(
            deriveAggregateLessonStatus(nextModules.map((moduleRecord) => moduleRecord.lessonStatus)),
            derivedCourseProgress
          );
        }

        this.currentCourse = {
          ...this.currentCourse,
          progressModules: nextModules,
          progress: courseProgress ? clampProgressValue(courseProgress.progress) : derivedCourseProgress,
        };

        if (!didPatchSection && courseProgress) {
          this.currentCourse.progress = clampProgressValue(courseProgress.progress);
        }
      }

      this.myCourses = this.myCourses.map((courseRecord) => {
        if (courseRecord.courseId !== normalizedCourseId) {
          return courseRecord;
        }

        const nextProgress = courseProgress ? clampProgressValue(courseProgress.progress) : clampProgressValue(derivedCourseProgress);
        const nextStatus = courseProgress
          ? deriveEnrollmentStatusFromLessonStatus(courseProgress.lessonStatus, nextProgress)
          : derivedCourseStatus;

        return {
          ...courseRecord,
          progress: nextProgress,
          status: nextStatus,
        };
      });
    });
  };

  updateSectionProgress = async (payload: {
    courseId: string;
    moduleId: string;
    sectionId: string;
    status: "in_progress" | "completed";
    lessonLocation?: string;
    currentTime?: number;
    duration?: number;
    progress?: number;
    contentType?: string;
    startOver?: boolean;
  }) => {
    try {
      const { data } = await axios.post("/scorm/section-progress", payload);
      return data?.data || null;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  fetchPublicCourses = async (
    params: Record<string, unknown> = {},
    options: { append?: boolean } = {}
  ) => {
    const append = options.append === true;
    const nextLimit = Number(params.limit || this.publicCoursesMeta.limit || 12) || 12;
    const nextOffset = append
      ? Number(params.offset ?? this.publicCourses.length)
      : Number(params.offset || 0);
    const normalizedParams = {
      ...params,
      limit: nextLimit,
      offset: nextOffset,
    };
    const queryParams = {
      ...normalizedParams,
    };
    delete queryParams.offset;
    delete queryParams.limit;

    const nextQueryKey = serializeCatalogParams(queryParams);
    if (append) {
      if (
        this.isPublicCoursesLoading ||
        this.isPublicCoursesLoadingMore ||
        !this.publicCoursesMeta.hasMore ||
        nextQueryKey !== this.publicCoursesQueryKey
      ) {
        return this.publicCourses;
      }
    }

    const requestId = this.publicCoursesRequestId + 1;
    this.publicCoursesRequestId = requestId;

    runInAction(() => {
      if (append) {
        this.isPublicCoursesLoadingMore = true;
      } else {
        this.isPublicCoursesLoading = true;
      }
      this.error = null;
    });

    try {
      const { data } = await axios.get("/course/public", { params: normalizedParams });
      if (requestId !== this.publicCoursesRequestId) {
        return data.data || [];
      }

      const incomingCourses = Array.isArray(data.data) ? data.data : [];
      const meta = data.meta || {};
      runInAction(() => {
        this.publicCourses = append
          ? mergeUniquePublicCourses([...this.publicCourses, ...incomingCourses])
          : mergeUniquePublicCourses(incomingCourses);
        this.publicCoursesMeta = {
          total: Number(meta.total || 0),
          offset: Number(meta.offset || nextOffset),
          limit: Number(meta.limit || nextLimit),
          hasMore: Boolean(meta.hasMore),
          availableCategories: Array.isArray(meta.availableCategories) ? meta.availableCategories : [],
          availableLanguages: Array.isArray(meta.availableLanguages) ? meta.availableLanguages : [],
        };
        this.currentPublicCourseParams = queryParams;
        this.publicCoursesQueryKey = nextQueryKey;
      });
      return incomingCourses;
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.error || "Failed to fetch public courses";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      if (requestId === this.publicCoursesRequestId) {
        runInAction(() => {
          this.isPublicCoursesLoading = false;
          this.isPublicCoursesLoadingMore = false;
        });
      }
    }
  };

  loadMorePublicCourses = async () => {
    if (
      this.isPublicCoursesLoading ||
      this.isPublicCoursesLoadingMore ||
      !this.publicCoursesMeta.hasMore
    ) {
      return this.publicCourses;
    }

    return this.fetchPublicCourses(
      {
        ...this.currentPublicCourseParams,
        limit: this.publicCoursesMeta.limit || 12,
        offset: this.publicCourses.length,
      },
      { append: true }
    );
  };

  fetchSectionProgress = async (params: {
    courseId: string;
    moduleId: string;
    sectionId: string;
  }) => {
    try {
      const { data } = await axios.get("/scorm/progress", { params });
      return data?.data || null;
    } catch (err: any) {
      return null;
    }
  };

  fetchCourseAssignmentAudit = async (params: {
    courseId?: string;
    userId?: string;
    companyId?: string;
  } = {}) => {
    this.isCourseAssignmentAuditLoading = true;
    this.accessError = null;
    try {
      const { data } = await axios.get("/course-assignments", { params });
      runInAction(() => {
        this.courseAssignmentAudit = data.data || [];
      });
      return data.data || [];
    } catch (err: any) {
      runInAction(() => {
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch course assignment audit";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isCourseAssignmentAuditLoading = false;
      });
    }
  };

  assignCourseAccess = async (payload: {
    courseId: string;
    assignmentType: "company" | "department" | "users";
    companyId?: string;
    departmentId?: string;
    departmentName?: string;
    userIds?: string[];
    validFrom?: string | null;
    validTill?: string | null;
    allowFurtherAssignment?: boolean;
  }) => {
    this.isAssignmentSubmitting = true;
    this.accessError = null;
    try {
      const { data } = await axios.post("/course-assign", payload);
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to save course assignment";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isAssignmentSubmitting = false;
      });
    }
  };

  assignMultipleCourses = async (payload: {
    courseIds: string[];
    assignmentType: "company" | "department" | "users" | "csv";
    companyId?: string;
    departmentId?: string;
    departmentName?: string;
    userIds?: string[];
    validFrom?: string | null;
    validTill?: string | null;
    dueDate?: string | null;
    file?: File | null;
    assessmentCriteriaByCourse?: Record<string, CourseAssessmentCriteriaInput>;
    allowFurtherAssignment?: boolean;
  }) => {
    this.isAssignmentSubmitting = true;
    this.accessError = null;
    try {
      const hasFile = Boolean(payload.file);
      const body = hasFile ? new FormData() : ({} as any);

      const appendValue = (key: string, value: any) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        if (hasFile) {
          body.append(
            key,
            Array.isArray(value) || (typeof value === "object" && value !== null)
              ? JSON.stringify(value)
              : String(value)
          );
          return;
        }

        body[key] = value;
      };

      appendValue("courseIds", payload.courseIds);
      appendValue("assignmentType", payload.assignmentType);
      appendValue("companyId", payload.companyId);
      appendValue("departmentId", payload.departmentId);
      appendValue("departmentName", payload.departmentName);
      appendValue("userIds", payload.userIds || []);
      appendValue("validFrom", payload.validFrom);
      appendValue("validTill", payload.validTill);
      appendValue("dueDate", payload.dueDate);
      appendValue("assessmentCriteriaByCourse", payload.assessmentCriteriaByCourse);
      appendValue("allowFurtherAssignment", payload.allowFurtherAssignment);

      if (hasFile && payload.file) {
        body.append("file", payload.file);
      }

      const { data } = await axios.post(
        "/course-assign",
        body,
        hasFile ? multipartRequestConfig : undefined
      );
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.accessError = err?.response?.data?.message || err?.response?.data?.error || "Failed to assign courses";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isAssignmentSubmitting = false;
      });
    }
  };

  resetSubmissionState = () => {
    this.submissionProgress = 0;
    this.submissionStage = "";
    this.submissionDetail = "";
  };

  private uploadCourseFilesInChunks = async (
    input: Pick<CreateCourseInput, "scormFiles" | "contentFiles" | "studyMaterialFiles">
  ) => {
    const uploadGroups: Array<{
      key: ChunkUploadFieldName;
      files: File[];
      stageLabel: string;
      assetLabel: string;
    }> = [
      {
        key: "scormChunkUploads",
        files: input.scormFiles,
        stageLabel: "Uploading SCORM files",
        assetLabel: "SCORM package",
      },
      {
        key: "contentChunkUploads",
        files: input.contentFiles,
        stageLabel: "Uploading lesson media",
        assetLabel: "lesson media",
      },
      {
        key: "studyMaterialChunkUploads",
        files: input.studyMaterialFiles,
        stageLabel: "Uploading study materials",
        assetLabel: "study material",
      },
    ];
    const uploads: ChunkedCourseUploadMap = {
      scormChunkUploads: [],
      contentChunkUploads: [],
      studyMaterialChunkUploads: [],
    };
    const totalBytes = uploadGroups.reduce(
      (sum, group) => sum + group.files.reduce((fileSum, file) => fileSum + file.size, 0),
      0
    );
    let uploadedBytes = 0;

    if (totalBytes === 0) {
      return uploads;
    }

    for (const group of uploadGroups) {
      for (const file of group.files) {
        const uploadId = createClientUploadId();
        const totalChunks = Math.max(1, Math.ceil(file.size / COURSE_ASSET_CHUNK_SIZE_BYTES));

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
          const start = chunkIndex * COURSE_ASSET_CHUNK_SIZE_BYTES;
          const end = Math.min(file.size, start + COURSE_ASSET_CHUNK_SIZE_BYTES);
          const chunk = file.slice(start, end);
          const chunkFormData = new FormData();

          chunkFormData.append("uploadId", uploadId);
          chunkFormData.append("chunkIndex", String(chunkIndex));
          chunkFormData.append("totalChunks", String(totalChunks));
          chunkFormData.append("fileName", file.name);
          chunkFormData.append("chunk", chunk, `${file.name}.part-${chunkIndex}`);

          await axios.post("/course/upload-chunk", chunkFormData, multipartRequestConfig);

          uploadedBytes += chunk.size;
          const uploadRatio = uploadedBytes / totalBytes;
          const progress = Math.min(
            COURSE_UPLOAD_PROGRESS_MAX,
            Math.max(8, Math.round(uploadRatio * COURSE_UPLOAD_PROGRESS_MAX))
          );

          runInAction(() => {
            this.submissionProgress = progress;
            this.submissionStage = group.stageLabel;
            this.submissionDetail = `${Math.round(uploadRatio * 100)}% complete. Uploading ${group.assetLabel}: ${file.name}`;
          });
        }

        uploads[group.key].push({
          uploadId,
          fileName: file.name,
          totalChunks,
          contentType: file.type || "application/octet-stream",
          sizeInBytes: file.size,
        });
      }
    }

    return uploads;
  };

  previewAssignmentUsers = async (payload: {
    file: File;
    companyId?: string;
  }) => {
    this.isAssignmentSubmitting = true;
    this.accessError = null;
    try {
      const formData = new FormData();
      formData.append("file", payload.file);
      if (payload.companyId) {
        formData.append("companyId", payload.companyId);
      }

      const { data } = await axios.post("/course-assign/preview", formData, multipartRequestConfig);
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.accessError =
          err?.response?.data?.message || err?.response?.data?.error || "Failed to preview uploaded users";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isAssignmentSubmitting = false;
      });
    }
  };

  fetchNextCourseCode = async () => {
    try {
      const { data } = await axios.get("/course/next-course-code");
      runInAction(() => {
        this.draftCourseCode = data?.data?.courseCode || "";
      });
      return data?.data?.courseCode || "";
    } catch (err: any) {
      runInAction(() => {
        this.draftCourseCode = "";
      });
      return Promise.reject(err?.response?.data || err);
    }
  };

  createCourse = async (
    input: CreateCourseInput,
    options?: {
      action: "draft" | "publish";
      fileCount?: number;
    }
  ) => {
    this.isSubmitting = true;
    this.submissionProgress = 4;
    this.submissionStage = options?.action === "publish" ? "Publishing course" : "Saving draft";
    this.submissionDetail =
      (options?.fileCount || 0) > 0
        ? `Uploading ${options?.fileCount} file${options?.fileCount === 1 ? "" : "s"} and preparing your course assets.`
        : "Saving your course details.";
    this.error = null;

    let uploadCompleted = false;
    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(input.payload));
      const chunkUploads = await this.uploadCourseFilesInChunks(input);
      const hasChunkedUploads = Object.values(chunkUploads).some((uploads) => uploads.length > 0);

      if (input.thumbnailFile) {
        formData.append("thumbnail", input.thumbnailFile);
      }

      if (chunkUploads.scormChunkUploads.length > 0) {
        formData.append("scormChunkUploads", JSON.stringify(chunkUploads.scormChunkUploads));
      }

      if (chunkUploads.contentChunkUploads.length > 0) {
        formData.append("contentChunkUploads", JSON.stringify(chunkUploads.contentChunkUploads));
      }

      if (chunkUploads.studyMaterialChunkUploads.length > 0) {
        formData.append("studyMaterialChunkUploads", JSON.stringify(chunkUploads.studyMaterialChunkUploads));
      }

      if (hasChunkedUploads) {
        runInAction(() => {
          this.submissionProgress = 86;
          this.submissionStage = "Creating course";
          this.submissionDetail = "Finalizing uploaded assets, extracting SCORM packages, and saving the course.";
        });
      }

      const { data } = await axios.post("/course/create", formData, {
        ...multipartRequestConfig,
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            runInAction(() => {
              this.submissionStage = hasChunkedUploads ? "Creating course" : "Uploading course files";
              this.submissionDetail = hasChunkedUploads
                ? "Finishing the course setup on the server..."
                : "Sending your course thumbnail and details to the server...";
            });
            return;
          }

          const ratio = progressEvent.loaded / progressEvent.total;
          const progressFloor = hasChunkedUploads ? 86 : 8;
          const progressCeiling = hasChunkedUploads ? 94 : 88;
          const progress = Math.min(
            progressCeiling,
            Math.max(progressFloor, Math.round(progressFloor + ratio * (progressCeiling - progressFloor)))
          );
          uploadCompleted = ratio >= 1;

          runInAction(() => {
            this.submissionProgress = progress;
            this.submissionStage = uploadCompleted ? "Processing course assets" : "Uploading files";
            this.submissionDetail = uploadCompleted
              ? "Saving uploaded assets and creating the course record..."
              : hasChunkedUploads
                ? "Sending the final course request..."
                : `Uploaded ${Math.round(ratio * 100)}% of your course files.`;
          });
        },
      });
      runInAction(() => {
        this.submissionProgress = 100;
        this.submissionStage = options?.action === "publish" ? "Course published" : "Draft saved";
        this.submissionDetail = "Everything is ready.";
        this.courses.unshift(data.data);
      });
      return data.data;
    } catch (err: any) {
      runInAction(() => {
        this.submissionStage = "Submission failed";
        this.submissionDetail = "We couldn't finish creating the course. Please try again.";
        this.error = err?.response?.data?.error || "Failed to create course";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  };

  updateCourse = async (
    id: string,
    input: CreateCourseInput,
    options?: {
      action: "draft" | "publish";
      fileCount?: number;
    }
  ) => {
    this.isSubmitting = true;
    this.submissionProgress = 4;
    this.submissionStage = options?.action === "publish" ? "Publishing updates" : "Saving draft updates";
    this.submissionDetail =
      (options?.fileCount || 0) > 0
        ? `Uploading ${options?.fileCount} replacement file${options?.fileCount === 1 ? "" : "s"} and preparing course assets.`
        : "Saving updated course details.";
    this.error = null;

    let uploadCompleted = false;
    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(input.payload));
      const chunkUploads = await this.uploadCourseFilesInChunks(input);
      const hasChunkedUploads = Object.values(chunkUploads).some((uploads) => uploads.length > 0);

      if (input.thumbnailFile) {
        formData.append("thumbnail", input.thumbnailFile);
      }

      if (chunkUploads.scormChunkUploads.length > 0) {
        formData.append("scormChunkUploads", JSON.stringify(chunkUploads.scormChunkUploads));
      }

      if (chunkUploads.contentChunkUploads.length > 0) {
        formData.append("contentChunkUploads", JSON.stringify(chunkUploads.contentChunkUploads));
      }

      if (chunkUploads.studyMaterialChunkUploads.length > 0) {
        formData.append("studyMaterialChunkUploads", JSON.stringify(chunkUploads.studyMaterialChunkUploads));
      }

      if (hasChunkedUploads) {
        runInAction(() => {
          this.submissionProgress = 86;
          this.submissionStage = "Updating course";
          this.submissionDetail = "Finalizing uploaded assets, extracting SCORM packages, and saving the updates.";
        });
      }

      const { data } = await axios.put(`/course/${id}`, formData, {
        ...multipartRequestConfig,
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            runInAction(() => {
              this.submissionStage = hasChunkedUploads ? "Updating course" : "Uploading course files";
              this.submissionDetail = hasChunkedUploads
                ? "Finishing the course update on the server..."
                : "Sending your updated course details to the server...";
            });
            return;
          }

          const ratio = progressEvent.loaded / progressEvent.total;
          const progressFloor = hasChunkedUploads ? 86 : 8;
          const progressCeiling = hasChunkedUploads ? 94 : 88;
          const progress = Math.min(
            progressCeiling,
            Math.max(progressFloor, Math.round(progressFloor + ratio * (progressCeiling - progressFloor)))
          );
          uploadCompleted = ratio >= 1;

          runInAction(() => {
            this.submissionProgress = progress;
            this.submissionStage = uploadCompleted ? "Processing course assets" : "Uploading files";
            this.submissionDetail = uploadCompleted
              ? "Saving uploaded assets and updating the course record..."
              : hasChunkedUploads
                ? "Sending the final course update..."
                : `Uploaded ${Math.round(ratio * 100)}% of your course files.`;
          });
        },
      });

      runInAction(() => {
        this.submissionProgress = 100;
        this.submissionStage = options?.action === "publish" ? "Course published" : "Draft updated";
        this.submissionDetail = "Everything is ready.";
        this.courses = this.courses.map((course) => (course._id === id ? data.data : course));
        this.currentCourse = data.data;
      });
      return data.data;
    } catch (err: any) {
      runInAction(() => {
        this.submissionStage = "Update failed";
        this.submissionDetail = "We couldn't finish updating the course. Please try again.";
        this.error = err?.response?.data?.error || "Failed to update course";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  };

  addSingleModule = async (courseId: string, formData: FormData, onProgress?: (progress: number) => void) => {
    this.isSubmitting = true;
    this.submissionProgress = 10;
    this.submissionStage = "Uploading module content";
    this.error = null;

    try {
      const { data } = await axios.post(`/course/${courseId}/modules/single`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress?.(progress);
            runInAction(() => {
              this.submissionProgress = Math.min(95, Math.max(10, progress));
              this.submissionStage = progress >= 100 ? "Processing asset & saving module" : "Uploading content file";
            });
          }
        },
      });

      runInAction(() => {
        this.submissionProgress = 100;
        this.submissionStage = "Module saved";
      });

      return data.data;
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.error || err?.message || "Failed to save module";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  };

  updateModuleFreePreview = async (courseId: string, moduleId: string, isFreePreview: boolean) => {
    try {
      const { data } = await axios.put(`/course/${courseId}/modules/${moduleId}`, {
        isFreePreview,
      });
      return data.data;
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.error || "Failed to update module preview setting";
      });
      throw err;
    }
  };

  deleteCourse = async (id: string) => {
    try {
      await axios.delete(`/course/${id}`);
      runInAction(() => {
        this.courses = this.courses.filter((c) => c._id !== id);
      });
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  publishCourse = async (id: string) => {
    this.publishingCourseId = id;
    try {
      const { data } = await axios.post(`/course/${id}/publish`);
      runInAction(() => {
        this.courses = this.courses.map((course) =>
          course._id === id ? { ...course, ...(data?.data || {}), status: "published" } : course
        );
      });
      return data?.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.publishingCourseId = null;
      });
    }
  };

  deleteCourseModule = async (courseId: string, moduleId: string) => {
    try {
      await axios.delete(`/course/${courseId}/modules/${moduleId}`);
      runInAction(() => {
        this.modules = this.modules.filter((m) => m._id !== moduleId);
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to delete module";
      return Promise.reject(new Error(msg));
    }
  };
}

export const courseStore = new CourseStoreClass();
