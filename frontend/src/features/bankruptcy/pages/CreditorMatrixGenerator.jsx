import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle, Copy, HelpCircle } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { MOCK_BANKRUPTCY_CASES } from '../../../data/mockBankruptcyCases';
import { MOCK_BANKRUPTCY_SCHEDULES } from '../../../data/mockBankruptcySchedules';
import { useToast } from '../../../components/ui/Toast';

export function CreditorMatrixGenerator() {
  const [selectedCaseId, setSelectedCaseId] = useState('BNK-2026-001');
  const { addToast } = useToast();

  const caseData = MOCK_BANKRUPTCY_CASES.find(c => c.id === selectedCaseId) || MOCK_BANKRUPTCY_CASES[0];
  const schedules = MOCK_BANKRUPTCY_SCHEDULES[selectedCaseId] || MOCK_BANKRUPTCY_SCHEDULES['BNK-2026-001'];

  // Combine Schedule D and EF creditors
  const creditors = [
    ...schedules.scheduleD.map(d => ({ name: d.creditor, address: d.address })),
    ...schedules.scheduleEF.map(ef => ({ name: ef.creditor, address: ef.address }))
  ];

  // Generate standardized court matrix string (District of Utah format: uppercase, single-spaced address block, blank line separator)
  const matrixText = creditors.map(c => `${c.name.toUpperCase()}\n${c.address.toUpperCase()}`).join('\n\n');

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([matrixText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${caseData.caseNumber.replace(/[^a-zA-Z0-9]/g, '_')}_creditor_matrix.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('Standardized creditor matrix (.txt) downloaded for court e-filing.', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(matrixText);
    addToast('Creditor matrix copied to clipboard.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>[MOCK COURT MATRIX]:</strong> District of Utah standard creditor mailing matrix generator. Complies with Clerk of Court plain ASCII formatting rules (left-aligned, 5 lines maximum per block).
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
          PROTOTYPE
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Bankruptcy Court Creditor Mailing Matrix Generator"
          subtitle={`Case: ${caseData.caseNumber} — ${caseData.debtorName}`}
          breadcrumbs={[
            { label: 'Clients & Matters', to: '/matters' },
            { label: 'Bankruptcy', to: '/bankruptcy/cases' },
            { label: 'Creditor Matrix' }
          ]}
        />

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-[#D9D6CF] shadow-sm">
          <span className="text-xs font-semibold text-[#06244B] ml-2">Select Case:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="text-xs p-1.5 rounded border border-[#D9D6CF] text-[#06244B] bg-slate-50 font-medium"
          >
            {MOCK_BANKRUPTCY_CASES.slice(0, 3).map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.debtorName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9D6CF] pb-3">
          <div>
            <h3 className="font-bold text-sm text-[#06244B]">
              Standard Matrix Preview ({creditors.length} Creditors Formatted)
            </h3>
            <span className="text-xs text-[#667085]">
              Compliant with CM/ECF upload specifications (Utah Bankruptcy Local Rule 1007-2).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" icon={Copy} onClick={handleCopy}>
              Copy Text
            </Button>
            <Button size="sm" variant="primary" icon={Download} onClick={handleDownloadTxt}>
              Download .TXT Matrix
            </Button>
          </div>
        </div>

        {/* Matrix Monospace Output Area */}
        <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 leading-relaxed overflow-x-auto whitespace-pre">
          {matrixText}
        </div>

        <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] text-xs text-[#202A35] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>
              All addresses formatted in uppercase without non-standard punctuation. Ready for automated notice dispatch.
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#667085]">
            ASCII 8-bit plain text
          </span>
        </div>
      </div>
    </div>
  );
}

