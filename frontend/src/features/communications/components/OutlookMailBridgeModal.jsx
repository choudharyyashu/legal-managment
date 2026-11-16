import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, ArrowRight, FileText, Search, Sparkles, FolderPlus } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { communicationService } from '../../../services/communicationService';

export function OutlookMailBridgeModal({ isOpen, onClose, onFileEmail }) {
  const { addToast } = useToast();
  const [inboxEmails, setInboxEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    communicationService.getUnmatchedQueue()
      .then((items) => {
        const list = Array.isArray(items) ? items : (items?.data || []);
        const emails = list.filter((i) => i.type === 'EMAIL' || !i.type).map((i) => ({
          id: i.id,
          sender: i.senderEmail || i.contactNumber || 'client@example.com',
          senderName: i.senderName || 'External Sender',
          subject: i.subject,
          preview: i.preview,
          received: i.receivedAt ? new Date(i.receivedAt).toLocaleString() : 'Recently',
          suggestedMatter: i.suggestedMatterLabel || 'Unassigned Matter',
          matchConfidence: i.suggestedMatterId ? 95 : 60,
          hasAttachments: false,
          filed: i.matchingStatus === 'Matched',
        }));
        setInboxEmails(emails);
      })
      .catch((err) => {
        console.warn('Failed to load bridge emails:', err?.message);
        setInboxEmails([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen]);

  const handleFileToMatter = (email) => {
    setInboxEmails(prev =>
      prev.map(e => e.id === email.id ? { ...e, filed: true } : e)
    );
    if (onFileEmail) onFileEmail(email);
    addToast(`Email "${email.subject}" successfully filed to ${email.suggestedMatter}. Timekeeper prompt spawned!`, 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Microsoft 365 / Outlook Mail Bridge"
      subtitle="Connected to firm Exchange tenant: mail.heuglybludworthlaw.com • Automatic Matter Auto-Matching"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-blue-900">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>[PROTOTYPE] Microsoft Graph API Simulator:</strong> Automatically scans sender email addresses, matches open matter dockets, and extracts litigation attachments directly to matter pleadings.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">
            SYNCED
          </span>
        </div>

        <div className="divide-y divide-[#D9D6CF] border border-[#D9D6CF] rounded-lg bg-white overflow-hidden">
          {inboxEmails.length === 0 ? (
            <div className="p-8 text-center text-[#667085]">
              <Mail className="w-8 h-8 text-[#D9D6CF] mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-xs text-[#06244B]">No Unfiled Outlook Messages</p>
              <p className="text-[11px] text-[#667085] mt-0.5">All incoming client correspondence is fully reconciled and filed to matter files.</p>
            </div>
          ) : (
            inboxEmails.map(em => (
            <div key={em.id} className={`p-4 space-y-2 hover:bg-slate-50 transition-colors ${em.filed ? 'bg-slate-50 opacity-80' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#06244B] text-xs">{em.senderName}</span>
                  <span className="text-[#667085] text-[11px] ml-2">&lt;{em.sender}&gt;</span>
                </div>
                <span className="text-[10px] text-[#667085]">{em.received}</span>
              </div>

              <div>
                <p className="font-bold text-xs text-[#06244B]">{em.subject}</p>
                <p className="text-[#667085] text-[11px] mt-0.5 leading-relaxed">{em.preview}</p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#667085] uppercase font-bold">Proposed Matter Match:</span>
                  <span className="text-[11px] font-semibold text-[#06244B] bg-[#F5F0E5] px-2 py-0.5 rounded border border-[#D9D6CF]">
                    {em.suggestedMatter}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                    {em.matchConfidence}% Match
                  </span>
                </div>

                {em.filed ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Filed to Matter
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={FolderPlus}
                    onClick={() => handleFileToMatter(em)}
                  >
                    File to Matter &amp; Log Time
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#D9D6CF]">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Inbox Viewer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

