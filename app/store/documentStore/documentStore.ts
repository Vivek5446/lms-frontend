import axios from "axios";
import { makeAutoObservable } from "mobx";

class DocumentStore {
  documents: { data: any[]; loading: boolean } = { data: [], loading: false };
  createLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * POST /document
   * { workflowId, documentData, tableData, file?: { base64, name, mimeType } }
   */
  createDocument = async (payload: {
    workflowId: string;
    documentData: Record<string, any>;
    tableData?: Record<string, any[]>;
    file?: { base64: string; name: string; mimeType: string };
  }) => {
    this.createLoading = true;
    try {
      const { data } = await axios.post(`/document`, payload);
      this.documents.data.unshift(data.data);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.createLoading = false;
    }
  };

  /**
   * GET /document/:workflowId
   */
  getDocumentsByWorkflow = async (workflowId: string) => {
    this.documents.loading = true;
    try {
      const { data } = await axios.get(`/document/${workflowId}`);
      this.documents.data = data?.data || [];
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.documents.loading = false;
    }
  };
}

export const documentStore = new DocumentStore();
