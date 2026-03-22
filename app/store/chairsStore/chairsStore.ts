import axios from "axios";
import { makeAutoObservable } from "mobx";
import { authStore } from "../authStore/authStore";

class ChairsStore {
  chairsLayout = "table";

  chairs = {
    data: [],
    totalPages: 1,
    loading: false,
  };

  openChairsDrawer = {
    open: false,
  };

  constructor() {
    makeAutoObservable(this);
  }

  // ------------------------------------------------------------
  // GET CHAIRS (Pagination + Search)
  // ------------------------------------------------------------
getChairs = async (sendData: { limit?: number; page: number; search?: string }) => {
  this.chairs.loading = true;
  try {
    const { limit = 10, page, search } = sendData;

    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";

    const { data } = await axios.get(
      `/chairs/get?page=${page}&limit=${limit}${searchQuery}&company=${authStore.company}`
    );

    // 🔥 FIX HERE
    this.chairs.data = data?.data?.data || [];
    this.chairs.totalPages = data?.data?.totalPages || 1;

    return data.data;
  } catch (err: any) {
    return Promise.reject(err?.response?.data || err);
  } finally {
    this.chairs.loading = false;
  }
};


  // ------------------------------------------------------------
  // CREATE CHAIR
  // ------------------------------------------------------------
  createChair = async (sendData: any) => {
    try {
      const { data } = await axios.post(`/chairs/create`, {
        ...sendData,
        company: authStore.company,
      });

      // Add newly created chair to table (top)
      this.chairs.data.unshift(data.data);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getChairSummary = async (sendData: any) => {
    try {
      const { data } = await axios.post(`/chairs/getChairSummary`, {
        ...sendData,
        company: authStore.company,
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };



  // ------------------------------------------------------------
  // UPDATE CHAIR
  // ------------------------------------------------------------
updateChair = async (id: string, sendData: any) => {
  try {
    const { data } = await axios.put(`/chairs/update/${id}`, sendData);

    if (!data?.data) {
      return { status: "error", message: "No updated chair returned" };
    }

    this.chairs.data = this.chairs.data.map((item: any) =>
      item._id === id ? data.data : item
    );

    return data;
  } catch (err: any) {
    return Promise.reject(err?.response?.data || err);
  }
};


  // ------------------------------------------------------------
  // DELETE CHAIR
  // ------------------------------------------------------------
  deleteChair = async (id: any) => {
    try {
      const { data } = await axios.delete(`/chairs/delete/${id}`);

      // Remove from local store
      this.chairs.data = this.chairs.data.filter(
        (item: any) => item._id !== id
      );

      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };


  // ------------------------------------------------------------
  // TOGGLE DRAWER
  // ------------------------------------------------------------
  setOpenChairsDrawer = () => {
    this.openChairsDrawer.open = !this.openChairsDrawer.open;
  };

  // ------------------------------------------------------------
  // TOGGLE LAYOUT (Table/Grid)
  // ------------------------------------------------------------

}

export const chairsStore = new ChairsStore();
