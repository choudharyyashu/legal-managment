import React, { useState, useMemo } from 'react';
import {
  Mail,
  MessageSquare,
  Eye,
  UserCheck,
  FolderCheck,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  Smartphone,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SearchBar } from '../../../components/shared/SearchBar';
import { StatusBadge } from '../../../components/shared/StatusBadge';

/**
 * C. Apple iPhone / Messages Sync Limitations informational panel.
 */
export function AppleSyncLimitationsPanel() {
  return (
    <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-950 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#A4432B] shrink-0" />
          <span className="font-bold text-sm text-[#06244B]">
            Integration Limitation Notice: Apple iPhone / Messages Sync Limitations
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-950 border border-amber-300">
          Informational Panel • No Active Apple Messages Sync
        </span>
      </div>

      <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed text-amber-950">
        <li>
          <strong>Platform &amp; Permission Restrictions:</strong> Apple iPhone / iMessage synchronization faces strict iOS sandbox and end-to-end encryption permission limitations.
        </li>
        <li>
          <strong>Partial Content &amp; Attachment Availability:</strong> Not all message content, tapback reactions, or media attachments may be captured or available for automated matching.
        </li>
        <li>
          <strong>Manual Verification Required:</strong> Staff must manually inspect unmatched messages and confirm client/matter assignment before logging correspondence to a docket.
        </li>
        <li>
          <strong>No Active Apple Sync Implied:</strong> Full Apple Messages synchronization is <strong>not active</strong> in this workspace; entries shown in the queue represent demo/manual export items only.
        </li>
      </ul>
    </div>
  );
}

/**
 * Shared parameterized queue component for Unmatched Emails ('email') and Unmatched Messages ('message').
 */
