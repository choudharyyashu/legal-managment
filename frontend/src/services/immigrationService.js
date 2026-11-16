import { apiClient } from './apiClient';

export const immigrationService = {
  async getImmigrationCase(matterId) {
    const res = await apiClient.get(`/immigration/matter/${matterId}`);
    return res?.data;
  },

  async saveImmigrationCase(matterId, data) {
    const res = await apiClient.post(`/immigration/matter/${matterId}`, data);
    return res?.data;
  },

  async getReceipts(matterId) {
    const res = await apiClient.get(`/immigration/matter/${matterId}/receipts`);
    return res?.data;
  },

  async createReceipt(matterId, data) {
    const res = await apiClient.post(`/immigration/matter/${matterId}/receipts`, data);
    return res?.data;
  },

  async getParties(matterId) {
    const res = await apiClient.get(`/immigration/matter/${matterId}/parties`);
    return res?.data;
  },

  async createParty(matterId, data) {
    const res = await apiClient.post(`/immigration/matter/${matterId}/parties`, data);
    return res?.data;
  },
};
