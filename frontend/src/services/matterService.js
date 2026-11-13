import { apiClient } from './apiClient';

export const matterService = {
  async getMatters(params = {}) {
    const res = await apiClient.get('/matters', params);
    const matters = Array.isArray(res?.data) ? res.data : (res?.data?.matters || []);
    return { matters, pagination: res?.pagination || res?.data?.pagination || {} };
  },

  async getMatterById(id) {
    const res = await apiClient.get(`/matters/${id}`);
    return res?.data?.matter;
  },

  async createMatter(data) {
    const res = await apiClient.post('/matters', data);
    return res?.data?.matter;
  },

  async updateMatter(id, data) {
    const res = await apiClient.put(`/matters/${id}`, data);
    return res?.data?.matter;
  },

  async updateMatterStatus(id, status, currentStageId = null) {
    const res = await apiClient.patch(`/matters/${id}/status`, { status, currentStageId });
    return res?.data?.matter;
  },

  async assignStaff(id, userId, assignmentRole = 'paralegal') {
    const res = await apiClient.post(`/matters/${id}/staff`, { userId, assignmentRole });
    return res?.data;
  },

  async removeStaff(id, userId) {
    const res = await apiClient.delete(`/matters/${id}/staff/${userId}`);
    return res?.data;
  },
};
