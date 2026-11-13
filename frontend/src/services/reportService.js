import { apiClient } from './apiClient';

export const reportService = {
  async getDashboard() {
    const res = await apiClient.get('/reports/dashboard');
    return res?.data;
  },

  async getArAging() {
    const res = await apiClient.get('/reports/ar-aging');
    return res?.data;
  },
};

