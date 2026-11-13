import React, { useState } from 'react';
import { useClients } from '../../../context/ClientContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export function ClientForm({ initialData = null, onSuccess, onCancel }) {
  const { addClient, updateClient } = useClients();
  const { allUsers } = useAuth();
  const { addToast } = useToast();

  const attorneys = allUsers.filter(u => u.role === 'attorney' || u.role === 'super_admin');

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'Organization',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    primaryContact: initialData?.primaryContact || '',
    assignedAttorneyId: initialData?.assignedAttorneyId || attorneys[0]?.id || 'usr-2',
    status: initialData?.status || 'Active',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Client Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.assignedAttorneyId) newErrors.assignedAttorneyId = 'Please assign an attorney';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const assignedAttorney = allUsers.find(u => u.id === formData.assignedAttorneyId);
      // Ensure assignedAttorneyId is a valid UUID or fallback to real attorney UUID from database
      const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const attorneyUuid = validUuidPattern.test(formData.assignedAttorneyId)
        ? formData.assignedAttorneyId
        : (attorneys.find(a => validUuidPattern.test(a.id))?.id || null);

      const clientPayload = {
        ...formData,
        assignedAttorneyId: attorneyUuid,
        assignedAttorneyName: assignedAttorney?.name || 'Assigned Counsel',
      };

      if (initialData?.id) {
        const updated = await updateClient(initialData.id, clientPayload);
        addToast(`Client record "${formData.name}" successfully updated.`, 'success');
        if (onSuccess) onSuccess(updated || initialData);
      } else {
        const created = await addClient(clientPayload);
        addToast(`New client "${formData.name}" created with ID ${created.clientNumber || created.id}.`, 'success');
        if (onSuccess) onSuccess(created);
      }
    } catch (err) {
      addToast(err?.message || 'Failed to save client record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Client or Entity Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Wasatch Mountain Logistics LLC"
            error={errors.name}
          />
        </div>

        <div>
          <Select
            label="Client Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'Organization', label: 'Organization / Corporate Entity' },
              { value: 'Individual', label: 'Individual / Personal Client' },
              { value: 'Trust / Estate', label: 'Trust / Estate Fiduciary' },
              { value: 'Government / Public', label: 'Government / Public Agency' },
            ]}
          />
        </div>

        <div>
          <Select
            label="Client Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'Active', label: 'Active (Retained)' },
              { value: 'Prospective', label: 'Prospective (Intake Cleared)' },
              { value: 'Inactive', label: 'Inactive / Closed' },
            ]}
          />
        </div>

        <div>
          <Input
            label="Primary Contact Person"
            value={formData.primaryContact}
            onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
            placeholder="e.g. Robert H. Henderson (CEO)"
          />
        </div>

        <div>
          <Select
            label="Assigned Lead Attorney"
            required
            value={formData.assignedAttorneyId}
            onChange={(e) => setFormData({ ...formData, assignedAttorneyId: e.target.value })}
            options={attorneys.map(a => ({ value: a.id, label: `${a.name} (${a.title})` }))}
            error={errors.assignedAttorneyId}
          />
        </div>

        <div>
          <Input
            label="Direct Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@clientdomain.com"
            error={errors.email}
          />
        </div>

        <div>
          <Input
            label="Phone Number"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(801) 555-0192"
            error={errors.phone}
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Physical / Mailing Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address, Suite, City, UT, ZIP"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold tracking-wide text-[#202A35] uppercase mb-1">
            Opening Notes &amp; Engagement Summary
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add relevant notes regarding engagement, fee agreement terms, or special instructions..."
            className="w-full text-sm p-3 rounded border border-[#D9D6CF] bg-white text-[#202A35] placeholder-[#667085]/60 focus:outline-none focus:border-[#06244B]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9D6CF]">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="sm">
          {initialData?.id ? 'Save Client Changes' : 'Create Client Record'}
        </Button>
      </div>
    </form>
  );
}

