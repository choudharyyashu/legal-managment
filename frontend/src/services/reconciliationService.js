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

  // =========================================================================
  // OPERATING BANK RECONCILIATION METHODS (ACCOUNT 1010)
  // =========================================================================

  async getOperatingStatus(params = {}) {
    const res = await apiClient.get('/reconciliation/operating/status', params);
    return res?.data;
  },

  async saveOperatingDraft(data) {
    const res = await apiClient.post('/reconciliation/operating/draft', data);
    return res?.data;
  },

  async finalizeOperating(data) {
    const res = await apiClient.post('/reconciliation/operating/finalize', data);
    return res?.data;
  },

  async getOperatingHistory() {
    const res = await apiClient.get('/reconciliation/operating/history');
    return Array.isArray(res?.data) ? res.data : [];
  },
};

