import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, FileText, Search, Sparkles, FolderPlus } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function OutlookMailBridgeModal({ isOpen, onClose, onFileEmail }) {
  const { addToast } = useToast();

  const [inboxEmails, setInboxEmails] = useState([
    {
      id: 'em-101',
      sender: 'rhenderson@wasatchlogistics.com',
      senderName: 'Robert H. Henderson',
      subject: 'FWD: Telemetry Sensor Calibration Log for Truck 408',
      preview: 'Thomas, attached are the temperature logs confirming the refrigeration unit power failure during the Nevada corridor transit...',
      received: 'Today at 09:24 AM',
      suggestedMatter: '25-CV-0101 (Wasatch Mountain Logistics v. Interstate Freightlines)',
      matchConfidence: 98,
      hasAttachments: true,
      filed: false,
    },
    {
      id: 'em-102',
      sender: 'cynthia.vance@apexhorizon.com',
      senderName: 'Cynthia Vance-Sterling',
      subject: 'Re: Special Water Right Master Allotment Agreement Draft',
      preview: 'Eleanor, our board reviewed section 4 regarding culinary recharge easements. We have minor redlines on the Heber City conveyance covenant...',
      received: 'Yesterday at 04:12 PM',
      suggestedMatter: '24-LND-0912 (Apex Horizon v. Wasatch County Board)',
      matchConfidence: 95,
      hasAttachments: true,
      filed: false,
    },
    {
      id: 'em-103',
      sender: 'elena.rostova@slcmail.org',
      senderName: 'Elena Rostova',
      subject: 'Ukrainian Passport Translation Certification Received',
      preview: 'Hi Sarah, the certified translation agency returned our translated birth certificate and marriage certificate today. I have attached the scans...',
      received: 'Nov 4, 2026',
      suggestedMatter: '26-IMM-0012 (Elena Rostova I-130 / I-485 Adjustment of Status)',
      matchConfidence: 99,
      hasAttachments: true,
      filed: false,
    }
  ]);

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
          {inboxEmails.map(em => (
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
          ))}
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

