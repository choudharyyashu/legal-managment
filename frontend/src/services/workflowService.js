import { apiClient } from './apiClient';

export const workflowService = {
  async getStages(params = {}) {
    const res = await apiClient.get('/workflows/stages', params);
    return res?.data || [];
  },

  async getStageById(id) {
    const res = await apiClient.get(`/workflows/stages/${id}`);
    return res?.data;
  },

  async createStage(stageData) {
    const res = await apiClient.post('/workflows/stages', stageData);
    return res?.data;
  },

  async updateStage(stageId, stageData) {
    const res = await apiClient.put(`/workflows/stages/${stageId}`, stageData);
    return res?.data;
  },

  async updateStageChecklist(stageId, requiredFields) {
    const res = await apiClient.put(`/workflows/stages/${stageId}/checklist`, { requiredFields });
    return res?.data;
  },

  async addAutomationRule(stageId, ruleData) {
    const res = await apiClient.post(`/workflows/stages/${stageId}/rules`, ruleData);
    return res?.data;
  },

  async getMatterChecklistProgress(matterId) {
    const res = await apiClient.get(`/workflows/matters/${matterId}/checklist`);
    return res?.data;
  },

  async toggleMatterChecklist(matterId, data) {
    const res = await apiClient.post(`/workflows/matters/${matterId}/checklist/toggle`, data);
    return res?.data;
  },
};
