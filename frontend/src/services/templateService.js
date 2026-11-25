import { apiClient, tokenStorage } from './apiClient';

export const templateService = {
  async getFieldDictionary() {
    const res = await apiClient.get('/templates/field-dictionary');
    return res?.data?.entities || [];
  },

  async getTemplates(params = {}) {
    const res = await apiClient.get('/templates', { limit: 500, ...params });
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.templates)) return res.data.templates;
    return [];
  },

  async getTemplateById(id) {
    const res = await apiClient.get(`/templates/${id}`);
    return res?.data?.template || res?.data;
  },

  async createTemplate(data) {
    const res = await apiClient.post('/templates', data);
    return res?.data?.template || res?.data;
  },

  async updateTemplate(id, data) {
    const res = await apiClient.put(`/templates/${id}`, data);
    return res?.data?.template || res?.data;
  },

  async setTemplateStatus(id, isActive) {
    const res = await apiClient.patch(`/templates/${id}/status`, { isActive });
    return res?.data?.template || res?.data;
  },

  async getVersions(templateId) {
    const res = await apiClient.get(`/templates/${templateId}/versions`);
    return res?.data?.versions || [];
  },

  async uploadVersion(templateId, formDataOrPayload) {
    const res = await apiClient.post(`/templates/${templateId}/versions`, formDataOrPayload);
    return res?.data?.version || res?.data;
  },

  async getVersionPlaceholders(templateId, versionId) {
    const res = await apiClient.get(`/templates/${templateId}/versions/${versionId}/placeholders`);
    return res?.data?.placeholders || [];
  },

  async downloadVersion(templateId, versionId, fallbackName = 'template.docx') {
    const token = tokenStorage.get();
    const baseUrl = apiClient.getBaseUrl().replace(/\/+$/, '');
    const url = `${baseUrl}/templates/${templateId}/versions/${versionId}/download`;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to download template version (${response.status})`);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition');
    let filename = fallbackName;
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

  async getFieldMappings(templateId, versionId) {
    const res = await apiClient.get(`/templates/${templateId}/versions/${versionId}/mappings`);
    return res?.data?.mappings || [];
  },

  async saveFieldMappings(templateId, versionId, mappings) {
    const res = await apiClient.post(`/templates/${templateId}/versions/${versionId}/mappings`, { mappings });
    return res?.data?.mappings || [];
  },

  async deleteFieldMapping(templateId, versionId, mappingId) {
    const res = await apiClient.delete(`/templates/${templateId}/versions/${versionId}/mappings/${mappingId}`);
    return res?.data;
  },
};
