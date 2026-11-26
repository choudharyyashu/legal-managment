import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Download,
  AlertTriangle,
  Clock,
  Send,
  RefreshCw,
  GitCompare,
  Edit3,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { documentService } from '../../../services/documentService';
import { useToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../hooks/useAuth';

export function DraftReviewModal({ isOpen, onClose, draft, onStatusChanged }) {
  const { addToast } = useToast();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'missingFields' | 'versions' | 'transmission'
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [sendRecipientName, setSendRecipientName] = useState('');
  const [sendRecipientEmail, setSendRecipientEmail] = useState('');
  const [sendRecipientAddress, setSendRecipientAddress] = useState('');
  const [sendChannel, setSendChannel] = useState('EMAIL');
  const [sendNotes, setSendNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Regeneration & diff comparison state
  const [candidateResult, setCandidateResult] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  // Reset local review/form state whenever switching drafts or reopening modal
  useEffect(() => {
    setActiveTab('overview');
    setIsApproving(false);
    setIsRejecting(false);
    setIsSending(false);
    setRejectionReason('');
    setApprovalNotes('');
    setSendRecipientName('');
    setSendRecipientEmail('');
    setSendRecipientAddress('');
    setSendChannel('EMAIL');
    setSendNotes('');
    setCandidateResult(null);
  }, [draft?.id, isOpen]);

  if (!draft) return null;

  const userRole = (currentUser?.role || '').toLowerCase();
  const canApprove =
    currentUser?.permissions?.includes('documents:approve') ||
    ['attorney', 'partner', 'supervisor', 'super_admin', 'admin'].includes(userRole);
  const canSend =
    currentUser?.permissions?.includes('documents:send') ||
    ['attorney', 'partner', 'supervisor', 'super_admin', 'admin'].includes(userRole);

  const handleApprove = async () => {
    setLoadingAction(true);
    try {
      const res = await documentService.approveDraft(draft.id, {
        notes: approvalNotes || 'Approved by responsible attorney for legal issuance.',
      });
      addToast(
        `Draft '${draft.draftCode}' approved and finalized (${res?.finalDocument?.documentCode || 'Document Created'}).`,
        'success'
      );
      setIsApproving(false);
      onStatusChanged?.(res?.draft || { ...draft, status: 'Approved' });
      onClose();
    } catch (err) {
      addToast(err?.message || 'Approval failed.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 3) {
      addToast('A substantive rejection reason (at least 3 characters) is required.', 'warning');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await documentService.rejectDraft(draft.id, {
        rejectionReason: rejectionReason.trim(),
      });
      addToast(
        `Draft '${draft.draftCode}' rejected. Correction task ${res?.correctionTask?.taskCode || ''} assigned.`,
        'info'
      );
      setIsRejecting(false);
      onStatusChanged?.(res?.draft || { ...draft, status: 'Rejected' });
      onClose();
    } catch (err) {
      addToast(err?.message || 'Rejection failed.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSend = async () => {
    if (!sendRecipientName.trim()) {
      addToast('Recipient name is required.', 'warning');
      return;
    }
    if (!sendRecipientEmail.trim() && !sendRecipientAddress.trim()) {
      addToast('Recipient email or mailing address/fax is required.', 'warning');
      return;
    }
    setLoadingAction(true);
    try {
      const recipient = {
        name: sendRecipientName.trim(),
        ...(sendRecipientEmail.trim() ? { email: sendRecipientEmail.trim() } : {}),
        ...(sendRecipientAddress.trim() ? { mailingAddress: sendRecipientAddress.trim() } : {}),
      };
      const res = await documentService.sendDraft(draft.id, {
        recipient,
        channel: sendChannel,
        notes: sendNotes.trim() || `Transmitted via ${sendChannel} with immutable evidence log.`,
      });
      addToast(`Draft '${draft.draftCode}' transmitted (${sendChannel}). Evidence recorded.`, 'success');
      setIsSending(false);
      onStatusChanged?.(res?.draft || { ...draft, status: 'Sent' });
      onClose();
    } catch (err) {
      addToast(err?.message || 'Send transmission recording failed.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      await documentService.downloadDraft(draft.id, format, draft);
      addToast(`Draft ${format.toUpperCase()} downloaded successfully!`, 'success');
    } catch (err) {
      addToast(err?.message || 'Download failed.', 'error');
    }
  };

  const handleToggleManualEdits = async () => {
    try {
      const next = !draft.hasManualEdits;
      await documentService.markManualEdits(draft.id, next);
      addToast(
        next ? 'Draft marked as containing attorney manual edits.' : 'Manual edits flag cleared.',
        'info'
      );
      onStatusChanged?.({ ...draft, hasManualEdits: next });
    } catch (err) {
      addToast(err?.message || 'Failed to update manual edit flag.', 'error');
    }
  };

  const handleGenerateCandidate = async () => {
    setRegenerating(true);
    try {
      const res = await documentService.regenerateCandidate(draft.id);
      setCandidateResult(res);
      addToast(`Candidate version '${res.candidateDraftCode}' generated for comparison.`, 'success');
    } catch (err) {
      addToast(err?.message || 'Candidate regeneration failed.', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleAcceptCandidate = async () => {
    if (!candidateResult) return;
    setRegenerating(true);
    try {
      const res = await documentService.acceptCandidate(draft.id, candidateResult.candidateDraftId);
      addToast(`Candidate '${candidateResult.candidateDraftCode}' promoted to active draft.`, 'success');
      setCandidateResult(null);
      onStatusChanged?.(res?.acceptedDraft || draft);
      onClose();
    } catch (err) {
      addToast(err?.message || 'Failed to accept candidate.', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleRejectCandidate = async () => {
    if (!candidateResult) return;
    setRegenerating(true);
    try {
      await documentService.rejectCandidate(draft.id, candidateResult.candidateDraftId, 'Attorney preserved existing edits.');
      addToast('Candidate rejected. Previous draft preserved.', 'info');
      setCandidateResult(null);
      onStatusChanged?.({ ...draft, isStale: false });
    } catch (err) {
      addToast(err?.message || 'Failed to reject candidate.', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const rawFlags = Array.isArray(draft.missingFieldsFlags) ? draft.missingFieldsFlags : [];
  const missingFlags = rawFlags.filter((f) => f && f.type !== 'TRANSMISSION_EVIDENCE' && f.type !== 'REJECTION_NOTICE');
  const transmissionEvidence = rawFlags.find((f) => f && f.type === 'TRANSMISSION_EVIDENCE') || draft.metadata?.transmissionEvidence;

  const statusColor =
    draft.status === 'Approved' || draft.status === 'Sent'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : draft.status === 'Rejected'
      ? 'bg-rose-100 text-rose-800 border-rose-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={draft.title || 'Document Draft Review'} size="lg">
      <div className="space-y-4 text-xs">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#06244B] text-white">
              {draft.draftCode || 'DFT-DRAFT'}
            </span>
            <span className={`px-2 py-0.5 rounded font-bold border text-[11px] ${statusColor}`}>
              {draft.status || 'Draft'}
            </span>
            {draft.hasManualEdits && (
              <span className="px-2 py-0.5 rounded font-bold border text-[11px] bg-purple-100 text-purple-800 border-purple-200">
                Attorney Edits Protected
              </span>
            )}
            {draft.isStale && (
              <span className="px-2 py-0.5 rounded font-bold border text-[11px] bg-orange-100 text-orange-800 border-orange-200">
                Source Data Changed (Stale)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Created: {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString() : 'Recent'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAECF0] gap-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Approval' },
            { id: 'missingFields', label: 'Missing Fields', count: missingFlags.length },
            { id: 'versions', label: 'Versioning & Regeneration' },
            { id: 'transmission', label: 'Transmission & Evidence' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`pb-2 font-semibold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-[#06244B] text-[#06244B]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{t.label}</span>
              {t.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-[#EAECF0] rounded-lg">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Template Code</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{draft.templateCode || draft.template?.templateCode || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Template Version</span>
                <span className="font-medium text-slate-800 text-xs">{draft.versionNumber || 'v1.0'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Associated Matter</span>
                <span className="font-semibold text-[#06244B] text-xs">{draft.matterNumber || draft.matter?.matterNumber || draft.matterId}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Storage Key</span>
                <span className="font-mono text-[11px] text-slate-600 truncate block">{draft.docxStorageKey || 'storage/drafts/'}</span>
              </div>
            </div>

            {/* Action Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-semibold text-slate-700 block">Word / PDF Export &amp; Approval Actions</span>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" icon={Download} onClick={() => handleDownload('docx')} className="text-xs">
                  Download Word (.DOCX)
                </Button>
                <Button size="sm" variant="outline" icon={Download} onClick={() => handleDownload('pdf')} className="text-xs">
                  Download PDF (.PDF)
                </Button>
                {canApprove && !['Approved', 'Sent'].includes(draft.status) && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={() => {
                      setIsRejecting(false);
                      setIsApproving(true);
                    }}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    Approve Draft
                  </Button>
                )}
                {canApprove && !['Approved', 'Sent', 'Rejected'].includes(draft.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={XCircle}
                    onClick={() => {
                      setIsApproving(false);
                      setIsRejecting(true);
                    }}
                    className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                  >
                    Reject with Reason
                  </Button>
                )}
                {canSend && draft.status === 'Approved' && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Send}
                    onClick={() => setIsSending(true)}
                    className="text-xs bg-[#06244B]"
                  >
                    Transmit Approved Draft
                  </Button>
                )}
              </div>
            </div>

            {/* Approval Form */}
            {isApproving && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 mt-2">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Attorney Approval Confirmation
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Approving finalizes this draft into the permanent Matter Document Repository (with OCR indexing &amp; SHA-256 checksum) and completes associated review tasks.
                </p>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Optional review approval notes..."
                  className="w-full text-xs p-2 bg-white border border-emerald-300 rounded focus:outline-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsApproving(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleApprove}
                    disabled={loadingAction}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    {loadingAction ? 'Finalizing...' : 'Confirm Approval'}
                  </Button>
                </div>
              </div>
            )}

            {/* Rejection Form */}
            {isRejecting && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2 mt-2">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-700" />
                  Reject Document Draft
                </span>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Mandatory rejection reason (at least 3 characters)..."
                  className="w-full text-xs p-2 bg-white border border-rose-300 rounded focus:outline-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsRejecting(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleReject}
                    disabled={loadingAction || rejectionReason.trim().length < 3}
                    className="bg-rose-700 hover:bg-rose-800 text-white"
                  >
                    {loadingAction ? 'Rejecting...' : 'Confirm Rejection'}
                  </Button>
                </div>
              </div>
            )}

            {/* Transmission Form */}
            {isSending && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg space-y-2 mt-2">
                <span className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-sky-700" />
                  Record Document Transmission Evidence
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-sky-800 block">Recipient Name *</label>
                    <input
                      type="text"
                      value={sendRecipientName}
                      onChange={(e) => setSendRecipientName(e.target.value)}
                      placeholder="e.g. State Farm Claims Adjuster"
                      className="w-full text-xs p-1.5 bg-white border border-sky-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-sky-800 block">Transmission Channel *</label>
                    <select
                      value={sendChannel}
                      onChange={(e) => setSendChannel(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white border border-sky-300 rounded"
                    >
                      <option value="EMAIL">Electronic / Secure Email</option>
                      <option value="PORTAL">Direct Insurer / Client Portal</option>
                      <option value="CERTIFIED_MAIL">Certified US Mail</option>
                      <option value="FAX">Secure Facsimile</option>
                      <option value="MANUAL_HAND_DELIVERY">Manual Hand Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-sky-800 block">Recipient Email</label>
                    <input
                      type="email"
                      value={sendRecipientEmail}
                      onChange={(e) => setSendRecipientEmail(e.target.value)}
                      placeholder="claims@carrier.com"
                      className="w-full text-xs p-1.5 bg-white border border-sky-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-sky-800 block">Mailing Address / Notes</label>
                    <input
                      type="text"
                      value={sendRecipientAddress}
                      onChange={(e) => setSendRecipientAddress(e.target.value)}
                      placeholder="Optional street address or portal ref"
                      className="w-full text-xs p-1.5 bg-white border border-sky-300 rounded"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={sendNotes}
                  onChange={(e) => setSendNotes(e.target.value)}
                  placeholder="Optional transmission notes..."
                  className="w-full text-xs p-1.5 bg-white border border-sky-300 rounded"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setIsSending(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSend}
                    disabled={loadingAction || !sendRecipientName.trim()}
                    className="bg-[#06244B] text-white"
                  >
                    {loadingAction ? 'Recording...' : 'Log Transmission Evidence'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Missing Fields */}
        {activeTab === 'missingFields' && (
          <div className="space-y-2">
            {missingFlags.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="font-semibold text-slate-800 block">All Template Tokens Resolved</span>
                <span className="text-[11px] text-slate-500">No missing fields were flagged during generation.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{missingFlags.length} field(s)</strong> were missing from case records during generation.
                  </span>
                </div>
                <div className="border border-[#EAECF0] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] text-slate-500 font-semibold border-b border-[#EAECF0]">
                      <tr>
                        <th className="py-2 px-3">Missing Field Tag</th>
                        <th className="py-2 px-3">Entity</th>
                        <th className="py-2 px-3">Remedy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECF0]">
                      {missingFlags.map((flag, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-semibold text-[#06244B]">
                            {typeof flag === 'string' ? flag : flag.placeholderTag || flag.field}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{flag.sourceEntity || 'Matter'}</td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">
                            {flag.suggestedTaskTitle || flag.description || 'Update matter record'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Versioning & Safe Regeneration */}
        {activeTab === 'versions' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-800 block">Safe Regeneration &amp; Attorney Edit Protection</span>
                <span className="text-[11px] text-slate-600">
                  Generate a side-by-side candidate version from updated matter facts without overwriting attorney edits.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="outline" icon={Edit3} onClick={handleToggleManualEdits}>
                  {draft.hasManualEdits ? 'Clear Manual Edit Lock' : 'Mark Attorney Edits'}
                </Button>
                <Button
                  size="xs"
                  variant="primary"
                  icon={RefreshCw}
                  onClick={handleGenerateCandidate}
                  disabled={regenerating}
                >
                  {regenerating ? 'Generating...' : 'Generate Candidate Version'}
                </Button>
              </div>
            </div>

            {candidateResult && (
              <div className="p-3 bg-white border border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#06244B] flex items-center gap-1.5">
                    <GitCompare className="w-4 h-4 text-blue-600" />
                    Candidate Comparison: {candidateResult.previousDraftCode} → {candidateResult.candidateDraftCode}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {candidateResult.comparison?.recommendation}
                  </span>
                </div>

                {candidateResult.comparison?.manualEditsWarning && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                    {candidateResult.comparison.manualEditsWarning}
                  </div>
                )}

                <div className="text-[11px] text-slate-600">
                  Changed Fields Detected: <strong>{candidateResult.comparison?.changedFieldsCount || 0}</strong>
                </div>

                {candidateResult.comparison?.changedFields?.length > 0 && (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-2">Field</th>
                          <th className="p-2">Previous</th>
                          <th className="p-2">Candidate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {candidateResult.comparison.changedFields.map((c, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-mono">{c.field}</td>
                            <td className="p-2 text-rose-700">{String(c.previousValue ?? '—')}</td>
                            <td className="p-2 text-emerald-700 font-semibold">{String(c.currentValue ?? '—')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button size="xs" variant="outline" onClick={handleRejectCandidate} disabled={regenerating}>
                    Keep Previous Version
                  </Button>
                  <Button size="xs" variant="primary" icon={FileCheck} onClick={handleAcceptCandidate} disabled={regenerating}>
                    Accept Candidate Version
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Transmission */}
        {activeTab === 'transmission' && (
          <div className="space-y-3">
            <div className="p-3 bg-white border border-[#EAECF0] rounded-lg space-y-2">
              <span className="font-bold text-slate-800 block">Transmission Log &amp; Delivery Evidence</span>
              {draft.status === 'Sent' || transmissionEvidence ? (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-700">{transmissionEvidence?.sendStatus || 'SENT'}</span>
                  </div>
                  {transmissionEvidence && (
                    <div className="mt-2 p-2 bg-slate-50 rounded font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                      {JSON.stringify(transmissionEvidence, null, 2)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-[11px] p-3 bg-slate-50 rounded">
                  This document has not been transmitted yet. Approved drafts can be sent via email, portal, certified mail, or fax.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#EAECF0]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
