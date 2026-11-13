import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Printer, Download, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

export function ClosingStatementModal({ isOpen, onClose, settlementModel }) {
  if (!settlementModel) return null;

  const {
    matterTitle,
    clientName,
    grossRecovery = 0,
    contingencyFeePercentage = 33.3333,
    contingencyFeeAmount = 0,
    caseExpenses = [],
    totalCaseExpenses = 0,
    medicalLiens = [],
    totalMedicalLiens = 0,
    otherDeductions = [],
    totalOtherDeductions = 0,
    netClientProceeds = 0,
    statementDate = new Date().toISOString().split('T')[0],
  } = settlementModel;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settlement Distribution & Closing Statement (Official Preview)"
      size="xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {/* Printable Formal Closing Statement Document */}
        <div className="bg-white p-6 sm:p-8 rounded border border-[#D9D6CF] shadow-sm font-sans text-xs text-slate-800 space-y-5">
          {/* Header */}
          <div className="text-center border-b-2 border-[#06244B] pb-4">
            <h2 className="text-lg font-serif font-bold tracking-wider text-[#06244B] uppercase">
              HEUGLY &amp; BLUDWORTH, P.C.
            </h2>
            <p className="text-[11px] text-slate-600">
              Attorneys at Law • 175 South Main Street, Suite 900, Salt Lake City, Utah 84111
            </p>
            <p className="text-[11px] text-[#A4432B] font-semibold">
              Client Trust Accounting Disbursement Division
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wide text-[#06244B]">
              CONFIDENTIAL SETTLEMENT DISBURSEMENT STATEMENT
            </h3>
            <p className="text-[11px] text-slate-500">
              Pursuant to Rule 1.5(c) of the Utah Rules of Professional Conduct
            </p>
          </div>

          {/* Client & Matter Details Strip */}
          <div className="bg-[#F5F0E5]/60 p-3 rounded border border-[#D9D6CF] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[#667085] block font-medium">Client / Claimant:</span>
              <span className="font-bold text-[#06244B]">{clientName || 'Sarah Jenkins'}</span>
            </div>
            <div>
              <span className="text-[#667085] block font-medium">Legal Action / Matter:</span>
              <span className="font-bold text-[#06244B]">{matterTitle}</span>
            </div>
            <div>
              <span className="text-[#667085] block font-medium">Statement Date:</span>
              <span className="font-bold text-[#06244B]">{statementDate}</span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-3">
            {/* 1. Gross Recovery */}
            <div className="flex justify-between items-center py-2 px-3 bg-[#06244B] text-white rounded font-bold text-sm">
              <span>I. TOTAL GROSS SETTLEMENT RECOVERY</span>
              <span>{formatCurrency(grossRecovery)}</span>
            </div>

            {/* 2. Attorney Contingency Fee */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
              <div className="flex justify-between items-center font-bold text-[#06244B]">
                <span>II. ATTORNEY CONTINGENCY FEE ({contingencyFeePercentage.toFixed(2)}%)</span>
                <span className="text-[#B42318]">-{formatCurrency(contingencyFeeAmount)}</span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Per written retainer agreement dated and approved by client prior to representation.
              </p>
            </div>

            {/* 3. Litigation Case Expenses */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
              <div className="flex justify-between items-center font-bold text-[#06244B]">
                <span>III. ITEMIZED LITIGATION COSTS &amp; DISBURSEMENTS</span>
                <span className="text-[#B42318]">-{formatCurrency(totalCaseExpenses)}</span>
              </div>
              <div className="pl-3 border-l-2 border-slate-300 space-y-1 text-[11px]">
                {caseExpenses.map((exp, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{exp.description}</span>
                    <span className="font-medium text-slate-800">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Medical Liens & Health Insurance Subrogation */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
              <div className="flex justify-between items-center font-bold text-[#06244B]">
                <span>IV. RESOLVED HEALTHCARE LIENS &amp; PROVIDER BALANCES</span>
                <span className="text-[#B42318]">-{formatCurrency(totalMedicalLiens)}</span>
              </div>
              <div className="pl-3 border-l-2 border-slate-300 space-y-1 text-[11px]">
                {medicalLiens.map((lien, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{lien.holder}</span>
                    <span className="font-medium text-slate-800">{formatCurrency(lien.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Other Deductions */}
            {totalOtherDeductions > 0 && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                <div className="flex justify-between items-center font-bold text-[#06244B]">
                  <span>V. OTHER AUTHORIZED DEDUCTIONS / CLIENT ADVANCES</span>
                  <span className="text-[#B42318]">-{formatCurrency(totalOtherDeductions)}</span>
                </div>
                <div className="pl-3 border-l-2 border-slate-300 space-y-1 text-[11px]">
                  {otherDeductions.map((ded, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span>{ded.description}</span>
                      <span className="font-medium text-slate-800">{formatCurrency(ded.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Net Client Proceeds Grand Total */}
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                  VI. FINAL NET PROCEEDS PAYABLE TO CLIENT
                </span>
                <span className="text-[11px] text-emerald-700">
                  Funds will be disbursed via certified IOLTA Trust Account check or direct FedWire.
                </span>
              </div>
              <span className="text-2xl font-serif font-bold text-emerald-800">
                {formatCurrency(netClientProceeds)}
              </span>
            </div>
          </div>

          {/* Utah RPC 1.5 Legal Attestation & Signatures */}
          <div className="pt-4 border-t border-slate-200 space-y-6 text-[11px] text-slate-600">
            <p className="leading-relaxed">
              <strong>CLIENT ACKNOWLEDGMENT &amp; APPROVAL:</strong> I, the undersigned client, hereby acknowledge that I have carefully reviewed this Settlement Disbursement Statement. I verify that the figures above represent a full and accurate accounting of all settlement funds received, attorney fees earned, costs reimbursed, and liens satisfied. I authorize Heugly &amp; Bludworth, P.C. to disburse the proceeds as itemized above.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <div className="border-t border-slate-400 pt-1.5 space-y-1">
                <p className="font-bold text-slate-900">{clientName || 'Sarah Jenkins'} (Client)</p>
                <p className="text-[10px] text-slate-500">Date Signed: ___________________________</p>
              </div>

              <div className="border-t border-slate-400 pt-1.5 space-y-1">
                <p className="font-bold text-slate-900">Thomas Bludworth, Esq. (Managing Attorney)</p>
                <p className="text-[10px] text-slate-500">Utah State Bar No. 10482 • Date: {statementDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Statement</span>
          </Button>

          <Button type="button" variant="primary" onClick={onClose}>
            Close Statement
          </Button>
        </div>
      </div>
    </Modal>
  );
}

