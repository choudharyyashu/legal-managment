import { apiClient } from './apiClient';

export const clientService = {
  async getClients(params = {}) {
    const res = await apiClient.get('/clients', params);
    const clients = Array.isArray(res?.data) ? res.data : (res?.data?.clients || []);
    return { clients, pagination: res?.pagination || res?.data?.pagination || {} };
  },

  async getClientById(id) {
    const res = await apiClient.get(`/clients/${id}`);
    return res?.data?.client;
  },

  async createClient(data) {
    const res = await apiClient.post('/clients', data);
    return res?.data?.client;
  },

  async updateClient(id, data) {
    const res = await apiClient.put(`/clients/${id}`, data);
    return res?.data?.client;
  },

  async updateClientStatus(id, status) {
    const res = await apiClient.patch(`/clients/${id}/status`, { status });
    return res?.data?.client;
  },

  async getClientMatters(id) {
    const res = await apiClient.get(`/clients/${id}/matters`);
    return res?.data?.matters || [];
  },
};
