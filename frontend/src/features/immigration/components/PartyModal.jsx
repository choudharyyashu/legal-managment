import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, Phone, MapPin, DollarSign, FileText } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export function PartyModal({ isOpen, onClose, party = null, onSaveParty }) {
  const isEditing = Boolean(party);
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [role, setRole] = useState('Beneficiary');
  const [subType, setSubType] = useState('Foreign National Spouse');
  const [alienNumber, setAlienNumber] = useState('');
  const [citizenshipStatus, setCitizenshipStatus] = useState('Citizen of Mexico');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [annualIncome, setAnnualIncome] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (party) {
      setName(party.name || '');
      setRole(party.role || 'Beneficiary');
      setSubType(party.subType || '');
      setAlienNumber(party.alienNumber || '');
      setCitizenshipStatus(party.citizenshipStatus || '');
      setEmail(party.email || '');
      setPhone(party.phone || '');
      setAddress(party.address || '');
      setAnnualIncome(party.annualIncome || party.currentAnnualIncome || 0);
      setNotes(party.notes || '');
    } else {
      setName('');
      setRole('Beneficiary');
      setSubType('Foreign National Applicant');
      setAlienNumber('');
      setCitizenshipStatus('');
      setEmail('');
      setPhone('');
      setAddress('');
      setAnnualIncome(0);
      setNotes('');
    }
  }, [party, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please enter party name.', 'error');
      return;
    }

    const payload = {
      id: party?.id || `PRT-${Date.now()}`,
      name,
      role,
      subType,
      alienNumber: alienNumber || (role === 'Petitioner' ? 'None (U.S. Citizen)' : 'Pending'),
      citizenshipStatus,
      email,
      phone,
      address,
      annualIncome: Number(annualIncome),
      currentAnnualIncome: Number(annualIncome),
      notes,
    };

    if (onSaveParty) onSaveParty(payload);
    addToast(isEditing ? `Updated profile for ${name}.` : `Party ${name} added to directory.`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Immigration Party: ${party?.name}` : 'Add New Immigration Party / Sponsor'}
      subtitle="Dual-party record management for USCIS and EOIR proceedings"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Immigration Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] bg-white font-medium"
            >
              <option value="Beneficiary">Beneficiary (Foreign National)</option>
              <option value="Petitioner">Petitioner (USC / LPR / Employer)</option>
              <option value="Joint Sponsor">Joint Sponsor (Form I-864)</option>
            </select>
          </div>
          <div>
            <Input
              label="Party Classification / Sub-Type"
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              placeholder="e.g. Foreign National Spouse, Corporate Sponsor"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Full Legal Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Carlos Vega-Gomez"
              required
            />
          </div>
          <div>
            <Input
              label="Alien Registration Number (A-Number)"
              value={alienNumber}
              onChange={(e) => setAlienNumber(e.target.value)}
              placeholder="A-###-###-###"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Citizenship Status / Country"
              value={citizenshipStatus}
              onChange={(e) => setCitizenshipStatus(e.target.value)}
              placeholder="e.g. Citizen of Mexico, U.S. Citizen"
              required
            />
          </div>
          <div>
            <Input
              label="Current Annual Income ($)"
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              placeholder="Form I-864 evaluation"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>
          <div>
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(801) 555-0100"
            />
          </div>
        </div>

        <div>
          <Input
            label="Physical Street Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, City, State, ZIP"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
            Notes &amp; Representation Scope
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Immigration history notes, joint sponsor disclosures..."
            className="w-full text-xs p-2 rounded border border-[#D9D6CF]"
          />
        </div>

        <div className="pt-3 border-t border-[#D9D6CF] flex justify-end gap-2">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit">
            {isEditing ? 'Save Changes' : 'Create Party Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

