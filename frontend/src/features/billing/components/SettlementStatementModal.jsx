import React, { useState, useEffect } from 'react';
import { DollarSign, Printer, Download, CheckCircle2, Scale } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/ui/Toast';
import { calculateSettlement, formatFeeRateDisplay } from '../../../utils/settlementCalculations';
import { piService } from '../../../services/piService';

export function SettlementStatementModal({
  isOpen,
  onClose,
  matterTitle = 'Settlement Statement',
  matter = null,
  matterId = null,
  settlementData = null,
}) {
  const { addToast } = useToast();

  const effectiveMatterId = matter?.id || matterId;
  const effectiveMatterTitle = matter?.title || matterTitle;

  const [grossSettlement, setGrossSettlement] = useState(0);
  const [feeSelection, setFeeSelection] = useState('33.33'); // '33.33', 'exact_one_third', '40', '25', '50'
  const [costs, setCosts] = useState([]);
  const [liens, setLiens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (settlementData) {
      setGrossSettlement(Number(settlementData.grossSettlement ?? settlementData.grossRecovery ?? 0));
      const isExact =
        settlementData.feeRateOption === 'exact' ||
        settlementData.feeSelection === 'exact_one_third' ||
        settlementData.feeBasis === 'EXACT_ONE_THIRD';
      setFeeSelection(isExact ? 'exact_one_third' : String(settlementData.feeRate ?? settlementData.contingencyPct ?? 33.33));
      setCosts(
        Array.isArray(settlementData.costs)
          ? settlementData.costs
          : Array.isArray(settlementData.caseExpenses)
          ? settlementData.caseExpenses
          : []
      );
      setLiens(
        Array.isArray(settlementData.liens)
          ? settlementData.liens
          : Array.isArray(settlementData.medicalLiens)
          ? settlementData.medicalLiens
          : []
      );
      return;
    }

    if (effectiveMatterId) {
      setLoading(true);
      let cancelled = false;
      piService
        .getSettlements(effectiveMatterId)
        .then((res) => {
          if (cancelled) return;
          const latest = Array.isArray(res) ? res[0]?.versions?.[0] : null;
          if (latest) {
            const savedGross = Number(latest.grossSettlementAmount ?? 0);
            const savedPct = Number(latest.contingencyFeePercentage ?? 33.33);
            const isExact = Boolean(latest.notes?.includes('1/3 (Exact)')) || latest.feeBasis === 'EXACT_ONE_THIRD';
            setGrossSettlement(savedGross);
            setFeeSelection(isExact ? 'exact_one_third' : String(savedPct));
            const savedCosts = Number(latest.totalLitigationCosts ?? 0);
            const savedLiens = Number(latest.totalMedicalLiens ?? 0);
            setCosts(savedCosts > 0 ? [{ id: 'saved-cost', label: 'Itemized Case Costs', amount: savedCosts }] : []);
            setLiens(
              savedLiens > 0
                ? [{ id: 'saved-lien', holder: 'Healthcare Liens', negotiatedAmount: savedLiens, originalAmount: savedLiens }]
                : []
            );
          } else {
            setGrossSettlement(0);
            setFeeSelection('33.33');
            setCosts([]);
            setLiens([]);
          }
        })
        .catch((err) => {
          console.warn('Could not load matter settlement from API:', err?.message);
          setGrossSettlement(0);
          setCosts([]);
          setLiens([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    } else {
      setGrossSettlement(0);
      setFeeSelection('33.33');
      setCosts([]);
      setLiens([]);
    }
  }, [isOpen, settlementData, effectiveMatterId]);

  const feeRateOption = feeSelection === 'exact_one_third' ? 'exact' : 'standard';
  const contingencyFeePct = feeSelection === 'exact_one_third' ? 33.33 : Number(feeSelection) || 0;

  const {
    contingencyFeeAmount: attorneyFee,
    totalCaseExpenses: totalCosts,
    totalMedicalLiens: totalLiens,
    netClientProceeds: netClientPayout,
    feeRateDisplay,
  } = calculateSettlement({
    grossRecovery: grossSettlement,
    feeRate: contingencyFeePct,
    feeRateOption,
    caseExpenses: costs,
    medicalLiens: liens,
  });

  const totalDisbursements = totalCosts + totalLiens;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const costRowsHtml =
      costs.length === 0
        ? `<tr><td class="sub-item">• Litigation &amp; Court Expenses</td><td class="sub-item">None Withheld</td><td class="text-right text-red">$0.00</td></tr>`
        : costs
            .map(
              (c) =>
                `<tr><td class="sub-item">• ${c.label || c.description || 'Case Expense'}</td><td class="sub-item">Itemized Litigation Cost</td><td class="text-right text-red">-${formatCurrency(
                  c.amount
                )}</td></tr>`
            )
            .join('');

    const lienRowsHtml =
      liens.length === 0
        ? `<tr><td class="sub-item">• Medical &amp; Subrogation Liens</td><td class="sub-item">None Withheld</td><td class="text-right text-red">$0.00</td></tr>`
        : liens
            .map(
              (l) =>
                `<tr><td class="sub-item">• ${l.holder || l.providerName || 'Healthcare Lien'}</td><td class="sub-item">Statutory Medical Lien</td><td class="text-right text-red">-${formatCurrency(
                  l.negotiatedAmount ?? l.amount ?? 0
                )}</td></tr>`
            )
            .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contingency Settlement Statement - ${effectiveMatterTitle}</title>
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
              <strong>Matter Caption:</strong> ${effectiveMatterTitle}<br>
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
                <td>Pursuant to signed retainer agreement (${feeRateDisplay})</td>
                <td class="text-right text-red">-${formatCurrency(attorneyFee)}</td>
              </tr>
              <tr style="background:#f1f5f9;">
                <td colspan="3"><strong>3. ITEMIZED LITIGATION COSTS &amp; LIENS WITHHELD</strong></td>
              </tr>
              ${costRowsHtml}
              ${lienRowsHtml}
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
                Assigned Responsible Attorney<br>
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
        `"Matter Caption:","${effectiveMatterTitle.replace(/"/g, '""')}"`,
        `"Governing Standard:","Utah Rule of Professional Conduct 1.5(c)"`,
        `"Date of Statement:","${timestamp}"`,
        `""`,
        `"Item Category","Description / Provider","Amount ($)"`,
        `"1. Gross Settlement Proceeds","Policy Limits / Settlement Award","${grossSettlement.toFixed(2)}"`,
        `"2. Attorney Contingency Fee","Heugly & Bludworth PLLC (${feeRateDisplay})","-${attorneyFee.toFixed(2)}"`,
      ];

      if (costs.length === 0) {
        csvLines.push(`"3. Litigation Costs","None Withheld","0.00"`);
      } else {
        costs.forEach((c) => {
          csvLines.push(
            `"3. Litigation Costs","${(c.label || c.description || 'Case Expense').replace(/"/g, '""')}","-${Number(
              c.amount || 0
            ).toFixed(2)}"`
          );
        });
      }

      if (liens.length === 0) {
        csvLines.push(`"3. Subrogation Liens","None Withheld","0.00"`);
      } else {
        liens.forEach((l) => {
          const lienAmt = Number(l.negotiatedAmount ?? l.amount ?? 0);
          csvLines.push(
            `"3. Subrogation Liens","${(l.holder || l.providerName || 'Healthcare Lien').replace(/"/g, '""')}","-${lienAmt.toFixed(
              2
            )}"`
          );
        });
      }

      csvLines.push(`""`);
      csvLines.push(`"4. NET CLIENT PAYOUT","Payable to Client Escrow / Trust Disbursement","${netClientPayout.toFixed(2)}"`);

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
      subtitle={`Matter: ${effectiveMatterTitle} • Utah Rule of Professional Conduct 1.5(c)`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {loading && (
          <div className="p-2 text-center text-xs text-[#667085] bg-slate-50 border border-[#D9D6CF] rounded">
            Loading settlement figures for matter...
          </div>
        )}

        {/* Settlement Breakdown Table */}
        <div className="border border-[#D9D6CF] rounded-lg overflow-hidden">
          <div className="bg-[#F5F0E5] p-3 border-b border-[#D9D6CF] flex justify-between items-center">
            <span className="font-bold text-sm text-[#06244B]">1. Gross Settlement Recovery</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-emerald-800">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={grossSettlement || ''}
                onChange={(e) => setGrossSettlement(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="w-36 text-right font-bold text-sm text-emerald-800 bg-white border border-[#D9D6CF] rounded px-2 py-0.5"
              />
            </div>
          </div>

          <div className="p-3 bg-white space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <span className="font-bold text-[#06244B] block">2. Attorney Contingency Fee ({feeRateDisplay})</span>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={feeSelection}
                    onChange={(e) => setFeeSelection(e.target.value)}
                    className="text-[11px] bg-slate-50 border border-[#D9D6CF] rounded px-1.5 py-0.5 text-[#06244B] font-medium"
                  >
                    <option value="exact_one_third">1/3 (Exact Contingency)</option>
                    <option value="33.33">33.33% Standard</option>
                    <option value="40">40.00% Litigation / Trial</option>
                    <option value="25">25.00% Settlement Prior to Filing</option>
                    <option value="50">50.00% Appeal / High Risk</option>
                  </select>
                  <span className="text-[10px] text-[#667085]">Pursuant to signed retainer</span>
                </div>
              </div>
              <span className="font-bold text-sm text-[#06244B]">{formatCurrency(attorneyFee)}</span>
            </div>

            <div>
              <span className="font-bold text-xs uppercase text-[#06244B] block mb-1">
                3. Itemized Litigation Costs &amp; Liens Withheld
              </span>
              <div className="space-y-1.5 pl-2 text-[11px] text-[#667085]">
                {costs.length === 0 ? (
                  <div className="flex justify-between text-slate-400">
                    <span>Litigation &amp; Expert Witness Expenses:</span>
                    <span>$0.00</span>
                  </div>
                ) : (
                  costs.map((c, idx) => (
                    <div key={c.id || idx} className="flex justify-between">
                      <span>{c.label || c.description || 'Case Expense'}:</span>
                      <span className="font-medium text-[#202A35]">{formatCurrency(c.amount)}</span>
                    </div>
                  ))
                )}

                {liens.length === 0 ? (
                  <div className="flex justify-between text-slate-400">
                    <span>Resolved Healthcare &amp; Subrogation Liens:</span>
                    <span>$0.00</span>
                  </div>
                ) : (
                  liens.map((l, idx) => (
                    <div key={l.id || idx} className="flex justify-between">
                      <span>{l.holder || l.providerName || 'Healthcare Lien'}:</span>
                      <span className="font-medium text-[#202A35]">
                        {formatCurrency(l.negotiatedAmount ?? l.amount ?? 0)}
                      </span>
                    </div>
                  ))
                )}

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
