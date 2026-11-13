import { apiClient } from './apiClient';

export const ledgerService = {
  async getAccounts() {
    const res = await apiClient.get('/ledger/accounts');
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.accounts)) return res.data.accounts;
    return [];
  },

  async createAccount(data) {
    const res = await apiClient.post('/ledger/accounts', data);
    return res?.data?.account || res?.data;
  },

  async getJournals(params = {}) {
    const res = await apiClient.get('/ledger/journals', params);
    return res?.data || { journals: [], pagination: {} };
  },

  async getJournalById(id) {
    const res = await apiClient.get(`/ledger/journals/${id}`);
    return res?.data?.journal || res?.data;
  },

  async createJournal(data) {
    const res = await apiClient.post('/ledger/journals', data);
    return res?.data?.journal || res?.data;
  },
};
