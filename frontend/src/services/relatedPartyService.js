import { apiClient } from './apiClient';

export const relatedPartyService = {
  async getRelatedParties(params = {}) {
    const res = await apiClient.get('/related-parties', params);
    return {
      parties: Array.isArray(res?.data) ? res.data : [],
      meta: res?.meta || { total: 0, migrationPending: false },
    };
  },

  async createRelatedParty(data) {
    const res = await apiClient.post('/related-parties', data);
    return res?.data?.party;
  },

  async updateRelatedParty(id, data) {
    const res = await apiClient.put(`/related-parties/${id}`, data);
    return res?.data?.party;
  },

  async deleteRelatedParty(id) {
    const res = await apiClient.delete(`/related-parties/${id}`);
    return res?.data;
  },

  async conflictSearch(params = {}) {
    const res = await apiClient.get('/related-parties/conflict-search', params);
    return res?.data || { matches: [], queriedTerms: [], searchedCategories: [], hasConflicts: false };
  },
};
