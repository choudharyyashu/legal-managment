import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Plus, Smartphone, Inbox } from 'lucide-react';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Tabs } from '../../../components/ui/Tabs';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { OutlookMailBridgeModal } from '../components/OutlookMailBridgeModal';
import { TextMessageThreadModal } from '../components/TextMessageThreadModal';
import {
  INITIAL_UNMATCHED_EMAILS,
  INITIAL_UNMATCHED_MESSAGES,
} from '../../../data/mockUnmatchedCommunications';
import {
  AppleSyncLimitationsPanel,
  UnmatchedCommunicationsQueue,
} from '../components/UnmatchedCommunicationsQueue';

export function CommunicationsList() {
  const { clients } = useClients();
  const { matters } = useMatters();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [communications, setCommunications] = useState([
    {
      id: 'COMM-101',
      type: 'Email',
      subject: 'Discovery Protocol & Cold-Chain Telemetry Log Production',
      sender: 'Thomas Bludworth, Esq.',
      recipient: 'rhenderson@wasatchlogistics.com',
      clientName: 'Wasatch Mountain Logistics LLC',
      matterTitle: 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
      date: '2026-11-05 14:20',
      summary: 'Transmitted revised deposition questions and confirmed date for expert telemetry witness inspection.',
    },
    {
      id: 'COMM-102',
      type: 'Telephone Call',
      subject: 'Park City Domestic Valuation Expert Deposition Preparation',
      sender: 'Sarah Jenkins, Esq.',
      recipient: 'Dr. Evelyn Martinez',
      clientName: 'Dr. Evelyn Martinez',
      matterTitle: 'In re Marriage of Martinez and Sterling',
      date: '2026-11-04 11:30',
      summary: '45-minute telephone conference discussing forensic CPA report on surgery center distribution characterization.',
    },
    {
      id: 'COMM-103',
      type: 'Written Notice',
      subject: 'Utah Division of Water Rights Pre-Hearing Notice',
      sender: 'Eleanor Heugly, Esq.',
      recipient: 'cvance@apexhorizon.com',
      clientName: 'Apex Horizon Real Estate Group',
      matterTitle: 'Apex Horizon v. Wasatch County Board of Adjustment',
      date: '2026-11-02 16:45',
      summary: 'Formal statutory notice of intervention served on state water engineer regarding culinary recharge basin.',
    },
    {
      id: 'COMM-104',
      type: 'Email',
      subject: 'Execution Instruments & Signature Notary Scheduling',
      sender: 'Marcus Vance',
      recipient: 'h.thorne@thornefamilyholdings.com',
      clientName: 'Harrison & Claire Thorne',
      matterTitle: 'Harrison & Claire Thorne Dynasty Trust & Corporate Succession',
      date: '2026-11-01 10:15',
      summary: 'Provided signature schedules and trust execution guidelines for upcoming in-office signing conference.',
    }
  ]);

  const [activeTab, setActiveTab] = useState('filed');
  const [unmatchedEmails, setUnmatchedEmails] = useState(INITIAL_UNMATCHED_EMAILS);
  const [unmatchedMessages, setUnmatchedMessages] = useState(INITIAL_UNMATCHED_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isOutlookOpen, setIsOutlookOpen] = useState(false);
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [selectedComm, setSelectedComm] = useState(null);

  const handleMatchEmailToClient = (id, client) => {
    setUnmatchedEmails((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              matchedClientName: client.name,
              matchingStatus: e.matchedMatterLabel ? 'Matched' : 'Reviewed',
            }
          : e
      )
    );
    addToast(`Email matched to client "${client.name}".`, 'success');
  };

  const handleMatchEmailToMatter = (id, matter, alsoFile) => {
    const matchedItem = unmatchedEmails.find((e) => e.id === id);
    const matterLabel = `${matter.matterNumber} — ${matter.title}`;
    setUnmatchedEmails((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              matchedClientName: matter.clientName,
              matchedMatterLabel: matterLabel,
              matchingStatus: 'Matched',
            }
          : e
      )
    );
    if (alsoFile && matchedItem) {
      setCommunications((prev) => [
        {
          id: `COMM-${prev.length + 101}`,
          type: 'Email',
          subject: matchedItem.subject,
          sender: `${matchedItem.senderName} <${matchedItem.senderEmail}>`,
          recipient: currentUser?.name || 'Attorney of Record',
          clientName: matter.clientName,
          matterTitle: matter.title,
          date: matchedItem.receivedDate,
          summary: matchedItem.fullBody || matchedItem.preview,
        },
        ...prev,
      ]);
    }
    addToast(`Email matched to matter "${matter.matterNumber}"${alsoFile ? ' and filed to log' : ''}.`, 'success');
  };

  const handleMarkEmailReviewed = (id) => {
    setUnmatchedEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, matchingStatus: 'Reviewed' } : e))
    );
    addToast('Unmatched email marked as Reviewed.', 'info');
  };

  const handleMatchMessageToClient = (id, client) => {
    setUnmatchedMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              matchedClientName: client.name,
              matchingStatus: m.matchedMatterLabel ? 'Matched' : 'Reviewed',
            }
          : m
      )
    );
    addToast(`Message matched to client "${client.name}".`, 'success');
  };

  const handleMatchMessageToMatter = (id, matter, alsoFile) => {
    const matchedItem = unmatchedMessages.find((m) => m.id === id);
    const matterLabel = `${matter.matterNumber} — ${matter.title}`;
    setUnmatchedMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              matchedClientName: matter.clientName,
              matchedMatterLabel: matterLabel,
              matchingStatus: 'Matched',
            }
          : m
      )
    );
    if (alsoFile && matchedItem) {
      setCommunications((prev) => [
        {
          id: `COMM-${prev.length + 101}`,
          type: 'Mobile Message',
          subject: `Message from ${matchedItem.senderName} (${matchedItem.contactNumber})`,
          sender: `${matchedItem.senderName} (${matchedItem.contactNumber})`,
          recipient: currentUser?.name || 'Firm Staff',
          clientName: matter.clientName,
          matterTitle: matter.title,
          date: matchedItem.receivedDate,
          summary: matchedItem.fullMessage || matchedItem.preview,
        },
        ...prev,
      ]);
    }
    addToast(`Message matched to matter "${matter.matterNumber}"${alsoFile ? ' and filed to log' : ''}.`, 'success');
  };

  const handleMarkMessageReviewed = (id) => {
    setUnmatchedMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, matchingStatus: 'Reviewed' } : m))
    );
    addToast('Unmatched message marked as Reviewed.', 'info');
  };

  // Compose State
  const [newSubject, setNewSubject] = useState('');
  const [newType, setNewType] = useState('Email');
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newMatterId, setNewMatterId] = useState(matters[0]?.id || '');
  const [newRecipient, setNewRecipient] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const handleCompose = (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newRecipient.trim()) {
      addToast('Please fill out recipient and subject.', 'error');
      return;
    }

    const client = clients.find(c => c.id === newClientId);
    const matter = matters.find(m => m.id === newMatterId);

    const newRecord = {
      id: `COMM-${communications.length + 101}`,
      type: newType,
      subject: newSubject,
      sender: currentUser.name,
      recipient: newRecipient,
      clientName: client?.name || 'Client',
      matterTitle: matter?.title || 'Matter',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      summary: newMessage,
    };

    setCommunications(prev => [newRecord, ...prev]);
    addToast(`Communication record "${newSubject}" logged to case file.`, 'success');
    setIsComposeOpen(false);
    setNewSubject('');
    setNewRecipient('');
    setNewMessage('');
  };

  const columns = [
    {
      key: 'subject',
      label: 'Subject & Type',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#F5F0E5] text-[#06244B]">
            {row.type === 'Email' ? (
              <Mail className="w-4 h-4 text-[#A4432B]" />
            ) : row.type === 'Mobile Message' ? (
              <MessageSquare className="w-4 h-4 text-[#06244B]" />
            ) : (
              <Phone className="w-4 h-4 text-[#06244B]" />
            )}
          </div>
          <div>
            <span
              onClick={() => setSelectedComm(row)}
              className="font-serif font-bold text-[#06244B] hover:text-[#A4432B] block cursor-pointer text-sm"
            >
              {val}
            </span>
            <span className="text-[11px] text-[#667085]">{row.type} • {row.date}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'clientName',
      label: 'Client & Matter',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#06244B] block">{val}</span>
          <span className="text-[11px] text-[#667085] block max-w-xs truncate">{row.matterTitle}</span>
        </div>
      ),
    },
    {
      key: 'sender',
      label: 'Sender & Recipient',
      render: (val, row) => (
        <div className="text-xs">
          <p className="font-medium text-[#202A35]">From: {val}</p>
          <p className="text-[#667085] text-[11px]">To: {row.recipient}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'View',
      align: 'right',
      render: (val, row) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedComm(row)}>
          Read Log
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Communications &amp; Notices"
        subtitle="Chronological record of emails, phone conferences, and formal notices linked to active matters."
        breadcrumbs={[{ label: 'Clients & Matters', to: '/clients' }, { label: 'Communications' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Mail}
              onClick={() => setIsOutlookOpen(true)}
            >
              Outlook Inbox Bridge
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Smartphone}
              onClick={() => setIsSmsOpen(true)}
            >
              Client SMS Thread
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsComposeOpen(true)}
            >
              Log Communication
            </Button>
          </div>
        }
      />

      {/* C. Apple iPhone / Messages Sync Limitations Informational Panel */}
      <AppleSyncLimitationsPanel />

      {/* Communications Section Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'filed', label: 'Filed Communications', icon: Inbox, count: communications.length },
          {
            id: 'unmatchedEmails',
            label: 'Unmatched Email Queue',
            icon: Mail,
            count: unmatchedEmails.filter((e) => e.matchingStatus === 'Unmatched').length,
          },
          {
            id: 'unmatchedMessages',
            label: 'Unmatched Message Queue',
            icon: MessageSquare,
            count: unmatchedMessages.filter((m) => m.matchingStatus === 'Unmatched').length,
          },
        ]}
      />

      {activeTab === 'filed' && (
        <div className="space-y-4">
          <div className="max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search communications, subjects, or recipients..."
            />
          </div>

          <DataTable
            columns={columns}
            data={communications.filter(c => c.subject.toLowerCase().includes(searchQuery.toLowerCase()) || c.clientName.toLowerCase().includes(searchQuery.toLowerCase()))}
            pageSize={8}
          />
        </div>
      )}

      {activeTab === 'unmatchedEmails' && (
        <UnmatchedCommunicationsQueue
          mode="email"
          items={unmatchedEmails}
          clients={clients}
          matters={matters}
          onMatchToClient={handleMatchEmailToClient}
          onMatchToMatter={handleMatchEmailToMatter}
          onMarkReviewed={handleMarkEmailReviewed}
        />
      )}

      {activeTab === 'unmatchedMessages' && (
        <UnmatchedCommunicationsQueue
          mode="message"
          items={unmatchedMessages}
          clients={clients}
          matters={matters}
          onMatchToClient={handleMatchMessageToClient}
          onMatchToMatter={handleMatchMessageToMatter}
          onMarkReviewed={handleMarkMessageReviewed}
        />
      )}

      {/* Compose / Log Modal */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Log Client Correspondence"
        subtitle="Record formal emails, telephone meetings, or court notices."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCompose} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Select
                label="Communication Channel"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                options={[
                  { value: 'Email', label: 'Email' },
                  { value: 'Telephone Call', label: 'Telephone Call' },
                  { value: 'Written Notice', label: 'Written Notice' },
                  { value: 'In-Person Conference', label: 'In-Person Conference' },
                ]}
              />
            </div>
            <div>
              <Input
                label="Recipient Name / Email"
                required
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="client@domain.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Select
                label="Client"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                options={clients.map(c => ({ value: c.id, label: c.name }))}
              />
            </div>
            <div>
              <Select
                label="Matter"
                value={newMatterId}
                onChange={(e) => setNewMatterId(e.target.value)}
                options={matters.map(m => ({ value: m.id, label: `${m.matterNumber} - ${m.title}` }))}
              />
            </div>
          </div>

          <div>
            <Input
              label="Subject Line"
              required
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Deposition Preparation & Documents Required"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Message Content / Conference Notes
            </label>
            <textarea
              rows={4}
              required
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter message details or meeting transcript..."
              className="w-full text-sm p-3 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsComposeOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Communication Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={Boolean(selectedComm)}
        onClose={() => setSelectedComm(null)}
        title={selectedComm?.subject || 'Communication Detail'}
        subtitle={`${selectedComm?.type} • ${selectedComm?.date}`}
        maxWidth="max-w-lg"
      >
        {selectedComm && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] space-y-1">
              <p><strong>From:</strong> {selectedComm.sender}</p>
              <p><strong>To:</strong> {selectedComm.recipient}</p>
              <p><strong>Matter:</strong> {selectedComm.matterTitle}</p>
              <p><strong>Client:</strong> {selectedComm.clientName}</p>
            </div>

            <div className="p-4 bg-white border border-[#D9D6CF] rounded leading-relaxed text-sm">
              {selectedComm.summary}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" onClick={() => setSelectedComm(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Microsoft 365 Outlook Mail Bridge Modal */}
      <OutlookMailBridgeModal
        isOpen={isOutlookOpen}
        onClose={() => setIsOutlookOpen(false)}
        onFileEmail={(email) => {
          const newRec = {
            id: `COMM-${communications.length + 101}`,
            type: 'Email',
            subject: email.subject,
            sender: email.sender,
            recipient: 'Thomas Bludworth, Esq.',
            clientName: 'Wasatch Mountain Logistics LLC',
            matterTitle: email.suggestedMatter,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            summary: email.preview
          };
          setCommunications(prev => [newRec, ...prev]);
        }}
      />

      {/* Firm VoIP SMS Thread Modal */}
      <TextMessageThreadModal
        isOpen={isSmsOpen}
        onClose={() => setIsSmsOpen(false)}
      />
    </div>
  );
}

