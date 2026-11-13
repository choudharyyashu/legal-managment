import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Mail,
  UserCheck
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export function SignatureTrackingModal({
  isOpen,
  onClose,
  documentTitle = 'Attorney-Client Engagement Agreement',
  signerName = 'Robert H. Henderson',
  signerEmail = 'rhenderson@wasatchlogistics.com',
  initialStatus = 'Sent',
  onSignedSuccessfully = null
}) {
  const { addToast } = useToast();
  const [status, setStatus] = useState(initialStatus);
  const [signedAt, setSignedAt] = useState(null);

  const handleSimulateClientSign = () => {
    const timestamp = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setStatus('Signed');
    setSignedAt(timestamp);
    addToast(`Electronic signature completed by ${signerName}. Audit certificate recorded.`, 'success');

    if (onSignedSuccessfully) {
      onSignedSuccessfully(timestamp);
    }
  };

  const steps = [
    { id: 'Drafted', label: 'Drafted & Formatted', time: 'Today, 10:00 AM', done: true },
    { id: 'Sent', label: 'Dispatched via TLS', time: 'Today, 10:05 AM', done: status !== 'Drafted' },
    { id: 'Viewed', label: 'Viewed by Signer', time: 'Today, 10:14 AM', done: status === 'Viewed' || status === 'Signed' },
    { id: 'Signed', label: 'Legally Executed', time: signedAt || 'Awaiting Action', done: status === 'Signed' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Electronic Signature Tracking & Audit Trail"
      size="md"
    >
      <div className="space-y-4 text-xs text-[#202A35]">
        {/* Document & Signer Header */}
        <div className="p-3 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#06244B] text-xs">{documentTitle}</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
              status === 'Signed'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {status === 'Signed' ? 'Fully Executed' : 'Awaiting Client Signature'}
            </span>
          </div>

          <div className="text-[11px] text-[#667085] flex flex-wrap gap-x-4">
            <span>Signer: <strong>{signerName}</strong></span>
            <span>Email: <strong>{signerEmail}</strong></span>
          </div>
        </div>

        {/* Progression Stepper */}
        <div className="p-4 bg-white rounded border border-[#D9D6CF] space-y-3">
          <h4 className="font-semibold text-[#06244B] text-xs uppercase tracking-wider">
            Signature Lifecycle Progression:
          </h4>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D9D6CF] text-[#667085]'
                  }`}>
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <span className={`font-semibold block ${step.done ? 'text-[#06244B]' : 'text-[#667085]'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-[#667085]">{step.time}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold ${step.done ? 'text-emerald-700' : 'text-[#667085]'}`}>
                  {step.done ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Details */}
        <div className="p-3 bg-white rounded border border-[#D9D6CF] space-y-1 text-[11px] text-[#667085]">
          <div className="flex justify-between">
            <span>E-Sign Compliance:</span>
            <span className="font-medium text-[#06244B]">Utah Uniform Electronic Transactions Act (§ 46-4)</span>
          </div>
          <div className="flex justify-between">
            <span>Tamper-Evident Hash:</span>
            <span className="font-mono text-[#06244B] text-[10px]">SHA-256: e8f149...9b207a</span>
          </div>
          <div className="flex justify-between">
            <span>Client Workstation IP:</span>
            <span className="text-[#06244B]">166.70.82.14 (Salt Lake City, Comcast)</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D9D6CF]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addToast(`Resent e-signature notification reminder to ${signerEmail}.`, 'info')}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Send Reminder
          </Button>

          <div className="flex items-center gap-2">
            {status !== 'Signed' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSimulateClientSign}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                Simulate Client Signature
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {status === 'Signed' ? 'Done' : 'Close'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

