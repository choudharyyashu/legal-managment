import { apiClient, tokenStorage } from './apiClient';
import { createLegalDocumentPdf } from '../utils/pdfGenerator';

async function downloadBinary(url, fallbackFilename) {
  const token = tokenStorage.get();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    let errMessage = `Download failed (${response.status})`;
    try {
      const json = await response.json();
      errMessage = json?.error?.message || json?.message || errMessage;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  let filename = fallbackFilename;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) filename = match[1];
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(blobUrl);
  document.body.removeChild(a);
  return true;
}

export const documentService = {
  async getDocuments(params = {}) {
    const res = await apiClient.get('/documents', params);
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.documents)) return res.data.documents;
    return [];
  },

  async getDocumentById(id) {
    const res = await apiClient.get(`/documents/${id}`);
    return res?.data?.document || res?.data;
  },

  async createDocument(data) {
    const res = await apiClient.post('/documents', data);
    return res?.data?.document || res?.data;
  },

  async updateDocument(id, data) {
    const res = await apiClient.patch(`/documents/${id}`, data);
    return res?.data?.document || res?.data;
  },

  async uploadNewDocument(formDataOrPayload) {
    const res = await apiClient.post('/documents/upload', formDataOrPayload);
    return res?.data;
  },

  async uploadVersion(id, data) {
    const res = await apiClient.post(`/documents/${id}/upload`, data);
    return res?.data?.version || res?.data;
  },

  async getVersions(id) {
    const res = await apiClient.get(`/documents/${id}/versions`);
    return res?.data?.versions || [];
  },

  async restoreVersion(id, versionId) {
    const res = await apiClient.post(`/documents/${id}/versions/${versionId}/restore`, {});
    return res?.data?.version || res?.data;
  },

  async downloadDocumentVersion(id, versionId, fallbackName = 'document.pdf') {
    const baseUrl = apiClient.getBaseUrl().replace(/\/+$/, '');
    return await downloadBinary(`${baseUrl}/documents/${id}/versions/${versionId}/download`, fallbackName);
  },

  async downloadDocument(id, docDetails = null) {
    const baseUrl = apiClient.getBaseUrl().replace(/\/+$/, '');
    return await downloadBinary(
      `${baseUrl}/documents/${id}/download`,
      docDetails?.fileName || `document-${id}.pdf`
    );
  },

  async runOcrExtraction(id, versionId = undefined) {
    const res = await apiClient.post(`/documents/${id}/ocr`, versionId ? { versionId } : {});
    return res?.data;
  },

  async getOcrDetails(id) {
    const res = await apiClient.get(`/documents/${id}/ocr`);
    return res?.data;
  },

  async verifyIntegrity(id) {
    const res = await apiClient.get(`/documents/${id}/verify-integrity`);
    return res?.data;
  },

  async getStorageStats() {
    const res = await apiClient.get('/documents/storage/stats');
    return res?.data;
  },

  async deleteDocument(id) {
    const res = await apiClient.delete(`/documents/${id}`);
    return res?.data;
  },

  async getEventCatalog() {
    const res = await apiClient.get('/documents/events/catalog');
    return res?.data?.events || [];
  },

  async triggerDocumentEvent(event, matterId, payload = {}) {
    const res = await apiClient.post('/documents/events/trigger', {
      event,
      matterId,
      payload,
    });
    return res?.data;
  },

  // 300-Document Automation Catalog endpoints
  async getAutomationSummary() {
    const res = await apiClient.get('/documents/automations/summary');
    return res?.data;
  },

  async getAutomations(params = {}) {
    const res = await apiClient.get('/documents/automations', params);
    return res?.data;
  },

  async getAutomationById(catalogId) {
    const res = await apiClient.get(`/documents/automations/${catalogId}`);
    return res?.data;
  },

  async materializeAutomations(options = {}) {
    const res = await apiClient.post('/documents/automations/materialize', options);
    return res?.data;
  },

  async triggerAutomation(catalogId, matterId, customOverrides = {}) {
    const res = await apiClient.post(`/documents/automations/${catalogId}/trigger`, {
      matterId,
      customOverrides,
    });
    return res?.data;
  },

  async validateDraftPrerequisites(data) {
    const res = await apiClient.post('/documents/drafts/validate', data);
    return res?.data;
  },

  async generateDraft(data) {
    const res = await apiClient.post('/documents/drafts/generate', data);
    return res?.data;
  },

  async convertDraftToPdf(id) {
    const res = await apiClient.post(`/documents/drafts/${id}/pdf`, {});
    return res?.data;
  },

  async createFollowUpTask(data) {
    const res = await apiClient.post('/documents/drafts/tasks/followup', data);
    return res?.data;
  },

  async getDrafts(params = {}) {
    const res = await apiClient.get('/documents/drafts', params);
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.drafts)) return res.data.drafts;
    if (Array.isArray(res?.drafts)) return res.drafts;
    return [];
  },

  async getDraftById(id) {
    const res = await apiClient.get(`/documents/drafts/${id}`);
    return res?.data?.draft || res?.data;
  },

  async approveDraft(id, data = {}) {
    const res = await apiClient.post(`/documents/drafts/${id}/approve`, data);
    return res?.data;
  },

  async rejectDraft(id, data = {}) {
    const res = await apiClient.post(`/documents/drafts/${id}/reject`, data);
    return res?.data;
  },

  async sendDraft(id, data = {}) {
    const res = await apiClient.post(`/documents/drafts/${id}/send`, data);
    return res?.data;
  },

  // Regeneration & Version Diff endpoints
  async getOutdatedDrafts(matterId = undefined) {
    const res = await apiClient.get('/documents/drafts/outdated', matterId ? { matterId } : {});
    return res?.data || [];
  },

  async regenerateCandidate(id, customOverrides = {}) {
    const res = await apiClient.post(`/documents/drafts/${id}/regenerate`, { customOverrides });
    return res?.data;
  },

  async compareDraftVersions(id, candidateId) {
    const res = await apiClient.get(`/documents/drafts/${id}/compare/${candidateId}`);
    return res?.data;
  },

  async acceptCandidate(id, candidateId) {
    const res = await apiClient.post(`/documents/drafts/${id}/accept/${candidateId}`, {});
    return res?.data;
  },

  async rejectCandidate(id, candidateId, reason = '') {
    const res = await apiClient.post(`/documents/drafts/${id}/reject/${candidateId}`, { reason });
    return res?.data;
  },

  async markManualEdits(id, hasManualEdits) {
    const res = await apiClient.patch(`/documents/drafts/${id}/manual-edits`, { hasManualEdits });
    return res?.data;
  },

  async downloadDraft(id, format = 'docx', draftDetails = null) {
    const baseUrl = apiClient.getBaseUrl().replace(/\/+$/, '');
    const ext = format.toLowerCase();
    try {
      return await downloadBinary(
        `${baseUrl}/documents/drafts/${id}/download?format=${ext}`,
        `draft-${id}.${ext}`
      );
    } catch (e) {
      console.warn('Backend draft download error:', e);
      if (ext !== 'pdf') throw e;
    }

    // Client-side PDF fallback only if backend unreachable
    const title = draftDetails?.title || draftDetails?.template?.templateName || 'Legal Document Draft';
    const client = draftDetails?.client?.name || draftDetails?.clientName || 'Client Records';
    const matter = draftDetails?.matter?.title || draftDetails?.matter?.matterNumber || draftDetails?.matterTitle || 'Legal Matter Records';
    const attorney =
      draftDetails?.matter?.responsibleAttorneyName ||
      draftDetails?.responsibleAttorney?.name ||
      'Assigned Counsel';
    const code = draftDetails?.draftCode || `DFT-${String(id).slice(0, 8)}`;

    const pdfBlob = createLegalDocumentPdf({
      title,
      draftCode: code,
      client,
      matter,
      attorney,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    });

    const filename = `${code}_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
    return true;
  },
};
