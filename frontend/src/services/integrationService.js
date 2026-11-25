import { apiClient } from './apiClient';

export const integrationService = {
  async getStatuses() {
    const res = await apiClient.get('/integrations/status');
    return Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
  },

  async testConnection(providerId, credentials = {}) {
    const res = await apiClient.post(`/integrations/${providerId}/test`, credentials);
    return res?.data?.data || res?.data;
  },

  async disconnect(providerId) {
    const res = await apiClient.post(`/integrations/${providerId}/disconnect`);
    return res?.data?.data || res?.data;
  },
};
