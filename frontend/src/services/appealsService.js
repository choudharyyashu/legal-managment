import { apiClient } from './apiClient';

export const appealsService = {
  async getAppealsCase(matterId) {
    const res = await apiClient.get(`/appeals/matter/${matterId}`);
    return res?.data;
  },

  async saveAppealsCase(matterId, data) {
    const res = await apiClient.post(`/appeals/matter/${matterId}`, data);
    return res?.data;
  },
};
