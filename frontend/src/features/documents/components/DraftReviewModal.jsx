import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  ShieldCheck,
  FileCode,
  Tag,
  Calendar,
  Lock,
  User,
  ExternalLink,
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
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendChannel, setSendChannel] = useState('Electronic / Email');
  const [loadingAction, setLoadingAction] = useState(false);

  if (!draft) return null;

  const canApprove = currentUser?.permissions?.includes('documents:approve') || currentUser?.role === 'ATTORNEY' || currentUser?.role === 'PARTNER' || currentUser?.role === 'ADMIN';
  const canSend = currentUser?.permissions?.includes('documents:send') || currentUser?.role === 'ATTORNEY' || currentUser?.role === 'PARTNER' || currentUser?.role === 'ADMIN';

  const handleApprove = async () => {
    setLoadingAction(true);
    try {
      const res = await documentService.approveDraft(draft.id, {
        notes: approvalNotes || 'Approved by responsible attorney for legal issuance.',
      });
      addToast(`Draft '${draft.draftCode}' approved and finalized into official legal document.`, 'success');
      setIsApproving(false);
      onStatusChanged?.(res?.draft || { ...draft, status: 'Approved' });
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Approval failed.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 3) {
      addToast('A substantive rejection reason (at least 3 characters) is required to assign correction tasks.', 'warning');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await documentService.rejectDraft(draft.id, {
        reason: rejectionReason.trim(),
      });
      addToast(`Draft '${draft.draftCode}' rejected. Correction task assigned to drafter.`, 'info');
      setIsRejecting(false);
      onStatusChanged?.(res?.draft || { ...draft, status: 'Rejected' });
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Rejection failed.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSend = async () => {
    if (!sendRecipient || !sendRecipient.trim()) {
      addToast('Transmission recipient is required.', 'warning');
      return;
    }
    setLoadingAction(true);
    try {
      const res = await documentService.sendDraft(draft.id, {
        recipient: sendRecipient.trim(),
        channel: sendChannel,
        transmissionNotes: `Transmitted via ${sendChannel} with immutable evidence log.`,
      });
      addToast(`Draft '${draft.draftCode}' marked as SENT. Transmission evidence recorded.`, 'success');
      setIsSending(false);
      onStatusChanged?.(res?.draft || { ...draft, sendStatus: 'SENT' });
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Send transmission recording failed.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      await documentService.downloadDraft(draft.id, format);
      addToast(`Downloading ${format.toUpperCase()} draft...`, 'info');
    } catch (err) {
      addToast(err?.message || 'Download failed.', 'error');
    }
  };

  const missingFlags = draft.missingFieldsFlags || [];
  const statusColor =
    draft.status === 'Approved'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : draft.status === 'Rejected'
      ? 'bg-rose-100 text-rose-800 border-rose-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={draft.title || 'Document Draft Review'} size="lg">
      <div className="space-y-4 text-xs">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#06244B] text-white">
              {draft.draftCode || 'DFT-DRAFT'}
            </span>
            <span className={`px-2 py-0.5 rounded font-bold border text-[11px] ${statusColor}`}>
              {draft.status || 'Drafted'}
            </span>
            {draft.sendStatus && (
              <span className="px-2 py-0.5 rounded font-bold border text-[11px] bg-sky-100 text-sky-800 border-sky-200">
                Send: {draft.sendStatus}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Created: {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString() : 'Recent'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAECF0] gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#06244B] text-[#06244B]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview &amp; Metadata
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('missingFields')}
            className={`pb-2 font-semibold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'missingFields'
                ? 'border-[#06244B] text-[#06244B]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Missing Fields</span>
            {missingFlags.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {missingFlags.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transmission')}
            className={`pb-2 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'transmission'
                ? 'border-[#06244B] text-[#06244B]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Transmission &amp; Evidence
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-[#EAECF0] rounded-lg">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Template Code</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{draft.template?.templateCode || 'UT-PI-DOC'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Template Name</span>
                <span className="font-medium text-slate-800 text-xs">{draft.template?.templateName || draft.title}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Associated Matter</span>
                <span className="font-semibold text-[#06244B] text-xs">{draft.matter?.matterNumber || draft.matterId || 'Active Matter'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Storage Key</span>
                <span className="font-mono text-[11px] text-slate-600 truncate block">{draft.docxStorageKey || 'storage/drafts/DFT.docx'}</span>
              </div>
            </div>

            {/* In-Modal Action Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-semibold text-slate-700 block">Drafter / Review Actions</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Download}
                  onClick={() => handleDownload('docx')}
                  className="text-xs"
                >
                  Download DOCX
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Download}
                  onClick={() => handleDownload('pdf')}
                  className="text-xs"
                >
                  Download PDF
                </Button>
                {canApprove && draft.status !== 'Approved' && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={() => setIsApproving(true)}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    Approve Draft
                  </Button>
                )}
                {canApprove && draft.status !== 'Approved' && draft.status !== 'Rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={XCircle}
                    onClick={() => setIsRejecting(true)}
                    className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                  >
                    Reject with Reason
                  </Button>
                )}
                {canSend && draft.status === 'Approved' && !draft.sentAt && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Send}
                    onClick={() => setIsSending(true)}
                    className="text-xs bg-[#06244B]"
                  >
                    Record Transmission
                  </Button>
                )}
              </div>
            </div>

            {/* Approval Sub-Modal / Form */}
            {isApproving && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 mt-2">
                <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Attorney Approval Confirmation
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Approving this draft will finalize it into the official Matter document repository, mark the review task completed, and preserve immutable version history (Utah RPC 1.1 / 1.3).
                </p>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Optional review approval notes / comments..."
                  className="w-full text-xs p-2 bg-white border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsApproving(false)}>
                    Cancel
                  </Button>
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

            {/* Rejection Sub-Modal / Form */}
            {isRejecting && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2 mt-2">
                <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-700" />
                  Reject Document Draft
                </span>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Please specify the substantive deficiency reason. A correction task will automatically be generated and assigned to the drafter with these notes.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Mandatory rejection reason (e.g. 'Missing adverse carrier claim number and police report citations')..."
                  className="w-full text-xs p-2 bg-white border border-rose-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-600"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsRejecting(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleReject}
                    disabled={loadingAction || !rejectionReason.trim()}
                    className="bg-rose-700 hover:bg-rose-800 text-white"
                  >
                    {loadingAction ? 'Rejecting...' : 'Confirm Rejection'}
                  </Button>
                </div>
              </div>
            )}

            {/* Transmission Sub-Modal / Form */}
            {isSending && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg space-y-2 mt-2">
                <span className="font-bold text-sky-900 block flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-sky-700" />
                  Record Document Transmission Evidence
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-sky-800 block">Recipient / Carrier</label>
                    <input
                      type="text"
                      value={sendRecipient}
                      onChange={(e) => setSendRecipient(e.target.value)}
                      placeholder="e.g. State Farm Claims Department"
                      className="w-full text-xs p-1.5 bg-white border border-sky-300 rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-sky-800 block">Transmission Channel</label>
                    <select
                      value={sendChannel}
                      onChange={(e) => setSendChannel(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white border border-sky-300 rounded focus:outline-none"
                    >
                      <option value="Electronic / Email">Electronic / Secure Email</option>
                      <option value="Certified US Mail">Certified US Mail with Tracking</option>
                      <option value="Direct Insurer Portal">Direct Insurer Claims Portal</option>
                      <option value="Secure Facsimile">Secure Facsimile</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setIsSending(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSend}
                    disabled={loadingAction || !sendRecipient.trim()}
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
                <span className="text-[11px] text-slate-500">No missing or unpopulated fields were flagged during generation.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    The following <strong>{missingFlags.length} fields</strong> were missing from case records during auto-generation. The draft was generated with placeholders.
                  </span>
                </div>
                <div className="border border-[#EAECF0] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] text-slate-500 font-semibold border-b border-[#EAECF0]">
                      <tr>
                        <th className="py-2 px-3">Missing Field Tag</th>
                        <th className="py-2 px-3">Entity</th>
                        <th className="py-2 px-3">Remedy / Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECF0]">
                      {missingFlags.map((flag, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-semibold text-[#06244B]">
                            {typeof flag === 'string' ? flag : flag.placeholderTag || flag.field}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {flag.sourceEntity || 'Matter Record'}
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">
                            {flag.suggestedRemedy || flag.description || 'Update in PI incident or provider record'}
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

        {/* Tab 3: Transmission */}
        {activeTab === 'transmission' && (
          <div className="space-y-3">
            <div className="p-3 bg-white border border-[#EAECF0] rounded-lg space-y-2">
              <span className="font-bold text-slate-800 block">Transmission Log &amp; Delivery Evidence</span>
              {draft.sentAt ? (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Transmitted Date:</span>
                    <span className="font-medium text-slate-900">{new Date(draft.sentAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-700">{draft.sendStatus || 'SENT'}</span>
                  </div>
                  {draft.metadata?.transmissionEvidence && (
                    <div className="mt-2 p-2 bg-slate-50 rounded font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                      {JSON.stringify(draft.metadata.transmissionEvidence, null, 2)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-[11px] p-3 bg-slate-50 rounded">
                  This document has not been transmitted yet. Approved drafts can be sent via electronic delivery, certified mail, or carrier portal.
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
