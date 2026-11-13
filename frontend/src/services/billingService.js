import { apiClient } from './apiClient';

export const billingService = {
  async getInvoices(params = {}) {
    const res = await apiClient.get('/billing/invoices', params);
    const invoices = Array.isArray(res?.data) ? res.data : (res?.data?.invoices || []);
    return { invoices, pagination: res?.pagination || res?.data?.pagination || {} };
  },

  async getInvoiceById(id) {
    const res = await apiClient.get(`/billing/invoices/${id}`);
    return res?.data?.invoice;
  },

  async createInvoice(data) {
    const res = await apiClient.post('/billing/invoices', data);
    return res?.data?.invoice;
  },

  async updateInvoiceStatus(id, status) {
    const res = await apiClient.patch(`/billing/invoices/${id}/status`, { status });
    return res?.data?.invoice;
  },

  async getPayments(params = {}) {
    const res = await apiClient.get('/billing/payments', params);
    return res?.data || { payments: [], pagination: {} };
  },

  async recordPayment(data) {
    const res = await apiClient.post('/billing/payments', data);
    return res?.data?.payment;
  },
};
