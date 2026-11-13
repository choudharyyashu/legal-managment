import React, { useState } from 'react';
import { UserPlus, DollarSign, MapPin, FileText, CheckCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export function AddCreditorModal({ isOpen, onClose, onAddCreditor }) {
  const [creditor, setCreditor] = useState('');
  const [address, setAddress] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [claimAmount, setClaimAmount] = useState(2500);
  const [priority, setPriority] = useState('Non-Priority General Unsecured');
  const [natureOfDebt, setNatureOfDebt] = useState('Consumer Credit Card Balance');
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!creditor.trim() || !address.trim()) {
      addToast('Please enter creditor name and full notice address.', 'error');
      return;
    }

    const newCreditor = {
      id: `ef-${Date.now()}`,
      creditor: creditor.trim(),
      address: address.trim(),
      accountNum: accountNum ? `****-${accountNum}` : '****-0000',
      claimAmount: Number(claimAmount),
      priority,
      natureOfDebt,
      disputed: false,
    };

    if (onAddCreditor) onAddCreditor(newCreditor);
    addToast(`Creditor "${creditor}" added to bankruptcy schedules & matrix.`, 'success');
    onClose();
    setCreditor('');
    setAddress('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Creditor to Bankruptcy Schedules &amp; Matrix"
      subtitle="District of Utah Local Rule 1007-2 Creditor Registry"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <Input
            label="Creditor Legal Entity Name"
            value={creditor}
            onChange={(e) => setCreditor(e.target.value)}
            placeholder="e.g. Discover Financial Services, LLC"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
            Official Bankruptcy Notice Address (Max 4 lines)
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="PO Box / Street Address&#10;City, State ZIP"
            required
            className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Account Number (Last 4 digits)"
              value={accountNum}
              onChange={(e) => setAccountNum(e.target.value)}
              placeholder="e.g. 4819"
            />
          </div>
          <div>
            <Input
              label="Claim Amount ($)"
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Claim Classification
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full text-xs p-2 rounded border border-[#D9D6CF] bg-white font-medium"
            >
              <option value="Non-Priority General Unsecured">Schedule E/F: Non-Priority Unsecured</option>
              <option value="Priority Unsecured Claims (100% Repaid in Plan)">Schedule E/F: Priority Claim (Tax/Support)</option>
              <option value="Secured Claims">Schedule D: Secured Claim</option>
            </select>
          </div>
          <div>
            <Input
              label="Nature of Debt / Consideration"
              value={natureOfDebt}
              onChange={(e) => setNatureOfDebt(e.target.value)}
              placeholder="e.g. Medical Services, Credit Card, Auto Loan"
              required
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#D9D6CF] flex justify-end gap-2">
          <Button size="sm" variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit">
            Add to Schedules &amp; Matrix
          </Button>
        </div>
      </form>
    </Modal>
  );
}

