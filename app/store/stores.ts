// store/index.ts
import { appointmentStore } from "./appointmentsStore/appointmentStore";
import { authStore } from "./authStore/authStore";
import { blogStore } from "./blogStore/blogStore";
import { bookingStore } from "./bookingStore/bookingStore";
import { batchStore } from "./batchStore/batchStore";
import { CompanyStore } from "./companyStore/companyStore";
import { chairsStore } from "./chairsStore/chairsStore";
import { contactStore } from "./contactStore/contactStore";
import { dashboardStore } from "./dashboardStore/dashboardStore";
import { DoctorAppointment } from "./doctorAppointmentStore/doctorAppointmentStore";
import { EventStore } from './eventStore/eventStore';
// import { labStore } from "./labStore/labStore";
import { layoutStore } from './layoutStore/LayoutStore';
import { managerStore } from "./managerStore/managerStore";
import { orderStore } from "./orderStore/orderStore";
import { testimonialStore } from "./testimonialStore/testimonialStore";
import { themeStore } from "./themeStore/themeStore";
import { toothTreatmentStore } from "./toothTreatmentStore/toothTreatmentStore";
import { userStore } from "./userStore/userStore";
import { documentStore } from "./documentStore/documentStore";
import { recallAppointmentStore } from "./recallAppointment/recallAppointmentStore";
import { reportStore } from "./reportStore/reportStore";
import { workflowStore } from "./workflowStore/workflowStore";
import { courseStore } from "./courseStore/courseStore";
const stores = {
  auth : authStore,
  dashboardStore : dashboardStore,
  DoctorAppointment : DoctorAppointment,
  userStore : userStore,
  appointmentStore : appointmentStore,
  bookingStore : bookingStore,
  batchStore: batchStore,
  themeStore : themeStore,
  layout : layoutStore,
  managerStore: managerStore,
  chairsStore : chairsStore,
  contactStore : contactStore,
  BlogStore : blogStore,
  companyStore : CompanyStore,
  orderStore : orderStore,
  testimonialStore : testimonialStore,
  toothTreatmentStore : toothTreatmentStore,
  EventStore:EventStore,
  recallAppointmentStore:recallAppointmentStore,
  reportStore:reportStore,
  workflowStore:workflowStore,
  documentStore:documentStore,
  courseStore:courseStore,
};

export default stores;
