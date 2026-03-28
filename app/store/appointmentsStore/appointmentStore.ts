import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

class Appointments {

  appointments : any = {
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

  getAppointmentBooking = async (sendData: { page: number, search: string }) => {
    this.appointments.loading = true;
    try {
      const searchQuery = sendData.search ? `&search=${encodeURIComponent(sendData.search)}` : '';
      const { data } = await axios.get(
        `/appointments/get?page=${sendData.page}&limit=10${searchQuery}&company=${authStore.company}`
      );
      this.appointments.data = data?.data?.data || [];
      this.appointments.totalPages = data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.appointments.loading = false;
    }
  };

  // Create Testimonial
  createBookAppointment = async (sendData: any) => {
    try {
      const { data } = await axios.post("/appointments/create", {...sendData,company : authStore.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };


}

export const appointmentStore = new Appointments();
