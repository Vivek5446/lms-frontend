import axios from "axios";
import { makeAutoObservable } from "mobx";

class ToothTreatmentStore {
  toothTreatment: any = {
    data: [],
    totalPages: 1,
    loading: false,
  };

  constructor() {
    makeAutoObservable(this);
  }

  getToothTreatments = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
  }) => {
    this.toothTreatment.loading = true;

    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", String(params.page));
      if (params.limit) query.set("limit", String(params.limit));
      if (params.search) query.set("search", params.search);
      if (params.patientId) query.set("patientId", params.patientId);

      const { data } = await axios.get(`/treatment/get?${query.toString()}`);

      this.toothTreatment.data = data?.data?.data || data?.data || [];
      this.toothTreatment.totalPages = data?.totalPages || data?.data?.totalPages || 1;

      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.toothTreatment.loading = false;
    }
  };

  getToothTreatmentById = async (sendData: { appointmentId: string }) => {
    try {
      const { data } = await axios.post(`/treatment/${sendData.appointmentId}`, sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  createToothTreatment = async (sendData: any) => {
    try {
      const { data } = await axios.post("/treatment/create", sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export const toothTreatmentStore = new ToothTreatmentStore();
