import React, { useState } from 'react';
import {
  Send,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Printer,
  X,
  ExternalLink,
  UserCheck,
  Building,
  MapPin,
  Calendar
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { MOCK_LITIGATION_CASES } from '../../../data/mockLitigationCases';
import { LitigationNavigationHeader } from '../components/LitigationNavigationHeader';
import { useToast } from '../../../components/ui/Toast';

export function PleadingsService() {
  const [cases, setCases] = useState(MOCK_LITIGATION_CASES);
  const [activeCase, setActiveCase] = useState(MOCK_LITIGATION_CASES[0]);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isDefensiveIntakeOpen, setIsDefensiveIntakeOpen] = useState(false);
  const { addToast } = useToast();

  // Add Party Service state
  const [newPartyName, setNewPartyName] = useState('');
  const [newRegisteredAgent, setNewRegisteredAgent] = useState('');
  const [newProcessServer, setNewProcessServer] = useState('Metro Legal Process Services LLC');
  const [newMethod, setNewMethod] = useState('Personal Service (URCP 4(d)(1))');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);

  // Defensive Intake state
  const [servedPlaintiff, setServedPlaintiff] = useState('');
  const [servedCourt, setServedCourt] = useState('Third District Court (Salt Lake County)');
  const [servedDate, setServedDate] = useState(new Date().toISOString().split('T')[0]);
  const [insurerName, setInsurerName] = useState('');
  const [claimNumber, setClaimNumber] = useState('');

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newPartyName.trim()) {
      addToast('Please enter party name.', 'error');
      return;
    }

    // Calculate answer deadline: 21 days under URCP 12(a)
    const answerDate = new Date(new Date(serviceDate).getTime() + 21 * 86400000).toISOString().split('T')[0];

    const newRosterItem = {
      id: `srv-${Date.now()}`,
      partyName: newPartyName,
      partyType: 'Named Defendant',
      registeredAgent: newRegisteredAgent || 'Personal Residence',
      processServer: newProcessServer,
      serviceMethod: newMethod,
      attemptsCount: 1,
      actualServiceDate: serviceDate,
      proofFiledDate: new Date().toISOString().split('T')[0],
      answerDueDate: answerDate,
      responseStatus: 'Awaiting Responsive Pleading',
      status: 'Service Complete & Verified'
    };

    setActiveCase(prev => ({
      ...prev,
      serviceRoster: [...(prev.serviceRoster || []), newRosterItem]
    }));

    addToast(`Proof of service recorded for ${newPartyName}! Answer due ${answerDate}.`, 'success');
    setIsAddServiceOpen(false);
    setNewPartyName('');
    setNewRegisteredAgent('');
  };

  const handleDefensiveIntakeSubmit = (e) => {
    e.preventDefault();
    if (!servedPlaintiff.trim()) {
      addToast('Please enter plaintiff name.', 'error');
      return;
    }

    const calculatedAnswerDue = new Date(new Date(servedDate).getTime() + 21 * 86400000).toISOString().split('T')[0];

    addToast(
      `Defensive intake logged! Response deadline calculated: ${calculatedAnswerDue} (URCP 12(a)). Insurer tender alert dispatched.`,
      'success'
    );
    setIsDefensiveIntakeOpen(false);
  };

  return (
    <div className="space-y-6">
      <LitigationNavigationHeader
        activeCase={activeCase}
        cases={cases}
        onSelectCase={setActiveCase}
      />

      <PageHeader
        title="Pleadings &amp; Party-Specific Service Tracker"
        subtitle="Track complaint filing, GreenFiling ECF acceptance, and individual service attempts and answer deadlines per defendant (Section 4)."
        breadcrumbs={[
          { label: 'Litigation Workspace', to: '/litigation/dashboard' },
          { label: 'Pleadings & Service' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={AlertTriangle}
              onClick={() => setIsDefensiveIntakeOpen(true)}
              className="text-amber-800 border-amber-300 hover:bg-amber-50"
            >
              Defensive Intake (Served Lawsuit)
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddServiceOpen(true)}
              className="bg-[#A4432B] hover:bg-[#8B3824]"
            >
              Record Proof of Service
            </Button>
          </div>
        }
      />

      {/* Defensive Alert Banner */}
      <div className="bg-[#06244B] text-white p-4 rounded-xl shadow-md border-l-4 border-[#A4432B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/10 rounded-lg text-amber-300 shrink-0 mt-0.5">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Party-Specific Service Tracking (URCP Rule 4 &amp; 12)</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-semibold">
                SEPARATE DEADLINES PER PARTY
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              In multi-defendant litigation, each defendant's 21-day answer clock runs from their individual date of completed service under URCP 12(a), rather than assigning one universal deadline to the docket.
            </p>
          </div>
        </div>
      </div>

      {/* Party-Specific Service Roster */}
      <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-[#06244B]">
            Defendant Service Ledger &amp; Return of Service Tracker
          </h3>
          <span className="text-xs font-mono font-bold text-[#A4432B]">
            {activeCase.serviceRoster?.length || 0} Named Parties
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
            <thead className="bg-slate-50 text-[#06244B] font-bold text-[11px]">
              <tr>
                <th className="p-3">Party Name &amp; Entity Type</th>
                <th className="p-3">Registered Agent / Address</th>
                <th className="p-3">Service Method &amp; Attempts</th>
                <th className="p-3">Service Date</th>
                <th className="p-3">Answer Deadline (URCP 12(a))</th>
                <th className="p-3">Pleading Response Status</th>
                <th className="p-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D6CF] text-[#202A35]">
              {(activeCase.serviceRoster || []).map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50">
                  <td className="p-3 align-top">
                    <span className="font-bold text-[#06244B] block">{srv.partyName}</span>
                    <span className="text-[10px] text-[#667085]">{srv.partyType}</span>
                  </td>
                  <td className="p-3 align-top text-xs text-slate-700">
                    {srv.registeredAgent}
                  </td>
                  <td className="p-3 align-top">
                    <div className="font-medium text-[#06244B]">{srv.serviceMethod}</div>
                    <div className="text-[10px] text-[#667085]">
                      Server: {srv.processServer} ({srv.attemptsCount} attempt{srv.attemptsCount > 1 ? 's' : ''})
                    </div>
                  </td>
                  <td className="p-3 align-top font-mono text-xs">
                    <span className="font-semibold text-emerald-800">{srv.actualServiceDate}</span>
                    <span className="text-[10px] text-slate-400 block">Proof: {srv.proofFiledDate}</span>
                  </td>
                  <td className="p-3 align-top font-mono text-xs">
                    <span className="font-bold text-[#A4432B] block">{srv.answerDueDate}</span>
                    <span className="text-[10px] text-slate-500">21 Calendar Days</span>
                  </td>
                  <td className="p-3 align-top text-xs text-slate-800 font-medium">
                    {srv.responseStatus}
                  </td>
                  <td className="p-3 align-top text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {srv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pleadings Filing Flow Card */}
      <div className="p-5 bg-white border border-[#D9D6CF] rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-2">
          <h4 className="font-serif font-bold text-sm text-[#06244B] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#A4432B]" />
            Operative Pleadings &amp; GreenFiling ECF Court Docket Status
          </h4>
          <span className="text-xs text-[#667085]">Utah Courts GreenFiling E-Filing System</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#06244B]">Verified Complaint</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Accepted</span>
            </div>
            <p className="text-[11px] text-[#667085]">Filed Nov 24, 2025 • Assigned Judge: Hon. Laura Scott</p>
            <span className="text-[10px] font-mono text-slate-500 block">Receipt: UT-SLC-2025-90144</span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#06244B]">Summons Issued (2 Defendants)</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Issued</span>
            </div>
            <p className="text-[11px] text-[#667085]">Issued Dec 01, 2025 by Clerk of Court</p>
            <span className="text-[10px] font-mono text-slate-500 block">120-Day Service Window Satisfied</span>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-[#D9D6CF] space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#06244B]">Answer &amp; Counterclaim</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">Filed</span>
            </div>
            <p className="text-[11px] text-[#667085]">Interstate Freightlines filed Answer Dec 22, 2025</p>
            <span className="text-[10px] font-mono text-slate-500 block">Reply to Counterclaim Served</span>
          </div>
        </div>
      </div>

      {/* Record Service Modal */}
      {isAddServiceOpen && (
        <Modal
          isOpen={isAddServiceOpen}
          onClose={() => setIsAddServiceOpen(false)}
          title="Record Proof of Service on Defendant"
          subtitle="Enforce URCP Rule 4 service return and compute answer deadline"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleAddService} className="space-y-4 text-xs">
            <div>
              <Input
                label="Defendant / Party Served *"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                placeholder="e.g. John Doe or Acme Corp."
                required
              />
            </div>
            <div>
              <Input
                label="Registered Agent / Location of Service"
                value={newRegisteredAgent}
                onChange={(e) => setNewRegisteredAgent(e.target.value)}
                placeholder="e.g. In-hand delivery to C.T. Corporation at 1100 S. Main"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#202A35] uppercase mb-1">
                  Service Method
                </label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
                >
                  <option value="Personal Delivery (URCP 4(d)(1))">Personal Delivery (URCP 4(d)(1))</option>
                  <option value="Registered Agent Service">Registered Agent Service</option>
                  <option value="Certified Mail Return Receipt (URCP 4(d)(2))">Certified Mail Return Receipt</option>
                  <option value="Acceptance / Waiver of Service (URCP 4(f))">Acceptance / Waiver of Service</option>
                </select>
              </div>
              <div>
                <Input
                  label="Actual Service Date"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] text-xs">
              <strong>Automated URCP 12(a) Calculation:</strong> Answer due date will automatically calculate as <strong>21 calendar days</strong> from the selected service date.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsAddServiceOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-[#A4432B] hover:bg-[#8B3824]">
                Save Proof of Service
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Defensive Intake Modal */}
      {isDefensiveIntakeOpen && (
        <Modal
          isOpen={isDefensiveIntakeOpen}
          onClose={() => setIsDefensiveIntakeOpen(false)}
          title="Defensive Lawsuit Intake (Client Served with Complaint)"
          subtitle="Trigger immediate response deadline clock and insurance notice"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleDefensiveIntakeSubmit} className="space-y-4 text-xs">
            <div>
              <Input
                label="Adverse Plaintiff / Suing Party *"
                value={servedPlaintiff}
                onChange={(e) => setServedPlaintiff(e.target.value)}
                placeholder="e.g. Apex Industrial Supply LLC"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Court Venue"
                value={servedCourt}
                onChange={(e) => setServedCourt(e.target.value)}
              />
              <Input
                label="Date Client was Served"
                type="date"
                value={servedDate}
                onChange={(e) => setServedDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Commercial Insurer for Defense"
                value={insurerName}
                onChange={(e) => setInsurerName(e.target.value)}
                placeholder="e.g. Travelers or Hartford"
              />
              <Input
                label="Policy / Claim #"
                value={claimNumber}
                onChange={(e) => setClaimNumber(e.target.value)}
                placeholder="e.g. CL-2026-99014"
              />
            </div>

            <div className="p-3 bg-red-50 rounded border border-red-200 text-red-900 text-xs space-y-1">
              <strong>Default Judgment Risk Alert:</strong> Failure to file an Answer or Rule 12 Motion within 21 days allows Plaintiff to seek Default Certificate under URCP Rule 55.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsDefensiveIntakeOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-red-700 hover:bg-red-800">
                Log Defensive Intake
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

