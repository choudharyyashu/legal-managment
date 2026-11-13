import { apiClient } from './apiClient';

export const intakeService = {
  async getIntakes(params = {}) {
    const res = await apiClient.get('/intakes', params);
    return res?.data || { intakes: [], pagination: {} };
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

  async clearConflict(id, data = {}) {
    const res = await apiClient.post(`/intakes/${id}/clear-conflict`, data);
    return res?.data;
  },
};

