import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export function VendorAssignmentModal({ isOpen, onClose, onSave, assignment, cases = [] }) {
  const [formData, setFormData] = useState({
    matterId: '',
    vendorName: '',
    vendorType: 'Medical Chronology',
    assignmentDate: '',
    dueDate: '',
    assignedBy: 'Marcus Vance (Senior Paralegal)',
    assignmentStatus: 'In Progress',
    deliverableStatus: 'Pending',
    notes: '',
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        matterId: assignment.matterId || cases[0]?.id || '',
        vendorName: assignment.vendorName || '',
        vendorType: assignment.vendorType || 'Medical Chronology',
        assignmentDate: assignment.assignmentDate || '',
        dueDate: assignment.dueDate || '',
        assignedBy: assignment.assignedBy || 'Marcus Vance (Senior Paralegal)',
        assignmentStatus: assignment.assignmentStatus || 'In Progress',
        deliverableStatus: assignment.deliverableStatus || 'Pending',
        notes: assignment.notes || '',
      });
    } else {
      setFormData({
        matterId: cases[0]?.id || '',
        vendorName: '',
        vendorType: 'Medical Chronology',
        assignmentDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        assignedBy: 'Marcus Vance (Senior Paralegal)',
        assignmentStatus: 'In Progress',
        deliverableStatus: 'Pending',
        notes: '',
      });
    }
  }, [assignment, cases, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedMatter = cases.find(c => c.id === formData.matterId);

    const savedRecord = {
      id: assignment?.id || `VND-${Date.now()}`,
      matterId: formData.matterId,
      assignedMatter: selectedMatter ? `${selectedMatter.clientName} (${selectedMatter.matterNumber})` : 'Personal Injury Matter',
      vendorName: formData.vendorName,
      vendorType: formData.vendorType,
      assignmentDate: formData.assignmentDate,
      dueDate: formData.dueDate,
      assignedBy: formData.assignedBy,
      assignmentStatus: formData.assignmentStatus,
      deliverableStatus: formData.deliverableStatus,
      deliverableUrl: '#',
      notes: formData.notes,
    };

    onSave(savedRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assignment ? 'Edit Vendor Assignment Task' : 'Dispatch New Outside Vendor Assignment'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assigned PI Matter *"
            value={formData.matterId}
            onChange={(e) => setFormData({ ...formData, matterId: e.target.value })}
            required
            options={cases.map((c) => ({
              value: c.id,
              label: `${c.matterNumber} - ${c.clientName}`,
            }))}
          />

          <Select
            label="Vendor Category / Discipline *"
            value={formData.vendorType}
            onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
            required
            options={[
              { value: 'Medical Record Retrieval', label: 'Medical Record Retrieval' },
              { value: 'Medical Chronology', label: 'Medical Chronology' },
              { value: 'Medical Bill Review', label: 'Medical Bill Review' },
              { value: 'Investigation Services', label: 'Investigation Services' },
              { value: 'Expert Services', label: 'Expert Services (Biomechanical / Accident Recon)' },
            ]}
          />
        </div>

        <Input
          label="Vendor / Expert Entity Name *"
          value={formData.vendorName}
          placeholder="e.g. Apex Med-Legal Chronology Solutions"
          onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Assignment Date *"
            type="date"
            value={formData.assignmentDate}
            onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })}
            required
          />

          <Input
            label="Target Delivery Due Date *"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />

          <Input
            label="Assigned By (Attorney / Staff)"
            value={formData.assignedBy}
            placeholder="e.g. Thomas Bludworth, Esq."
            onChange={(e) => setFormData({ ...formData, assignedBy: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assignment Execution Status"
            value={formData.assignmentStatus}
            onChange={(e) => setFormData({ ...formData, assignmentStatus: e.target.value })}
            options={[
              { value: 'Requested / Dispatched', label: 'Requested / Dispatched' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Reviewing Draft', label: 'Reviewing Draft' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />

          <Select
            label="Deliverable Verification Status"
            value={formData.deliverableStatus}
            onChange={(e) => setFormData({ ...formData, deliverableStatus: e.target.value })}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Received - Approved', label: 'Received - Approved' },
              { value: 'Revisions Requested', label: 'Revisions Requested' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#06244B] uppercase tracking-wider mb-1">
            Scope of Work &amp; Assignment Instructions
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Specific instructions, Bates ranges to prioritize, specific pre-existing conditions to distinguish, turnaround targets..."
            className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#A4432B]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {assignment ? 'Save Assignment' : 'Dispatch Assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

