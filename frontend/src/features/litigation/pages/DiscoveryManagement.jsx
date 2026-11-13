import React, { useState } from 'react';
import {
  Search,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Printer,
  Users,
  Video,
  FileText,
  Lock,
  Tag,
  Hash,
  Eye
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { MOCK_LITIGATION_CASES } from '../../../data/mockLitigationCases';
import { LitigationNavigationHeader } from '../components/LitigationNavigationHeader';
import { useToast } from '../../../components/ui/Toast';

export function DiscoveryManagement() {
  const [cases, setCases] = useState(MOCK_LITIGATION_CASES);
  const [activeCase, setActiveCase] = useState(MOCK_LITIGATION_CASES[0]);
  const [activeTab, setActiveTab] = useState('written'); // 'written', 'privilege', 'subpoenas', 'depositions', 'bates'
  const [isPrivilegeModalOpen, setIsPrivilegeModalOpen] = useState(false);
  const [isBatesModalOpen, setIsBatesModalOpen] = useState(false);
  const { addToast } = useToast();

  // Bates Stamping Form state
  const [batesPrefix, setBatesPrefix] = useState('WML-');
  const [batesStart, setBatesStart] = useState('000001');
  const [batesEnd, setBatesEnd] = useState('004192');
  const [batesVolume, setBatesVolume] = useState('Vol 01 (Commercial Freight Documents)');

  // New Privilege Log entry state
  const [privBates, setPrivBates] = useState('WML-PRIV-0003');
  const [privDate, setPrivDate] = useState('2025-11-25');
  const [privAuthor, setPrivAuthor] = useState('Thomas Bludworth, Esq.');
  const [privRecipients, setPrivRecipients] = useState('Travis Olsen (Client Managing Member)');
  const [privSubject, setPrivSubject] = useState('Confidential Legal Strategy Memo re Trade Secret Injunction');
  const [privBasis, setPrivBasis] = useState('Attorney-Client Communication (Utah R. Evid. 504)');
  const [privRedaction, setPrivRedaction] = useState('Withheld in Entirety');

  const handleAddPrivilegeEntry = (e) => {
    e.preventDefault();
    const newEntry = {
      batesNum: privBates,
      docDate: privDate,
      author: privAuthor,
      recipients: privRecipients,
      subject: privSubject,
      privilegeBasis: privBasis,
      redactionType: privRedaction
    };

    setActiveCase(prev => ({
      ...prev,
      privilegeLog: [newEntry, ...(prev.privilegeLog || [])]
    }));

    addToast(`Document ${privBates} added to Utah RPC 1.6 Privilege Log!`, 'success');
    setIsPrivilegeModalOpen(false);
  };

  const handleApplyBates = (e) => {
    e.preventDefault();
    addToast(`Bates sequence applied: ${batesPrefix}${batesStart} through ${batesPrefix}${batesEnd} (4,192 pages)!`, 'success');
    setIsBatesModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <LitigationNavigationHeader
        activeCase={activeCase}
        cases={cases}
        onSelectCase={setActiveCase}
      />

      <PageHeader
        title="Discovery Management &amp; Privilege Log Suite"
        subtitle="Request-by-request Interrogatories/RFPs, Bates numbering, Utah RPC 1.6 Privilege Logs, and Subpoenas (Section 6)."
        breadcrumbs={[
          { label: 'Litigation Workspace', to: '/litigation/dashboard' },
          { label: 'Discovery Suite' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Hash}
              onClick={() => setIsBatesModalOpen(true)}
            >
              Bates Numbering Generator
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Lock}
              onClick={() => setIsPrivilegeModalOpen(true)}
              className="bg-[#A4432B] hover:bg-[#8B3824]"
            >
              Add to Privilege Log
            </Button>
          </div>
        }
      />

      {/* Discovery Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9D6CF] pb-2 text-xs">
        {[
          { id: 'written', label: '1. Written Discovery (URCP 33/34)', count: activeCase.writtenDiscovery?.length || 0 },
          { id: 'privilege', label: '2. Utah RPC 1.6 Privilege Log', count: activeCase.privilegeLog?.length || 0 },
          { id: 'subpoenas', label: '3. Subpoenas Duces Tecum (URCP 45)', count: activeCase.subpoenas?.length || 0 },
          { id: 'depositions', label: '4. Depositions & Experts (URCP 26)', count: activeCase.depositions?.length || 0 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#06244B] text-white shadow-sm'
                : 'bg-white border border-[#D9D6CF] text-[#667085] hover:bg-slate-50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab 1: Written Discovery */}
      {activeTab === 'written' && (
        <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#06244B]">
                Written Discovery Sets (Request-by-Request Verification)
              </h3>
              <p className="text-[11px] text-[#667085]">
                URCP Rule 33 Interrogatories &amp; Rule 34 Requests for Production
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Active Docket
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
              <thead className="bg-[#06244B] text-white font-bold text-[11px]">
                <tr>
                  <th className="p-3">Discovery Set Title &amp; Classification</th>
                  <th className="p-3">Propounding &rarr; Responding Party</th>
                  <th className="p-3">Served &amp; Due Date</th>
                  <th className="p-3">Request Progress</th>
                  <th className="p-3">Deficiencies &amp; Meet-and-Confer</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF] text-[#202A35]">
                {(activeCase.writtenDiscovery || []).map((disc) => (
                  <tr key={disc.id} className="hover:bg-slate-50">
                    <td className="p-3 align-top">
                      <span className="font-bold text-[#06244B] block">{disc.title}</span>
                      <span className="text-[10px] text-[#A4432B] font-semibold">{disc.type}</span>
                    </td>
                    <td className="p-3 align-top text-xs text-slate-700">
                      <div><strong>From:</strong> {disc.propoundingParty}</div>
                      <div><strong>To:</strong> {disc.respondingParty}</div>
                    </td>
                    <td className="p-3 align-top font-mono text-xs">
                      <div>Served: {disc.servedDate}</div>
                      <div className="font-bold text-[#A4432B]">Due: {disc.dueDate}</div>
                    </td>
                    <td className="p-3 align-top text-xs">
                      <div><strong>{disc.respondedRequests} / {disc.totalRequests}</strong> Answered</div>
                      {disc.objectedRequests > 0 && (
                        <span className="text-[10px] text-amber-700 font-bold block">
                          ⚠️ {disc.objectedRequests} Objections Raised
                        </span>
                      )}
                    </td>
                    <td className="p-3 align-top text-xs text-slate-600">
                      {disc.notes}
                    </td>
                    <td className="p-3 align-top text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                        {disc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Privilege Log */}
      {activeTab === 'privilege' && (
        <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden space-y-4">
          <div className="p-4 bg-[#06244B] text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif font-bold text-sm text-white">
                  Utah RPC 1.6 &amp; URCP 26(b)(8) Statutory Privilege Log
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Formal legal descriptions of withheld materials in compliance with court disclosure rules.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={Printer}
                onClick={() => window.print()}
                className="text-white border-white/30 hover:bg-white/10"
              >
                Print Log
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={Download}
                onClick={() => addToast('Privilege Log (.pdf / .csv) exported!', 'success')}
                className="bg-[#A4432B] hover:bg-[#8B3824]"
              >
                Export Log
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto p-4 pt-0">
            <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
              <thead className="bg-[#F5F0E5] text-[#06244B] font-bold text-[11px]">
                <tr>
                  <th className="p-3">Bates ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Author(s)</th>
                  <th className="p-3">Recipient(s)</th>
                  <th className="p-3">Subject Matter Description</th>
                  <th className="p-3">Privilege Ground Claimed</th>
                  <th className="p-3 text-right">Redaction Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF] text-[#202A35]">
                {(activeCase.privilegeLog || []).map((p) => (
                  <tr key={p.batesNum} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-[#A4432B]">{p.batesNum}</td>
                    <td className="p-3 font-mono">{p.docDate}</td>
                    <td className="p-3 font-medium">{p.author}</td>
                    <td className="p-3">{p.recipients}</td>
                    <td className="p-3 text-slate-700 leading-relaxed max-w-xs">{p.subject}</td>
                    <td className="p-3 font-serif text-[11px] text-[#06244B]">{p.privilegeBasis}</td>
                    <td className="p-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {p.redactionType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Subpoenas */}
      {activeTab === 'subpoenas' && (
        <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#06244B]">
              Third-Party Subpoenas Duces Tecum (URCP Rule 45)
            </h3>
            <span className="text-xs font-mono font-bold text-[#A4432B]">
              {activeCase.subpoenas?.length || 0} Subpoenas Served
            </span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
              <thead className="bg-slate-50 text-[#06244B] font-bold text-[11px]">
                <tr>
                  <th className="p-3">Target Entity / Deponent</th>
                  <th className="p-3">Subpoena Type</th>
                  <th className="p-3">Served Date</th>
                  <th className="p-3">Compliance Due Date</th>
                  <th className="p-3">Records / Testimony Requested</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF]">
                {(activeCase.subpoenas || []).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-[#06244B]">{s.targetEntity}</td>
                    <td className="p-3 text-[#667085]">{s.subpoenaType}</td>
                    <td className="p-3 font-mono">{s.servedDate}</td>
                    <td className="p-3 font-mono font-bold text-[#A4432B]">{s.complianceDate}</td>
                    <td className="p-3 text-slate-700">{s.recordsRequested}</td>
                    <td className="p-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Depositions & Experts */}
      {activeTab === 'depositions' && (
        <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#F5F0E5] border-b border-[#D9D6CF] flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#06244B]">
              Depositions &amp; Retained Experts Schedule (URCP 26(a)(4))
            </h3>
            <span className="text-xs font-mono font-bold text-[#06244B]">
              Citadel Court Reporting Retained
            </span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-[#D9D6CF]">
              <thead className="bg-slate-50 text-[#06244B] font-bold text-[11px]">
                <tr>
                  <th className="p-3">Deponent / Witness</th>
                  <th className="p-3">Witness Classification</th>
                  <th className="p-3">Scheduled Date &amp; Time</th>
                  <th className="p-3">Location / Remote Medium</th>
                  <th className="p-3">Court Reporter / Video</th>
                  <th className="p-3 text-right">Preparation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF]">
                {(activeCase.depositions || []).map((dep, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-[#06244B]">{dep.deponent}</td>
                    <td className="p-3 text-[#A4432B] font-semibold">{dep.witnessType}</td>
                    <td className="p-3 font-mono font-bold">{dep.scheduledDate}</td>
                    <td className="p-3 text-slate-700">{dep.location}</td>
                    <td className="p-3 text-slate-600">
                      <div>{dep.stenographer}</div>
                      <div className="text-[10px] text-slate-500">Video: {dep.videographer}</div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                        {dep.prepStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bates Generator Modal */}
      {isBatesModalOpen && (
        <Modal
          isOpen={isBatesModalOpen}
          onClose={() => setIsBatesModalOpen(false)}
          title="Automated Bates Stamping &amp; Production Indexer"
          subtitle="Generate sequential alphanumeric Bates identifiers across document sets"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleApplyBates} className="space-y-4 text-xs">
            <div>
              <Input
                label="Bates Prefix Code *"
                value={batesPrefix}
                onChange={(e) => setBatesPrefix(e.target.value)}
                placeholder="e.g. WML- or IFL-DEF-"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Starting Number"
                value={batesStart}
                onChange={(e) => setBatesStart(e.target.value)}
                required
              />
              <Input
                label="Ending Number"
                value={batesEnd}
                onChange={(e) => setBatesEnd(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Production Volume Label"
                value={batesVolume}
                onChange={(e) => setBatesVolume(e.target.value)}
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-emerald-950 text-xs">
              <strong>Bates Output Format:</strong> First page will stamp as <code>{batesPrefix}{batesStart}</code>, final page will stamp as <code>{batesPrefix}{batesEnd}</code> with SHA-256 metadata integrity.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsBatesModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-[#06244B] hover:bg-[#0B356D]">
                Apply Bates Stamping
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Privilege Log Modal */}
      {isPrivilegeModalOpen && (
        <Modal
          isOpen={isPrivilegeModalOpen}
          onClose={() => setIsPrivilegeModalOpen(false)}
          title="Add Document to Utah RPC 1.6 Privilege Log"
          subtitle="Record legally protected communications withheld from production"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleAddPrivilegeEntry} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Bates Identifier *"
                value={privBates}
                onChange={(e) => setPrivBates(e.target.value)}
                required
              />
              <Input
                label="Document Creation Date *"
                type="date"
                value={privDate}
                onChange={(e) => setPrivDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Author / Drafter *"
                value={privAuthor}
                onChange={(e) => setPrivAuthor(e.target.value)}
                required
              />
              <Input
                label="Recipient(s) *"
                value={privRecipients}
                onChange={(e) => setPrivRecipients(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Subject Matter / Description (Without Revealing Privileged Text)"
                value={privSubject}
                onChange={(e) => setPrivSubject(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#202A35] uppercase mb-1">
                  Privilege Ground Claimed
                </label>
                <select
                  value={privBasis}
                  onChange={(e) => setPrivBasis(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
                >
                  <option value="Attorney-Client Communication (Utah R. Evid. 504)">Attorney-Client Communication (Utah R. Evid. 504)</option>
                  <option value="Work Product Doctrine (URCP 26(b)(5))">Work Product Doctrine (URCP 26(b)(5))</option>
                  <option value="Proprietary Trade Secret (Utah Code § 13-24-6)">Proprietary Trade Secret (Utah Code § 13-24-6)</option>
                  <option value="Joint Defense / Common Interest Privilege">Joint Defense / Common Interest Privilege</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#202A35] uppercase mb-1">
                  Redaction Treatment
                </label>
                <select
                  value={privRedaction}
                  onChange={(e) => setPrivRedaction(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
                >
                  <option value="Withheld in Entirety">Withheld in Entirety</option>
                  <option value="Redacted Paragraphs / Redaction Box">Redacted Paragraphs / Redaction Box</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsPrivilegeModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-[#A4432B] hover:bg-[#8B3824]">
                Log Privileged Entry
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

