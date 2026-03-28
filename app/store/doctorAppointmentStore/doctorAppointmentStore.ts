import axios from "axios";
import { makeAutoObservable } from "mobx";

class DoctorAppointmentStore {
  constructor() {
    makeAutoObservable(this);
  }

  createDoctorAppointment = async (sendData: any) => {
    try {
      const { data } = await axios.post("/doctor/appointment/create", sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateAppointment = async (sendData: any) => {
    try {
      const { data } = await axios.put(
        `/doctor/appointment/update/${sendData._id}`,
        sendData
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateAppointmentStatus = async (sendData: any) => {
    try {
      const { data } = await axios.put(
        `/doctor/appointment/status/${sendData.id}`,
        sendData
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export const DoctorAppointment = new DoctorAppointmentStore();
