import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  ShieldAlert,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  ArrowRight,
  UserPlus,
  Sparkles,
  FileText,
  FileCheck,
  Send,
  Building,
  Scale
} from 'lucide-react';
import { useClients } from '../../../context/ClientContext';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PRACTICE_AREAS } from '../../../data/practiceAreas';
import { formatDate } from '../../../utils/formatDate';
import { ConflictSearchModal } from '../components/ConflictSearchModal';
import { EngagementLetterModal } from '../../clients/components/EngagementLetterModal';
import { SignatureTrackingModal } from '../../documents/components/SignatureTrackingModal';
import { EndToEndDemoWizard } from '../components/EndToEndDemoWizard';

export function IntakeList() {
  const navigate = useNavigate();
  const { intakes, addIntake, updateConflictCheck, addClient } = useClients();
  const { currentUser } = useAuth();
  const permissions = usePermissions();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState(null);

  // Phase 1 Enhanced Modals
  const [isConflictSearchOpen, setIsConflictSearchOpen] = useState(false);
  const [conflictSearchTarget, setConflictSearchTarget] = useState('');
  const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDemoWizardOpen, setIsDemoWizardOpen] = useState(false);

  // New Intake Form State with Practice Area Questionnaire Fields
  const [formData, setFormData] = useState({
    prospectiveClient: '',
    contactPerson: '',
    email: '',
    phone: '',
    practiceAreaId: PRACTICE_AREAS[0]?.id || '',
    adverseParties: '',
    matterSummary: '',
    disputeAmount: '75000',
    jurisdictionVenue: 'Utah Third Judicial District Court (Salt Lake County)',
    practiceSpecificDetail: '',
  });

  const handleCreateIntake = async (e) => {
    e.preventDefault();
    if (!formData.prospectiveClient.trim() || !formData.email.trim()) {
      addToast('Please complete all required intake fields.', 'error');
      return;
    }

    try {
      const pa = PRACTICE_AREAS.find(p => p.id === formData.practiceAreaId);
      const payload = {
        ...formData,
        disputeAmount: Number(formData.disputeAmount) || 0,
        practiceAreaName: pa?.name || 'General Legal Practice',
      };
      await addIntake(payload);

      addToast(`New intake file created for "${formData.prospectiveClient}". Ready for Conflict Check.`, 'success');
      setIsAddModalOpen(false);
      setFormData({
        prospectiveClient: '',
        contactPerson: '',
        email: '',
        phone: '',
        practiceAreaId: PRACTICE_AREAS[0]?.id || '',
        adverseParties: '',
        matterSummary: '',
        disputeAmount: '75000',
        jurisdictionVenue: 'Utah Third Judicial District Court (Salt Lake County)',
        practiceSpecificDetail: '',
      });
    } catch (err) {
      addToast(err?.message || 'Failed to create intake record. Please verify all fields.', 'error');
    }
  };

  const handleSetConflictStatus = (intakeId, status) => {
    updateConflictCheck(intakeId, status, currentUser.name);
    addToast(`Conflict check marked as "${status}" by ${currentUser.name}.`, status === 'Cleared' ? 'success' : 'warning');
    if (selectedIntake?.id === intakeId) {
      setSelectedIntake(prev => ({ ...prev, conflictStatus: status, reviewedBy: currentUser.name }));
    }
  };

  const handleConvertClient = (intake) => {
    const newClient = addClient({
      name: intake.prospectiveClient,
      primaryContact: intake.contactPerson,
      email: intake.email,
      phone: intake.phone,
      type: 'Organization',
      assignedAttorneyId: currentUser.id,
      assignedAttorneyName: currentUser.name,
      status: 'Active',
      notes: `Converted from Intake ${intake.id}. Adverse Parties cleared: ${intake.adverseParties}`,
    });

    addToast(`Client record created: ${newClient.name} (${newClient.id}). Opening matter workflow...`, 'success');
    setSelectedIntake(null);
    navigate(`/clients/${newClient.id}`);
  };

  const columns = [
    {
      key: 'id',
      label: 'Intake ID',
      sortable: true,
      render: (val, row) => <span className="text-xs font-bold text-[#A4432B]">{row.intakeNumber || val}</span>,
    },
    {
      key: 'prospectiveClient',
      label: 'Prospective Client & Contact',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-[#06244B] block">{val}</span>
          <span className="text-[11px] text-[#667085]">{row.contactPerson} • {row.email}</span>
        </div>
      ),
    },
    {
      key: 'practiceAreaName',
      label: 'Practice Area',
      render: (val) => <span className="text-xs text-[#202A35]">{val}</span>,
    },
    {
      key: 'adverseParties',
      label: 'Adverse Parties for Conflict Check',
      render: (val) => (
        <span className="text-xs text-[#B42318] font-medium max-w-[220px] block truncate" title={val}>
          {val || 'None identified'}
        </span>
      ),
    },
    {
      key: 'conflictStatus',
      label: 'Conflict Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'reviewedBy',
      label: 'Reviewer',
      render: (val, row) => (
        <div className="text-xs">
          <span className="text-[#06244B] font-semibold">{val || 'Pending Review'}</span>
          {row.reviewedAt && <span className="text-[10px] text-[#667085] block">{formatDate(row.reviewedAt, { short: true })}</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Review',
      align: 'right',
      render: (val, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedIntake(row)}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intake &amp; Conflict Checks"
        subtitle="End-to-end prospective client intake screening, adverse party conflict checks (RPC 1.7), and matter clearance."
        breadcrumbs={[{ label: 'Clients & Matters', to: '/clients' }, { label: 'Intake & Conflicts' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDemoWizardOpen(true)}
              className="border-[#A4432B] text-[#A4432B] hover:bg-[#A4432B]/10 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#A4432B]" />
              End-to-End Walkthrough
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              New Intake Form
            </Button>
          </div>
        }
      />

      {/* Workflow Explainer Banner */}
      <div className="p-4 bg-white rounded border border-[#D9D6CF] shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#F5F0E5] text-[#A4432B]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#06244B]">
              Standard Firm Clearance Flow
            </h3>
            <p className="text-xs text-[#667085]">
              1. Enter Prospective Client &rarr; 2. Screen Adverse Parties &rarr; 3. Partner Reviews Conflict &rarr; 4. Convert to Active Client &amp; Open Matter.
            </p>
          </div>
        </div>
      </div>

      {/* Intakes Table */}
      <DataTable
        columns={columns}
        data={intakes}
        pageSize={10}
        onRowClick={(row) => setSelectedIntake(row)}
      />

      {/* Review Intake & Conflict Modal */}
      <Modal
        isOpen={Boolean(selectedIntake)}
        onClose={() => setSelectedIntake(null)}
        title={`Conflict Review: ${selectedIntake?.prospectiveClient}`}
        subtitle={`Intake ID: ${selectedIntake?.id} • Created on ${formatDate(selectedIntake?.createdAt)}`}
        maxWidth="max-w-2xl"
      >
        {selectedIntake && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF]">
              <div>
                <span className="text-[#667085] font-semibold block uppercase text-[10px]">Prospective Client:</span>
                <p className="font-bold text-sm text-[#06244B]">{selectedIntake.prospectiveClient}</p>
                <p className="text-[#667085]">{selectedIntake.contactPerson}</p>
              </div>
              <div>
                <span className="text-[#667085] font-semibold block uppercase text-[10px]">Contact Info:</span>
                <p>{selectedIntake.email}</p>
                <p>{selectedIntake.phone}</p>
              </div>
            </div>

            <div>
              <span className="text-[#667085] font-semibold block uppercase text-[10px]">Practice Area:</span>
              <p className="font-bold text-[#06244B] text-sm">{selectedIntake.practiceAreaName}</p>
            </div>

            <div>
              <span className="text-[#B42318] font-bold block uppercase text-[10px]">Adverse Parties / Entities Screened:</span>
              <div className="p-3 bg-red-50 text-[#B42318] rounded border border-red-200 font-semibold mt-1">
                {selectedIntake.adverseParties || 'None specified'}
              </div>
            </div>

            <div>
              <span className="text-[#667085] font-semibold block uppercase text-[10px]">Matter Summary &amp; Scope:</span>
              <p className="p-3 bg-white border border-[#D9D6CF] rounded mt-1 leading-relaxed">
                {selectedIntake.matterSummary || 'No details provided.'}
              </p>
            </div>

            <div className="p-3 rounded border border-[#D9D6CF] bg-white flex items-center justify-between">
              <div>
                <span className="text-[#667085] font-semibold uppercase text-[10px] block">Current Conflict Status:</span>
                <div className="mt-1"><StatusBadge status={selectedIntake.conflictStatus} /></div>
              </div>
              {selectedIntake.reviewedBy && (
                <div className="text-right">
                  <span className="text-[#667085] text-[10px] block">Reviewed by:</span>
                  <span className="font-bold text-[#06244B]">{selectedIntake.reviewedBy}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#D9D6CF] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#06244B] hover:bg-[#0B356D] text-white"
                  onClick={() => {
                    setConflictSearchTarget(selectedIntake.adverseParties || selectedIntake.prospectiveClient);
                    setIsConflictSearchOpen(true);
                  }}
                >
                  <Search className="w-3.5 h-3.5 mr-1" />
                  Run RPC 1.7 Conflict Check
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEngagementModalOpen(true)}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Engagement Letter
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSignatureModalOpen(true)}
                >
                  <FileCheck className="w-3.5 h-3.5 mr-1" />
                  E-Sign Status
                </Button>
              </div>

              {selectedIntake.conflictStatus === 'Cleared' && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={UserPlus}
                  onClick={() => handleConvertClient(selectedIntake)}
                >
                  Convert to Client &amp; Open Matter
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* New Intake Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="New Prospective Client Intake"
        subtitle="Capture entity information and adverse parties for immediate conflict search."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateIntake} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Prospective Client Entity / Name"
                required
                value={formData.prospectiveClient}
                onChange={(e) => setFormData({ ...formData, prospectiveClient: e.target.value })}
                placeholder="e.g. Clearwater Basin Agricultural Water Co."
              />
            </div>

            <div>
              <Input
                label="Primary Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. LeRoy Jenkins (President)"
              />
            </div>

            <div>
              <Select
                label="Practice Area"
                value={formData.practiceAreaId}
                onChange={(e) => setFormData({ ...formData, practiceAreaId: e.target.value })}
                options={PRACTICE_AREAS.map(p => ({ value: p.id, label: p.name }))}
              />
            </div>

            <div>
              <Input
                label="Contact Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@entity.com"
              />
            </div>

            <div>
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(801) 555-0100"
              />
            </div>

            <div>
              <Input
                label="Estimated Matter Valuation ($)"
                value={formData.disputeAmount}
                onChange={(e) => setFormData({ ...formData, disputeAmount: e.target.value })}
                placeholder="e.g. 150000"
              />
            </div>

            <div>
              <Input
                label="Jurisdiction / Court Venue"
                value={formData.jurisdictionVenue}
                onChange={(e) => setFormData({ ...formData, jurisdictionVenue: e.target.value })}
                placeholder="e.g. Utah Third District Court"
              />
            </div>

            {/* Dynamic Practice-Specific Questionnaire Block (PA-02, PA-03, PA-04) */}
            <div className="sm:col-span-2 p-3 bg-[#F5F0E5]/80 rounded border border-[#D9D6CF] space-y-2">
              <span className="font-bold text-xs text-[#06244B] block">
                {formData.practiceAreaId === 'pa-2' && 'Family Law Specialized Intake: Minor Children & Custody'}
                {formData.practiceAreaId === 'pa-3' && 'Criminal Defense Intake: Charges, Arraignment & Bail Status'}
                {formData.practiceAreaId === 'pa-4' && 'Estate Planning Intake: Beneficiaries & Asset Inventory'}
                {formData.practiceAreaId === 'pa-5' && 'Commercial / Corporate Intake: Entity Structure & Governance'}
                {formData.practiceAreaId === 'pa-6' && 'Real Estate & Water Rights Intake: Parcel PIN & Water Decrees'}
                {formData.practiceAreaId === 'pa-7' && 'Personal Injury Intake: Incident Date, Insurer & Liens'}
                {!['pa-2', 'pa-3', 'pa-4', 'pa-5', 'pa-6', 'pa-7'].includes(formData.practiceAreaId) && 'Specialized Practice Intake Questionnaire'}
              </span>
              <Input
                label={
                  formData.practiceAreaId === 'pa-2' ? 'Children Details (Names, DOBs, Current Custody)' :
                  formData.practiceAreaId === 'pa-3' ? 'Arresting Agency, Citation # & Arraignment Date' :
                  formData.practiceAreaId === 'pa-4' ? 'Primary Fiduciary / Trustee & Real Property Addresses' :
                  formData.practiceAreaId === 'pa-5' ? 'State of Incorporation & Ownership % Split' :
                  formData.practiceAreaId === 'pa-6' ? 'Utah County Parcel # (PIN) & Water Right # (e.g. 55-1234)' :
                  formData.practiceAreaId === 'pa-7' ? 'Accident Date, Insurer Claim # & Hospital / Medical Lienholders' :
                  'Practice Area Custom Attributes & Statutory Notes'
                }
                value={formData.practiceSpecificDetail}
                onChange={(e) => setFormData({ ...formData, practiceSpecificDetail: e.target.value })}
                placeholder="Enter practice-specific intake responses..."
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Adverse Parties &amp; Associated Entities (For Conflict Search)"
                required
                value={formData.adverseParties}
                onChange={(e) => setFormData({ ...formData, adverseParties: e.target.value })}
                placeholder="List opposing parties, adverse corporations, known affiliates..."
                helperText="Names will be cross-checked against active and prior firm representations."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Matter Overview &amp; Representation Request
              </label>
              <textarea
                rows={3}
                value={formData.matterSummary}
                onChange={(e) => setFormData({ ...formData, matterSummary: e.target.value })}
                placeholder="Summarize the legal dispute, proposed transaction, or administrative relief sought..."
                className="w-full text-sm p-3 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Submit for Conflict Clearance
            </Button>
          </div>
        </form>
      </Modal>

      {/* Conflict Search Engine Modal */}
      {isConflictSearchOpen && (
        <ConflictSearchModal
          isOpen={isConflictSearchOpen}
          onClose={() => setIsConflictSearchOpen(false)}
          initialQuery={conflictSearchTarget}
          intakeId={selectedIntake?.id}
          onConflictResolved={(disposition, reviewer, notes) => {
            if (selectedIntake) {
              handleSetConflictStatus(selectedIntake.id, disposition);
            }
          }}
        />
      )}

      {/* Engagement Letter Generator Modal */}
      {isEngagementModalOpen && selectedIntake && (
        <EngagementLetterModal
          isOpen={isEngagementModalOpen}
          onClose={() => setIsEngagementModalOpen(false)}
          clientName={selectedIntake.prospectiveClient}
          contactPerson={selectedIntake.contactPerson || selectedIntake.prospectiveClient}
          email={selectedIntake.email}
          matterTitle={selectedIntake.matterSummary || `${selectedIntake.practiceAreaName} Representation`}
          practiceAreaName={selectedIntake.practiceAreaName}
          attorneyName={currentUser?.name || 'Thomas Bludworth, Esq.'}
          onDispatchSignature={() => {
            setIsSignatureModalOpen(true);
          }}
        />
      )}

      {/* E-Signature Tracking Modal */}
      {isSignatureModalOpen && selectedIntake && (
        <SignatureTrackingModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          signerName={selectedIntake.contactPerson || selectedIntake.prospectiveClient}
          signerEmail={selectedIntake.email}
          initialStatus="Sent"
          onSignedSuccessfully={() => {
            handleSetConflictStatus(selectedIntake.id, 'Cleared');
          }}
        />
      )}

      {/* End-to-End Walkthrough Demo Wizard */}
      {isDemoWizardOpen && (
        <EndToEndDemoWizard
          isOpen={isDemoWizardOpen}
          onClose={() => setIsDemoWizardOpen(false)}
        />
      )}
    </div>
  );
}

