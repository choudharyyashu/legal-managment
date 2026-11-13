import { apiClient } from './apiClient';

export const ledgerService = {
  async getAccounts() {
    const res = await apiClient.get('/ledger/accounts');
    return res?.data?.accounts || [];
  },

  async getJournals(params = {}) {
    const res = await apiClient.get('/ledger/journals', params);
    return res?.data || { journals: [], pagination: {} };
  },

  async getJournalById(id) {
    const res = await apiClient.get(`/ledger/journals/${id}`);
    return res?.data?.journal;
  },

  async createJournal(data) {
    const res = await apiClient.post('/ledger/journals', data);
    return res?.data?.journal;
  },
};

