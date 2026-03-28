import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

class EventsStore {
  testimonialLayout = "table";

  event = {
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

  getEvent = async (sendData: { limit?: number; page: number; search?: string }) => {
    this.event.loading = true;
    try {
      const { limit = 10 , page, search } = sendData;
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';

      const { data } = await axios.get(
        `/event/get?page=${page}&limit=${limit}${searchQuery}`
      );

      this.event.data = data?.data || [];
      this.event.totalPages = data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.event.loading = false;
    }
};


  deleteEvent = async (sendData: any) => {
    try {
      const { data } = await axios.delete(`/event/${sendData._id}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  createEvent = async (sendData: any) => {
    try {
      const { data } = await axios.post(`/event/create`, {
        ...sendData,
        company: authStore.company,
      });
      this.event.data.unshift(data.data);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data);
    }
  };

  // Edit Testimonial
  updateEvent = async (id : any,sendData : any) => {
    try {
      const { data } = await axios.put(`event/${id}`, sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  // Download Testimonial List
  downloadTestimonialList = async (sendData: any) => {
    try {
      const response = await axios.post(
        "/event/download/list",
        sendData,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "event.xlsx");
      document.body.appendChild(link);
      link.click();
      return {
        data: "Testimonial list downloaded successfully",
      };
    } catch (err: any) {
      return Promise.reject(err);
    }
  };

  // Toggle Testimonial Drawer
  setOpenTestimonialDrawer = () => {
    this.openTestimonialDrawer.open = !this.openTestimonialDrawer.open;
  };

  // Toggle Layout (Table/Grid)
  setTestimonialLayout = () => {
    this.testimonialLayout =
      this.testimonialLayout === "table" ? "grid" : "table";
  };
}

export const EventStore = new EventsStore();
