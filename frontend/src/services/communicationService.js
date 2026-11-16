import { apiClient } from './apiClient';

export const communicationService = {
  async getCommunications(params = {}) {
    const res = await apiClient.get('/communications', { params });
    return res?.data;
  },

  async createCommunication(data) {
    const res = await apiClient.post('/communications', data);
    return res?.data;
  },

  async getUnmatchedQueue() {
    const res = await apiClient.get('/communications/unmatched');
    return res?.data;
  },

  async matchCommunication(id, data) {
    const res = await apiClient.post(`/communications/unmatched/${id}/match`, data);
    return res?.data;
  },
};
