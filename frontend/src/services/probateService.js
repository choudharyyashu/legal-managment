import { apiClient } from './apiClient';

export const probateService = {
  async getProbateCase(matterId) {
    const res = await apiClient.get(`/probate/matter/${matterId}`);
    return res?.data;
  },

  async saveProbateCase(matterId, data) {
    const res = await apiClient.post(`/probate/matter/${matterId}`, data);
    return res?.data;
  },

  async getBeneficiaries(matterId) {
    const res = await apiClient.get(`/probate/matter/${matterId}/beneficiaries`);
    return res?.data;
  },

  async createBeneficiary(matterId, data) {
    const res = await apiClient.post(`/probate/matter/${matterId}/beneficiaries`, data);
    return res?.data;
  },

  async getAssets(matterId) {
    const res = await apiClient.get(`/probate/matter/${matterId}/assets`);
    return res?.data;
  },

  async createAsset(matterId, data) {
    const res = await apiClient.post(`/probate/matter/${matterId}/assets`, data);
    return res?.data;
  },
};
