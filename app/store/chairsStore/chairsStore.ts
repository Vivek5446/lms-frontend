import axios from "axios";
import { makeAutoObservable } from "mobx";

class ChairsStore {
  constructor() {
    makeAutoObservable(this);
  }

  getChairs = async (params: { page?: number; limit?: number; search?: string }) => {
    try {
      const { data } = await axios.get("/chairs/get", {
        params,
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getChairSummary = async (sendData: { date: string }) => {
    try {
      const { data } = await axios.post("/chairs/getChairSummary", sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteChair = async (id: string) => {
    try {
      const { data } = await axios.delete(`/chairs/delete/${id}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export const chairsStore = new ChairsStore();
