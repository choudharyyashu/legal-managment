import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Send,
  Eye,
  FileCheck
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export function DocumentRequestModal({
  isOpen,
  onClose,
  matterTitle = 'Wasatch Mountain Logistics v. Interstate Freightlines Inc.',
  clientName = 'Wasatch Mountain Logistics LLC'
}) {
  const { addToast } = useToast();

  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      title: 'Executed Commercial Hauling Agreement (2024-2025)',
      category: 'Contracts & Exhibits',
      dueDate: '2026-11-15',
      status: 'Approved',
      uploadedFile: 'Hauling_Agreement_Executed_Signed.pdf',
    },
    {
      id: 'req-2',
      title: 'Carrier Refrigeration Telematics Log (Trip #UT-9941)',
      category: 'Evidence & Exhibits',
      dueDate: '2026-11-20',
      status: 'Uploaded',
      uploadedFile: 'ThermoKing_Sensor_Logs_Raw.csv',
    },
    {
      id: 'req-3',
      title: 'Itemized Loss of Spoilage Inventory Invoices',
      category: 'Damages Documentation',
      dueDate: '2026-11-22',
      status: 'Requested',
      uploadedFile: null,
    },
    {
      id: 'req-4',
      title: 'Certified Translation of Foreign Inspection Certificate',
      category: 'Statutory Certificates',
      dueDate: '2026-11-28',
      status: 'Requested',
      uploadedFile: null,
    },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Evidence & Exhibits');
  const [newDue, setNewDue] = useState('2026-11-30');

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReq = {
      id: `req-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      dueDate: newDue,
      status: 'Requested',
      uploadedFile: null,
    };

    setRequests([newReq, ...requests]);
    setNewTitle('');
    setIsAddOpen(false);
    addToast(`Document request "${newReq.title}" dispatched to client portal.`, 'success');
  };

  const handleSimulateUpload = (reqId) => {
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: 'Uploaded',
          uploadedFile: `${r.title.slice(0, 25).replace(/\s+/g, '_')}_Upload.pdf`,
        };
      }
      return r;
    }));
    addToast('Client simulated file upload received and queued for attorney review.', 'info');
  };

  const handleApprove = (reqId) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Approved' } : r));
    addToast('Document approved and filed to litigation exhibits.', 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Client Document Requests & Submission Tracker"
      size="lg"
    >
      <div className="space-y-4 text-xs text-[#202A35]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF]">
          <div>
            <span className="font-bold text-[#06244B] text-xs block">{matterTitle}</span>
            <span className="text-[11px] text-[#667085]">Client: {clientName}</span>
          </div>

          <Button size="xs" variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Request Document
          </Button>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-[#D9D6CF] border border-[#D9D6CF] rounded bg-white max-h-72 overflow-y-auto">
          {requests.map((req) => (
            <div key={req.id} className="p-3 flex items-start justify-between gap-3 hover:bg-[#FAF7F0] transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                    req.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : req.status === 'Uploaded'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {req.status}
                  </span>
                  <span className="font-semibold text-[#06244B]">{req.title}</span>
                </div>
                <div className="text-[10px] text-[#667085] flex items-center gap-3">
                  <span>Category: {req.category}</span>
                  <span>•</span>
                  <span>Due by: {req.dueDate}</span>
                  {req.uploadedFile && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[#06244B] font-semibold">{req.uploadedFile}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {req.status === 'Requested' && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleSimulateUpload(req.id)}
                    className="text-[10px]"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Simulate Client Upload
                  </Button>
                )}

                {req.status === 'Uploaded' && (
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => handleApprove(req.id)}
                    className="text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approve Document
                  </Button>
                )}

                {req.status === 'Approved' && (
                  <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    Exhibits Logged
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {isAddOpen && (
          <form onSubmit={handleCreateRequest} className="p-3 bg-white rounded border border-[#06244B]/40 space-y-2.5">
            <h4 className="font-bold text-xs text-[#06244B]">New Client Document Request</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Document title or description..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-1.5 border border-[#D9D6CF] rounded"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="w-full text-xs p-1.5 border border-[#D9D6CF] rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button size="xs" variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button size="xs" variant="primary" type="submit">
                Dispatch Request
              </Button>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-2 border-t border-[#D9D6CF]">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

