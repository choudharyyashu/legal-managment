import React, { useState } from 'react';
import { MessageSquare, Send, Phone, Shield, AlertTriangle, Lock } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function TextMessageThreadModal({ isOpen, onClose, clientName = 'Robert H. Henderson', clientPhone = '(801) 555-0192', matterTitle = '25-CV-0101 (Wasatch Mountain Logistics)' }) {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([
    { id: 'sms-1', fromMe: false, sender: clientName, time: 'Nov 4, 11:20 AM', text: 'Hi Thomas, we received the deposition subpoena for our operations manager. Does he need to appear in person or Zoom?' },
    { id: 'sms-2', fromMe: true, sender: 'Thomas Bludworth, Esq.', time: 'Nov 4, 11:35 AM', text: 'Good morning Robert. Opposing counsel agreed to conduct this deposition remotely via Zoom. Marcus will email the link and scheduling order today.' },
    { id: 'sms-3', fromMe: false, sender: clientName, time: 'Nov 4, 11:42 AM', text: 'Perfect. We will have him dial in from our Salt Lake headquarters conference room.' },
  ]);
  const [reply, setReply] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    const newSms = {
      id: `sms-${Date.now()}`,
      fromMe: true,
      sender: 'Thomas Bludworth, Esq.',
      time: 'Just now',
      text: reply.trim()
    };
    setMessages(prev => [...prev, newSms]);
    setReply('');
    addToast(`SMS dispatched to ${clientPhone} via firm VoIP gateway.`, 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Firm VoIP SMS Thread: ${clientName}`}
      subtitle={`Mobile: ${clientPhone} • Linked Matter: ${matterTitle}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {/* Compliance Notice (CTC-05) */}
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Legal Notice on Mobile Messaging (Utah RPC 1.6):</strong> Messages are logged through the firm's authorized VoIP number and archived automatically into the case file. Personal iMessage/SMS capture requires client consent under Utah law.
          </span>
        </div>

        {/* Chat Thread */}
        <div className="p-3 bg-slate-100 rounded-lg border border-[#D9D6CF] space-y-2.5 max-h-64 overflow-y-auto">
          {messages.map(m => (
            <div key={m.id} className={`p-2.5 rounded-lg max-w-[85%] text-xs ${m.fromMe ? 'bg-[#06244B] text-white ml-auto' : 'bg-white text-[#202A35] border border-[#D9D6CF]'}`}>
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className={`font-bold ${m.fromMe ? 'text-amber-300' : 'text-[#06244B]'}`}>{m.sender}</span>
                <span className={m.fromMe ? 'text-slate-300' : 'text-[#667085]'}>{m.time}</span>
              </div>
              <p className="leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Input Composer */}
        <form onSubmit={handleSend} className="space-y-2">
          <textarea
            rows={2}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={`Reply to ${clientName} via SMS...`}
            className="w-full text-xs p-2 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            required
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#667085] flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-700" /> Carrier SMS delivery via Twilio / Firm PBX
            </span>
            <Button size="sm" variant="primary" icon={Send} type="submit">
              Send SMS
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

