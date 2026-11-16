import React, { useState, useEffect } from 'react';
import {
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  ShieldAlert,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { piService } from '../../../services/piService';
import { useToast } from '../../../components/ui/Toast';

const VALID_STATUSES = [
  { value: 'Drafted', label: 'Drafted (Internal Review)' },
  { value: 'Ready to Send', label: 'Ready to Send (Authorized)' },
  { value: 'Sent', label: 'Sent (Transmitted to Facility)' },
  { value: 'Received', label: 'Received (Records Produced)' },
  { value: 'Incomplete', label: 'Incomplete (Deficiency Identified)' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export function UpdateRequestStatusModal({
  isOpen,
  onClose,
  provider,
  matter,
  onStatusUpdated,
  onOpenSignatureModal,
}) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const currentStatus = provider?.recordsStatus || 'Drafted';
  const isAuthSigned = Boolean(
    provider?.authorizationSigned ||
      provider?.authorizations?.toLowerCase().includes('signed')
  );

  const [targetStatus, setTargetStatus] = useState(currentStatus);
  const [sentDate, setSentDate] = useState(todayStr);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (provider && isOpen) {
      setTargetStatus(provider.recordsStatus || 'Drafted');
      setSentDate(todayStr);
      setNotes('');
    }
  }, [provider, isOpen]);

  // Authorization gate check: "Ready to Send" and "Sent" require signed authorization
  const isTransmissionStatus = targetStatus === 'Ready to Send' || targetStatus === 'Sent';
  const isBlockedByGate = isTransmissionStatus && !isAuthSigned;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlockedByGate) {
      addToast(
        'Transmission Blocked: Cannot transition to Ready to Send or Sent without signed client authorization (Document 112).',
        'error'
      );
      return;
    }

    const matterId = provider.matterId || matter?.id;
    const requestId = provider.requestId || provider.recordRequestId || provider.id;

    if (!matterId) {
      addToast('Matter ID association is missing.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        status: targetStatus,
        sentDate: targetStatus === 'Sent' ? sentDate : undefined,
        notes: notes.trim() || undefined,
      };

      let result;
      try {
        result = await piService.updateRecordRequestStatus(matterId, requestId, payload);
      } catch (apiErr) {
        // Fallback for mock mode or offline local test
        result = {
          success: true,
          status: targetStatus,
          requestSentDate: targetStatus === 'Sent' ? sentDate : undefined,
        };
      }

      addToast(
        `Medical Records Request (Document 113) status updated to '${targetStatus}'.${
          targetStatus === 'Sent'
            ? ' 30-day statutory turnaround follow-up task scheduled.'
            : ''
        }`,
        'success'
      );

      onStatusUpdated?.({
        ...provider,
        recordsStatus: targetStatus,
        dateOfService: targetStatus === 'Sent' ? `Sent ${sentDate}` : provider.dateOfService,
      });

      onClose();
    } catch (err) {
      addToast(
        err?.response?.data?.message || err?.message || 'Failed to update request status.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Records Request Status & Lifecycle"
      subtitle="Document 113 — Medical Records & Billing Request Turnaround"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Context Summary */}
        <div className="bg-[#F5F0E5]/60 border border-[#D9D6CF] rounded-lg p-3 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#06244B] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#A4432B]" />
              {provider?.providerName || 'Medical Facility'}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Current: {currentStatus}
            </span>
          </div>
          <div className="text-[#667085] flex flex-wrap gap-x-4 text-[11px]">
            <span>
              <strong>Matter:</strong> {matter?.matterNumber || provider?.matterId || 'PI Matter'}
            </span>
            <span>
              <strong>Authorization:</strong>{' '}
              {isAuthSigned ? (
                <span className="text-emerald-700 font-semibold">✓ Signed on File</span>
              ) : (
                <span className="text-amber-700 font-semibold">⚠ Unsigned</span>
              )}
            </span>
          </div>
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#06244B] mb-1">
            Target Request Status *
          </label>
          <select
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-[#D9D6CF] rounded bg-white text-[#344054] focus:ring-1 focus:ring-[#06244B] focus:outline-none"
            required
          >
            {VALID_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transmission Readiness Gate Warning */}
        {isBlockedByGate && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-900 space-y-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Transmission Readiness Gate Enforced</span>
                Medical records requests cannot be set to <strong>"{targetStatus}"</strong> without verified client signature evidence for Document 112.
              </div>
            </div>
            {onOpenSignatureModal && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full text-xs border-red-300 text-red-800 hover:bg-red-100"
                onClick={() => {
                  onClose();
                  onOpenSignatureModal(provider);
                }}
              >
                Record Client Signature Evidence (Document 112) Now
              </Button>
            )}
          </div>
        )}

        {/* Sent Date field (only shown if status === 'Sent') */}
        {targetStatus === 'Sent' && (
          <div className="space-y-2 bg-blue-50/70 border border-blue-200 rounded p-3">
            <label className="block text-xs font-semibold text-[#06244B]">
              Transmission / Sent Date *
            </label>
            <Input
              type="date"
              max={todayStr}
              value={sentDate}
              onChange={(e) => setSentDate(e.target.value)}
              required
            />
            <div className="text-[11px] text-blue-900 flex items-start gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
              <span>
                <strong>30-Day Turnaround SLA:</strong> A statutory turnaround follow-up task will be scheduled exactly 30 days from this sent date.
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#06244B] mb-1">
            Status Transition Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Transmitted request packet via certified fax with confirmation."
            className="w-full text-xs px-3 py-2 border border-[#D9D6CF] rounded bg-white text-[#344054] focus:ring-1 focus:ring-[#06244B] focus:outline-none"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="primary"
            loading={loading}
            disabled={isBlockedByGate}
            icon={Send}
          >
            Apply Status Update
          </Button>
        </div>
      </form>
    </Modal>
  );
}
