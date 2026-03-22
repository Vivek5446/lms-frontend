import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";
import { send } from "process";

class ToothTreatment {

  toothTreatment : any = {
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

  getToothTreatmentById = async (sendData: any) => {
    try {
      const { data } = await axios.post(
        `/toothTreatment/${sendData?.appointmentId}`,
        {...sendData, appointmentId : sendData?.appointmentId ,company :authStore.company}
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
    }
  };

  getToothTreatments = async (sendData: { page: number, search: string, patientId?:any }) => {
    this.toothTreatment.loading = true;
    try {
      const searchQuery = sendData.search ? `&search=${encodeURIComponent(sendData.search)}` : '';
      const { data } = await axios.get(
        `/toothTreatment/get?page=${sendData.page}&limit=10${searchQuery}&company=${authStore.company}&patientId=${sendData?.patientId}`
      );
this.toothTreatment.data =
  data?.data?.data?.map((it: any) => {
    const fdi = it?.tooth?.fdi || "--";
    const universal = it?.tooth?.universal || "--";
    const palmer = it?.tooth?.palmer || "--";

    return {
      ...it,

      // Names
      patientName: it?.patient?.name,
      doctorName: it?.doctor?.name,

      // Keep separate (for future filtering / reports)
      toothFDI: fdi,
      toothUniversal: universal,
      toothPalmer: palmer,

      // 👇 Combined display key (THIS is what table will use)
      toothName: `FDI ${fdi} | U ${universal} | P ${palmer}`,
    };
  }) || [];
      this.toothTreatment.totalPages = data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.toothTreatment.loading = false;
    }
  };

  // Create Testimonial
  createToothTreatment = async (sendData: any) => {
    try {
      const { data } = await axios.post("/toothTreatment/create", {...sendData,company : authStore.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };


}

export const toothTreatmentStore = new ToothTreatment();
