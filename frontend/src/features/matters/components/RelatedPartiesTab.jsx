import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Building,
  Trash2,
  Edit,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useToast } from '../../../components/ui/Toast';
import { RELATED_PARTY_ROLES } from '../../../data/mockRelatedParties';
import { relatedPartyService } from '../../../services/relatedPartyService';
import { formatDate } from '../../../utils/formatDate';

const EMPTY_FORM = {
  name: '',
  aliases: '',
  roleId: 'opposing_party',
  firmName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  serviceType: '',
  notes: '',
};

export function RelatedPartiesTab({ matterId, clientId }) {
  const { addToast } = useToast();

  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [migrationPending, setMigrationPending] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const loadParties = useCallback(async () => {
    if (!matterId && !clientId) {
      setParties([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await relatedPartyService.getRelatedParties({
        ...(matterId ? { matterId } : {}),
        ...(clientId ? { clientId } : {}),
      });
      setParties(result.parties || []);
      setMigrationPending(Boolean(result.meta?.migrationPending));
    } catch (err) {
      console.warn('Failed to load related parties:', err?.message);
      setParties([]);
    } finally {
      setLoading(false);
    }
  }, [matterId, clientId]);

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  const handleOpenAdd = () => {
    setEditingPartyId(null);
    setFormData({ ...EMPTY_FORM });
    setIsAddModalOpen(true);
  };

  const handleEditParty = (party) => {
    setEditingPartyId(party.id);
    setFormData({
      name: party.name || '',
      aliases: party.aliases || '',
      roleId: party.roleId || 'opposing_party',
      firmName: party.firmName || '',
      contactPerson: party.contactPerson || '',
      email: party.email || '',
      phone: party.phone || '',
      address: party.address || '',
      serviceType: party.serviceType || '',
      notes: party.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveParty = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter the party or firm name.', 'error');
      return;
    }

    const roleObj = RELATED_PARTY_ROLES.find((r) => r.id === formData.roleId) || RELATED_PARTY_ROLES[0];
    const payload = {
      ...(matterId ? { matterId } : {}),
      ...(clientId ? { clientId } : {}),
      name: formData.name.trim(),
      aliases: formData.aliases.trim() || null,
      roleId: roleObj.id,
      roleLabel: roleObj.label,
      firmName: formData.firmName.trim() || null,
      contactPerson: formData.contactPerson.trim() || null,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
      serviceType: formData.serviceType.trim() || null,
      notes: formData.notes.trim() || null,
    };

    setSaving(true);
    try {
      if (editingPartyId) {
        const updated = await relatedPartyService.updateRelatedParty(editingPartyId, payload);
        setParties((prev) => prev.map((p) => (p.id === editingPartyId ? updated : p)));
        addToast(`Related party "${formData.name}" updated.`, 'success');
      } else {
        const created = await relatedPartyService.createRelatedParty(payload);
        setParties((prev) => [created, ...prev]);
        addToast(`Related party "${created.name}" linked as ${created.roleLabel}.`, 'success');
      }
      setIsAddModalOpen(false);
      setEditingPartyId(null);
      setFormData({ ...EMPTY_FORM });
    } catch (err) {
      addToast(err?.message || 'Failed to persist related party record.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteParty = async (partyId, partyName) => {
    try {
      await relatedPartyService.deleteRelatedParty(partyId);
      setParties((prev) => prev.filter((p) => p.id !== partyId));
      addToast(`Related party "${partyName}" removed.`, 'info');
    } catch (err) {
      addToast(err?.message || 'Failed to delete related party record.', 'error');
    }
  };

  const filteredParties = parties.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.aliases && p.aliases.toLowerCase().includes(q)) ||
      (p.contactPerson && p.contactPerson.toLowerCase().includes(q)) ||
      (p.firmName && p.firmName.toLowerCase().includes(q)) ||
      (p.roleLabel && p.roleLabel.toLowerCase().includes(q));

    const matchesRole = selectedRoleFilter === 'ALL' || p.roleId === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roleId, label) => {
    const found = RELATED_PARTY_ROLES.find((r) => r.id === roleId);
    const colorClass = found ? found.badgeColor : 'bg-slate-100 text-slate-800 border-slate-200';
    return (
      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${colorClass}`}>
        {label || found?.label || roleId}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {migrationPending && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Related parties persistence requires applying the approved MySQL migration (<code className="font-mono">related_parties</code>). Existing records cannot be stored until approved.
          </span>
        </div>
      )}

      <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
            <input
              type="text"
              placeholder="Search related parties, opposing counsel, judges, witnesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D9D6CF] rounded text-[#202A35] focus:outline-none focus:border-[#06244B]"
            />
          </div>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-[#D9D6CF] rounded text-[#202A35] focus:outline-none focus:border-[#06244B]"
          >
            <option value="ALL">All Party Roles ({parties.length})</option>
            {RELATED_PARTY_ROLES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleOpenAdd}
          className="flex-shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          <span>Add Related Party</span>
        </Button>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded border border-[#D9D6CF] text-center text-xs text-[#667085]">
          Loading related parties...
        </div>
      ) : filteredParties.length === 0 ? (
        <div className="bg-white p-8 rounded border border-dashed border-[#D9D6CF] text-center">
          <Users className="w-10 h-10 text-[#667085] mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-semibold text-[#06244B]">No Related Parties Found</h4>
          <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No entities matched your search filters. Clear search to view all linked parties.'
              : 'Add opposing parties, trial counsel, judges, expert witnesses, or insurers to persist conflict-indexed records.'}
          </p>
          <Button size="xs" variant="outline" onClick={handleOpenAdd} className="mt-3">
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            Add First Related Party
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredParties.map((party) => (
            <div
              key={party.id}
              className="bg-white rounded border border-[#D9D6CF] hover:border-[#06244B]/40 transition-all p-4 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {getRoleBadge(party.roleId, party.roleLabel)}
                      {party.serviceType && (
                        <span className="text-[9px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {party.serviceType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-serif font-bold text-[#06244B]">{party.name}</h3>
                    {party.aliases && (
                      <p className="text-[11px] text-[#667085]">Aliases: {party.aliases}</p>
                    )}
                    {party.firmName && (
                      <p className="text-xs text-[#667085] flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-[#A4432B]" />
                        <span>{party.firmName}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditParty(party)}
                      className="text-[#667085] hover:text-[#06244B] p-1 cursor-pointer transition-colors"
                      title="Edit Related Party"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteParty(party.id, party.name)}
                      className="text-[#667085] hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Unlink Party"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F5F0E5] space-y-1.5 text-xs text-[#202A35]">
                  {party.contactPerson && (
                    <div className="flex items-center gap-1.5 text-[#667085]">
                      <span className="text-[10px] uppercase font-semibold text-[#667085]/80">Contact:</span>
                      <span className="font-medium text-[#06244B]">{party.contactPerson}</span>
                    </div>
                  )}

                  {party.email && (
                    <div className="flex items-center gap-1.5 text-[#667085] truncate">
                      <Mail className="w-3 h-3 text-[#A4432B] flex-shrink-0" />
                      <a href={`mailto:${party.email}`} className="hover:underline truncate">{party.email}</a>
                    </div>
                  )}

                  {party.phone && (
                    <div className="flex items-center gap-1.5 text-[#667085]">
                      <Phone className="w-3 h-3 text-[#A4432B] flex-shrink-0" />
                      <span>{party.phone}</span>
                    </div>
                  )}

                  {party.address && (
                    <div className="flex items-start gap-1.5 text-[#667085]">
                      <MapPin className="w-3 h-3 text-[#A4432B] flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{party.address}</span>
                    </div>
                  )}

                  {party.notes && (
                    <div className="mt-2 p-2 bg-[#F5F0E5]/60 rounded text-[11px] text-[#667085] border border-[#D9D6CF]/60">
                      <strong className="text-[#06244B] font-semibold">Role Notes: </strong>
                      {party.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#D9D6CF]/40 flex items-center justify-between text-[10px] text-[#667085]">
                <span>Linked {party.createdAt ? formatDate(party.createdAt, { short: true }) : ''}</span>
                <span className="text-[#06244B] font-semibold">Indexed for Conflict Search</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingPartyId ? 'Update Related Party' : 'Link Related Party or Adverse Entity'}
          size="lg"
        >
          <form onSubmit={handleSaveParty} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#06244B] mb-1">
                  Party or Organization Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Interstate Freightlines Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#06244B] mb-1">
                  Litigation Role Taxonomy *
                </label>
                <Select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  options={RELATED_PARTY_ROLES.map((r) => ({ value: r.id, label: r.label }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#06244B] mb-1">
                  Known Aliases / DBA (For Conflict Check)
                </label>
                <Input
                  placeholder="Optional alternate names or former surnames"
                  value={formData.aliases}
                  onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#06244B] mb-1">
                  Service / Notice Method
                </label>
                <Input
                  placeholder="e.g. Electronic Notice (ECF), Personal Service"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#06244B] mb-1">
                  Law Firm / Company Entity
                </label>
                <Input
                  placeholder="Optional firm or insurer name"
                  value={formData.firmName}
                  onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#06244B] mb-1">
                  Primary Contact Person / Title
                </label>
                <Input
                  placeholder="Optional adjuster or partner contact"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#06244B] mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="contact@entity.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#06244B] mb-1">Phone Number</label>
                <Input
                  placeholder="(801) 555-0199"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#06244B] mb-1">
                Formal Service / Mailing Address
              </label>
              <Input
                placeholder="Street address, Suite, City, State, ZIP"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#06244B] mb-1">
                Representation &amp; Conflict Notes
              </label>
              <textarea
                rows={2}
                placeholder="Specify relationship, cross-claims, expert retainer terms, or adverse posture..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-[#D9D6CF] rounded text-[#202A35] focus:outline-none focus:border-[#06244B]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D6CF]">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? 'Saving...' : editingPartyId ? 'Update Related Party' : 'Save & Link Party'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
