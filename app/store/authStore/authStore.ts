// stores/authStore.ts
import { makeAutoObservable } from "mobx";
import axios from "axios";
import { AUTH_TOKEN, BACKEND_URL, ENCRYPT_SECRET_KEY, USER_SESSION_DATA } from "../../config/utils/variables";
import stores from "../stores";
import CryptoJS from "crypto-js";

interface Notification {
  title?: any;
  message: string;
  type?: any;
  placement?: string;
  action?: any;
  duration?:number
}

class AuthStore {
  user: any = null;
  userType : any = null
  token: string | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  notification: Notification | null = null;
  company: any = undefined

  constructor() {
    makeAutoObservable(this);
    axios.defaults.baseURL = BACKEND_URL
    axios.defaults.timeout = 0;
    axios.defaults.headers["Content-Type"] = "application/json";

    // Attach token automatically for all requests
    axios.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem(AUTH_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          this.logout(); // Logout on 401
        }
        return Promise.reject(error);
      }
    );

    if (typeof window !== "undefined") {
      this.initializeUser();
    }
  }

  changePassword = async (sendData: any) => {
    try {
      const { data } = await axios.post("/auth/change-password", {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };


  // Initialize User Session
  initializeUser = async () => {
    if (typeof window !== "undefined") {  // ✅ Prevent SSR errors
      const savedToken = localStorage.getItem(AUTH_TOKEN);
      if (savedToken) {
        this.token = savedToken;
        await this.fetchUser();
      }
    }
  };

   forgotPasswordStore = async (value: any) => {
    try {
      const { data } = await axios.post("/auth/forgot-password", value);
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err?.message);
    }
  };

  openNotification = (data: {
    title: any;
    message: string;
    type?: string;
    placement?: string;
    action?: any;
    duration?:number
  }) => {
    this.notification = {
      title: data.title,
      message: data.message,
      type: data.type ? data.type : "success",
      placement: data.placement ? data.placement : "bottom",
      action: data.action ? data.action : null,
    };
  };

  closeNotication = () => {
    this.notification = null;
  };

  // Register user
  register = async (email: string, password: string) => {
    this.isLoading = true;
    try {
      const response = await axios.post("/auth/register", { email, password });
      this.token = response.data.token;

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_TOKEN, this.token);
      }

      await this.fetchUser();
    } catch (err: any) {
      this.error = err?.response?.data?.message || "Registration failed.";
    } finally {
      this.isLoading = false;
    }
  };

  restoreUser = () => {
    try {
      const authorization_token = AUTH_TOKEN;
      if (authorization_token) {
        const storedData = sessionStorage.getItem(
          USER_SESSION_DATA!
        );
        if (storedData) {
          return this.getUserFromSessionStorage()
        } else {
          this.doLogout();
          return false;
        }
      } else {
        this.doLogout();
        return false;
      }
    } catch ({}) {
      this.user = null;
      this.doLogout();
    }
  };

  doLogout = () => {
    this.user = null;
    this.clearLocalStorage();
  };

  clearLocalStorage = () => {
    localStorage.removeItem(
      AUTH_TOKEN as string
    );
    sessionStorage.removeItem(USER_SESSION_DATA!);
  };
  // Login user
  login = async (payload: any) => {
    this.isLoading = true;
    try {
      const response = await axios.post("/auth/login", payload);
      this.token = response?.data?.data?.authorization_token;

      if (this.token && typeof window !== "undefined") {
        localStorage.setItem(AUTH_TOKEN, this.token);
      }

      await this.fetchUser();
      return response?.data
    } catch (err: any) {
      this.error = err?.response?.data?.message || "Login failed.";
    } finally {
      this.isLoading = false;
    }
  };


  uploadFile = async (sendData: any) => {
    try {
      const { data } = await axios.post("/file/upload", {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  saveUserToSessionStorage(user: any) {
    if (typeof window !== "undefined" && user) {
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(user),
        ENCRYPT_SECRET_KEY
      ).toString();
      sessionStorage.setItem(USER_SESSION_DATA, encryptedData);
    }
  }

  // Fetch User Info
  fetchUser = async () => {
    if (!this.token) return;

    try {
      const response = await axios.post(
        "/auth/me",
        {},
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      this.user = response.data?.data;
      this.company = response?.data?.data?.company
      this.userType = response?.data?.data?.userType || "patient"
      this.saveUserToSessionStorage(this.user);

      // If there's a company field
      // this.company = this.user?.company;
    } catch (err: any) {
      this.error = err?.response?.data?.message || "Failed to fetch user info.";
    }
  };

  getUserFromSessionStorage() {
    if (typeof window === "undefined") return false;

    const storedData = sessionStorage.getItem(USER_SESSION_DATA);
    if (!storedData) return false;

    try {
      const decryptedBytes = CryptoJS.AES.decrypt(storedData, ENCRYPT_SECRET_KEY);
      const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
      return decryptedData ? JSON.parse(decryptedData) : false;
    } catch ({}) {
      return false;
    }
  }

  getCompanyUsers = async (sendData : any = {}) => {
    try {
      const { data } = await axios.post(`auth/get/users`,{},{params : {...sendData}});
      return data.data?.map((item : any) => ({user : {...item}})) || [];
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  // Logout user
  logout = () => {
    this.token = null;
    this.user = null;
    this.error = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN);
    }
  };
}

export const authStore = new AuthStore();
