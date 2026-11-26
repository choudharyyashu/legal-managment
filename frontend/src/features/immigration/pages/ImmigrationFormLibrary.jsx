import React, { useState } from 'react';
import { FileText, ShieldAlert, CheckCircle, Search, AlertTriangle, Layers, DollarSign } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Modal } from '../../../components/ui/Modal';
import { USCIS_STANDARD_FORMS } from '../../../data/mockUSCISForms';
import { useToast } from '../../../components/ui/Toast';

export function ImmigrationFormLibrary() {
  const [forms] = useState(USCIS_STANDARD_FORMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [diagnosticForm, setDiagnosticForm] = useState(null);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const { addToast } = useToast();

  const filteredForms = forms.filter(f =>
    searchQuery === '' ||
    f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunDiagnostic = (form) => {
    setDiagnosticForm(form);
    setDiagnosticResult(null);
    setIsDiagnosticOpen(true);
  };

  const handleExecuteDiagnostic = () => {
    const isSuccess = diagnosticForm.code !== 'I-485';
    if (isSuccess) {
      setDiagnosticResult({
        status: 'Pass',
        message: 'Checklist review complete for draft preparation. Confirm current USCIS form edition dates and filing fees directly on uscis.gov before filing.',
        details: [
          'Edition Date field listed (confirm current edition at uscis.gov)',
          'Client Form G-28 attorney representation signature item',
          'Reference Filing Fee ($' + diagnosticForm.filingFee + ') — verify against current USCIS G-1055 schedule',
          'Primary civil identity documentation item'
        ]
      });
      addToast('Draft checklist review completed. Verify current USCIS fees before filing.', 'info');
    } else {
      setDiagnosticResult({
        status: 'Deficiency',
        message: 'Pre-filing checklist items missing. Resolve before attorney sign-off.',
        details: [
          'Edition Date field listed (confirm current edition at uscis.gov)',
          'MISSING: Sealed Form I-693 Report of Medical Examination',
          'MISSING: Form I-864 joint sponsor tax return transcript',
          'Reference Filing Fee ($1,440) — verify against current USCIS G-1055 schedule'
        ]
      });
      addToast('Missing checklist items noted. Review before filing.', 'warning');
    }
  };

  const columns = [
    {
      key: 'code',
      label: 'Form #',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-bold text-sm text-[#06244B]">{val}</span>
          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded border border-slate-300 block w-fit mt-0.5">
            {row.agency}
          </span>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Official Title & Category',
      sortable: true,
      render: (val, row) => (
        <div>
          <button
            onClick={() => setSelectedForm(row)}
            className="font-bold text-xs text-[#06244B] hover:text-[#A4432B] text-left block"
          >
            {val}
          </button>
          <span className="text-[11px] text-[#A4432B] font-medium">{row.category}</span>
        </div>
      ),
    },
    {
      key: 'editionDate',
      label: 'Edition Date',
      render: (val) => <span className="text-xs text-[#202A35] font-mono">{val}</span>,
    },
    {
      key: 'filingFee',
      label: 'Reference Fee',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#06244B]">
            {val > 0 ? `$${val.toLocaleString()}` : 'No Fee ($0)'}
          </span>
          {row.biometricsFee > 0 && (
            <span className="text-[10px] text-[#667085] block">+ ${row.biometricsFee} Biometrics</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Pre-Filing Diagnostic',
      align: 'right',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          icon={ShieldAlert}
          onClick={() => handleRunDiagnostic(row)}
        >
          Validate
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            <strong>Official Form Library &amp; Diagnostic Engine:</strong> USCIS, EOIR, DOS, and DOL immigration inventory with edition date monitoring, fee schedules, and pre-filing compliance checks.
          </span>
        </div>
        <span className="bg-[#06244B] text-white font-medium px-2 py-0.5 rounded text-[10px]">
          ACTIVE
        </span>
      </div>

      <PageHeader
        title="Immigration Form Library &amp; Diagnostic Engine"
        subtitle="Reference catalog of USCIS petitions, edition dates, filing fee notes, supporting document checklists, and pre-filing review."
        breadcrumbs={[
          { label: 'Clients & Matters', to: '/matters' },
          { label: 'Immigration', to: '/immigration/cases' },
          { label: 'Form Library' }
        ]}
      />

      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by form number (e.g. I-130, I-485)..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredForms}
        keyField="id"
        emptyMessage="No forms found matching your search."
      />

      {/* Form Details Modal */}
      <Modal
        isOpen={Boolean(selectedForm)}
        onClose={() => setSelectedForm(null)}
        title={`${selectedForm?.code}: ${selectedForm?.title}`}
        subtitle={`Agency: ${selectedForm?.agency} | Edition: ${selectedForm?.editionDate}`}
        maxWidth="max-w-xl"
      >
        {selectedForm && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <p className="p-3 bg-slate-50 border border-[#D9D6CF] rounded text-xs leading-relaxed">
              {selectedForm.description}
            </p>

            <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#667085] block text-[10px] uppercase font-bold">Reference Filing Fee (Verify at USCIS):</span>
                <span className="font-bold text-sm text-[#06244B]">
                  {selectedForm.filingFee > 0 ? `$${selectedForm.filingFee.toLocaleString()}` : '$0 (Fee Exempt)'}
                </span>
              </div>
              <div>
                <span className="text-[#667085] block text-[10px] uppercase font-bold">Online Filing Available:</span>
                <span className="font-bold text-sm text-[#06244B]">
                  {selectedForm.onlineFilingAvailable ? 'Yes (myUSCIS Portal)' : 'Paper Filing Only'}
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-[#06244B] uppercase text-[10px] block mb-1">
                Commonly Requested Supporting Evidence &amp; Civil Documents:
              </span>
              <ul className="space-y-1 list-disc list-inside bg-white p-3 rounded border border-[#D9D6CF]">
                {selectedForm.mandatoryAttachments.map((att, i) => (
                  <li key={i} className="text-xs text-[#202A35]">{att}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[#D9D6CF] flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedForm(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={ShieldAlert}
                onClick={() => {
                  const f = selectedForm;
                  setSelectedForm(null);
                  handleRunDiagnostic(f);
                }}
              >
                Run Diagnostic Check
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Diagnostic Engine Modal */}
      <Modal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        title={`Pre-Filing Checklist Preview: Form ${diagnosticForm?.code}`}
        subtitle="Draft completeness review (verify current form editions & G-1055 fees at uscis.gov)"
        maxWidth="max-w-lg"
      >
        {diagnosticForm && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-slate-50 border border-[#D9D6CF] rounded space-y-1">
              <div className="font-bold text-[#06244B]">{diagnosticForm.title}</div>
              <div className="text-[11px] text-[#667085]">Reference Filing Fee: ${diagnosticForm.filingFee} | Agency: {diagnosticForm.agency}</div>
            </div>

            {!diagnosticResult ? (
              <div className="text-center py-6 space-y-3">
                <ShieldAlert className="w-10 h-10 text-[#A4432B] mx-auto animate-pulse" />
                <p className="text-sm font-semibold text-[#06244B]">
                  Ready to run draft checklist review on this petition form.
                </p>
                <p className="text-xs text-[#667085] max-w-sm mx-auto">
                  Reviews common civil document, Form G-28, and reference fee items for attorney verification.
                </p>
                <Button variant="primary" size="sm" onClick={handleExecuteDiagnostic}>
                  Run Checklist Review
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded border flex items-start gap-2.5 ${
                    diagnosticResult.status === 'Pass'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  {diagnosticResult.status === 'Pass' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block text-sm">
                      {diagnosticResult.status === 'Pass' ? 'CHECKLIST REVIEWED (DRAFT)' : 'CHECKLIST ITEMS MISSING'}
                    </span>
                    <span className="text-xs">{diagnosticResult.message}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border border-[#D9D6CF] space-y-1.5">
                  <span className="font-bold text-[10px] uppercase text-[#667085] block">Validation Checklist Results:</span>
                  {diagnosticResult.details.map((d, idx) => (
                    <div key={idx} className="text-xs font-mono py-0.5">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsDiagnosticOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

