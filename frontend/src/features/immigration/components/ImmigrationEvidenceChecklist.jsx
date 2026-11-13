import React, { useState } from 'react';
import { FileCheck, Upload, CheckCircle2, Clock, AlertTriangle, FileText, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export function ImmigrationEvidenceChecklist({ evidenceItems = [], onUpdateEvidence }) {
  const [items, setItems] = useState(evidenceItems);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Civil Document');
  const { addToast } = useToast();

  const handleToggleVerified = (itemId) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const nextStatus = item.status === 'Verified & Admitted' ? 'Pending Review' : 'Verified & Admitted';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
    addToast('Document verification status updated.', 'info');
  };

  const handleSimulatedUpload = (e) => {
    e.preventDefault();
    if (!newTitle) {
      addToast('Please enter document title.', 'error');
      return;
    }

    const newItem = {
      id: `ev-${Date.now()}`,
      category: newCategory,
      title: newTitle,
      status: 'Verified & Admitted',
      file: `${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_verified.pdf`,
      required: true,
    };

    setItems(prev => [...prev, newItem]);
    if (onUpdateEvidence) onUpdateEvidence(newItem);
    addToast(`Document "${newTitle}" uploaded and admitted to evidence docket.`, 'success');
    setIsUploadModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D6CF] pb-2">
        <div>
          <h4 className="font-bold text-sm text-[#06244B] flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-[#A4432B]" />
            USCIS Mandatory Civil Evidence &amp; Attachments
          </h4>
          <span className="text-xs text-[#667085]">
            Primary civil records, translation affidavits, and certified transcripts.
          </span>
        </div>
        <Button size="sm" variant="outline" icon={Upload} onClick={() => setIsUploadModalOpen(true)}>
          Upload Simulated Exhibit
        </Button>
      </div>

      <div className="border border-[#D9D6CF] rounded-lg overflow-hidden bg-white">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F5F0E5] text-[#06244B] font-bold">
            <tr>
              <th className="p-2.5">Category</th>
              <th className="p-2.5">Evidence Description</th>
              <th className="p-2.5">File Attachment</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D6CF]">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-2.5 font-semibold text-[#A4432B]">{item.category}</td>
                <td className="p-2.5 font-medium text-[#202A35]">
                  {item.title}
                  {item.required && <span className="text-red-600 font-bold ml-1">*</span>}
                </td>
                <td className="p-2.5 font-mono text-[11px] text-[#667085]">
                  {item.file ? (
                    <span className="flex items-center gap-1 text-[#06244B]">
                      <FileText className="w-3.5 h-3.5 text-[#A4432B]" />
                      {item.file}
                    </span>
                  ) : (
                    <span className="text-amber-700 italic">Awaiting Upload</span>
                  )}
                </td>
                <td className="p-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.status === 'Verified & Admitted'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-900 border-amber-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => handleToggleVerified(item.id)}
                    className="text-xs font-semibold text-[#A4432B] hover:underline"
                  >
                    {item.status === 'Verified & Admitted' ? 'Mark Pending' : 'Verify & Admit'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Simulated Immigration Exhibit"
        subtitle="Attach certified translation, medical report, or civil certificate"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSimulatedUpload} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Evidence Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] bg-white font-medium"
            >
              <option value="Primary Civil Document">Primary Civil Document</option>
              <option value="Certified Translation">Certified Translation Affidavit</option>
              <option value="Financial Affidavit">Financial Record / Tax Transcript</option>
              <option value="Medical Examination">Form I-693 Medical Exam</option>
              <option value="Expert Letter">Expert / Rebuttal Letter</option>
            </select>
          </div>

          <div>
            <Input
              label="Exhibit Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Certified Translation of Mexican Birth Certificate"
              required
            />
          </div>

          <div className="p-3 bg-slate-50 border border-dashed border-[#D9D6CF] rounded text-center space-y-1">
            <Upload className="w-5 h-5 text-[#667085] mx-auto" />
            <div className="font-semibold text-[#06244B]">Simulate Local File Attachment</div>
            <div className="text-[10px] text-[#667085]">Creates verified PDF placeholder on exhibit docket</div>
          </div>

          <div className="pt-2 border-t border-[#D9D6CF] flex justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Admit Exhibit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

