import { apiClient } from './apiClient';

export const brandingService = {
  async getFirmBranding() {
    const res = await apiClient.get('/settings/branding');
    return res?.data;
  },

  async updateFirmBranding(data) {
    const res = await apiClient.put('/settings/branding', data);
    return res?.data;
  },

  async resetFirmBranding() {
    const res = await apiClient.post('/settings/branding/reset');
    return res?.data;
  },
};
