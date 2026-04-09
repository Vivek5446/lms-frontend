import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";

export interface BatchListItem {
  _id: string;
  name: string;
  courseCount: number;
  userCount?: number;
  completedCount?: number;
  startDate?: string | null;
  endDate?: string | null;
  durationLabel?: string;
  status: "active" | "expired" | "expiring_soon" | "completed";
  isExpired?: boolean;
  createdAt?: string;
  createdBy?: {
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
}

export interface BatchDetailsItem {
  _id: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  status: "active" | "expired" | "expiring_soon" | "completed";
  isExpired?: boolean;
  createdBy?: {
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
  users: Array<{
    _id: string;
    name: string;
    email?: string;
    department?: string;
  }>;
  courses: Array<{
    _id: string;
    title: string;
    status: string;
    description?: {
      text?: string;
      html?: string;
    };
    curriculum?: {
      totalModules?: number;
      totalSections?: number;
    };
    thumbnailUrl?: string;
    sourceLabel?: string;
    progress?: number;
    validTill?: string | null;
    isExpired?: boolean;
  }>;
}

class BatchStoreClass {
  batches: BatchListItem[] = [];
  myBatches: BatchListItem[] = [];
  activeBatch: BatchDetailsItem | null = null;
  isLoading = false;
  isMyBatchesLoading = false;
  isDetailsLoading = false;
  isSubmitting = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  clearActiveBatch = () => {
    this.activeBatch = null;
  };

  fetchBatches = async (params: { companyId?: string } = {}) => {
    this.isLoading = true;
    this.error = null;
    try {
      const { data } = await axios.get("/batches", { params });
      runInAction(() => {
        this.batches = data.data || [];
      });
      return data.data || [];
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch batches";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  fetchMyBatches = async () => {
    this.isMyBatchesLoading = true;
    this.error = null;
    try {
      const { data } = await axios.get("/my-batches");
      runInAction(() => {
        this.myBatches = data.data || [];
      });
      return data.data || [];
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch my batches";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isMyBatchesLoading = false;
      });
    }
  };

  fetchBatchDetails = async (id: string) => {
    this.isDetailsLoading = true;
    this.error = null;
    try {
      const { data } = await axios.get(`/batches/${id}`);
      runInAction(() => {
        this.activeBatch = data.data || null;
      });
      return data.data || null;
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.message || err?.response?.data?.error || "Failed to fetch batch details";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isDetailsLoading = false;
      });
    }
  };

  createBatch = async (payload: {
    name: string;
    companyId?: string;
    courseIds: string[];
    userIds?: string[];
    startDate: string;
    endDate?: string | null;
    file?: File | null;
  }) => {
    this.isSubmitting = true;
    this.error = null;
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

      appendValue("name", payload.name);
      appendValue("companyId", payload.companyId);
      appendValue("courseIds", payload.courseIds);
      appendValue("userIds", payload.userIds || []);
      appendValue("startDate", payload.startDate);
      appendValue("endDate", payload.endDate);

      if (hasFile && payload.file) {
        body.append("file", payload.file);
      }

      const { data } = await axios.post("/batches", body, hasFile ? {
        headers: {
          "Content-Type": undefined,
        },
      } : undefined);
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.message || err?.response?.data?.error || "Failed to create batch";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  };

  updateBatch = async (id: string, payload: {
    name?: string;
    courseIds?: string[];
    userIds?: string[];
    startDate?: string | null;
    endDate?: string | null;
    file?: File | null;
    removeAccessOnUserRemoval?: boolean;
  }) => {
    this.isSubmitting = true;
    this.error = null;
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

      appendValue("name", payload.name);
      appendValue("courseIds", payload.courseIds || []);
      appendValue("userIds", payload.userIds || []);
      appendValue("startDate", payload.startDate);
      appendValue("endDate", payload.endDate);
      appendValue("removeAccessOnUserRemoval", payload.removeAccessOnUserRemoval);

      if (hasFile && payload.file) {
        body.append("file", payload.file);
      }

      const { data } = await axios.put(`/batches/${id}`, body, hasFile ? {
        headers: {
          "Content-Type": undefined,
        },
      } : undefined);
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.message || err?.response?.data?.error || "Failed to update batch";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  };

  deleteBatch = async (id: string) => {
    this.isSubmitting = true;
    this.error = null;
    try {
      const { data } = await axios.delete(`/batches/${id}`);
      runInAction(() => {
        this.batches = this.batches.filter((batch) => batch._id !== id);
        this.myBatches = this.myBatches.filter((batch) => batch._id !== id);
        if (this.activeBatch?._id === id) {
          this.activeBatch = null;
        }
      });
      return data;
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.response?.data?.message || err?.response?.data?.error || "Failed to delete batch";
      });
      return Promise.reject(err?.response?.data || err);
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  };
}

export const batchStore = new BatchStoreClass();
