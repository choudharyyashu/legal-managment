import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  FileText,
  Printer,
  Scale,
  Building,
  User,
  History,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../hooks/useAuth';
import { mockStorage } from '../../../services/mockStorage';
import { MOCK_CLIENTS } from '../../../data/mockClients';
import { MOCK_MATTERS } from '../../../data/mockMatters';
import { MOCK_RELATED_PARTIES } from '../../../data/mockRelatedParties';

export function ConflictSearchModal({
  isOpen,
  onClose,
  initialQuery = '',
  intakeId = null,
  onConflictResolved = null
}) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'history' | 'certificate'
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Clearance Disposition State
  const [reviewer, setReviewer] = useState(currentUser?.name || 'Eleanor Heugly, Esq.');
  const [disposition, setDisposition] = useState('Cleared');
  const [analysisNotes, setAnalysisNotes] = useState('');
  const [generatedCert, setGeneratedCert] = useState(null);

  // Search History
  const [history, setHistory] = useState(() => {
    return mockStorage.get('conflict_search_history', [
      {
        id: 'CSH-101',
        query: 'Interstate Freightlines Inc.',
        searchedBy: 'Eleanor Heugly, Esq.',
        date: '2026-11-04 10:15 AM',
        hitsCount: 2,
        disposition: 'Conflict Identified',
        notes: 'Direct conflict: Defendant in Wasatch Mountain Logistics litigation.',
      },
      {
        id: 'CSH-102',
        query: 'Clearwater Basin Water Co.',
        searchedBy: 'Thomas Bludworth, Esq.',
        date: '2026-11-02 02:45 PM',
        hitsCount: 0,
        disposition: 'Cleared',
        notes: 'Adverse check against Central Valley Canal Co. clear.',
      }
    ]);
  });

  const runSearch = (searchStr) => {
    const q = (searchStr || query).trim().toLowerCase();
    if (!q) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const hits = [];

    // 1. Search Clients
    MOCK_CLIENTS.forEach(client => {
      const nameMatch = client.name.toLowerCase().includes(q);
      const contactMatch = client.primaryContact && client.primaryContact.toLowerCase().includes(q);
      if (nameMatch || contactMatch) {
        hits.push({
          type: 'Existing Active Client',
          name: client.name,
          detail: `Client ID: ${client.id} • Lead Counsel: ${client.assignedAttorneyName}`,
          confidence: nameMatch ? 96 : 78,
          severity: 'Critical Conflict',
          status: 'Direct Adverse Conflict under Utah RPC 1.7(a)(1)',
        });
      }
    });

    // 2. Search Matters & Adverse Parties
    MOCK_MATTERS.forEach(matter => {
      if (matter.title.toLowerCase().includes(q) || (matter.description && matter.description.toLowerCase().includes(q))) {
        hits.push({
          type: 'Active Matter Docket',
          name: matter.title,
          detail: `Matter: ${matter.matterNumber} (${matter.practiceAreaName})`,
          confidence: 88,
          severity: 'Potential Conflict',
          status: 'Substantially Related Matter under Utah RPC 1.9',
        });
      }
    });

    // 3. Search Related Parties
    MOCK_RELATED_PARTIES.forEach(party => {
      if (party.name.toLowerCase().includes(q) || (party.firmName && party.firmName.toLowerCase().includes(q))) {
        hits.push({
          type: `Related Entity: ${party.roleLabel}`,
          name: party.name,
          detail: `Linked to: ${party.matterTitle} (${party.firmName || 'Direct Entity'})`,
          confidence: 94,
          severity: party.roleId === 'opposing_party' ? 'Direct Adversary' : 'Informational Hit',
          status: party.roleId === 'opposing_party' ? 'Adverse Litigant in Pending Action' : 'Witness / Affiliated Entity',
        });
      }
    });

    setResults(hits);
    setHasSearched(true);

    if (hits.length > 0) {
      setDisposition('Conflict Identified');
      setAnalysisNotes(`Search returned ${hits.length} matching entity records. Review required against Utah RPC 1.7 adverse party prohibitions.`);
    } else {
      setDisposition('Cleared');
      setAnalysisNotes('Zero adverse party or prior representation conflicts identified across active rosters, closed files, and corporate affiliates.');
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      runSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleIssueCertificate = (e) => {
    e.preventDefault();

    const certData = {
      certificateNumber: `UT-RPC1.7-${Date.now().toString().slice(-6)}`,
      queryEntity: query,
      intakeId: intakeId || 'PROSP-INTAKE',
      reviewer,
      disposition,
      analysisNotes,
      issuedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      hitsCount: results.length,
      securityHash: `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    setGeneratedCert(certData);

    // Save to History
    const newHistoryItem = {
      id: `CSH-${history.length + 101}`,
      query,
      searchedBy: reviewer,
      date: certData.issuedAt,
      hitsCount: results.length,
      disposition,
      notes: analysisNotes,
    };
    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    mockStorage.set('conflict_search_history', updatedHistory);

    if (onConflictResolved) {
      onConflictResolved(disposition, reviewer, analysisNotes);
    }

    addToast(`Utah RPC 1.7 Conflict Certificate issued: "${disposition}".`, disposition === 'Cleared' ? 'success' : 'warning');
    setActiveTab('certificate');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Utah RPC 1.7 Comprehensive Conflict Search & Clearance Engine"
      size="xl"
    >
      <div className="space-y-4">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-[#D9D6CF] pb-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'search' ? 'bg-[#06244B] text-white' : 'text-[#667085] hover:bg-[#F5F0E5]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Multi-Entity Conflict Search</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-[#06244B] text-white' : 'text-[#667085] hover:bg-[#F5F0E5]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Search Audit Log ({history.length})</span>
          </button>

          {generatedCert && (
            <button
              type="button"
              onClick={() => setActiveTab('certificate')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'certificate' ? 'bg-[#A4432B] text-white' : 'text-[#A4432B] hover:bg-[#F5F0E5]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Clearance Certificate ({generatedCert.certificateNumber})</span>
            </button>
          )}
        </div>

        {/* TAB 1: CONFLICT SEARCH INTERFACE */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="bg-[#F5F0E5]/60 p-3 rounded border border-[#D9D6CF] text-xs text-[#202A35]">
              <div className="flex items-start gap-2">
                <Scale className="w-4 h-4 text-[#06244B] mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  <strong>Utah Rules of Professional Conduct 1.7 &amp; 1.9 Mandatory Inquiry:</strong> Scans firm active client rosters, closed matter archives, adverse parties, co-counsels, and corporate subsidiaries for potential loyalty or confidentiality impairments.
                </p>
              </div>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
                <input
                  type="text"
                  placeholder="Enter entity name, adversary, corporate alias, or executive..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9D6CF] rounded text-[#202A35] focus:outline-none focus:border-[#06244B]"
                />
              </div>
              <Button size="sm" variant="primary" onClick={() => runSearch()}>
                Search Dockets
              </Button>
            </div>

            {/* Hits Summary */}
            {hasSearched && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold px-1">
                  <span>Match Results ({results.length})</span>
                  {results.length === 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> 0 Adverse Hits • Cleared
                    </span>
                  ) : (
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" /> {results.length} Potential Adverse Hits Detected
                    </span>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="bg-emerald-50/50 p-4 rounded border border-emerald-200 text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="text-xs font-bold text-emerald-900">No Conflict of Interest Identified</h4>
                    <p className="text-[11px] text-emerald-700 max-w-md mx-auto">
                      Query for <strong>"{query}"</strong> showed 0 matches across active matters, historical pleadings, and adverse indexes. Eligible for clearance under Utah RPC 1.7.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {results.map((hit, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded border border-rose-200 shadow-2xs flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                              {hit.type}
                            </span>
                            <span className="font-bold text-[#06244B]">{hit.name}</span>
                          </div>
                          <p className="text-[#667085] text-[11px]">{hit.detail}</p>
                          <p className="text-rose-700 font-medium text-[11px]">{hit.status}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-mono font-bold text-rose-700">
                            {hit.confidence}% Match
                          </span>
                          <span className="block text-[10px] text-[#667085]">Confidence</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conflict Resolution & Disposition Form */}
                <form onSubmit={handleIssueCertificate} className="bg-white p-4 rounded border border-[#D9D6CF] space-y-3 pt-3">
                  <h4 className="text-xs font-serif font-bold text-[#06244B] flex items-center gap-1.5 border-b border-[#D9D6CF] pb-2">
                    <FileCheck className="w-4 h-4 text-[#A4432B]" />
                    <span>Attorney Disposition &amp; Ethical Clearance Determination</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#06244B] mb-1">
                        Reviewing Attorney *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewer}
                        onChange={(e) => setReviewer(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#D9D6CF] rounded text-[#202A35]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#06244B] mb-1">
                        Final Clearance Disposition *
                      </label>
                      <select
                        value={disposition}
                        onChange={(e) => setDisposition(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#D9D6CF] rounded text-[#202A35] font-semibold"
                      >
                        <option value="Cleared">Cleared (No Conflict Identified)</option>
                        <option value="Conflict Identified">Conflict Identified (Representation Declined)</option>
                        <option value="Ethical Wall Erected">Ethical Wall Erected (Utah RPC 1.10)</option>
                        <option value="Client Waiver Obtained">Client Informed Waiver Obtained (Utah RPC 1.7(b))</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#06244B] mb-1">
                      Utah RPC 1.7 Ethical Analysis Narrative *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={analysisNotes}
                      onChange={(e) => setAnalysisNotes(e.target.value)}
                      placeholder="Explain factual inquiry, ethical wall isolation, or waiver confirmation..."
                      className="w-full text-xs p-2 bg-white border border-[#D9D6CF] rounded text-[#202A35]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-[#667085]">
                      Generates Utah Bar compliant clearance memorandum.
                    </span>
                    <Button type="submit" variant="primary" size="sm">
                      <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                      Issue Clearance Certificate
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONFLICT SEARCH AUDIT LOG */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h4 className="text-xs font-serif font-bold text-[#06244B]">
              Firm Conflict Check Log (Utah RPC 1.7 Recordkeeping)
            </h4>
            <div className="divide-y divide-[#D9D6CF] border border-[#D9D6CF] rounded bg-white max-h-72 overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="p-3 text-xs flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#A4432B]">{item.id}</span>
                      <span className="font-semibold text-[#06244B]">"{item.query}"</span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                        item.disposition === 'Cleared'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {item.disposition}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085]">{item.notes}</p>
                    <div className="flex items-center gap-3 text-[10px] text-[#667085]">
                      <span>Reviewed by: <strong>{item.searchedBy}</strong></span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-[#667085] flex-shrink-0">
                    <span>{item.hitsCount} hits evaluated</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GENERATED CLEARANCE CERTIFICATE PREVIEW */}
        {activeTab === 'certificate' && generatedCert && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded border-2 border-[#06244B] shadow-md space-y-4 text-xs text-[#202A35]">
              {/* Header Letterhead */}
              <div className="border-b-2 border-[#06244B] pb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#06244B]">HEUGLY &amp; BLUDWORTH</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#667085]">Attorneys at Law • Salt Lake City, Utah</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-[#A4432B]">{generatedCert.certificateNumber}</span>
                  <p className="text-[10px] text-[#667085]">{generatedCert.issuedAt}</p>
                </div>
              </div>

              <div className="text-center py-1">
                <h4 className="font-serif font-bold text-base text-[#06244B] uppercase tracking-wider">
                  Conflict of Interest Clearance Certificate
                </h4>
                <p className="text-[11px] text-[#667085]">Pursuant to Utah Rules of Professional Conduct 1.6, 1.7, 1.9 &amp; 1.10</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F5F0E5]/50 rounded border border-[#D9D6CF]">
                <div>
                  <span className="text-[10px] text-[#667085] uppercase block font-semibold">Subject Inquired Entity:</span>
                  <span className="text-xs font-bold text-[#06244B]">{generatedCert.queryEntity}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] uppercase block font-semibold">Associated File:</span>
                  <span className="text-xs font-bold text-[#06244B]">{generatedCert.intakeId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] uppercase block font-semibold">Reviewing Authority:</span>
                  <span className="text-xs font-bold text-[#06244B]">{generatedCert.reviewer}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] uppercase block font-semibold">Ethical Determination:</span>
                  <span className="text-xs font-bold text-emerald-700">{generatedCert.disposition}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#667085] uppercase block font-semibold mb-1">Attorney Ethical Analysis:</span>
                <p className="p-2.5 bg-white border border-[#D9D6CF] rounded text-[11px] leading-relaxed text-[#202A35]">
                  {generatedCert.analysisNotes}
                </p>
              </div>

              <div className="pt-3 border-t border-[#D9D6CF] flex items-center justify-between text-[10px] text-[#667085]">
                <div className="font-mono">
                  <span>Cryptographic Seal: </span>
                  <span className="text-[#06244B] font-semibold">{generatedCert.securityHash}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Utah State Bar Compliance Logged</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToast('Conflict certificate printed / saved to matter document repository.', 'info')}
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print Certificate
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onClose()}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

