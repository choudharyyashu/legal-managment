import React, { useState } from 'react';
import {
  FileText,
  Layers,
  Plus,
  Download,
  Eye,
  Sparkles,
  Printer,
  CheckCircle2,
  Copy,
  Edit,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  User,
  Scale,
  FolderOpen
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { useMatters } from '../../../context/MatterContext';
import { useClients } from '../../../context/ClientContext';
import { formatCurrency } from '../../../utils/formatCurrency';

export function TemplatesSettings() {
  const { addToast } = useToast();
  const { matters } = useMatters();
  const { clients } = useClients();

  const [templates, setTemplates] = useState([
    {
      id: 'TPL-01',
      name: 'Master Client Engagement & Hourly Retainer Agreement',
      category: 'Engagement',
      format: 'DOCX / PDF',
      practiceArea: 'All Practice Areas',
      lastUpdated: '2026-10-15',
      variables: ['{{Client.Name}}', '{{Client.Address}}', '{{Matter.Title}}', '{{Billing.HourlyRate}}', '{{Billing.RetainerDeposit}}'],
      conditionalClauses: ['Arbitration Clause', 'IOLTA Replenishment Covenant'],
      templateBody: `LEGAL SERVICES ENGAGEMENT & RETAINER AGREEMENT

This Agreement is made by and between HEUGLY & BLUDWORTH, P.C. ("Firm") and {{Client.Name}} ("Client"), having its primary address at {{Client.Address}}, in connection with legal representation in {{Matter.Title}} (Docket No. {{Matter.DocketNumber}}).

1. SCOPE OF ENGAGEMENT:
The Firm agrees to provide legal representation to Client before the {{Court.Name}} and in related negotiations with {{OpposingParty.Name}}, represented by {{OpposingCounsel.Firm}}.

2. HOURLY RATES & EXPENSES:
Client agrees to pay the Firm at the standard hourly billing rate of {{Billing.HourlyRate}} per hour for partner time and $195.00 per hour for paralegal support services.

3. ADVANCE TRUST RETAINER (UTAH RPC 1.15):
Client shall deposit an initial retainer of {{Billing.RetainerDeposit}} into the Firm's segregated IOLTA Client Trust Account at Chase Bank. Funds remain the property of Client until earned.

{{CLAUSE_ARBITRATION}}

{{CLAUSE_IOLTA}}

DATED this 12th day of November, 2026.

HEUGLY & BLUDWORTH, P.C.                    CLIENT ACKNOWLEDGMENT:
______________________________            ______________________________
Thomas Bludworth, Esq. (Partner)          {{Client.ContactPerson}} (Authorized)`
    },
    {
      id: 'TPL-02',
      name: 'Utah Third District Notice of Appearance & Electronic Service',
      category: 'Litigation Pleadings',
      format: 'DOCX',
      practiceArea: 'Civil Litigation & Dispute Resolution',
      lastUpdated: '2026-11-01',
      variables: ['{{Court.Name}}', '{{Matter.DocketNumber}}', '{{Client.Name}}', '{{OpposingParty.Name}}'],
      conditionalClauses: ['Electronic Service Consent (URCP Rule 5)'],
      templateBody: `IN THE THIRD JUDICIAL DISTRICT COURT IN AND FOR SALT LAKE COUNTY, STATE OF UTAH

{{Client.Name}},
     Plaintiff,
v.                                                 ENTRY OF APPEARANCE & NOTICE OF ELECTRONIC SERVICE
{{OpposingParty.Name}},                           Civil No. {{Matter.DocketNumber}}
     Defendant.                                   Judge: Hon. Coral Del-Valle

COMES NOW Thomas Bludworth, Esq. of HEUGLY & BLUDWORTH, P.C., and enters his formal appearance as counsel of record for Plaintiff {{Client.Name}} in the above-entitled action pursuant to Utah R. Civ. P. 5 and 7.

{{CLAUSE_E_SERVICE}}

RESPECTFULLY SUBMITTED this 12th day of November, 2026.

HEUGLY & BLUDWORTH, P.C.
/s/ Thomas Bludworth, Esq.
Counsel for {{Client.Name}}`
    },
    {
      id: 'TPL-03',
      name: 'Deposition Subpoena Duces Tecum for Corporate Records',
      category: 'Discovery',
      format: 'DOCX',
      practiceArea: 'Civil Litigation & Dispute Resolution',
      lastUpdated: '2026-09-20',
      variables: ['{{Court.Name}}', '{{Matter.DocketNumber}}', '{{OpposingParty.Name}}'],
      conditionalClauses: ['Include 10-Day Records Production Waiver'],
      templateBody: `SUBPOENA DUCES TECUM PURSUANT TO UTAH R. CIV. P. 45

TO: Custodian of Records, {{OpposingParty.Name}}

YOU ARE HEREBY COMMANDED to appear and produce certified business records in connection with {{Matter.Title}} (Civil No. {{Matter.DocketNumber}}), pending before the {{Court.Name}}...`
    },
    {
      id: 'TPL-04',
      name: 'Utah Contingency Fee Retainer & Settlement Authority Agreement',
      category: 'Personal Injury',
      format: 'DOCX / PDF',
      practiceArea: 'Personal Injury & Wrongful Death',
      lastUpdated: '2026-11-04',
      variables: ['{{Client.Name}}', '{{Matter.Title}}', '{{Billing.ContingencyPct}}'],
      conditionalClauses: ['Medical Liens Direct Withholding Authorization', 'Appellate Surcharge Notice'],
      templateBody: `CONTINGENCY FEE RETAINER (UTAH RPC 1.5(c))

Client {{Client.Name}} hereby retains HEUGLY & BLUDWORTH, P.C. to prosecute claims arising out of {{Matter.Title}}.
Attorney contingency fee shall be {{Billing.ContingencyPct}} of gross recovery prior to trial...`
    },
  ]);

  // Merge Studio State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedMatterId, setSelectedMatterId] = useState(matters[0]?.id || 'MAT-1001');
  const targetMatter = matters.find(m => m.id === selectedMatterId) || matters[0];
  const targetClient = clients.find(c => c.id === targetMatter?.clientId) || clients[0];

  // Conditional Clauses Toggle State
  const [enableArbitration, setEnableArbitration] = useState(true);
  const [enableIOLTAClause, setEnableIOLTAClause] = useState(true);
  const [enableEService, setEnableEService] = useState(true);

  const handleOpenStudio = (tpl) => {
    setSelectedTemplate(tpl);
  };

  // Generate real-time populated document text
  const getPopulatedText = () => {
    if (!selectedTemplate) return '';

    let text = selectedTemplate.templateBody;

    // Replace merge tags with real data
    text = text.replace(/\{\{Client\.Name\}\}/g, targetClient?.name || 'Wasatch Mountain Logistics LLC');
    text = text.replace(/\{\{Client\.Address\}\}/g, targetClient?.address || '1420 South Foothill Blvd, Salt Lake City, UT 84108');
    text = text.replace(/\{\{Client\.ContactPerson\}\}/g, targetClient?.primaryContact || 'Robert H. Henderson');
    text = text.replace(/\{\{Matter\.Title\}\}/g, targetMatter?.title || 'Commercial Contract Breach Litigation');
    text = text.replace(/\{\{Matter\.DocketNumber\}\}/g, targetMatter?.matterNumber || '25-CV-0101');
    text = text.replace(/\{\{Court\.Name\}\}/g, 'Utah Third Judicial District Court (Salt Lake County)');
    text = text.replace(/\{\{OpposingParty\.Name\}\}/g, 'Interstate Freightlines Inc.');
    text = text.replace(/\{\{OpposingCounsel\.Firm\}\}/g, 'Sterling & Crawford LLP');
    text = text.replace(/\{\{Billing\.HourlyRate\}\}/g, '$500.00');
    text = text.replace(/\{\{Billing\.RetainerDeposit\}\}/g, '$15,000.00');
    text = text.replace(/\{\{Billing\.ContingencyPct\}\}/g, '33.33%');

    // Conditional Clauses
    if (enableArbitration) {
      text = text.replace(
        '{{CLAUSE_ARBITRATION}}',
        '4. MANDATORY BINDING ARBITRATION:\nAny dispute arising under this Agreement shall be submitted to confidential, binding arbitration in Salt Lake City, Utah under the Utah Uniform Arbitration Act (Utah Code § 78B-11-101 et seq.).'
      );
    } else {
      text = text.replace('{{CLAUSE_ARBITRATION}}', '');
    }

    if (enableIOLTAClause) {
      text = text.replace(
        '{{CLAUSE_IOLTA}}',
        '5. TRUST REPLENISHMENT COVENANT:\nClient agrees to replenish the IOLTA retainer within ten (10) business days upon notice that the balance has fallen below $5,000.00.'
      );
    } else {
      text = text.replace('{{CLAUSE_IOLTA}}', '');
    }

    if (enableEService) {
      text = text.replace(
        '{{CLAUSE_E_SERVICE}}',
        'Pursuant to Utah R. Civ. P. 5(b)(3), counsel accepts electronic service of all pleadings, discovery, and notices via Utah GreenFiling / Odyssey Court e-filing system at service@utahslawyers.com.'
      );
    } else {
      text = text.replace('{{CLAUSE_E_SERVICE}}', '');
    }

    return text;
  };

  const columns = [
    {
      key: 'name',
      label: 'Template Title & Scope',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-start gap-2 min-w-[220px]">
          <FileText className="w-4 h-4 text-[#A4432B] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-xs text-[#06244B] block leading-snug">{val}</span>
            <span className="text-[10px] text-[#667085] whitespace-nowrap">{row.id} • {row.format}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="inline-block whitespace-nowrap text-xs px-2 py-0.5 rounded bg-[#F5F0E5] text-[#06244B] border border-[#D9D6CF]">
          {val}
        </span>
      ),
    },
    {
      key: 'practiceArea',
      label: 'Applicable Practice Area',
      sortable: true,
      render: (val) => <span className="text-xs text-[#202A35] font-medium block min-w-[140px]">{val}</span>,
    },
    {
      key: 'variables',
      label: 'Dynamic Tags',
      render: (val) => (
        <span className="inline-block whitespace-nowrap text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
          {val?.length || 4} merge tags
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button
            size="xs"
            variant="outline"
            icon={Eye}
            onClick={() => handleOpenStudio(row)}
          >
            Live Merge
          </Button>
          <Button
            size="xs"
            variant="outline"
            icon={Download}
            onClick={() => addToast(`Template "${row.name}" downloaded for offline editing.`, 'info')}
          >
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filevine Template Architecture Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950">
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Smart Document Template Engine (Filevine Model):</strong> Dynamic document generation populated from matter data, repeating adversaries, and conditional clauses. Firm administrators can customize merge tags and clauses without code changes.
          </span>
        </div>
        <span className="bg-emerald-200 text-emerald-900 font-bold px-2.5 py-0.5 rounded text-[10px] whitespace-nowrap shrink-0 self-start sm:self-auto">
          SMART MERGE ACTIVE
        </span>
      </div>

      <PageHeader
        title="Document Templates &amp; Merge Studio"
        subtitle="Standardized legal pleadings, agreements, engagement instruments, and statutory notices with live data merging."
        breadcrumbs={[
          { label: 'Reports & Settings', to: '/settings/users' },
          { label: 'Templates & Workflows' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => handleOpenStudio(templates[0])}
            >
              Open Live Merge Studio
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => addToast('Upload Word / PDF template dialog opened.', 'info')}
            >
              Add New Template
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={templates}
        pageSize={8}
      />

      {/* Smart Template Merge Studio Modal */}
      {selectedTemplate && (
        <Modal
          isOpen={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          title={`Smart Document Merge Studio: ${selectedTemplate.name}`}
          subtitle="Preview dynamic merge variables, toggle conditional paragraphs, and export populated legal instruments."
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top Config Row: Responsive 2-Column Grid */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-[#D9D6CF] grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#667085] block mb-1">
                  1. Target Matter (Auto-Fills Client &amp; Court Data)
                </label>
                <select
                  value={selectedMatterId}
                  onChange={(e) => setSelectedMatterId(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded border border-[#D9D6CF] bg-white text-[#06244B] focus:outline-none focus:border-[#06244B]"
                >
                  {matters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.matterNumber} — {m.title} ({m.clientName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional Clauses Toggles */}
              <div>
                <label className="text-[10px] uppercase font-bold text-[#667085] block mb-1">
                  2. Conditional Paragraph Toggles
                </label>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#D9D6CF] rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-xs">
                    <input
                      type="checkbox"
                      checked={enableArbitration}
                      onChange={(e) => setEnableArbitration(e.target.checked)}
                      className="rounded border-[#D9D6CF] text-[#06244B] focus:ring-[#06244B] h-3.5 w-3.5"
                    />
                    <span className="text-[11px] font-medium text-[#202A35]">Arbitration Clause</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#D9D6CF] rounded cursor-pointer hover:bg-slate-100 transition-colors shadow-xs">
                    <input
                      type="checkbox"
                      checked={enableIOLTAClause}
                      onChange={(e) => setEnableIOLTAClause(e.target.checked)}
                      className="rounded border-[#D9D6CF] text-[#06244B] focus:ring-[#06244B] h-3.5 w-3.5"
                    />
                    <span className="text-[11px] font-medium text-[#202A35]">IOLTA Replenishment</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Document Preview Area (Styled with comfortable max-height and clean scroll) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#06244B] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#A4432B]" />
                  Live Populated Document Output:
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Data merged from Matter #{targetMatter?.matterNumber} ✓
                </span>
              </div>

              <div className="p-4 sm:p-5 bg-white border border-[#D9D6CF] rounded-lg shadow-inner max-h-60 sm:max-h-72 overflow-y-auto font-mono text-[11px] sm:text-xs whitespace-pre-line leading-relaxed text-[#202A35]">
                {getPopulatedText()}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#D9D6CF]">
              <span className="text-[11px] text-[#667085]">
                Variables auto-mapped: <strong>{"{{Client}}, {{Court}}, {{OpposingParty}}, {{Rates}}"}</strong>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Download}
                  onClick={() => addToast('Populated Word document (.docx) downloaded.', 'success')}
                >
                  Download .DOCX
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Printer}
                  onClick={() => {
                    window.print();
                    addToast('Print dialog launched for legal instrument.', 'info');
                  }}
                >
                  Print Instrument
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
