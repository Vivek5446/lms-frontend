import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

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

  createCourse = async (
    formData: FormData,
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
      const { data } = await axios.post("/course/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            runInAction(() => {
              this.submissionStage = "Uploading files";
              this.submissionDetail = "Sending your course content to the server...";
            });
            return;
          }

          const ratio = progressEvent.loaded / progressEvent.total;
          const progress = Math.min(88, Math.max(8, Math.round(ratio * 88)));
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
