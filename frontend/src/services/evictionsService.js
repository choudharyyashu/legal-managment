import { apiClient } from './apiClient';

export const evictionsService = {
  async getEvictionsCase(matterId) {
    const res = await apiClient.get(`/evictions/matter/${matterId}`);
    return res?.data;
  },

  async saveEvictionsCase(matterId, data) {
    const res = await apiClient.post(`/evictions/matter/${matterId}`, data);
    return res?.data;
  },
};
