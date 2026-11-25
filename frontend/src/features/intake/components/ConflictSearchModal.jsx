import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  FileCheck,
  Printer,
  Scale,
  History,
  Clock,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../hooks/useAuth';
import { intakeService } from '../../../services/intakeService';
import { relatedPartyService } from '../../../services/relatedPartyService';

export function ConflictSearchModal({
  isOpen,
  onClose,
  initialQuery = '',
  intakeId = null,
  onConflictResolved = null,
}) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('search');
  const [results, setResults] = useState([]);
  const [searchedCategories, setSearchedCategories] = useState([]);
  const [queriedTerms, setQueriedTerms] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [savingDisposition, setSavingDisposition] = useState(false);

  const [reviewer, setReviewer] = useState(currentUser?.name || '');
  const [disposition, setDisposition] = useState('Review Completed');
  const [analysisNotes, setAnalysisNotes] = useState('');
  const [recordedDecision, setRecordedDecision] = useState(null);
  const [history, setHistory] = useState([]);

  const loadPersistedLogs = useCallback(async () => {
    if (!intakeId) return;
    try {
      const logData = await intakeService.getConflictLogs(intakeId);
      if (Array.isArray(logData?.searchLogs) || Array.isArray(logData?.auditTrail)) {
        const mergedHistory = [];
        for (const a of logData.auditTrail || []) {
          mergedHistory.push({
            id: a.id,
            query: Array.isArray(a.details?.queriedTerms)
              ? a.details.queriedTerms.join(', ')
              : logData.intake?.adverseParties || logData.intake?.prospectiveClient,
            searchedBy: a.userName || 'System',
            date: a.timestamp ? new Date(a.timestamp).toLocaleString() : '',
            hitsCount: a.details?.matchCount ?? (logData.searchLogs?.length || 0),
            disposition: a.details?.resultingStatus || a.details?.conflictStatus || a.action,
            notes: a.details?.notes || `Categories scanned: ${(a.details?.searchedCategories || []).map((c) => c.category).join(', ')}`,
          });
        }
        setHistory(mergedHistory);
      }
      if (Array.isArray(logData?.liveMatches)) {
        setResults(logData.liveMatches);
        setSearchedCategories(logData.searchedCategories || []);
        setQueriedTerms(logData.queriedTerms || []);
        setHasSearched(Boolean((logData.auditTrail || []).length > 0 || logData.intake?.conflictStatus !== 'Not Started'));
        if (logData.liveMatches.length > 0) {
          setDisposition('Conflict Identified');
        }
      }
    } catch (err) {
      console.warn('Could not load intake conflict logs:', err?.message);
    }
  }, [intakeId]);

  const runSearch = useCallback(
    async (customQuery) => {
      const q = (customQuery !== undefined ? customQuery : query).trim();
      if (!q && !intakeId) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setSearching(true);
      setSearchError('');
      try {
        let scanData;
        if (intakeId && (!customQuery || customQuery.trim() === initialQuery.trim())) {
          scanData = await intakeService.runConflictCheck(intakeId);
        } else {
          scanData = await relatedPartyService.conflictSearch({
            q: q || initialQuery,
            excludeIntakeId: intakeId || undefined,
          });
        }

        const matches = Array.isArray(scanData?.matches) ? scanData.matches : [];
        setResults(matches);
        setSearchedCategories(Array.isArray(scanData?.searchedCategories) ? scanData.searchedCategories : []);
        setQueriedTerms(Array.isArray(scanData?.queriedTerms) ? scanData.queriedTerms : []);
        setHasSearched(true);

        if (matches.length > 0) {
          setDisposition('Conflict Identified');
          setAnalysisNotes(
            `Potential match detected across ${matches.length} record(s). Reviewer verification required against Utah RPC 1.7 / 1.9.`
          );
        } else {
          setDisposition('Review Completed');
          setAnalysisNotes('');
        }

        if (intakeId) {
          await loadPersistedLogs();
        }
      } catch (err) {
        setSearchError(err?.message || 'Conflict search failed on backend server.');
        addToast(err?.message || 'Conflict search failed.', 'error');
      } finally {
        setSearching(false);
      }
    },
    [query, intakeId, initialQuery, loadPersistedLogs, addToast]
  );

  useEffect(() => {
    if (!isOpen) return;
    setReviewer((prev) => prev || currentUser?.name || '');
    if (initialQuery) setQuery(initialQuery);
    if (intakeId) {
      loadPersistedLogs();
    } else if (initialQuery) {
      runSearch(initialQuery);
    }
  }, [isOpen, intakeId, initialQuery, currentUser?.name, loadPersistedLogs]);

  const handleSaveDisposition = async (e) => {
    e.preventDefault();
    if (!analysisNotes.trim() || analysisNotes.trim().length < 3) {
      addToast('Please enter reviewer conflict analysis notes (minimum 3 characters).', 'error');
      return;
    }

    setSavingDisposition(true);
    try {
      if (onConflictResolved) {
        await onConflictResolved(disposition, reviewer.trim() || currentUser?.name || '', analysisNotes.trim());
      }

      const recordSummary = {
        recordId: `CR-${Date.now().toString().slice(-6)}`,
        queryEntity: query || (queriedTerms.join(', ') || 'Intake Parties'),
        intakeId: intakeId || 'AD-HOC',
        reviewer: reviewer.trim() || currentUser?.name || 'Authorized Reviewer',
        disposition,
        analysisNotes: analysisNotes.trim(),
        recordedAt: new Date().toLocaleString(),
        hitsCount: results.length,
      };
      setRecordedDecision(recordSummary);
      await loadPersistedLogs();
      setActiveTab('record');
    } catch {
      // Error toast already surfaced by onConflictResolved
    } finally {
      setSavingDisposition(false);
    }
  };

  const scanStatusBadge = () => {
    if (!hasSearched) {
      return (
        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1 font-bold">
          <Clock className="w-3.5 h-3.5" /> Not Searched
        </span>
      );
    }
    if (results.length > 0) {
      return (
        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1 font-bold">
          <ShieldAlert className="w-3.5 h-3.5" /> Potential Match ({results.length} Hit{results.length === 1 ? '' : 's'})
        </span>
      );
    }
    return (
      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 font-bold">
        <AlertTriangle className="w-3.5 h-3.5" /> Automated Scan Complete (0 Hits) — Reviewer Sign-Off Required
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Utah RPC 1.7 Multi-Entity Conflict Search & Review"
      size="xl"
    >
      <div className="space-y-4">
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
            <span>Persisted Audit Log ({history.length})</span>
          </button>

          {recordedDecision && (
            <button
              type="button"
              onClick={() => setActiveTab('record')}
              className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'record' ? 'bg-[#A4432B] text-white' : 'text-[#A4432B] hover:bg-[#F5F0E5]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Review Record ({recordedDecision.recordId})</span>
            </button>
          )}
        </div>

        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="bg-[#F5F0E5]/60 p-3 rounded border border-[#D9D6CF] text-xs text-[#202A35]">
              <div className="flex items-start gap-2">
                <Scale className="w-4 h-4 text-[#06244B] mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  <strong>Multi-Entity Inquiry:</strong> Searches firm clients, matters, prior/prospective intakes, related parties, PI incident parties, immigration parties, and bankruptcy creditors. Automated scans do not grant conflict clearance until an authorized reviewer records a determination.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
                <input
                  type="text"
                  placeholder="Enter client/adverse party name, alias, email, or phone..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9D6CF] rounded text-[#202A35] focus:outline-none focus:border-[#06244B]"
                />
              </div>
              <Button size="sm" variant="primary" disabled={searching} onClick={() => runSearch(query)}>
                {searching ? 'Searching...' : 'Run Conflict Search'}
              </Button>
            </div>

            {searchError && (
              <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {searchError}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold px-1">
                <span>Match Results ({results.length})</span>
                {scanStatusBadge()}
              </div>

              {searchedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {searchedCategories.map((cat) => (
                    <span
                      key={cat.category}
                      className={`px-2 py-0.5 rounded border ${
                        cat.status === 'searched'
                          ? 'bg-slate-50 border-[#D9D6CF] text-[#202A35]'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      {cat.category}: {cat.status === 'searched' ? `scanned (${cat.scannedCount})` : cat.status}
                    </span>
                  ))}
                </div>
              )}

              {hasSearched && results.length === 0 ? (
                <div className="bg-amber-50/60 p-4 rounded border border-amber-200 text-center space-y-1">
                  <AlertTriangle className="w-7 h-7 text-amber-600 mx-auto" />
                  <h4 className="text-xs font-bold text-[#06244B]">
                    No Automated Matches Found — Attorney Review Required
                  </h4>
                  <p className="text-[11px] text-[#667085] max-w-lg mx-auto">
                    Terms queried: <strong>{queriedTerms.join(', ') || query}</strong>. Zero automated hits were detected across searched records. Record your formal reviewer disposition below to mark review completed.
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {results.map((hit, idx) => (
                    <div
                      key={`${hit.entityType}-${hit.recordId}-${idx}`}
                      className="bg-white p-3 rounded border border-rose-200 shadow-2xs flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                            {hit.entityType}
                          </span>
                          <span className="font-bold text-[#06244B]">{hit.displayName || hit.label}</span>
                          {hit.recordCode && (
                            <span className="text-[10px] font-mono text-[#667085]">({hit.recordCode})</span>
                          )}
                        </div>
                        <p className="text-[#667085] text-[11px]">{hit.roleOrType}</p>
                        <p className="text-rose-700 font-medium text-[11px]">
                          Matched on <strong>{hit.matchedField}</strong>: &ldquo;{hit.matchedValue}&rdquo; (term: &ldquo;{hit.queriedTerm}&rdquo;)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <form onSubmit={handleSaveDisposition} className="bg-white p-4 rounded border border-[#D9D6CF] space-y-3 pt-3">
                <h4 className="text-xs font-serif font-bold text-[#06244B] flex items-center gap-1.5 border-b border-[#D9D6CF] pb-2">
                  <FileCheck className="w-4 h-4 text-[#A4432B]" />
                  <span>Reviewer Determination &amp; Audit Sign-Off</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#06244B] mb-1">
                      Reviewing Attorney / Staff *
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewer}
                      onChange={(e) => setReviewer(e.target.value)}
                      placeholder="Enter reviewing attorney name"
                      className="w-full text-xs p-2 bg-white border border-[#D9D6CF] rounded text-[#202A35]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#06244B] mb-1">
                      Review Disposition *
                    </label>
                    <select
                      value={disposition}
                      onChange={(e) => setDisposition(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-[#D9D6CF] rounded text-[#202A35] font-semibold"
                    >
                      <option value="Review Completed">Review Completed (No Conflict Found)</option>
                      <option value="Cleared">Cleared (No Conflict Found)</option>
                      <option value="Conflict Identified">Potential Match / Conflict Identified</option>
                      <option value="Waiver Obtained">Informed Waiver Obtained (Utah RPC 1.7(b))</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#06244B] mb-1">
                    Conflict Review Analysis &amp; Basis *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={analysisNotes}
                    onChange={(e) => setAnalysisNotes(e.target.value)}
                    placeholder="Document review findings, false-positive explanation, ethical wall, or signed waiver..."
                    className="w-full text-xs p-2 bg-white border border-[#D9D6CF] rounded text-[#202A35]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-[#667085]">
                    Persists to backend conflict review audit log before enabling conversion.
                  </span>
                  <Button type="submit" variant="primary" size="sm" disabled={savingDisposition}>
                    <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                    {savingDisposition ? 'Saving...' : 'Save Review Decision'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            <h4 className="text-xs font-serif font-bold text-[#06244B]">
              Persisted Conflict Search &amp; Review History
            </h4>
            {history.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#667085] border border-dashed border-[#D9D6CF] rounded bg-white">
                No conflict scans or review entries have been logged for this intake yet.
              </div>
            ) : (
              <div className="divide-y divide-[#D9D6CF] border border-[#D9D6CF] rounded bg-white max-h-72 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="p-3 text-xs flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#06244B]">&ldquo;{item.query}&rdquo;</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                            item.disposition === 'Conflict Identified'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {item.disposition}
                        </span>
                      </div>
                      {item.notes && <p className="text-[11px] text-[#667085]">{item.notes}</p>}
                      <div className="flex items-center gap-3 text-[10px] text-[#667085]">
                        <span>By: <strong>{item.searchedBy}</strong></span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-[#667085] flex-shrink-0">
                      <span>{item.hitsCount} match(es)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'record' && recordedDecision && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded border-2 border-[#06244B] shadow-md space-y-4 text-xs text-[#202A35]">
              <div className="border-b-2 border-[#06244B] pb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#06244B]">HEUGLY &amp; BLUDWORTH</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#667085]">
                    Internal Conflict Review Record
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-[#A4432B]">{recordedDecision.recordId}</span>
                  <p className="text-[10px] text-[#667085]">{recordedDecision.recordedAt}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F5F0E5]/50 rounded border border-[#D9D6CF]">
                <div>
                  <span className="text-[10px] text-[#667085] uppercase block font-semibold">Subject / Queried Terms:</span>
                  <span className="text-xs font-bold text-[#06244B]">{recordedDecision.queryEntity}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] uppercase block font-semibold">Intake Reference:</span>
                  <span className="text-xs font-bold text-[#06244B]">{recordedDecision.intakeId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] uppercase block font-semibold">Reviewer:</span>
                  <span className="text-xs font-bold text-[#06244B]">{recordedDecision.reviewer}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] uppercase block font-semibold">Recorded Status:</span>
                  <span className="text-xs font-bold text-[#06244B]">{recordedDecision.disposition}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#667085] uppercase block font-semibold mb-1">Analysis Notes:</span>
                <p className="p-2.5 bg-white border border-[#D9D6CF] rounded text-[11px] leading-relaxed text-[#202A35]">
                  {recordedDecision.analysisNotes}
                </p>
              </div>

              <div className="pt-3 border-t border-[#D9D6CF] flex items-center justify-between text-[10px] text-[#667085]">
                <span>{recordedDecision.hitsCount} automated match(es) evaluated</span>
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Saved to Intake Audit Record</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print Record
              </Button>
              <Button variant="primary" size="sm" onClick={() => onClose()}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
