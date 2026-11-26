import { apiClient } from './apiClient';

export const intakeService = {
  async getIntakes(params = {}) {
    const res = await apiClient.get('/intakes', params);
    const intakes = Array.isArray(res?.data) ? res.data : (res?.data?.intakes || []);
    return { intakes, pagination: res?.pagination || res?.data?.pagination || {} };
  },

  async getIntakeById(id) {
    const res = await apiClient.get(`/intakes/${id}`);
    return res?.data?.intake;
  },

  async createIntake(data) {
    const res = await apiClient.post('/intakes', data);
    return res?.data?.intake;
  },

  async updateIntake(id, data) {
    const res = await apiClient.put(`/intakes/${id}`, data);
    return res?.data?.intake;
  },

  async runConflictCheck(id) {
    const res = await apiClient.post(`/intakes/${id}/conflict-check`);
    return res?.data;
  },

  async getConflictLogs(id) {
    const res = await apiClient.get(`/intakes/${id}/conflict-logs`);
    return res?.data;
  },

  async clearConflict(id, data = {}) {
    const res = await apiClient.post(`/intakes/${id}/clear-conflict`, data);
    return res?.data;
  },

  async convertToClient(id, data = {}) {
    const res = await apiClient.post(`/intakes/${id}/convert-client`, data);
    return res?.data;
  },

  async convertToMatter(id, data = {}) {
    const res = await apiClient.post(`/intakes/${id}/convert-matter`, data);
    return res?.data;
  },
};

