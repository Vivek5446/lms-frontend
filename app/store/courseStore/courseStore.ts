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

  createCourse = async (formData: FormData) => {
    this.isSubmitting = true;
    this.error = null;
    try {
      const { data } = await axios.post("/course/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      runInAction(() => {
        this.courses.unshift(data.data);
      });
      return data.data;
    } catch (err: any) {
      runInAction(() => {
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
