import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  BookOpen,
  FileText,
  Printer,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { MOCK_LITIGATION_CASES } from '../../../data/mockLitigationCases';
import { LitigationNavigationHeader } from '../components/LitigationNavigationHeader';
import { useToast } from '../../../components/ui/Toast';

export function CaseAssessment() {
  const [cases, setCases] = useState(MOCK_LITIGATION_CASES);
  const [activeCase, setActiveCase] = useState(MOCK_LITIGATION_CASES[0]);
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const { addToast } = useToast();

  // New Issue form state
  const [issueTitle, setIssueTitle] = useState('');
  const [issueElements, setIssueElements] = useState('');
  const [supportingEvidence, setSupportingEvidence] = useState('');
  const [missingEvidence, setMissingEvidence] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [assignedResearch, setAssignedResearch] = useState('');

  // New Hold form state
  const [holdRecipient, setHoldRecipient] = useState('');
  const [holdDepartment, setHoldDepartment] = useState('');
  const [holdDevices, setHoldDevices] = useState('');

  const handleAddIssue = (e) => {
    e.preventDefault();
    if (!issueTitle.trim()) {
      addToast('Please enter claim or issue title.', 'error');
      return;
    }

    const newClaim = {
      id: `clm-${Date.now()}`,
      title: issueTitle,
      element: issueElements,
      supportingEvidence,
      missingEvidence,
      witnesses,
      assignedResearch,
      status: 'Active Review'
    };

    setActiveCase(prev => ({
      ...prev,
      claims: [newClaim, ...prev.claims]
    }));

    addToast(`Issue "${issueTitle}" added to Proof Matrix!`, 'success');
    setIsAddIssueOpen(false);
    setIssueTitle('');
    setIssueElements('');
    setSupportingEvidence('');
    setMissingEvidence('');
    setWitnesses('');
    setAssignedResearch('');
  };

  const handleAddHold = (e) => {
    e.preventDefault();
    if (!holdRecipient.trim()) {
      addToast('Please enter recipient name.', 'error');
      return;
    }

    const newHold = {
      id: `hold-${Date.now()}`,
      recipient: holdRecipient,
      department: holdDepartment,
      noticeDate: new Date().toISOString().split('T')[0],
      acknowledgedDate: null,
      status: 'Notice Dispatched (Pending Acknowledgment)',
      devicesCovered: holdDevices,
      notes: 'Preservation notice transmitted via certified electronic delivery.'
    };

    setActiveCase(prev => ({
      ...prev,
      litigationHolds: [newHold, ...(prev.litigationHolds || [])]
    }));

    addToast(`Litigation Hold issued to ${holdRecipient}!`, 'success');
    setIsHoldModalOpen(false);
    setHoldRecipient('');
    setHoldDepartment('');
    setHoldDevices('');
  };

  return (
    <div className="space-y-6">
      <LitigationNavigationHeader
        activeCase={activeCase}
        cases={cases}
        onSelectCase={setActiveCase}
      />

      <PageHeader
        title="Case Assessment &amp; Issues/Proof Matrix"
        subtitle="Map substantive claims to evidentiary proof, track litigation holds, and enforce prefiling prerequisites (Section 3)."
        breadcrumbs={[
          { label: 'Litigation Workspace', to: '/litigation/dashboard' },
          { label: 'Case Assessment & Issues Matrix' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddIssueOpen(true)}
              className="bg-[#A4432B] hover:bg-[#8B3824]"
            >
              Add Legal Issue / Claim
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={ShieldCheck}
              onClick={() => setIsHoldModalOpen(true)}
            >
              Issue Litigation Hold
            </Button>
          </div>
        }
      />

      {/* Case Details Callout */}
      <div className="p-4 bg-[#F5F0E5] rounded-xl border border-[#D9D6CF] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-sm text-[#06244B] block">{activeCase.caseTitle}</span>
          <span className="text-[#667085]">
            Matter Type: <strong>{activeCase.matterType}</strong> • Court: <strong>{activeCase.courtVenue}</strong> • Judge: <strong>{activeCase.judge}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white px-2.5 py-1 rounded border border-[#D9D6CF] font-bold text-[#06244B]">
            {activeCase.role}
          </span>
        </div>
      </div>

      {/* Issues & Proof Matrix Section */}
      <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#06244B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-300" />
            <h3 className="font-serif font-bold text-sm text-white">
              Substantive Issues &amp; Proof Matrix (Blueprint Section 3)
            </h3>
          </div>
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-amber-200">
            {activeCase.claims.length} Claims Mapped
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
            <thead className="bg-[#F5F0E5] text-[#06244B] font-bold text-[11px]">
              <tr>
                <th className="p-3 w-56">Claim / Defense Title</th>
                <th className="p-3 min-w-[200px]">Substantive Legal Elements</th>
                <th className="p-3 min-w-[180px]">Supporting Evidence (In-Hand)</th>
                <th className="p-3 min-w-[160px]">Missing Evidence / Gaps</th>
                <th className="p-3 min-w-[140px]">Key Witnesses</th>
                <th className="p-3 min-w-[160px]">Assigned Legal Research</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D6CF] text-[#202A35]">
              {activeCase.claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 align-top">
                    <span className="font-bold text-[#06244B] block">{claim.title}</span>
                  </td>
                  <td className="p-3 align-top leading-relaxed text-slate-700">
                    {claim.element}
                  </td>
                  <td className="p-3 align-top">
                    <span className="text-emerald-800 font-medium block bg-emerald-50 p-1.5 rounded border border-emerald-200">
                      ✓ {claim.supportingEvidence}
                    </span>
                  </td>
                  <td className="p-3 align-top">
                    {claim.missingEvidence ? (
                      <span className="text-amber-900 font-medium block bg-amber-50 p-1.5 rounded border border-amber-200">
                        ⚠️ {claim.missingEvidence}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">None identified</span>
                    )}
                  </td>
                  <td className="p-3 align-top text-[#06244B] font-medium">
                    {claim.witnesses}
                  </td>
                  <td className="p-3 align-top text-xs text-slate-600 font-serif italic">
                    {claim.assignedResearch}
                  </td>
                  <td className="p-3 align-top text-right whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                      {claim.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Litigation Hold & Custodian Preservation Tracker */}
      <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden space-y-3">
        <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#A4432B]" />
            <div>
              <h3 className="font-serif font-bold text-sm text-[#06244B]">
                Litigation Hold &amp; Custodian Preservation Log (Spoliation Defense)
              </h3>
              <p className="text-[11px] text-[#667085]">
                Enforce duty to preserve under Federal Rule 37(e) and Utah URCP Rule 37.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={Plus}
            onClick={() => setIsHoldModalOpen(true)}
            className="text-xs"
          >
            New Preservation Notice
          </Button>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
            <thead className="text-[#06244B] font-bold text-[11px] bg-slate-50">
              <tr>
                <th className="p-2.5">Custodian / Recipient</th>
                <th className="p-2.5">Department / Role</th>
                <th className="p-2.5">Dispatched Date</th>
                <th className="p-2.5">Acknowledged Date</th>
                <th className="p-2.5">Covered Devices &amp; ESI Data Sources</th>
                <th className="p-2.5 text-right">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D6CF]">
              {(activeCase.litigationHolds || []).map((hold) => (
                <tr key={hold.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-[#06244B]">{hold.recipient}</td>
                  <td className="p-2.5 text-[#667085]">{hold.department}</td>
                  <td className="p-2.5 font-mono text-[11px]">{hold.noticeDate}</td>
                  <td className="p-2.5 font-mono text-[11px]">
                    {hold.acknowledgedDate ? (
                      <span className="text-emerald-700 font-semibold">{hold.acknowledgedDate} ✓</span>
                    ) : (
                      <span className="text-red-600 font-semibold italic">Unacknowledged</span>
                    )}
                  </td>
                  <td className="p-2.5 text-xs text-slate-700">{hold.devicesCovered}</td>
                  <td className="p-2.5 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      hold.status.includes('Acknowledged')
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {hold.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prefiling Checklist Card */}
      <div className="p-5 bg-slate-50 border border-[#D9D6CF] rounded-xl space-y-3">
        <h4 className="font-serif font-bold text-sm text-[#06244B] border-b border-slate-300 pb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#A4432B]" />
          Prefiling Statutory Prerequisites &amp; Limitations Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded border border-[#D9D6CF] space-y-1">
            <span className="font-bold text-[#06244B] block">Jurisdiction &amp; Venue</span>
            <p className="text-[11px] text-[#667085]">
              Proper venue in Salt Lake County under Utah Code § 78B-3-307; transaction occurred in SLC.
            </p>
            <span className="text-[10px] text-emerald-700 font-bold block">Venue Satisfied ✓</span>
          </div>

          <div className="p-3 bg-white rounded border border-[#D9D6CF] space-y-1">
            <span className="font-bold text-[#06244B] block">Statute of Limitations</span>
            <p className="text-[11px] text-[#667085]">
              4 years under Utah Code § 78B-2-307 (Written Contract). Breach occurred Nov 2025.
            </p>
            <span className="text-[10px] text-emerald-700 font-bold block">3+ Years Remaining ✓</span>
          </div>

          <div className="p-3 bg-white rounded border border-[#D9D6CF] space-y-1">
            <span className="font-bold text-[#06244B] block">Pre-Litigation ADR Clause</span>
            <p className="text-[11px] text-[#667085]">
              Agreement Section 14 mandates 30-day executive mediation before lawsuit filing.
            </p>
            <span className="text-[10px] text-amber-800 font-bold block">Mediation Concluded (Impasse) ✓</span>
          </div>
        </div>
      </div>

      {/* Add Issue Modal */}
      {isAddIssueOpen && (
        <Modal
          isOpen={isAddIssueOpen}
          onClose={() => setIsAddIssueOpen(false)}
          title="Add Legal Claim to Issues &amp; Proof Matrix"
          subtitle={`Case: ${activeCase.caseTitle}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleAddIssue} className="space-y-4 text-xs">
            <div>
              <Input
                label="Legal Claim / Counterclaim / Defense Title *"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="e.g. Breach of Fiduciary Duty or Unjust Enrichment"
                required
              />
            </div>
            <div>
              <Input
                label="Substantive Elements Required to Prove"
                value={issueElements}
                onChange={(e) => setIssueElements(e.target.value)}
                placeholder="List elements required under Utah pattern jury instructions..."
              />
            </div>
            <div>
              <Input
                label="Supporting Evidence in Hand"
                value={supportingEvidence}
                onChange={(e) => setSupportingEvidence(e.target.value)}
                placeholder="Documents, emails, Bates stamped exhibits..."
              />
            </div>
            <div>
              <Input
                label="Missing Evidence / Investigative Need"
                value={missingEvidence}
                onChange={(e) => setMissingEvidence(e.target.value)}
                placeholder="Identify evidentiary gaps for subpoena or discovery..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Key Witness(es)"
                value={witnesses}
                onChange={(e) => setWitnesses(e.target.value)}
                placeholder="Grahame, Olsen, etc."
              />
              <Input
                label="Assigned Legal Research"
                value={assignedResearch}
                onChange={(e) => setAssignedResearch(e.target.value)}
                placeholder="Statutory citation, preemption analysis..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsAddIssueOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-[#A4432B] hover:bg-[#8B3824]">
                Add to Matrix
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Litigation Hold Modal */}
      {isHoldModalOpen && (
        <Modal
          isOpen={isHoldModalOpen}
          onClose={() => setIsHoldModalOpen(false)}
          title="Issue Formal Litigation Hold Notice"
          subtitle="Trigger statutory duty to preserve evidence and suspend auto-deletion"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddHold} className="space-y-4 text-xs">
            <div>
              <Input
                label="Custodian / Recipient Full Name *"
                value={holdRecipient}
                onChange={(e) => setHoldRecipient(e.target.value)}
                placeholder="e.g. John Doe, Director of Operations"
                required
              />
            </div>
            <div>
              <Input
                label="Department / Corporate Role"
                value={holdDepartment}
                onChange={(e) => setHoldDepartment(e.target.value)}
                placeholder="e.g. Fleet Logistics or Accounts Payable"
              />
            </div>
            <div>
              <Input
                label="Covered ESI Devices &amp; Accounts"
                value={holdDevices}
                onChange={(e) => setHoldDevices(e.target.value)}
                placeholder="e.g. Company laptop, Microsoft Exchange email, mobile SMS"
              />
            </div>
            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px]">
              <strong>Spoliation Warning:</strong> Recipient will receive an electronic acknowledgment request. Failure to preserve triggers adverse inference sanctions under URCP Rule 37.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsHoldModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-[#06244B] hover:bg-[#0B356D]">
                Dispatch Preservation Notice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

