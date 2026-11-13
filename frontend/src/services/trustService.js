import { apiClient } from './apiClient';

export const trustService = {
  async getLedgers(params = {}) {
    const res = await apiClient.get('/trust/ledgers', params);
    const ledgers = Array.isArray(res?.data) ? res.data : (res?.data?.ledgers || []);
    return { ledgers, pagination: res?.pagination || res?.data?.pagination || {} };
  },

  async getLedgerById(id) {
    const res = await apiClient.get(`/trust/ledgers/${id}`);
    return res?.data?.ledger;
  },

  async deposit(data) {
    const res = await apiClient.post('/trust/deposits', data);
    return res?.data;
  },

  async disburse(data) {
    const res = await apiClient.post('/trust/disbursements', data);
    return res?.data;
  },

  async getTransactions(params = {}) {
    const res = await apiClient.get('/trust/transactions', params);
    return res?.data || { transactions: [], pagination: {} };
  },
};
