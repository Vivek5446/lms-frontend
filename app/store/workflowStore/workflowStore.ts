import axios from "axios";
import { makeAutoObservable } from "mobx";
import { authStore } from "../authStore/authStore";

class WorkflowStore {
  workflows = {
    data: [] as any[],
    totalPages: 1,
    loading: false,
  };
  assignedWorkflows: any[] = [];
  defaultWorkflow: any = null;
  activeWorkflow: any = null;

  createLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  // ------------------------------------------------------------
  // GET WORKFLOWS
  // ------------------------------------------------------------
  getWorkflows = async (sendData: { page: number; limit?: number; search?: string }) => {
    this.workflows.loading = true;
    try {
      const { page, limit = 10, search } = sendData;
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";

      const { data } = await axios.get(
        `/workflow/get?page=${page}&limit=${limit}${searchQuery}&company=${authStore.company}`
      );

      this.workflows.data = data?.data?.data || [];
      this.workflows.totalPages = data?.data?.totalPages || 1;

      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.workflows.loading = false;
    }
  };

  // ------------------------------------------------------------
  // CREATE WORKFLOW
  // ------------------------------------------------------------
  createWorkflow = async (config: any) => {
    this.createLoading = true;
    try {
      const { data } = await axios.post(`/workflow/create`, {
        ...config,
        company: authStore.company,
      });

      this.workflows.data.unshift(data.data);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.createLoading = false;
    }
  };

  // ------------------------------------------------------------
  // TOGGLE STATUS
  // ------------------------------------------------------------
  toggleWorkflowStatus = async (id: string) => {
    try {
      const { data } = await axios.patch(`/workflow/activeStatus/${id}`);

      this.workflows.data = this.workflows.data.map((item: any) =>
        item._id === id ? { ...item, status: data.data.status } : item
      );

      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  // ------------------------------------------------------------
// UPDATE WORKFLOW
// ------------------------------------------------------------
updateWorkflow = async (id: string, config: any) => {
  this.createLoading = true;
  try {
    const { data } = await axios.put(`/workflow/update/${id}`, {
      ...config,
      company: authStore.company,
    });

    // Update in-place in the list
    this.workflows.data = this.workflows.data.map((item: any) =>
      item._id === id ? data.data : item
    );

    return data;
  } catch (err: any) {
    return Promise.reject(err?.response?.data || err);
  } finally {
    this.createLoading = false;
  }
};

  // ------------------------------------------------------------
  // DELETE WORKFLOW
  // ------------------------------------------------------------
  deleteWorkflow = async (id: string) => {
    try {
      const { data } = await axios.delete(`/workflow/delete/${id}`);

      this.workflows.data = this.workflows.data.filter(
        (item: any) => item._id !== id
      );

      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  // ── Get workflows the user is creator or approver of ──────────────────
  getAssignedWorkflows = async () => {
    try {
      const { data } = await axios.get(`/workflow/assigned`);
      this.assignedWorkflows = data?.data || [];
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  // ── Pin a workflow as the user's default ──────────────────────────────
  setDefaultWorkflow = async (workflowId: string) => {
    try {
      const { data } = await axios.post(`/workflow/default`, { workflowId });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  // ── Get the user's default workflow (with fallback) ───────────────────
  getDefaultWorkflow = async () => {
    try {
      const { data } = await axios.get(`/workflow/user-default`);
      this.defaultWorkflow = data?.data || null;
      // Also sync activeWorkflow on load if not set
      if (!this.activeWorkflow) {
        this.activeWorkflow = this.defaultWorkflow;
      }
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  // ── Set the global active workflow ────────────────────────────────────
  setActiveWorkflow = (workflow: any) => {
    this.activeWorkflow = workflow;
  };
}

export const workflowStore = new WorkflowStore();


// import axios from "axios";
// import { makeAutoObservable } from "mobx";
// import { authStore } from "../authStore/authStore";

// class WorkflowStore {
//   workflows = {
//     data: [] as any[],
//     totalPages: 1,
//     loading: false,
//   };

//   createLoading = false;

//   constructor() {
//     makeAutoObservable(this);
//   }

//   // ------------------------------------------------------------
//   // CREATE WORKFLOW
//   // ------------------------------------------------------------
//   createWorkflow = async (config: any) => {
//     this.createLoading = true;
//     try {
//       const { data } = await axios.post(`/workflow/create`, {
//         ...config,
//         company: authStore.company,
//       });

//       this.workflows.data.unshift(data.data);
//       return data;
//     } catch (err: any) {
//       return Promise.reject(err?.response?.data || err);
//     } finally {
//       this.createLoading = false;
//     }
//   };

//   // ------------------------------------------------------------
//   // TOGGLE STATUS (active <-> inactive)
//   // ------------------------------------------------------------
//   toggleWorkflowStatus = async (id: string) => {
//     try {
//       const { data } = await axios.patch(`/workflow/toggle-status/${id}`);

//       this.workflows.data = this.workflows.data.map((item: any) =>
//         item._id === id ? { ...item, status: data.data.status } : item
//       );

//       return data;
//     } catch (err: any) {
//       return Promise.reject(err?.response?.data || err);
//     }
//   };

//   // ------------------------------------------------------------
//   // DELETE WORKFLOW
//   // ------------------------------------------------------------
//   deleteWorkflow = async (id: string) => {
//     try {
//       const { data } = await axios.delete(`/workflow/delete/${id}`);

//       this.workflows.data = this.workflows.data.filter(
//         (item: any) => item._id !== id
//       );

//       return data;
//     } catch (err: any) {
//       return Promise.reject(err?.response?.data || err);
//     }
//   };
// }

// export const workflowStore = new WorkflowStore();