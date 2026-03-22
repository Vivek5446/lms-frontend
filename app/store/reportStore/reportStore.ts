import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

class Report {


  constructor() {
    makeAutoObservable(this);
  }

  // Fetch Testimonials

  getReportDownload = async (sendData: any) => {
    try {
      const { data } = await axios.post(
        `/report/download`,
        {company:authStore.company,...sendData}
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
    }
  };

}

export const reportStore = new Report();
