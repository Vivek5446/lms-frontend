import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import stores from "../stores";

class LabStore {
  auth : any;
  labs = {
    data: [],
    loading: false,
    hasFetch: false,
    currentPage: 1,
    TotalPages: 0,
  };

  lineItems = {
    data: [],
    loading: false,
    hasFetch: false,
    currentPage: 1,
    TotalPages: 0,
  };

  patientItems = {
    data: [],
    loading: false,
    hasFetch: false,
    currentPage: 1,
    TotalPages: 0,
  };

  constructor() {
    makeObservable(this, {
      labs: observable,
      lineItems:observable,
      patientItems:observable,
      getLabLineItems:action,
      getLabs: action,
      createLab: action,
      updateBlog:action,
      updateLab:action,
      updateLabItem:action,
      deleteLab:action,
      deleteLabItem:action
    });
  }

  createLab = async (sendData: any) => {
    try {
      const { data } = await axios.post("/lab/create", {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  createLabItem = async (sendData: any) => {
    try {
      const { data } = await axios.post("/lab/item/create", {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateLab = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/lab/${sendData?._id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateLabItem = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/lab/item/${sendData?.id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteLabItem = async (sendData: any) => {
    try {
      const { data } = await axios.delete(`/lab/item/${sendData?.id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteLab = async (sendData: any) => {
    try {
      const { data } = await axios.delete(`/lab/${sendData.id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateBlog = async (sendData: any) => {
    try {
      const { data } = await axios.put("/blog", {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getLabs = async (sendData : any) => {
    try {
      this.labs.loading = true;
      const { data } = await axios.post(`/lab/get`,{company : [stores.auth.company]},{params : {...sendData}});
      this.labs.data = data?.data?.data || [];
      this.labs.TotalPages = data?.data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.labs.loading = false;
    }
  };

  getLabLineItems = async (sendData : any) => {
    try {
      this.lineItems.loading = true;
      const { data } = await axios.post(`/lab/items/get`,{company : [stores.auth.company]},{params : {...sendData}});
      this.lineItems.data = data?.data || [];
      this.lineItems.TotalPages = data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.lineItems.loading = false;
    }
  }

  getPatientLabLineItems = async (sendData : any) => {
    try {
      this.patientItems.loading = true;
      const { data } = await axios.post(`/lab/items/patient/get`,{company : [stores.auth.company]},{params : {...sendData}});
      this.patientItems.data = data?.data || [];
      this.patientItems.TotalPages = data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.patientItems.loading = false;
    }
  }

  updateLineItems = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/lab/items/${sendData?._id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };


}

export const labStore = new LabStore();
