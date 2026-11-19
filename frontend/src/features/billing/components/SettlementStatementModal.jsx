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
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contingency Settlement Statement - ${matterTitle}</title>
          <style>
            @page { size: letter portrait; margin: 15mm 20mm; }
            body { font-family: "Georgia", "Times New Roman", serif; color: #1a1a1a; margin: 0; padding: 20px; font-size: 11pt; line-height: 1.45; }
            .header { text-align: center; border-bottom: 2px solid #06244B; padding-bottom: 12px; margin-bottom: 16px; }
            .firm-name { font-size: 18pt; font-weight: bold; color: #06244B; letter-spacing: 0.5px; }
            .firm-sub { font-size: 9pt; text-transform: uppercase; letter-spacing: 1.5px; color: #555; margin-top: 3px; font-family: sans-serif; }
            .cert-title { font-size: 13pt; font-weight: bold; margin-top: 12px; text-transform: uppercase; color: #A4432B; }
            .rule-cite { font-size: 9pt; font-style: italic; color: #444; margin-top: 2px; }
            .meta-grid { display: flex; justify-content: space-between; font-size: 9.5pt; margin-bottom: 16px; border-bottom: 1px solid #ddd; padding-bottom: 8px; font-family: sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10pt; font-family: sans-serif; }
            th { background: #06244B; color: #fff; text-align: left; padding: 8px 10px; font-weight: 600; text-transform: uppercase; font-size: 8.5pt; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            .row-gross { background-color: #f8fafc; font-weight: bold; font-size: 10.5pt; }
            .row-net { background-color: #ecfdf5; font-weight: bold; font-size: 11pt; color: #065f46; border-top: 2px solid #059669; }
            .text-right { text-align: right; }
            .text-red { color: #b91c1c; }
            .text-emerald { color: #047857; }
            .sub-item { padding-left: 20px; font-size: 9pt; color: #475569; }
            .legal-box { margin-top: 18px; padding: 12px; border: 1px solid #cbd5e1; background: #f8fafc; font-size: 9pt; border-radius: 4px; }
            .legal-box strong { color: #06244B; }
            .sig-row { display: flex; justify-content: space-between; margin-top: 40px; }
            .sig-col { width: 45%; }
            .sig-line { border-top: 1px solid #333; margin-top: 45px; padding-top: 6px; font-size: 9pt; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="firm-name">HEUGLY &amp; BLUDWORTH, LLC</div>
            <div class="firm-sub">Attorneys at Law • 222 S. Main Street, Suite 500 • Salt Lake City, Utah 84101</div>
            <div class="cert-title">Contingency Settlement Statement &amp; Disbursement Sheet</div>
            <div class="rule-cite">Required Written Settlement Disclosure Pursuant to Utah Rules of Professional Conduct — Rule 1.5(c)</div>
          </div>

          <div class="meta-grid">
            <div>
              <strong>Matter Caption:</strong> ${matterTitle}<br>
              <strong>Governing Rule:</strong> Utah RPC 1.5(c) (Contingency Settlement Accounting)
            </div>
            <div style="text-align: right;">
              <strong>Date of Statement:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
              <strong>Status:</strong> Approved for Client Closing
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Disbursement Description</th>
                <th>Authority / Reference</th>
                <th class="text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="row-gross">
                <td>1. GROSS SETTLEMENT RECOVERY</td>
                <td>Total Recovery Proceeds</td>
                <td class="text-right text-emerald">${formatCurrency(grossSettlement)}</td>
              </tr>
              <tr>
                <td><strong>2. Attorney Contingency Fee</strong></td>
                <td>Pursuant to signed retainer agreement (${contingencyFeePct}%)</td>
                <td class="text-right text-red">-${formatCurrency(attorneyFee)}</td>
              </tr>
              <tr style="background:#f1f5f9;">
                <td colspan="3"><strong>3. ITEMIZED LITIGATION COSTS &amp; LIENS WITHHELD</strong></td>
              </tr>
              <tr>
                <td class="sub-item">• Accident Reconstruction / Medical Experts</td>
                <td class="sub-item">Expert Witness Services</td>
                <td class="text-right text-red">-${formatCurrency(expertWitnessFees)}</td>
              </tr>
              <tr>
                <td class="sub-item">• Certified Deposition Transcripts &amp; Filing Fees</td>
                <td class="sub-item">Court Reporter &amp; Clerk Filing Fees</td>
                <td class="text-right text-red">-${formatCurrency(depositionTranscripts)}</td>
              </tr>
              <tr>
                <td class="sub-item">• Resolved Healthcare / Subrogation Liens</td>
                <td class="sub-item">Statutory Medical Provider Liens</td>
                <td class="text-right text-red">-${formatCurrency(medicalLiens)}</td>
              </tr>
              <tr style="font-weight: 600;">
                <td style="padding-left: 20px;">Total Withheld Costs &amp; Liens</td>
                <td>Total Advanced Disbursements</td>
                <td class="text-right text-red">-${formatCurrency(totalDisbursements)}</td>
              </tr>
              <tr class="row-net">
                <td>4. NET PROCEEDS DISBURSED TO CLIENT</td>
                <td>Payable by Trust Check or Wire to Client</td>
                <td class="text-right text-emerald">${formatCurrency(netClientPayout)}</td>
              </tr>
            </tbody>
          </table>

          <div class="legal-box">
            <strong>CLIENT WRITTEN ACKNOWLEDGMENT &amp; APPROVAL (UTAH RPC 1.5(c)):</strong><br>
            "I have examined this settlement statement and approve the disbursement of funds as outlined above. I acknowledge receipt of the net settlement amount in full satisfaction of the settlement recovery."
          </div>

          <div class="sig-row">
            <div class="sig-col">
              <div class="sig-line">
                <strong>Client Signature</strong><br>
                Date: ________________________
              </div>
            </div>
            <div class="sig-col">
              <div class="sig-line">
                <strong>Responsible Attorney Signature</strong><br>
                Eleanor Heugly, Esq. / Thomas Bludworth, Esq.<br>
                Date: ________________________
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(htmlContent);
      iframe.contentWindow.document.close();
      iframe.contentWindow.focus();
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 350);
    }
  };

  const handleDownloadStatement = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const csvLines = [
        `"HEUGLY & BLUDWORTH, PLLC - CONTINGENCY SETTLEMENT STATEMENT"`,
        `"Matter Caption:","${matterTitle.replace(/"/g, '""')}"`,
        `"Governing Standard:","Utah Rule of Professional Conduct 1.5(c)"`,
        `"Date of Statement:","${timestamp}"`,
        `""`,
        `"Item Category","Description / Provider","Amount ($)"`,
        `"1. Gross Settlement Proceeds","Policy Limits / Defense Award","${grossSettlement.toFixed(2)}"`,
        `"2. Attorney Contingency Fee","Heugly & Bludworth PLLC (${contingencyFeePct}%)","-${attorneyFee.toFixed(2)}"`,
        `"3. Litigation Costs","Accident Reconstruction / Medical Experts","-${expertWitnessFees.toFixed(2)}"`,
        `"3. Litigation Costs","Certified Deposition Transcripts & Filing Fees","-${depositionTranscripts.toFixed(2)}"`,
        `"3. Subrogation Liens","Resolved Healthcare / Provider Liens","-${medicalLiens.toFixed(2)}"`,
        `""`,
        `"4. NET CLIENT PAYOUT","Check / Wire Transfer to Client Escrow","${netClientPayout.toFixed(2)}"`
      ];

      const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Settlement_Closing_Statement_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('Settlement statement CSV downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to download settlement statement.', 'error');
    }
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
            <Button size="sm" variant="outline" icon={Download} onClick={handleDownloadStatement}>
              Download Statement (.CSV)
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

