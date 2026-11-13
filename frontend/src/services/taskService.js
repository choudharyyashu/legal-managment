import { apiClient } from './apiClient';

export const taskService = {
  async getTasks(params = {}) {
    const res = await apiClient.get('/tasks', params);
    const tasks = Array.isArray(res?.data) ? res.data : (res?.data?.tasks || []);
    return { tasks, pagination: res?.pagination || res?.data?.pagination || {} };
  },

  async getTaskById(id) {
    const res = await apiClient.get(`/tasks/${id}`);
    return res?.data?.task;
  },

  async createTask(data) {
    const res = await apiClient.post('/tasks', data);
    return res?.data?.task;
  },

  async updateTask(id, data) {
    const res = await apiClient.put(`/tasks/${id}`, data);
    return res?.data?.task;
  },

  async updateTaskStatus(id, status) {
    const res = await apiClient.patch(`/tasks/${id}/status`, { status });
    return res?.data?.task;
  },

  async deleteTask(id) {
    const res = await apiClient.delete(`/tasks/${id}`);
    return res?.data;
  },
};
