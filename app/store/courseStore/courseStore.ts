import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";

const COURSE_ASSET_CHUNK_SIZE_BYTES = 3.5 * 1024 * 1024;
const COURSE_UPLOAD_PROGRESS_MAX = 82;

export interface CourseListItem {
  _id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  scormFilePath?: string;
  status: string;
  curriculum: {
    totalModules: number;
    totalSections: number;
  };
  commerce: {
    pricingModel: string;
    amountInRupees: number | null;
  };
  createdAt: string;
  updatedAt: string;
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
  type: "direct" | "batch";
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
    dripEnabled?: boolean;
    certificateEnabled?: boolean;
    mandatoryModules?: boolean;
  };
  sources: MyCourseSourceItem[];
  progress: number;
  validTill?: string | null;
  isExpired: boolean;
  visibilityStatus: "active" | "expired" | "expiring_soon";
  progressModules?: MyCourseModuleProgressItem[];
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

function createClientUploadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

class CourseStoreClass {
  courses: CourseListItem[] = [];
  accessibleCourses: AccessibleCourseItem[] = [];
  assignedCourseAccesses: AssignedCourseAccessItem[] = [];
  myCourses: MyCourseItem[] = [];
  courseAssignmentAudit: CourseAssignmentAuditItem[] = [];
  currentCourse: MyCourseDetailItem | null = null;
  isLoading: boolean = false;
  isAccessLoading: boolean = false;
  isAssignedCoursesLoading: boolean = false;
  isMyCoursesLoading: boolean = false;
  isMyCourseDetailLoading: boolean = false;
  isCourseAssignmentAuditLoading: boolean = false;
  isSubmitting: boolean = false;
  isAccessSubmitting: boolean = false;
  isAssignmentSubmitting: boolean = false;
  submissionProgress: number = 0;
  submissionStage: string = "";
  submissionDetail: string = "";
  error: string | null = null;
  accessError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  fetchCourses = async () => {
    this.isLoading = true;
    this.error = null;
    try {
      const { data } = await axios.get("/course");
      runInAction(() => {
        this.courses = data.data || [];
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.error || "Failed to fetch courses";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  fetchCourse = async (id: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const { data } = await axios.get(`/course/${id}`);
      runInAction(() => {
        this.currentCourse = data.data;
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

  fetchMyCourses = async () => {
    this.isMyCoursesLoading = true;
    this.accessError = null;
    try {
      const { data } = await axios.get("/my-courses");
      runInAction(() => {
        this.myCourses = data.data || [];
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

  fetchMyCourseDetail = async (courseId: string) => {
    this.isMyCourseDetailLoading = true;
    this.accessError = null;
    try {
      const { data } = await axios.get(`/my-courses/${courseId}`);
      runInAction(() => {
        this.currentCourse = data.data || null;
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
          body.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
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
}

export const courseStore = new CourseStoreClass();
