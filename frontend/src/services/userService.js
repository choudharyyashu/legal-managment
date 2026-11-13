import { apiClient } from './apiClient';

export const userService = {
  async getUsers(params = {}) {
    const res = await apiClient.get('/users', params);
    const users = Array.isArray(res?.data) ? res.data : (res?.data?.users || []);
    return { users, pagination: res?.pagination || res?.data?.pagination || {} };
  },

  async getUserById(id) {
    const res = await apiClient.get(`/users/${id}`);
    return res?.data?.user;
  },

  async createUser(data) {
    const res = await apiClient.post('/users', data);
    return res?.data?.user;
  },

  async updateUser(id, data) {
    const res = await apiClient.put(`/users/${id}`, data);
    return res?.data?.user;
  },

  async updateStatus(id, status) {
    const res = await apiClient.patch(`/users/${id}/status`, { status });
    return res?.data?.user;
  },

  async deleteUser(id) {
    const res = await apiClient.delete(`/users/${id}`);
    return res?.data;
  },
};
