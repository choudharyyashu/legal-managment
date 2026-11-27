import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Upload,
  FileText,
  Search,
  Eye,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Zap,
  HardDrive,
  ScanText,
  History,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { documentService } from '../../../services/documentService';
import { useMatters } from '../../../context/MatterContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { GenerateDraftModal } from '../components/GenerateDraftModal';
import { DraftReviewModal } from '../components/DraftReviewModal';
import { formatDate } from '../../../utils/formatDate';

const DOCUMENT_CATEGORIES = [
  'Pleading',
  'Motion',
  'Discovery',
  'Correspondence',
  'Contract',
  'Evidence',
  'Court Order',
  'Billing / Receipt',
  'Engagement',
  'Personal Injury',
  'Civil Litigation',
  'Bankruptcy',
  'Immigration',
  'Probate',
  'Family Law',
  'Criminal Defense',
  'Appeals',
  'Landlord-Tenant',
  'Legal Draft',
  'Other',
];

export function DocumentsList() {
  const { matters } = useMatters();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [privilegeFilter, setPrivilegeFilter] = useState('all');
  const [searchOCR, setSearchOCR] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [viewMode, setViewMode] = useState('documents'); // 'documents' | 'drafts' | 'automations'
  const [drafts, setDrafts] = useState([]);
  const [selectedReviewDraft, setSelectedReviewDraft] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Storage stats
  const [storageStats, setStorageStats] = useState(null);

  // 300-Automation Catalog state
  const [automations, setAutomations] = useState([]);
  const [automationSummary, setAutomationSummary] = useState(null);
  const [automationPracticeArea, setAutomationPracticeArea] = useState('');
  const [automationMatterId, setAutomationMatterId] = useState('');
  const [triggeringCatId, setTriggeringCatId] = useState(null);
  const [automationPage, setAutomationPage] = useState(1);
  const [automationPageSize, setAutomationPageSize] = useState(50);
  const [automationPagination, setAutomationPagination] = useState({
    totalCatalogCount: 300,
    filteredCount: 300,
    totalPages: 6,
    page: 1,
    limit: 50,
  });

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOcrData, setPreviewOcrData] = useState(null);
  const [runningOcr, setRunningOcr] = useState(false);
  const [integrityResult, setIntegrityResult] = useState(null);
  const [versionDoc, setVersionDoc] = useState(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Pleading');
  const [uploadMatterId, setUploadMatterId] = useState('');
  const [isNewDocPrivileged, setIsNewDocPrivileged] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // New Revision Form State
  const [revisionFile, setRevisionFile] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Editable Display Title & Delete Confirmation State
  const [renameDoc, setRenameDoc] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [deleteDocTarget, setDeleteDocTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await documentService.getDocuments({
        limit: 100,
        ...(searchOCR && searchQuery ? { search: searchQuery, ocrSearch: 'true' } : {}),
      });
      if (Array.isArray(res)) {
        setDocuments(
          res.map((d) => ({
            ...d,
            id: d.id,
            title: d.title,
            fileName: d.versions?.[0]?.fileName || `${d.title.replace(/\s+/g, '_')}.pdf`,
            fileSize: d.versions?.[0]?.fileSizeBytes
              ? `${Math.max(1, Math.round(Number(d.versions[0].fileSizeBytes) / 1024))} KB`
              : '—',
            matterTitle: d.matterTitle || d.matter?.title || 'Matter Document',
            clientName: d.clientName || d.client?.name || 'Firm Client',
            category: d.category || 'Pleading',
            version: d.currentVersion || d.versions?.[0]?.versionLabel || 'v1.0',
            uploadedAt: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '',
            uploadedByName: d.versions?.[0]?.uploadedByName || 'Firm Staff',
            isPrivileged: Boolean(d.isPrivileged),
            privilegeType: d.privilegeType || null,
            ocrText: d.ocrContent || '',
            isDbRecord: true,
            versionHistory:
              Array.isArray(d.versions) && d.versions.length > 0
                ? d.versions.map((v) => ({
                    id: v.id,
                    version: v.versionLabel,
                    fileName: v.fileName,
                    sha256Checksum: v.sha256Checksum,
                    date: v.uploadedAt ? new Date(v.uploadedAt).toISOString().split('T')[0] : '',
                    author: v.uploadedByName || 'Firm Staff',
                    note: v.revisionNotes || 'Uploaded version',
                  }))
                : [],
          }))
        );
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.warn('Could not load documents from API:', err?.message);
      setDocuments([]);
    }
  }, [searchOCR, searchQuery]);

  const loadDrafts = useCallback(async () => {
    try {
      const res = await documentService.getDrafts({ limit: 100 });
      setDrafts(Array.isArray(res) ? res : []);
    } catch {
      setDrafts([]);
    }
  }, []);

  const loadStorageStats = useCallback(async () => {
    try {
      const stats = await documentService.getStorageStats();
      setStorageStats(stats);
    } catch {
      // optional
    }
  }, []);

  const loadAutomations = useCallback(async () => {
    try {
      const [listRes, summaryRes] = await Promise.all([
        documentService.getAutomations({
          practiceAreaId: automationPracticeArea || undefined,
          search: searchQuery || undefined,
          page: automationPage,
          limit: automationPageSize,
        }),
        documentService.getAutomationSummary(),
      ]);
      setAutomations(listRes?.items || []);
      setAutomationPagination({
        totalCatalogCount: listRes?.totalCatalogCount ?? 300,
        filteredCount: listRes?.filteredCount ?? (listRes?.items?.length || 0),
        totalPages: listRes?.totalPages ?? 1,
        page: listRes?.page ?? automationPage,
        limit: listRes?.limit ?? automationPageSize,
      });
      setAutomationSummary(summaryRes || null);
    } catch {
      setAutomations([]);
    }
  }, [automationPracticeArea, searchQuery, automationPage, automationPageSize]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    loadDrafts();
    loadStorageStats();
  }, [loadDrafts, loadStorageStats]);

  useEffect(() => {
    if (viewMode === 'automations') {
      loadAutomations();
    }
  }, [viewMode, loadAutomations]);

  useEffect(() => {
    if (matters.length > 0 && !automationMatterId) {
      setAutomationMatterId(matters[0].id);
    }
  }, [matters, automationMatterId]);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchQuery.toLowerCase();
      const matchesVersion =
        Array.isArray(doc.versionHistory) &&
        doc.versionHistory.some(
          (v) =>
            (v.fileName && v.fileName.toLowerCase().includes(q)) ||
            (v.sha256Checksum && v.sha256Checksum.toLowerCase().includes(q)) ||
            (v.note && v.note.toLowerCase().includes(q))
        );
      const matchesStandard =
        searchQuery === '' ||
        doc.title.toLowerCase().includes(q) ||
        (doc.documentCode && doc.documentCode.toLowerCase().includes(q)) ||
        (doc.fileName && doc.fileName.toLowerCase().includes(q)) ||
        (doc.batesNumberStart && doc.batesNumberStart.toLowerCase().includes(q)) ||
        (doc.matterTitle && doc.matterTitle.toLowerCase().includes(q)) ||
        (doc.clientName && doc.clientName.toLowerCase().includes(q)) ||
        matchesVersion;

      const matchesOCR = searchOCR && doc.ocrText && doc.ocrText.toLowerCase().includes(q);
      const matchesSearch = matchesStandard || matchesOCR;

      const matchesCat = categoryFilter === '' || doc.category === categoryFilter;
      const matchesPrivilege =
        privilegeFilter === 'all' ||
        (privilegeFilter === 'privileged' && doc.isPrivileged) ||
        (privilegeFilter === 'public' && !doc.isPrivileged);

      return matchesSearch && matchesCat && matchesPrivilege;
    });
  }, [documents, searchQuery, categoryFilter, privilegeFilter, searchOCR]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadMatterId) {
      addToast('Please provide a document title and select a Linked Matter.', 'error');
      return;
    }
    if (!selectedFile) {
      addToast('Please select a file (PDF, DOCX, TXT, or Image) to upload.', 'error');
      return;
    }

    const matter = matters.find((m) => m.id === uploadMatterId || m.matterNumber === uploadMatterId);
    if (!matter?.id) {
      addToast('Selected matter not found.', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('matterId', matter.id);
      if (matter.clientId) formData.append('clientId', matter.clientId);
      formData.append('title', uploadTitle.trim());
      formData.append('category', uploadCategory);
      formData.append('isPrivileged', String(Boolean(isNewDocPrivileged)));
      if (isNewDocPrivileged) {
        formData.append('privilegeType', 'Attorney Work Product (Utah RPC 1.6)');
      }

      const uploaded = await documentService.uploadNewDocument(formData);
      const ocrWords = uploaded?.ocrExtraction?.wordCount || 0;
      addToast(
        `Document "${uploadTitle}" (${uploaded?.document?.documentCode || 'v1.0'}) uploaded. OCR indexed ${ocrWords} words.`,
        'success'
      );
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setSelectedFile(null);
      setIsNewDocPrivileged(false);
      await loadDocuments();
      await loadStorageStats();
    } catch (err) {
      addToast(err?.message || 'Failed to upload document to vault.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadNewVersion = async (e) => {
    e.preventDefault();
    if (!versionDoc) return;
    if (!revisionFile) {
      addToast('Please choose a file to upload as the new revision.', 'warning');
      return;
    }
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', revisionFile);
      formData.append('revisionNotes', revisionNotes.trim() || `Uploaded revision by ${currentUser?.name || 'Staff'}`);

      const res = await documentService.uploadVersion(versionDoc.id, formData);
      addToast(`Uploaded ${res.versionLabel || 'new version'} for "${versionDoc.title}".`, 'success');
      setRevisionFile(null);
      setRevisionNotes('');
      setVersionDoc(null);
      await loadDocuments();
      await loadStorageStats();
    } catch (err) {
      addToast(err?.message || 'Failed to upload new revision.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestoreVersion = async (docId, versionId, versionLabel) => {
    try {
      setIsUploading(true);
      const restored = await documentService.restoreVersion(docId, versionId);
      addToast(`Restored ${versionLabel} as new active version ${restored.versionLabel}.`, 'success');
      setVersionDoc(null);
      await loadDocuments();
    } catch (err) {
      addToast(err?.message || 'Failed to restore version.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenPreview = async (doc) => {
    setPreviewDoc(doc);
    setPreviewOcrData(null);
    setIntegrityResult(null);
    try {
      const [ocrRes, integrityRes] = await Promise.all([
        documentService.getOcrDetails(doc.id).catch(() => null),
        documentService.verifyIntegrity(doc.id).catch(() => null),
      ]);
      setPreviewOcrData(ocrRes);
      setIntegrityResult(integrityRes);
    } catch {
      // non-blocking
    }
  };

  const handleRunOcr = async () => {
    if (!previewDoc) return;
    setRunningOcr(true);
    try {
      const res = await documentService.runOcrExtraction(previewDoc.id);
      setPreviewOcrData({
        ocrContent: res.ocrContent,
        extractedFields: res.extraction?.extractedFields,
        method: res.extraction?.method,
        wordCount: res.extraction?.wordCount,
        confidence: res.extraction?.confidence,
        warnings: res.extraction?.warnings,
      });
      addToast(`OCR extraction complete (${res.extraction?.method}, ${res.extraction?.wordCount || 0} words).`, 'success');
      await loadDocuments();
    } catch (err) {
      addToast(err?.message || 'OCR extraction failed.', 'error');
    } finally {
      setRunningOcr(false);
    }
  };

  const handleTriggerCatalogItem = async (item) => {
    const targetMatterId = automationMatterId || matters[0]?.id;
    if (!targetMatterId) {
      addToast('Please select a target matter first.', 'warning');
      return;
    }
    setTriggeringCatId(item.catalogId);
    try {
      const res = await documentService.triggerAutomation(item.catalogId, targetMatterId);
      addToast(
        res?.isDuplicate
          ? `Draft ${res?.draft?.draftCode} already active for ${item.catalogId}.`
          : `Triggered ${item.catalogId}: generated draft ${res?.draft?.draftCode}.`,
        'success'
      );
      await loadDrafts();
      setViewMode('drafts');
    } catch (err) {
      addToast(err?.message || `Failed to trigger ${item.catalogId}.`, 'error');
    } finally {
      setTriggeringCatId(null);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      await documentService.downloadDocument(doc.id, doc);
      addToast(`Document "${doc.fileName || doc.title}" downloaded.`, 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to download document from vault.', 'error');
    }
  };

  const handleTogglePrivilege = async (doc) => {
    try {
      const nextPrivileged = !doc.isPrivileged;
      await documentService.updateDocument(doc.id, {
        isPrivileged: nextPrivileged,
        privilegeType: nextPrivileged ? 'Attorney Work Product (Utah RPC 1.6)' : null,
      });
      addToast(
        nextPrivileged
          ? `"${doc.title}" marked as Privileged (Utah RPC 1.6).`
          : `"${doc.title}" set to Standard / Court Record.`,
        'success'
      );
      await loadDocuments();
    } catch (err) {
      addToast(err?.message || 'Failed to update privilege tag.', 'error');
    }
  };

  const handleDownloadVersion = async (docId, versionId, fileName) => {
    try {
      await documentService.downloadDocumentVersion(docId, versionId, fileName);
      addToast(`Version "${fileName}" downloaded.`, 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to download document version.', 'error');
    }
  };

  const handleConfirmDeleteDocument = async () => {
    if (!deleteDocTarget) return;
    setIsDeleting(true);
    try {
      await documentService.deleteDocument(deleteDocTarget.id);
      addToast(`Document "${deleteDocTarget.title}" deleted.`, 'success');
      setDeleteDocTarget(null);
      await loadDocuments();
      await loadStorageStats();
    } catch (err) {
      addToast(err?.message || 'Failed to delete document.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameDoc || !renameTitle.trim()) return;
    try {
      await documentService.updateDocument(renameDoc.id, { title: renameTitle.trim() });
      addToast(`Display title updated (origin code ${renameDoc.documentCode} & checksums preserved).`, 'success');
      setRenameDoc(null);
      setRenameTitle('');
      await loadDocuments();
    } catch (err) {
      addToast(err?.message || 'Failed to rename document.', 'error');
    }
  };

  const pendingDraftCount = drafts.filter((d) => ['Draft', 'Under Review'].includes(d.status)).length;

  return (
    <div className="space-y-6">
      {/* Architecture & Storage Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Document Vault, Versioning, OCR &amp; 300-Automation Engine:</strong> Real multipart upload, PDF/DOCX/Image OCR indexing, immutable SHA-256 versioning, and Word/PDF generation.
          </span>
        </div>
        {storageStats && (
          <span className="inline-flex items-center gap-1.5 bg-emerald-200 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[10px]">
            <HardDrive className="w-3 h-3" />
            {storageStats.totalFiles} Files ({Math.round((storageStats.totalBytes || 0) / 1024)} KB)
          </span>
        )}
      </div>

      <PageHeader
        title="Document Management &amp; Repository"
        subtitle="Centralized firm repository for uploaded filings, OCR extraction, version history, draft approvals, and 300 automations."
        breadcrumbs={[{ label: 'Clients & Matters', to: '/clients' }, { label: 'Documents' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => setIsGenerateModalOpen(true)}
              className="border-[#06244B] text-[#06244B] hover:bg-[#06244B]/5"
            >
              Generate Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Document
            </Button>
          </div>
        }
      />

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EAECF0] pb-2 text-xs overflow-x-auto no-scrollbar sm:flex-wrap">
        <button
          type="button"
          onClick={() => setViewMode('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            viewMode === 'documents'
              ? 'bg-[#06244B] text-white shadow-sm'
              : 'bg-[#F9FAFB] text-[#475467] hover:bg-slate-100 border border-[#D0D5DD]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Repository Documents ({documents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('drafts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            viewMode === 'drafts'
              ? 'bg-[#06244B] text-white shadow-sm'
              : 'bg-[#F9FAFB] text-[#475467] hover:bg-slate-100 border border-[#D0D5DD]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Workflow Drafts &amp; Approvals ({drafts.length})</span>
          {pendingDraftCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#A4432B] text-white">
              {pendingDraftCount} Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setViewMode('automations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            viewMode === 'automations'
              ? 'bg-[#06244B] text-white shadow-sm'
              : 'bg-[#F9FAFB] text-[#475467] hover:bg-slate-100 border border-[#D0D5DD]'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>300 Document Automations ({automationSummary?.totalAutomations || 300})</span>
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAECF0] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#98A2B3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setAutomationPage(1);
              }}
              placeholder={
                viewMode === 'automations'
                  ? 'Search 300 automations by ID (CAT-001), title, trigger, or mapped fields...'
                  : searchOCR
                  ? 'Full-text / OCR search inside extracted document contents...'
                  : 'Search by title, code, file name, client, or matter...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-[#1D2939] focus:outline-none focus:ring-2 focus:ring-[#06244B] focus:bg-white"
            />
          </div>

          {viewMode === 'documents' && (
            <button
              type="button"
              onClick={() => {
                setSearchOCR(!searchOCR);
                addToast(!searchOCR ? 'OCR full-text content search enabled.' : 'Standard metadata search active.', 'info');
              }}
              className={`text-xs px-3 py-2 rounded-lg font-semibold border flex items-center gap-1.5 cursor-pointer shrink-0 ${
                searchOCR
                  ? 'bg-[#06244B] text-white border-[#06244B]'
                  : 'bg-[#F9FAFB] text-[#475467] border-[#D0D5DD]'
              }`}
            >
              <ScanText className={`w-3.5 h-3.5 ${searchOCR ? 'text-amber-300' : 'text-[#667085]'}`} />
              <span>OCR Search: {searchOCR ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>

        {viewMode === 'documents' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAECF0] text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Files' },
                { id: 'privileged', label: 'Privileged Only (Rule 1.6)', icon: Lock },
                { id: 'public', label: 'Court Filings / Public', icon: Unlock },
              ].map((f) => {
                const Icon = f.icon;
                const isActive = privilegeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPrivilegeFilter(f.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                      isActive ? 'bg-[#06244B] text-white border-[#06244B]' : 'bg-[#F9FAFB] text-[#344054] border-[#D0D5DD]'
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-[#F9FAFB] text-xs text-[#344054] font-medium"
              >
                <option value="">All Categories</option>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {(searchQuery || privilegeFilter !== 'all' || categoryFilter || searchOCR) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setPrivilegeFilter('all');
                    setCategoryFilter('');
                    setSearchOCR(false);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#667085] hover:text-[#A4432B]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View 1: Documents Repository */}
      {viewMode === 'documents' && (
        <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F9FAFB] text-[#475467] uppercase font-semibold text-[11px] border-b border-[#EAECF0]">
                <tr>
                  <th className="py-3 px-4">Document Title &amp; File</th>
                  <th className="py-3 px-3 text-center">Versions</th>
                  <th className="py-3 px-3">Privilege Tag</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-4">Linked Matter &amp; Client</th>
                  <th className="py-3 px-3">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F9FAFB]/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#06244B] text-white shrink-0">
                          <FileText className="w-4 h-4 text-amber-300" />
                        </div>
                        <div>
                          <span
                            onClick={() => handleOpenPreview(doc)}
                            className="font-serif font-bold text-sm text-[#06244B] hover:text-[#A4432B] block cursor-pointer"
                          >
                            {doc.title}
                          </span>
                          <span className="text-[11px] text-[#667085] block">
                            {doc.documentCode} • {doc.fileName} • {doc.fileSize}
                          </span>
                          {searchOCR && doc.ocrText && searchQuery && doc.ocrText.toLowerCase().includes(searchQuery.toLowerCase()) && (
                            <div className="mt-1 p-1.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-900 max-w-md">
                              <strong>OCR Match:</strong> {doc.ocrText.slice(0, 120)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setVersionDoc(doc)}
                        className="font-mono font-semibold text-[11px] px-2.5 py-0.5 rounded-md bg-[#F9FAFB] text-[#06244B] border border-[#D0D5DD] hover:border-[#06244B] cursor-pointer"
                      >
                        {doc.version} ({doc.versionHistory?.length || 1})
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePrivilege(doc)}
                        title="Click to toggle Attorney-Client Privilege (Utah RPC 1.6)"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer ${
                          doc.isPrivileged ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' : 'bg-slate-50 text-[#475467] border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {doc.isPrivileged ? <Lock className="w-3 h-3 text-amber-700" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                        {doc.isPrivileged ? 'Privileged (RPC 1.6)' : 'Standard / Court'}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 text-[#344054] font-medium border">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="text-xs font-semibold text-[#1D2939] block truncate">{doc.matterTitle}</span>
                      <span className="text-[11px] text-[#667085] block">{doc.clientName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs font-medium text-[#1D2939] block">{doc.uploadedByName}</span>
                      <span className="text-[11px] text-[#667085]">{doc.uploadedAt ? formatDate(doc.uploadedAt, { short: true }) : ''}</span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(doc)}
                          className="p-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] hover:text-[#06244B] cursor-pointer"
                          title="Preview & OCR Extraction"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRenameDoc(doc);
                            setRenameTitle(doc.title);
                          }}
                          className="p-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] hover:text-[#06244B] cursor-pointer"
                          title="Rename Display Title (Preserves Immutable Code & Versions)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setVersionDoc(doc)}
                          className="p-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] hover:text-[#06244B] cursor-pointer"
                          title="Version History & Restore"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-1.5 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] hover:text-[#06244B] cursor-pointer"
                          title="Download Latest Version"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteDocTarget(doc)}
                          className="p-1.5 rounded-lg border border-[#D0D5DD] bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No documents found in repository. Upload a document or approve a draft to store it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Drafts & Approvals */}
      {viewMode === 'drafts' && (
        <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F9FAFB] text-[#475467] uppercase font-semibold text-[11px] border-b border-[#EAECF0]">
                <tr>
                  <th className="py-3 px-4">Draft Code &amp; Title</th>
                  <th className="py-3 px-3">Template</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Missing Fields</th>
                  <th className="py-3 px-4">Linked Matter</th>
                  <th className="py-3 px-3">Generated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {(() => {
                  const filteredDrafts = drafts.filter((d) => {
                    if (!d) return false;
                    const q = searchQuery.toLowerCase();
                    return (
                      !q ||
                      d.title?.toLowerCase().includes(q) ||
                      d.draftCode?.toLowerCase().includes(q) ||
                      d.templateCode?.toLowerCase().includes(q)
                    );
                  });
                  if (filteredDrafts.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500">
                          {drafts.length === 0
                            ? 'No document drafts generated yet. Click "Generate Draft" or trigger one from the 300 Document Automations tab.'
                            : 'No drafts match the current search query.'}
                        </td>
                      </tr>
                    );
                  }
                  return filteredDrafts.map((d) => {
                    const missingCount = Array.isArray(d.missingFieldsFlags)
                      ? d.missingFieldsFlags.filter((f) => f && f.type !== 'TRANSMISSION_EVIDENCE' && f.type !== 'REJECTION_NOTICE').length
                      : 0;
                    return (
                      <tr key={d.id} className="hover:bg-[#F9FAFB]/70">
                        <td className="py-3 px-4">
                          <span
                            onClick={() => {
                              setSelectedReviewDraft(d);
                              setIsReviewModalOpen(true);
                            }}
                            className="font-serif font-bold text-sm text-[#06244B] hover:text-[#A4432B] block cursor-pointer"
                          >
                            {d.title}
                          </span>
                          <span className="font-mono text-[11px] text-[#667085]">{d.draftCode}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px]">{d.templateCode || d.template?.templateCode || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                              ['Approved', 'Sent'].includes(d.status)
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : d.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {missingCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> {missingCount} missing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-semibold block">{d.matterNumber || d.matter?.matterNumber || d.matterId}</span>
                          <span className="text-[11px] text-[#667085] block truncate max-w-xs">{d.matterTitle || d.matter?.title}</span>
                        </td>
                        <td className="py-3 px-3">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={Eye}
                            onClick={() => {
                              setSelectedReviewDraft(d);
                              setIsReviewModalOpen(true);
                            }}
                            className="text-xs py-1 text-[#06244B] border-[#06244B]"
                          >
                            Review &amp; Approve
                          </Button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: 300 Document Automations Catalog */}
      {viewMode === 'automations' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-[#EAECF0] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={automationPracticeArea}
                onChange={(e) => {
                  setAutomationPracticeArea(e.target.value);
                  setAutomationPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-[#F9FAFB] text-xs font-medium"
              >
                <option value="">All 10 Practice Categories ({automationSummary?.totalAutomations || 300})</option>
                {(automationSummary?.practiceAreas || []).map((pa) => (
                  <option key={pa.practiceArea} value={pa.practiceAreaId}>
                    {pa.practiceArea} ({pa.count})
                  </option>
                ))}
              </select>

              <select
                value={automationMatterId}
                onChange={(e) => setAutomationMatterId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-semibold text-[#06244B]"
              >
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    Target Matter: {m.matterNumber} — {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>Per page:</span>
                <select
                  value={automationPageSize}
                  onChange={(e) => {
                    setAutomationPageSize(Number(e.target.value));
                    setAutomationPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-semibold text-[#06244B]"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={300}>300 (All)</option>
                </select>
              </div>

              <span className="text-[11px] text-slate-500 font-medium">
                Showing {automations.length === 0 ? 0 : ((automationPage - 1) * automationPageSize) + 1}–{Math.min(automationPage * automationPageSize, automationPagination.filteredCount)} of {automationPagination.filteredCount} filtered automations (Catalog Total: {automationPagination.totalCatalogCount || 300})
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F9FAFB] text-[#475467] uppercase font-semibold text-[11px] border-b border-[#EAECF0]">
                  <tr>
                    <th className="py-3 px-4">Catalog ID</th>
                    <th className="py-3 px-3">Automation Document</th>
                    <th className="py-3 px-3">Practice Area</th>
                    <th className="py-3 px-3">Trigger Event</th>
                    <th className="py-3 px-3">Mapped Fields</th>
                    <th className="py-3 px-4 text-right">Run Automation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0]">
                  {automations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        No document automations match the current practice area or search filter.
                      </td>
                    </tr>
                  ) : (
                    automations.map((item) => (
                      <tr key={item.catalogId} className="hover:bg-[#F9FAFB]">
                        <td className="py-2.5 px-4 font-mono font-bold text-[#06244B] whitespace-nowrap">{item.catalogId}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.title}</td>
                        <td className="py-2.5 px-3 text-slate-600">{item.practiceArea}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px]">
                            {item.trigger}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs truncate">{item.fields}</td>
                        <td className="py-2.5 px-4 text-right">
                          <Button
                            size="xs"
                            variant="primary"
                            icon={Zap}
                            loading={triggeringCatId === item.catalogId}
                            onClick={() => handleTriggerCatalogItem(item)}
                            className="bg-[#06244B] text-white"
                          >
                            Trigger Draft
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {automationPagination.totalPages > 1 && (
              <div className="bg-[#F9FAFB] px-4 py-3 border-t border-[#EAECF0] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 text-[11px]">
                  Page <span className="font-semibold text-slate-800">{automationPage}</span> of <span className="font-semibold text-slate-800">{automationPagination.totalPages}</span> ({automationPagination.filteredCount} entries)
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                  <Button
                    size="xs"
                    variant="outline"
                    icon={ChevronLeft}
                    disabled={automationPage <= 1}
                    onClick={() => setAutomationPage((prev) => Math.max(1, prev - 1))}
                    className="px-2 py-1 text-xs"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: automationPagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (automationPagination.totalPages <= 7) return true;
                      if (p === 1 || p === automationPagination.totalPages) return true;
                      if (Math.abs(p - automationPage) <= 1) return true;
                      return false;
                    })
                    .map((p, idx, arr) => {
                      const prevP = arr[idx - 1];
                      const showEllipsis = prevP && p - prevP > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                          <button
                            type="button"
                            onClick={() => setAutomationPage(p)}
                            className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                              automationPage === p
                                ? 'bg-[#06244B] text-white shadow-sm'
                                : 'bg-white text-slate-700 border border-[#D0D5DD] hover:bg-slate-100'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <Button
                    size="xs"
                    variant="outline"
                    icon={ChevronRight}
                    disabled={automationPage >= automationPagination.totalPages}
                    onClick={() => setAutomationPage((prev) => Math.min(automationPagination.totalPages, prev + 1))}
                    className="px-2 py-1 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Version History & Upload Revision Modal */}
      {versionDoc && (
        <Modal
          isOpen={!!versionDoc}
          onClose={() => setVersionDoc(null)}
          title={`Document Version History: ${versionDoc.title}`}
          subtitle={`Current: ${versionDoc.version} | Code: ${versionDoc.documentCode}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs text-[#202A35]">
            <form onSubmit={handleUploadNewVersion} className="p-3 bg-slate-50 border border-[#D9D6CF] rounded-lg space-y-2.5">
              <span className="font-bold text-[#06244B] block">Upload New File Revision</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                onChange={(e) => setRevisionFile(e.target.files?.[0] || null)}
                className="w-full text-xs p-1.5 rounded border border-[#D9D6CF] bg-white"
              />
              <input
                type="text"
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Revision notes (e.g. Updated with attorney redlines)"
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white"
              />
              <div className="flex justify-end">
                <Button size="sm" variant="primary" icon={Upload} type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload Revision'}
                </Button>
              </div>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {versionDoc.versionHistory?.map((vh, i) => (
                <div key={vh.id || i} className="p-3 border rounded-lg bg-white border-[#D9D6CF] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-[#06244B] text-white px-2 py-0.5 rounded">
                        {vh.version}
                      </span>
                      <span className="font-semibold text-[#06244B] truncate">{vh.fileName}</span>
                    </div>
                    <span className="text-[11px] text-slate-600 block mt-1">{vh.note}</span>
                    <span className="text-[10px] text-[#667085] block">
                      {vh.author} • {vh.date} • SHA256: {vh.sha256Checksum?.slice(0, 12)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {vh.id && (
                      <Button
                        size="xs"
                        variant="outline"
                        icon={Download}
                        onClick={() => handleDownloadVersion(versionDoc.id, vh.id, vh.fileName)}
                      >
                        Get
                      </Button>
                    )}
                    {vh.id && vh.version !== versionDoc.version && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleRestoreVersion(versionDoc.id, vh.id, vh.version)}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" onClick={() => setVersionDoc(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Preview, OCR & Storage Integrity Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview & OCR: ${previewDoc.title}`}
          subtitle={`${previewDoc.documentCode} • ${previewDoc.fileName} • Version ${previewDoc.version}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-3 text-xs text-[#202A35]">
            <div className="flex flex-wrap justify-between items-center gap-2 p-3 bg-[#FAF8F5] border border-[#D9D6CF] rounded">
              <div className="flex items-center gap-2">
                {integrityResult?.allVerified ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SHA-256 Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    Storage Key: {previewDoc.versions?.[0]?.s3StorageKey || 'vault'}
                  </span>
                )}
              </div>
              <Button size="xs" variant="outline" icon={ScanText} loading={runningOcr} onClick={handleRunOcr}>
                Run / Refresh OCR Extraction
              </Button>
            </div>

            {previewOcrData?.method && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded text-blue-900">
                <span><strong>OCR Method:</strong> {previewOcrData.method}</span>
                {typeof previewOcrData.wordCount === 'number' && <span>• <strong>Words:</strong> {previewOcrData.wordCount}</span>}
                {typeof previewOcrData.confidence === 'number' && <span>• <strong>Confidence:</strong> {previewOcrData.confidence}%</span>}
                {previewOcrData.warnings?.length > 0 && <span className="text-amber-800">• {previewOcrData.warnings.join('; ')}</span>}
              </div>
            )}

            {previewOcrData?.extractedFields && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Dates Detected</span>
                  <span className="text-[11px]">{previewOcrData.extractedFields.dates?.join(', ') || 'None'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Monetary Amounts</span>
                  <span className="text-[11px]">{previewOcrData.extractedFields.monetaryAmounts?.join(', ') || 'None'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Case / Claim IDs</span>
                  <span className="text-[11px]">
                    {[...(previewOcrData.extractedFields.caseOrDocketNumbers || []), ...(previewOcrData.extractedFields.claimOrPolicyNumbers || [])].join(', ') || 'None'}
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 bg-white border border-[#D9D6CF] rounded-lg shadow-inner font-mono text-xs whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
              {previewOcrData?.ocrContent || previewDoc.ocrText || 'No OCR text extracted yet. Click "Run / Refresh OCR Extraction" above.'}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#D9D6CF]">
              <span className="text-[11px] text-[#667085]">Uploaded by {previewDoc.uploadedByName}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewDoc(null)}>Close</Button>
                <Button size="sm" variant="primary" icon={Download} onClick={() => handleDownloadDocument(previewDoc)}>
                  Download File
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload &amp; OCR Index Legal Document"
          subtitle="Multipart binary upload to unified storage with automatic PDF/DOCX/Image OCR extraction."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs text-[#202A35]">
            <div>
              <label className="text-xs font-bold text-[#667085] uppercase block mb-1">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Medical Records Packet or Motion to Dismiss"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-[#D9D6CF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#667085] uppercase block mb-1">
                Select File (PDF / DOCX / TXT / PNG / JPG) *
              </label>
              <input
                type="file"
                required
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.tif,.tiff"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white cursor-pointer"
              />
              {selectedFile && (
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                  Selected: {selectedFile.name} ({Math.max(1, Math.round(selectedFile.size / 1024))} KB)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#667085] uppercase block mb-1">Category *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
                >
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#667085] uppercase block mb-1">Linked Matter *</label>
                <select
                  value={uploadMatterId}
                  onChange={(e) => setUploadMatterId(e.target.value)}
                  required
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-semibold"
                >
                  <option value="">Select Matter...</option>
                  {matters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.matterNumber} — {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewDocPrivileged}
                  onChange={(e) => setIsNewDocPrivileged(e.target.checked)}
                />
                <span className="font-bold text-[#06244B] text-xs">
                  Classify as Attorney-Client Privileged (Utah RPC 1.6)
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" disabled={isUploading}>
                {isUploading ? 'Uploading & Indexing...' : 'Upload & Run OCR'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Rename Display Title Modal (F-0700) */}
      {renameDoc && (
        <Modal
          isOpen={!!renameDoc}
          onClose={() => setRenameDoc(null)}
          title="Rename Document Display Title"
          subtitle={`Origin Code: ${renameDoc.documentCode} (Immutable provenance & SHA-256 checksums preserved)`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRenameSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#06244B] block mb-1">Display Title *</label>
              <input
                type="text"
                required
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="w-full p-2.5 border border-[#D9D6CF] rounded"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setRenameDoc(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Display Title
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDocTarget && (
        <Modal
          isOpen={!!deleteDocTarget}
          onClose={() => !isDeleting && setDeleteDocTarget(null)}
          title="Delete Repository Document"
          subtitle={`Document Code: ${deleteDocTarget.documentCode || deleteDocTarget.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
              Are you sure you want to delete <strong>{deleteDocTarget.title}</strong>? This removes the document record from the Matter Document Repository and logs an audit entry.
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteDocTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDeleteDocument}
                disabled={isDeleting}
                className="bg-rose-700 hover:bg-rose-800 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <GenerateDraftModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerated={() => {
          loadDocuments();
          loadDrafts();
          setViewMode('drafts');
        }}
        matters={matters}
      />

      <DraftReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        draft={selectedReviewDraft}
        onStatusChanged={(updated) => {
          setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
          loadDrafts();
          loadDocuments();
        }}
      />
    </div>
  );
}
