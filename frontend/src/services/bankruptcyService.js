import { apiClient } from './apiClient';

export const bankruptcyService = {
  async getBankruptcyCase(matterId) {
    const res = await apiClient.get(`/bankruptcy/matter/${matterId}`);
    return res?.data;
  },

  async saveBankruptcyCase(matterId, data) {
    const res = await apiClient.post(`/bankruptcy/matter/${matterId}`, data);
    return res?.data;
  },

  async getCreditors(matterId) {
    const res = await apiClient.get(`/bankruptcy/matter/${matterId}/creditors`);
    return res?.data;
  },

  async createCreditor(matterId, data) {
    const res = await apiClient.post(`/bankruptcy/matter/${matterId}/creditors`, data);
    return res?.data;
  },

  async getSchedules(matterId) {
    const res = await apiClient.get(`/bankruptcy/matter/${matterId}/schedules`);
    return res?.data;
  },

  async createScheduleItem(matterId, data) {
    const res = await apiClient.post(`/bankruptcy/matter/${matterId}/schedules`, data);
    return res?.data;
  },
};
