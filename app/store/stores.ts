// store/index.ts
import { appointmentStore } from "./appointmentsStore/appointmentStore";
import { authStore } from "./authStore/authStore";
import { blogStore } from "./blogStore/blogStore";
import { bookingStore } from "./bookingStore/bookingStore";
import { CompanyStore } from "./companyStore/companyStore";
import { contactStore } from "./contactStore/contactStore";
import { dashboardStore } from "./dashboardStore/dashboardStore";
import { EventStore } from './eventStore/eventStore';
// import { labStore } from "./labStore/labStore";
import { layoutStore } from './layoutStore/LayoutStore';
import { orderStore } from "./orderStore/orderStore";
import { testimonialStore } from "./testimonialStore/testimonialStore";
import { themeStore } from "./themeStore/themeStore";
import { userStore } from "./userStore/userStore";
import { documentStore } from "./documentStore/documentStore";
import { recallAppointmentStore } from "./recallAppointment/recallAppointmentStore";
import { reportStore } from "./reportStore/reportStore";
import { workflowStore } from "./workflowStore/workflowStore";
const stores = {
  auth : authStore,
  dashboardStore : dashboardStore,
  userStore : userStore,
  appointmentStore : appointmentStore,
  bookingStore : bookingStore,
  themeStore : themeStore,
  layout : layoutStore,
  contactStore : contactStore,
  BlogStore : blogStore,
  companyStore : CompanyStore,
  orderStore : orderStore,
  testimonialStore : testimonialStore,
  EventStore:EventStore,
  recallAppointmentStore:recallAppointmentStore,
  reportStore:reportStore,
  workflowStore:workflowStore,
  documentStore:documentStore,
};

export default stores;