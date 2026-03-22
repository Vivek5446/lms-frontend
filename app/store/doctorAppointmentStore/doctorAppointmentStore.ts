import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";
import { tablePageLimit } from "../../component/config/utils/variable";

class DoctorAppointment {

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

  getDoctorAppointment = async (sendData: { page: number, search: string }) => {
    this.appointments.loading = true;
    try {
      const searchQuery = sendData.search ? `&search=${encodeURIComponent(sendData.search)}` : '';
      const { data } = await axios.post(
        `/doctor/appointment/get`,
        {...sendData, page:sendData.page,limit:tablePageLimit,searchQuery,company :authStore.company}
      );
      this.appointments.data = Array.isArray(data?.data?.data) ? data?.data?.data?.map((it : any) => ({...it, actionBy : it?.createdBy?.name || '--' , doctorName : it?.primaryDoctor?.name, patientName : it?.patient?.name})) : [];
      this.appointments.totalPages = data?.data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.appointments.loading = false;
    }
  };

  getAppointmentById = async (sendData: any) => {
    try {
      const { data } = await axios.post(
        `/doctor/appointment/AppointmentById`,
        {...sendData, appointmentId : sendData?.appointmentId ,company :authStore.company}
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
    }
  };

  // Create Testimonial
  createDoctorAppointment = async (sendData: any) => {
    try {
      const { data } = await axios.post("/doctor/appointment/create", {...sendData,company : authStore.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateAppointment = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/doctor/appointment/update/${sendData?._id}`, {...sendData,company : authStore.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };



  updateAppointmentStatus = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/doctor/appointment/status/${sendData.id}`, {...sendData,company : authStore.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getPatientAppointmentStatusCount = async (sendData: any) => {
    try {
      const { data } = await axios.post(`/doctor/appointment/patients/status/count`, {...sendData,company : authStore.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };


}

export const doctorAppointment = new DoctorAppointment();
