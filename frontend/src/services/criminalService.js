import { apiClient } from './apiClient';

export const criminalService = {
  async getCriminalCase(matterId) {
    const res = await apiClient.get(`/criminal/matter/${matterId}`);
    return res?.data;
  },

  async saveCriminalCase(matterId, data) {
    const res = await apiClient.post(`/criminal/matter/${matterId}`, data);
    return res?.data;
  },

  async getCharges(matterId) {
    const res = await apiClient.get(`/criminal/matter/${matterId}/charges`);
    return res?.data;
  },

  async createCharge(matterId, data) {
    const res = await apiClient.post(`/criminal/matter/${matterId}/charges`, data);
    return res?.data;
  },
};
