import { apiClient } from './apiClient';

export const piService = {
  async getIncident(matterId) {
    const res = await apiClient.get(`/pi/matters/${matterId}/incident`);
    return res?.data;
  },

  async saveIncident(matterId, data) {
    const res = await apiClient.post(`/pi/matters/${matterId}/incident`, data);
    return res?.data;
  },

  async getProviders(matterId) {
    const res = await apiClient.get(`/pi/matters/${matterId}/providers`);
    return res?.data;
  },

  async addProvider(matterId, data) {
    const res = await apiClient.post(`/pi/matters/${matterId}/providers`, data);
    return res?.data;
  },

  async getInsurance(matterId) {
    const res = await apiClient.get(`/pi/matters/${matterId}/insurance`);
    return res?.data;
  },

  async createInsurance(matterId, data) {
    const res = await apiClient.post(`/pi/matters/${matterId}/insurance`, data);
    return res?.data;
  },

  async getDemands(matterId) {
    const res = await apiClient.get(`/pi/matters/${matterId}/demands`);
    return res?.data;
  },

  async createDemand(matterId, data) {
    const res = await apiClient.post(`/pi/matters/${matterId}/demands`, data);
    return res?.data;
  },

  async getWorkflowTasks(matterId) {
    const res = await apiClient.get(`/pi/matters/${matterId}/workflow/tasks`);
    return res?.data;
  },

  async signAuthorization(matterId, requestId, data) {
    const res = await apiClient.post(`/pi/matters/${matterId}/records-requests/${requestId}/sign-authorization`, data);
    return res?.data;
  },

  async updateRecordRequestStatus(matterId, requestId, data) {
    const res = await apiClient.patch(`/pi/matters/${matterId}/records-requests/${requestId}/status`, data);
    return res?.data;
  },

  async markRecordsIncomplete(requestId, data, matterId) {
    const url = matterId
      ? `/pi/matters/${matterId}/records-requests/${requestId}/incomplete`
      : `/pi/records-requests/${requestId}/incomplete`;
    const res = await apiClient.post(url, data);
    return res?.data;
  },

  async getLiens(matterId) {
    const res = await apiClient.get(`/pi/matters/${matterId}/liens`);
    return res?.data;
  },

  async createLien(matterId, data) {
    const res = await apiClient.post(`/pi/matters/${matterId}/liens`, data);
    return res?.data;
  },

  async updateLien(matterId, lienId, data) {
    const res = await apiClient.patch(`/pi/matters/${matterId}/liens/${lienId}`, data);
    return res?.data;
  },

  async getDamages(matterId) {
    const res = await apiClient.get(`/pi/matters/${matterId}/damages`);
    return res?.data;
  },

  async createDamage(matterId, data) {
    const res = await apiClient.post(`/pi/matters/${matterId}/damages`, data);
    return res?.data;
  },

  async getSettlements(matterId) {
    const res = await apiClient.get(`/pi/matters/${matterId}/settlements`);
    return res?.data;
  },

  async createSettlement(matterId, data) {
    const res = await apiClient.post(`/pi/matters/${matterId}/settlements`, data);
    return res?.data;
  },

  async getVendors() {
    const res = await apiClient.get('/pi/vendors');
    return res?.data;
  },

  async createVendor(data) {
    const res = await apiClient.post('/pi/vendors', data);
    return res?.data;
  },

  async getVendorAssignments(matterId) {
    const res = await apiClient.get(`/pi/matters/${matterId}/vendors`);
    return res?.data;
  },

  async createVendorAssignment(matterId, data) {
    const res = await apiClient.post(`/pi/matters/${matterId}/vendors`, data);
    return res?.data;
  },

  async getDashboardMetrics() {
    const res = await apiClient.get('/pi/dashboard-metrics');
    return res?.data;
  },
};
