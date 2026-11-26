import { apiClient } from './apiClient';

export const timeService = {
  async getTimeEntries(params = {}) {
    const res = await apiClient.get('/time/entries', params);
    const entries = Array.isArray(res?.data) ? res.data : (res?.data?.entries || []);
    return { entries, pagination: res?.pagination || res?.data?.pagination || {} };
  },

  async getTimeEntryById(id) {
    const res = await apiClient.get(`/time/entries/${id}`);
    return res?.data?.entry;
  },

  async createTimeEntry(data) {
    const res = await apiClient.post('/time/entries', data);
    return res?.data?.entry;
  },

  async updateTimeEntry(id, data) {
    const res = await apiClient.put(`/time/entries/${id}`, data);
    return res?.data?.entry;
  },

  async approveTimeEntry(id, data = {}) {
    const res = await apiClient.patch(`/time/entries/${id}/approve`, data);
    return res?.data?.entry;
  },

  async deleteTimeEntry(id) {
    const res = await apiClient.delete(`/time/entries/${id}`);
    return res?.data;
  },

  async getSuggestedBilling() {
    const res = await apiClient.get('/time/suggested-billing');
    return res?.data?.suggestions || [];
  },

  async convertSuggestedBilling(id) {
    const res = await apiClient.post(`/time/suggested-billing/${id}/convert`);
    return res?.data?.entry;
  },

  async getReviewSlots(params = {}) {
    const res = await apiClient.get('/time/review-slots', params);
    return res?.data || [];
  },

  async markReviewSlotCompleted(slotId, data = {}) {
    const res = await apiClient.post(`/time/review-slots/${slotId}/reviewed`, data);
    return res?.data;
  },

  async getReviewFlags(params = {}) {
    const res = await apiClient.get('/time/review-flags', params);
    return res?.data || { idleFlags: [], overlapFlags: [], metadata: {} };
  },

  async updateReviewFlagStatus(flagId, data = {}) {
    const res = await apiClient.patch(`/time/review-flags/${flagId}/status`, data);
    return res?.data;
  },
};
