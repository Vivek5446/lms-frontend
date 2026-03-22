import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";
class UserStore {
  user: any = {
    loading : false,
    data : [],
    totalPages : 1
  }
  userSettings: any = {};
  userPreferences: any = {};
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  fetchUserSettings = async () => {
    this.isLoading = true;
    try {
      const response = await axios.get("/user/settings");

      this.userSettings = response.data?.settings || {};
    } catch (err: any) {
      this.error = err?.response?.data?.message || "Failed to fetch settings.";
      throw err;
    } finally {
      this.isLoading = false;
    }
  };

  createUser = async (payload: any) => {
    this.isLoading = true;
    try {
      const response = await axios.post("/user/create", {
        ...payload,
        company: authStore.company,
      });
      return response;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    } finally {
      this.isLoading = false;
    }
  };

  createAdmin = async (payload: any) => {
    this.isLoading = true;
    try {
      const response = await axios.post("/user/admin/create", {
        ...payload,
        company: authStore.company,
      });
      return response;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    } finally {
      this.isLoading = false;
    }
  };

  deleteUser = async (payload: any) => {
    try {
      const response = await axios.delete(`/user/profile/${payload?._id}`);
      return response;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    } finally {
    }
  };

  updateUser = async (payload: any) => {
    this.isLoading = true;
    try {
      const response = await axios.put(`/user/profile/${payload._id}`, {
        ...payload,
        company: authStore.company,
      });
      return response;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    } finally {
      this.isLoading = false;
    }
  };

  toggleUserStatus = async (id: string) => {
    this.isLoading = true;
    try {
      const response = await axios.put(`/user/status/${id}`);
      return response;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    } finally {
        this.isLoading = false;
    }
  };

  getUserByName = async (payload: any) => {
    try {
      const response = await axios.get(`/user/${payload.name}`);
      return response;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    }
  };

  getUserById = async (id: string) => {
    try {
      const response = await axios.get(`/user/details/${id}`);
      return response;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    }
  };

  getAllUsers = async (payload: any) => {
    this.user.loading = true;
    try {
      const response : any = await axios.post("/user", {
        ...payload,
        company: authStore.company,
      });
      this.user.data = response?.data?.data?.data || []
      this.user.totalPages = response?.data?.data?.totalPages || 1
      return response;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    } finally {
      this.user.loading = false;
    }
  };


  updateUserSettings = async (settings: any) => {
    this.isLoading = true;
    try {
      const response = await axios.put("/user/settings", settings);

      this.userSettings = response.data?.settings || {};
    } catch (err: any) {
      this.error = err?.response?.data?.message || "Failed to update settings.";
      throw err;
    } finally {
      this.isLoading = false;
    }
  };

  // Update user preferences
  updateUserPreferences = async (preferences: any) => {
    this.isLoading = true;
    try {
      const response = await axios.put("/user/preferences", preferences);

      this.userPreferences = response.data?.preferences || {};
    } catch (err: any) {
      this.error =
        err?.response?.data?.message || "Failed to update preferences.";
      throw err;
    } finally {
      this.isLoading = false;
    }
  };
}

export const userStore = new UserStore();
