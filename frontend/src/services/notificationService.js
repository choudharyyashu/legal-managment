import { apiClient } from './apiClient';

export const notificationService = {
  async getPreferences() {
    const res = await apiClient.get('/notifications/preferences');
    return res?.data;
  },

  async updatePreferences(data) {
    const res = await apiClient.put('/notifications/preferences', data);
    return res?.data;
  },

  async resetPreferences() {
    const res = await apiClient.post('/notifications/preferences/reset');
    return res?.data;
  },
};
