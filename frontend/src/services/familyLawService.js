import { apiClient } from './apiClient';

export const familyLawService = {
  async getFamilyLawCase(matterId) {
    const res = await apiClient.get(`/family-law/matter/${matterId}`);
    return res?.data;
  },

  async saveFamilyLawCase(matterId, data) {
    const res = await apiClient.post(`/family-law/matter/${matterId}`, data);
    return res?.data;
  },

  async getOrders(matterId) {
    const res = await apiClient.get(`/family-law/matter/${matterId}/orders`);
    return res?.data;
  },

  async createOrder(matterId, data) {
    const res = await apiClient.post(`/family-law/matter/${matterId}/orders`, data);
    return res?.data;
  },
};
