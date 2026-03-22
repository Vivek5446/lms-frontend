import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

class RecallAppointmentStore {

  recallAppointment : any = {
    data: [],
    totalPages: 1,
    loading : false
  };

  openTestimonialDrawer = {
    open: false,
  };

  constructor() {
    makeAutoObservable(this);
  }

  // Fetch Testimonials

  getRecallAppointments = async (sendData: { page: number, search: string }) => {
    this.recallAppointment.loading = true;
    try {
      const searchQuery = sendData.search ? `&search=${encodeURIComponent(sendData.search)}` : '';
      const { data } = await axios.post(
        `/recall-appointment/get?page=${sendData.page}&limit=10${searchQuery}&company=${authStore.company}`
      );
      this.recallAppointment.data = Array.isArray(data?.data) ? data.data.map((it : any) => ({...it, doctorName:it?.doctor?.name, patientName : it.patient?.name,patientMobileNumber : it.patient?.mobileNumber, createdBy : it?.createdBy.name, createdDetails : it?.createdBy})) : [];
      this.recallAppointment.totalPages = data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.recallAppointment.loading = false;
    }
  };

  // Create Testimonial
  createRecallAppointment = async (sendData: any) => {
    try {
      const { data } = await axios.post("/recall-appointment/create", {...sendData,company : authStore.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateRecallAppointment = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/recall-appointment/update/${sendData?._id}`, {...sendData,company : authStore.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };


}

export const recallAppointmentStore = new RecallAppointmentStore();
