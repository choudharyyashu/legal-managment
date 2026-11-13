import { apiClient } from './apiClient';

export const documentService = {
  async getDocuments(params = {}) {
    const res = await apiClient.get('/documents', params);
    return res?.data?.documents || [];
  },

  async getDocumentById(id) {
    const res = await apiClient.get(`/documents/${id}`);
    return res?.data?.document;
  },

  async createDocument(data) {
    const res = await apiClient.post('/documents', data);
    return res?.data?.document;
  },

  async uploadVersion(id, data) {
    const res = await apiClient.post(`/documents/${id}/upload`, data);
    return res?.data?.version;
  },

  async deleteDocument(id) {
    const res = await apiClient.delete(`/documents/${id}`);
    return res?.data;
  },
};

