import { apiClient } from './apiClient';

export const litigationService = {
  async getLitigationCase(matterId) {
    const res = await apiClient.get(`/litigation/matter/${matterId}`);
    return res?.data;
  },

  async saveLitigationCase(matterId, data) {
    const res = await apiClient.post(`/litigation/matter/${matterId}`, data);
    return res?.data;
  },

  async getHearings(matterId) {
    const res = await apiClient.get(`/litigation/matter/${matterId}/hearings`);
    return res?.data;
  },

  async createHearing(matterId, data) {
    const res = await apiClient.post(`/litigation/matter/${matterId}/hearings`, data);
    return res?.data;
  },

  async getDiscovery(matterId) {
    const res = await apiClient.get(`/litigation/matter/${matterId}/discovery`);
    return res?.data;
  },

  async createDiscovery(matterId, data) {
    const res = await apiClient.post(`/litigation/matter/${matterId}/discovery`, data);
    return res?.data;
  },

  async getPleadings(matterId) {
    const res = await apiClient.get(`/litigation/matter/${matterId}/pleadings`);
    return res?.data;
  },

  async createPleading(matterId, data) {
    const res = await apiClient.post(`/litigation/matter/${matterId}/pleadings`, data);
    return res?.data;
  },

  async getTrialNotebook(matterId) {
    const res = await apiClient.get(`/litigation/matter/${matterId}/trial-notebook`);
    return res?.data;
  },

  async createTrialNotebookItem(matterId, data) {
    const res = await apiClient.post(`/litigation/matter/${matterId}/trial-notebook`, data);
    return res?.data;
  },
};
