import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";

const SCORM_CHUNK_SIZE_BYTES = 3.5 * 1024 * 1024;

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

interface CreateCourseInput {
  payload: Record<string, unknown>;
  thumbnailFile?: File | null;
  scormFiles: File[];
}

interface ChunkedScormUpload {
  uploadId: string;
  fileName: string;
  totalChunks: number;
  contentType: string;
  sizeInBytes: number;
}

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
  currentCourse: any = null;
  isLoading: boolean = false;
  isAccessLoading: boolean = false;
  isAssignedCoursesLoading: boolean = false;
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

  resetSubmissionState = () => {
    this.submissionProgress = 0;
    this.submissionStage = "";
    this.submissionDetail = "";
  };

  private uploadScormFilesInChunks = async (files: File[]) => {
    const uploads: ChunkedScormUpload[] = [];
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let uploadedBytes = 0;

    for (const file of files) {
      const uploadId = createClientUploadId();
      const totalChunks = Math.max(1, Math.ceil(file.size / SCORM_CHUNK_SIZE_BYTES));

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
        const start = chunkIndex * SCORM_CHUNK_SIZE_BYTES;
        const end = Math.min(file.size, start + SCORM_CHUNK_SIZE_BYTES);
        const chunk = file.slice(start, end);
        const chunkFormData = new FormData();

        chunkFormData.append("uploadId", uploadId);
        chunkFormData.append("chunkIndex", String(chunkIndex));
        chunkFormData.append("totalChunks", String(totalChunks));
        chunkFormData.append("fileName", file.name);
        chunkFormData.append("chunk", chunk, `${file.name}.part-${chunkIndex}`);

        await axios.post("/course/upload-chunk", chunkFormData, multipartRequestConfig);

        uploadedBytes += chunk.size;
        const uploadRatio = totalBytes > 0 ? uploadedBytes / totalBytes : 1;
        const progress = Math.min(74, Math.max(8, Math.round(uploadRatio * 74)));

        runInAction(() => {
          this.submissionProgress = progress;
          this.submissionStage = "Uploading SCORM files";
          this.submissionDetail = `Uploaded ${Math.round(uploadRatio * 100)}% of your course package.`;
        });
      }

      uploads.push({
        uploadId,
        fileName: file.name,
        totalChunks,
        contentType: file.type || "application/octet-stream",
        sizeInBytes: file.size,
      });
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
        ? `Uploading ${options?.fileCount} file${options?.fileCount === 1 ? "" : "s"} and preparing your SCORM package.`
        : "Saving your course details.";
    this.error = null;

    let uploadCompleted = false;
    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(input.payload));

      if (input.thumbnailFile) {
        formData.append("thumbnail", input.thumbnailFile);
      }

      if (input.scormFiles.length > 0) {
        const scormChunkUploads = await this.uploadScormFilesInChunks(input.scormFiles);
        formData.append("scormChunkUploads", JSON.stringify(scormChunkUploads));

        runInAction(() => {
          this.submissionProgress = 80;
          this.submissionStage = "Processing SCORM package";
          this.submissionDetail = "Extracting files, storing package assets, and creating the course record...";
        });
      }

      const { data } = await axios.post("/course/create", formData, {
        ...multipartRequestConfig,
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            runInAction(() => {
              this.submissionStage = input.scormFiles.length > 0 ? "Processing SCORM package" : "Uploading files";
              this.submissionDetail = input.scormFiles.length > 0
                ? "Finishing the course setup on the server..."
                : "Sending your course content to the server...";
            });
            return;
          }

          const ratio = progressEvent.loaded / progressEvent.total;
          const progressFloor = input.scormFiles.length > 0 ? 80 : 8;
          const progressCeiling = 88;
          const progress = Math.min(
            progressCeiling,
            Math.max(progressFloor, Math.round(progressFloor + ratio * (progressCeiling - progressFloor)))
          );
          uploadCompleted = ratio >= 1;

          runInAction(() => {
            this.submissionProgress = progress;
            this.submissionStage = uploadCompleted ? "Processing SCORM package" : "Uploading files";
            this.submissionDetail = uploadCompleted
              ? "Extracting files, storing package assets, and creating the course record..."
              : `Uploaded ${Math.round(ratio * 100)}% of your course package.`;
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
