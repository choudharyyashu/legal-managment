import { apiClient } from './apiClient';

export const reconciliationService = {
  async getLiveStatus(params = {}) {
    const res = await apiClient.get('/reconciliation/status', params);
    return res?.data;
  },

  async submit(data) {
    const res = await apiClient.post('/reconciliation', data);
    return res?.data?.record;
  },

  async getHistory(params = {}) {
    const res = await apiClient.get('/reconciliation/history', params);
    return res?.data?.history || [];
  },
};

