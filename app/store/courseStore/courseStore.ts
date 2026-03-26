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

function createClientUploadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

class CourseStoreClass {
  courses: CourseListItem[] = [];
  currentCourse: any = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  submissionProgress: number = 0;
  submissionStage: string = "";
  submissionDetail: string = "";
  error: string | null = null;

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

        await axios.post("/course/upload-chunk", chunkFormData);

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
