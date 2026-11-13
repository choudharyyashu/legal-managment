import React, { useState } from 'react';
import { DollarSign, Printer, Download, CheckCircle2, Scale } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';

export function SettlementStatementModal({ isOpen, onClose, matterTitle = 'Interstate Freightlines Settlement' }) {
  const { addToast } = useToast();
  const [grossSettlement, setGrossSettlement] = useState(250000);
  const [contingencyFeePct, setContingencyFeePct] = useState(33.33);
  const [expertWitnessFees, setExpertWitnessFees] = useState(12500);
  const [depositionTranscripts, setDepositionTranscripts] = useState(4800);
  const [medicalLiens, setMedicalLiens] = useState(22400);

  const attorneyFee = grossSettlement * (contingencyFeePct / 100);
  const totalDisbursements = expertWitnessFees + depositionTranscripts + medicalLiens;
  const netClientPayout = grossSettlement - attorneyFee - totalDisbursements;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contingency Settlement Statement &amp; Disbursement Sheet"
      subtitle={`Matter: ${matterTitle} • Utah Rule of Professional Conduct 1.5(c)`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Settlement Breakdown Table */}
        <div className="border border-[#D9D6CF] rounded-lg overflow-hidden">
          <div className="bg-[#F5F0E5] p-3 border-b border-[#D9D6CF] flex justify-between items-center">
            <span className="font-bold text-sm text-[#06244B]">1. Gross Settlement Recovery</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-emerald-800">$</span>
              <input
                type="number"
                value={grossSettlement}
                onChange={(e) => setGrossSettlement(Number(e.target.value))}
                className="w-32 text-right font-bold text-sm text-emerald-800 bg-white border border-[#D9D6CF] rounded px-2 py-0.5"
              />
            </div>
          </div>

          <div className="p-3 bg-white space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <span className="font-bold text-[#06244B] block">2. Attorney Contingency Fee ({contingencyFeePct}%)</span>
                <span className="text-[10px] text-[#667085]">Pursuant to signed retainer agreement</span>
              </div>
              <span className="font-bold text-sm text-[#06244B]">{formatCurrency(attorneyFee)}</span>
            </div>

            <div>
              <span className="font-bold text-xs uppercase text-[#06244B] block mb-1">
                3. Itemized Litigation Costs &amp; Liens Withheld
              </span>
              <div className="space-y-1.5 pl-2 text-[11px] text-[#667085]">
                <div className="flex justify-between">
                  <span>Accident Reconstruction / Medical Experts:</span>
                  <span className="font-medium text-[#202A35]">{formatCurrency(expertWitnessFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Certified Deposition Transcripts &amp; Filing Fees:</span>
                  <span className="font-medium text-[#202A35]">{formatCurrency(depositionTranscripts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved Healthcare / Subrogation Liens:</span>
                  <span className="font-medium text-[#202A35]">{formatCurrency(medicalLiens)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-semibold text-[#06244B]">
                  <span>Total Withheld Costs &amp; Liens:</span>
                  <span className="text-red-700">-{formatCurrency(totalDisbursements)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-[#D9D6CF] flex justify-between items-center bg-emerald-50 p-2.5 rounded">
              <div>
                <span className="font-bold text-sm text-[#06244B] block">4. Net Proceeds Disbursed to Client</span>
                <span className="text-[10px] text-[#667085]">Check / Wire transfer to client escrow</span>
              </div>
              <span className="font-bold text-lg text-emerald-800 font-mono">
                {formatCurrency(netClientPayout)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] text-[11px] text-[#202A35] space-y-1">
          <p className="font-bold text-[#06244B]">Client Written Acknowledgment (Utah RPC 1.5(c)):</p>
          <p className="text-[#667085]">
            "I have examined this settlement statement and approve the disbursement of funds as outlined above. I acknowledge receipt of the net settlement amount."
          </p>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-[#D9D6CF]">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" icon={Download} onClick={() => addToast('Settlement statement PDF downloaded.', 'success')}>
              Download PDF
            </Button>
            <Button size="sm" variant="primary" icon={Printer} onClick={handlePrint}>
              Print Settlement Sheet
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

