import { apiClient, tokenStorage } from './apiClient';

export const documentService = {
  async getDocuments(params = {}) {
    const res = await apiClient.get('/documents', params);
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.documents)) return res.data.documents;
    return [];
  },

  async getDocumentById(id) {
    const res = await apiClient.get(`/documents/${id}`);
    return res?.data?.document || res?.data;
  },

  async createDocument(data) {
    const res = await apiClient.post('/documents', data);
    return res?.data?.document || res?.data;
  },

  async uploadVersion(id, data) {
    const res = await apiClient.post(`/documents/${id}/upload`, data);
    return res?.data?.version || res?.data;
  },

  async downloadDocument(id) {
    const token = tokenStorage.get();
    const baseUrl = apiClient.getBaseUrl().replace(/\/+$/, '');
    const url = `${baseUrl}/documents/${id}/download`;
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.statusText}`);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition');
    let filename = `document-${id}.pdf`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
    return true;
  },

  async deleteDocument(id) {
    const res = await apiClient.delete(`/documents/${id}`);
    return res?.data;
  },

  async getEventCatalog() {
    const res = await apiClient.get('/documents/events/catalog');
    return res?.data?.events || [];
  },

  async triggerDocumentEvent(event, matterId, payload = {}) {
    const res = await apiClient.post('/documents/events/trigger', {
      event,
      matterId,
      payload,
    });
    return res?.data;
  },

  async validateDraftPrerequisites(data) {
    const res = await apiClient.post('/documents/drafts/validate', data);
    return res?.data;
  },

  async generateDraft(data) {
    const res = await apiClient.post('/documents/drafts/generate', data);
    return res?.data;
  },

  async createFollowUpTask(data) {
    const res = await apiClient.post('/documents/drafts/tasks/followup', data);
    return res?.data;
  },
};
