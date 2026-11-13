import React, { useState } from 'react';
import {
  FileText,
  Send,
  Printer,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  User,
  Building,
  Scale
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export function EngagementLetterModal({
  isOpen,
  onClose,
  clientName = 'Wasatch Mountain Logistics LLC',
  contactPerson = 'Robert H. Henderson',
  email = 'rhenderson@wasatchlogistics.com',
  matterTitle = 'Commercial Contract Enforcement & Carrier Defense',
  practiceAreaName = 'Civil Litigation & Dispute Resolution',
  attorneyName = 'Thomas Bludworth, Esq.',
  onDispatchSignature = null
}) {
  const { addToast } = useToast();

  const [billingModel, setBillingModel] = useState('Hourly');
  const [hourlyRate, setHourlyRate] = useState(500);
  const [retainerDeposit, setRetainerDeposit] = useState(7500);
  const [scopeDescription, setScopeDescription] = useState(
    'Representation of Client regarding commercial contract disputes, freight cargo claims, pre-trial fact discovery, dispositive motion practice, and formal mediation under Utah law.'
  );

  const handleSendForSignature = () => {
    const letterPayload = {
      letterId: `ENG-${Date.now().toString().slice(-6)}`,
      clientName,
      contactPerson,
      email,
      matterTitle,
      practiceAreaName,
      attorneyName,
      billingModel,
      hourlyRate,
      retainerDeposit,
      scopeDescription,
      dispatchedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Sent',
    };

    if (onDispatchSignature) {
      onDispatchSignature(letterPayload);
    }

    addToast(`Engagement letter dispatched for electronic signature to ${email}.`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Engagement Letter & Retainer Agreement Generator"
      size="xl"
    >
      <div className="space-y-4">
        {/* Term Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF] text-xs">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#667085] mb-1">
              Fee Structure:
            </label>
            <select
              value={billingModel}
              onChange={(e) => setBillingModel(e.target.value)}
              className="w-full text-xs p-1.5 bg-white border border-[#D9D6CF] rounded text-[#06244B] font-semibold"
            >
              <option value="Hourly">Standard Hourly Rate</option>
              <option value="Flat Fee">Fixed Retainer Flat Fee</option>
              <option value="Contingency">Contingency Fee (33.33%)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#667085] mb-1">
              Hourly Rate ($/hr):
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              disabled={billingModel !== 'Hourly'}
              className="w-full text-xs p-1.5 bg-white border border-[#D9D6CF] rounded text-[#06244B]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#667085] mb-1">
              IOLTA Trust Retainer ($):
            </label>
            <input
              type="number"
              value={retainerDeposit}
              onChange={(e) => setRetainerDeposit(Number(e.target.value))}
              className="w-full text-xs p-1.5 bg-white border border-[#D9D6CF] rounded text-[#06244B]"
            />
          </div>
        </div>

        {/* Live Formatted Legal Preview */}
        <div className="bg-white p-6 rounded border border-[#06244B]/30 shadow-xs space-y-4 text-xs text-[#202A35] max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="border-b-2 border-[#06244B] pb-3 flex justify-between items-start">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#06244B]">HEUGLY &amp; BLUDWORTH</h3>
              <p className="text-[10px] text-[#667085] uppercase tracking-widest">Attorneys at Law • A Professional Corporation</p>
              <p className="text-[10px] text-[#667085]">1420 Foothill Boulevard, Suite 500, Salt Lake City, Utah 84108</p>
            </div>
            <div className="text-right text-[10px] text-[#667085]">
              <span className="font-mono font-bold text-[#A4432B]">CONFIDENTIAL LEGAL WORK PRODUCT</span>
              <p>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Letter Body */}
          <div className="space-y-3 leading-relaxed">
            <div>
              <p><strong>To: </strong>{clientName}</p>
              <p><strong>Attn: </strong>{contactPerson} ({email})</p>
              <p><strong>Re: </strong>Attorney-Client Engagement Agreement &amp; Representation Scope</p>
            </div>

            <p>
              Dear {contactPerson},
            </p>
            <p>
              Thank you for selecting <strong>HEUGLY &amp; BLUDWORTH</strong> to represent <strong>{clientName}</strong> in connection with <strong>{matterTitle}</strong> within our <strong>{practiceAreaName}</strong> practice group.
            </p>

            <div className="p-3 bg-[#F5F0E5]/40 rounded border border-[#D9D6CF]">
              <h4 className="font-semibold text-[#06244B] mb-1">1. Scope of Representation:</h4>
              <p className="text-[11px] text-[#202A35]">{scopeDescription}</p>
            </div>

            <div className="p-3 bg-[#F5F0E5]/40 rounded border border-[#D9D6CF]">
              <h4 className="font-semibold text-[#06244B] mb-1">2. Professional Fees &amp; Retainer Terms (Utah RPC 1.5):</h4>
              <p className="text-[11px]">
                Legal services rendered under this agreement shall be billed at <strong>${hourlyRate}.00 per hour</strong> for lead counsel ({attorneyName}) and customary associate and paralegal rates.
              </p>
              <p className="text-[11px] mt-1.5">
                Client agrees to deposit an initial retainer of <strong>${retainerDeposit.toLocaleString()}.00</strong> into the firm's dedicated IOLTA Client Trust Account, compliant with Utah State Bar Rule 14-1001. Earned fees will be drawn monthly against detailed, itemized invoices.
              </p>
            </div>

            <p className="text-[11px] text-[#667085]">
              Please execute this engagement letter electronically via the secure signing portal link attached below.
            </p>

            <div className="pt-4 border-t border-[#D9D6CF] flex justify-between items-end">
              <div>
                <p className="font-serif font-bold text-[#06244B]">{attorneyName}</p>
                <p className="text-[10px] text-[#667085]">Managing Litigation Partner, Utah State Bar</p>
              </div>
              <div className="text-right">
                <div className="w-48 border-b border-dashed border-[#667085] pb-1 mb-1 text-[11px] text-amber-700 italic">
                  [Awaiting Electronic Signature]
                </div>
                <p className="text-[10px] text-[#667085]">{contactPerson}, Authorized Representative</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D9D6CF]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addToast('Engagement letter preview printed to PDF simulator.', 'info')}
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print Preview
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSendForSignature}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Dispatch for E-Signature
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