export function UnmatchedCommunicationsQueue({
  mode = 'email', // 'email' | 'message'
  items = [],
  clients = [],
  matters = [],
  onMatchToClient,
  onMatchToMatter,
  onMarkReviewed,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [viewingItem, setViewingItem] = useState(null);
  const [clientMatchItem, setClientMatchItem] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientError, setClientError] = useState('');

  const [matterMatchItem, setMatterMatchItem] = useState(null);
  const [selectedMatterId, setSelectedMatterId] = useState('');
  const [alsoFileToLog, setAlsoFileToLog] = useState(true);
  const [matterError, setMatterError] = useState('');

  const [reviewConfirmItem, setReviewConfirmItem] = useState(null);

  const isEmail = mode === 'email';
  const HeaderIcon = isEmail ? Mail : MessageSquare;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = !statusFilter || item.matchingStatus === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesStatus;
      const hay = [
        item.senderName,
        item.senderEmail,
        item.contactNumber,
        item.subject,
        item.preview,
        item.suggestedClientName,
        item.suggestedMatterLabel,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesStatus && hay.includes(q);
    });
  }, [items, statusFilter, searchQuery]);

  const openClientModal = (item) => {
    setClientMatchItem(item);
    setSelectedClientId(item.suggestedClientId || clients[0]?.id || '');
    setClientError('');
  };

  const handleSaveClientMatch = (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      setClientError('Please select a client to match.');
      return;
    }
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) {
      setClientError('Selected client not found.');
      return;
    }
    onMatchToClient(clientMatchItem.id, client);
    setClientMatchItem(null);
  };

  const openMatterModal = (item) => {
    setMatterMatchItem(item);
    setSelectedMatterId(item.suggestedMatterId || matters[0]?.id || '');
    setAlsoFileToLog(true);
    setMatterError('');
  };

  const handleSaveMatterMatch = (e) => {
    e.preventDefault();
    if (!selectedMatterId) {
      setMatterError('Please select a matter to match.');
      return;
    }
    const matter = matters.find((m) => m.id === selectedMatterId);
    if (!matter) {
      setMatterError('Selected matter not found.');
      return;
    }
    onMatchToMatter(matterMatchItem.id, matter, alsoFileToLog);
    setMatterMatchItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-[#D9D6CF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#D9D6CF] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-[#06244B] flex items-center gap-2">
                <HeaderIcon className="w-4 h-4 text-[#A4432B]" />
                {isEmail
                  ? `Unmatched Email Queue (${filteredItems.length})`
                  : `Unmatched Message Queue (${filteredItems.length})`}
              </h3>
              <p className="text-xs text-[#667085]">
                {isEmail
                  ? 'Inbound/outbound emails requiring manual client or matter verification before docket filing (Demo Data).'
                  : 'Unlinked SMS and exported mobile messages requiring manual client/matter matching (Demo Data).'}
              </p>
            </div>
            <span className="text-[11px] font-semibold bg-[#F5F0E5] text-[#06244B] px-2.5 py-1 rounded border border-[#D9D6CF]">
              Manual Matching Required
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={
                  isEmail
                    ? 'Search sender, subject, preview, or suggested match...'
                    : 'Search contact, phone number, message preview...'
                }
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {['', 'Unmatched', 'Reviewed', 'Matched'].map((st) => (
                <button
                  key={st || 'all'}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                    statusFilter === st
                      ? 'bg-[#06244B] text-white border-[#06244B]'
                      : 'bg-white text-[#202A35] border-[#D9D6CF] hover:border-[#A4432B]'
                  }`}
                >
                  {st || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4">
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={isEmail ? 'No Unmatched Emails' : 'No Unmatched Messages'}
              description="No queue items match your current search or matching status filter."
            />
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-[#D9D6CF] bg-white hover:bg-slate-50/60 transition-colors space-y-3 text-xs"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#06244B]">{item.senderName}</span>
                        <span className="text-[11px] text-[#667085] font-mono">
                          {isEmail ? `<${item.senderEmail}>` : `${item.contactNumber} • ${item.channel}`}
                        </span>
                        <StatusBadge status={item.matchingStatus} />
                      </div>

                      {isEmail && (
                        <div className="font-serif font-bold text-sm text-[#06244B]">
                          {item.subject}
                        </div>
                      )}

                      <p className="text-[#202A35] leading-relaxed">{item.preview}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#667085] pt-1">
                        <span>
                          Received: <strong className="text-[#202A35] font-mono">{item.receivedDate}</strong>
                        </span>
                        <span>
                          Suggested Client/Matter:{' '}
                          <strong className="text-[#06244B]">
                            {item.suggestedMatterLabel ||
                              item.suggestedClientName ||
                              'No automatic suggestion available'}
                          </strong>
                        </span>
                      </div>

                      {(item.matchedClientName || item.matchedMatterLabel) && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900">
                          <strong>Matched To:</strong>{' '}
                          {item.matchedClientName ? `Client: ${item.matchedClientName}` : ''}
                          {item.matchedClientName && item.matchedMatterLabel ? ' • ' : ''}
                          {item.matchedMatterLabel ? `Matter: ${item.matchedMatterLabel}` : ''}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => setViewingItem(item)}
                      >
                        {isEmail ? 'View Email' : 'View Message'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={UserCheck}
                        onClick={() => openClientModal(item)}
                      >
                        Match to Client
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={FolderCheck}
                        onClick={() => openMatterModal(item)}
                      >
                        Match to Matter
                      </Button>
                      {item.matchingStatus !== 'Reviewed' && item.matchingStatus !== 'Matched' && (
                        <Button
                          size="sm"
                          variant="navyOutline"
                          icon={CheckCircle2}
                          onClick={() => setReviewConfirmItem(item)}
                        >
                          Mark as Reviewed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Email / Message Modal */}
      <Modal
        isOpen={Boolean(viewingItem)}
        onClose={() => setViewingItem(null)}
        title={
          viewingItem
            ? isEmail
              ? viewingItem.subject
              : `Message from ${viewingItem.senderName}`
            : 'Details'
        }
        subtitle={
          viewingItem
            ? `${isEmail ? viewingItem.senderEmail : viewingItem.contactNumber} • ${viewingItem.receivedDate}`
            : ''
        }
        maxWidth="max-w-lg"
        footer={
          <Button size="sm" variant="outline" onClick={() => setViewingItem(null)}>
            Close
          </Button>
        }
      >
        {viewingItem && (
          <div className="space-y-3 text-xs text-[#202A35]">
            <div className="p-3 bg-slate-50 border border-[#D9D6CF] rounded space-y-1">
              <div>
                <strong>Sender:</strong> {viewingItem.senderName} (
                {isEmail ? viewingItem.senderEmail : viewingItem.contactNumber})
              </div>
              <div>
                <strong>Received:</strong> {viewingItem.receivedDate}
              </div>
              <div>
                <strong>Status:</strong> <StatusBadge status={viewingItem.matchingStatus} />
              </div>
              <div>
                <strong>Suggested Match:</strong>{' '}
                {viewingItem.suggestedMatterLabel || viewingItem.suggestedClientName || 'None'}
              </div>
            </div>

            <div className="p-3.5 bg-white border border-[#D9D6CF] rounded whitespace-pre-line leading-relaxed">
              {isEmail ? viewingItem.fullBody : viewingItem.fullMessage}
            </div>

            {isEmail && viewingItem.attachments?.length > 0 && (
              <div className="p-2.5 bg-[#F5F0E5]/50 border border-[#D9D6CF] rounded space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#667085] block">
                  Attachments (Demo Metadata)
                </span>
                <div className="flex flex-wrap gap-2">
                  {viewingItem.attachments.map((att, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#D9D6CF] text-[11px] font-mono"
                    >
                      <Paperclip className="w-3 h-3 text-[#A4432B]" />
                      {att}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Match to Client Modal */}
      <Modal
        isOpen={Boolean(clientMatchItem)}
        onClose={() => setClientMatchItem(null)}
        title="Match Communication to Client"
        subtitle={
          clientMatchItem
            ? isEmail
              ? clientMatchItem.subject
              : `${clientMatchItem.senderName} (${clientMatchItem.contactNumber})`
            : ''
        }
        maxWidth="max-w-md"
      >
        {clientMatchItem && (
          <form onSubmit={handleSaveClientMatch} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">
                Select Client <span className="text-[#A4432B]">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  if (clientError) setClientError('');
                }}
                className="w-full p-2 border border-[#D9D6CF] rounded bg-white"
              >
                <option value="">-- Select a Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
              {clientError && <p className="text-red-700 text-[11px] mt-1">{clientError}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
              <Button type="button" size="sm" variant="outline" onClick={() => setClientMatchItem(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Save Client Match
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Match to Matter Modal */}
      <Modal
        isOpen={Boolean(matterMatchItem)}
        onClose={() => setMatterMatchItem(null)}
        title="Match Communication to Matter"
        subtitle={
          matterMatchItem
            ? isEmail
              ? matterMatchItem.subject
              : `${matterMatchItem.senderName} (${matterMatchItem.contactNumber})`
            : ''
        }
        maxWidth="max-w-md"
      >
        {matterMatchItem && (
          <form onSubmit={handleSaveMatterMatch} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#06244B] mb-1">
                Select Target Matter <span className="text-[#A4432B]">*</span>
              </label>
              <select
                value={selectedMatterId}
                onChange={(e) => {
                  setSelectedMatterId(e.target.value);
                  if (matterError) setMatterError('');
                }}
                className="w-full p-2 border border-[#D9D6CF] rounded bg-white"
              >
                <option value="">-- Select a Matter --</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.matterNumber} — {m.title} ({m.clientName})
                  </option>
                ))}
              </select>
              {matterError && <p className="text-red-700 text-[11px] mt-1">{matterError}</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={alsoFileToLog}
                onChange={(e) => setAlsoFileToLog(e.target.checked)}
                className="rounded border-[#D9D6CF] text-[#06244B]"
              />
              <span className="font-medium text-[#202A35]">
                Also add matched entry to Filed Communications log
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
              <Button type="button" size="sm" variant="outline" onClick={() => setMatterMatchItem(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Save Matter Match
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Mark as Reviewed Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(reviewConfirmItem)}
        onClose={() => setReviewConfirmItem(null)}
        onConfirm={() => {
          if (reviewConfirmItem) {
            onMarkReviewed(reviewConfirmItem.id);
          }
        }}
        title="Mark Queue Item as Reviewed"
        message={
          reviewConfirmItem
            ? `Mark this unmatched ${isEmail ? 'email' : 'message'} from "${reviewConfirmItem.senderName}" as Reviewed? You can still match it to a client or matter afterward.`
            : ''
        }
        confirmLabel="Mark as Reviewed"
        variant="primary"
      />
    </div>
  );
}
