import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  UserCheck,
  Plus,
  Search,
  UserPlus,
  Sparkles,
  FileText,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import { useClients } from '../../../context/ClientContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PRACTICE_AREAS, normalizePracticeAreaId } from '../../../data/practiceAreas';
import { formatDate } from '../../../utils/formatDate';
import { ConflictSearchModal } from '../components/ConflictSearchModal';
import { EngagementLetterModal } from '../../clients/components/EngagementLetterModal';
import { SignatureTrackingModal } from '../../documents/components/SignatureTrackingModal';
import { EndToEndDemoWizard } from '../components/EndToEndDemoWizard';
import { PIIntakeQuestionnaire } from '../components/PIIntakeQuestionnaire';
import {
  serializePIIntakeData,
  parsePIIntakeData,
  EMPTY_PI_DATA,
  getCleanMatterSummary,
} from '../utils/piIntakeHelper';

const PRACTICE_PROMPTS = {
  'pa-civ': {
    heading: 'Civil / Commercial Litigation Intake Details',
    label: 'Claims, Contract / Entity Dispute Details & Statutory Tolling Notes',
  },
  'pa-fam': {
    heading: 'Family Law Specialized Intake: Minor Children & Custody',
    label: 'Children Details (Names, DOBs, Current Custody & Property Overview)',
  },
  'pa-crim': {
    heading: 'Criminal Defense Intake: Charges, Arraignment & Bail Status',
    label: 'Arresting Agency, Citation / Docket # & Next Hearing Date',
  },
  'pa-prob': {
    heading: 'Probate & Estate Administration Intake',
    label: 'Decedent Name, Date of Death, Will Status & Primary Fiduciary',
  },
  'pa-bk': {
    heading: 'Bankruptcy Intake: Chapter, Household Size & Creditor Summary',
    label: 'Proposed Chapter (7/13), Priority Creditors & Foreclosure/Garnishment Urgency',
  },
  'pa-evict': {
    heading: 'Landlord-Tenant / Evictions Intake',
    label: 'Property Address, Lease Balance & 3-Day/15-Day Notice Service Status',
  },
  'pa-imm': {
    heading: 'Immigration Intake: Petitioner, Beneficiary & Filing Category',
    label: 'Visa / Petition Type (I-130, I-485, N-400), Current Status & Expiry Dates',
  },
  'pa-app': {
    heading: 'Appellate Practice Intake',
    label: 'Lower Court Name, Final Order Date & Notice of Appeal Deadline',
  },
};

const EMPTY_FORM_STATE = {
  prospectiveClient: '',
  contactPerson: '',
  email: '',
  phone: '',
  practiceAreaId: PRACTICE_AREAS[0]?.id || 'pa-civ',
  adverseParties: '',
  matterSummary: '',
  disputeAmount: '',
  jurisdictionVenue: '',
  practiceSpecificDetail: '',
};

const isClearedForConversion = (status) =>
  ['Cleared', 'Waiver Obtained', 'Review Completed'].includes(status);

export function IntakeList() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    intakes,
    addIntake,
    updateConflictCheck,
    convertIntakeToClient,
    refreshIntakes,
  } = useClients();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState(null);
  const [convertingIntakeId, setConvertingIntakeId] = useState(null);

  useEffect(() => {
    if (location.search.includes('openIntake=true') || location.search.includes('new=true')) {
      setIsAddModalOpen(true);
    }
  }, [location.search]);

  const [isConflictSearchOpen, setIsConflictSearchOpen] = useState(false);
  const [conflictSearchTarget, setConflictSearchTarget] = useState('');
  const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDemoWizardOpen, setIsDemoWizardOpen] = useState(false);

  const [formData, setFormData] = useState({ ...EMPTY_FORM_STATE });
  const [piData, setPiData] = useState({ ...EMPTY_PI_DATA });

  const canonicalPAId = normalizePracticeAreaId(formData.practiceAreaId) || formData.practiceAreaId;
  const isPI = canonicalPAId === 'pa-pi';
  const promptConfig = PRACTICE_PROMPTS[canonicalPAId] || {
    heading: 'Specialized Practice Intake Questionnaire',
    label: 'Practice Area Custom Attributes & Statutory Notes',
  };

  // Keep modal selection synchronized with refreshed intakes list
  useEffect(() => {
    if (!selectedIntake?.id) return;
    const latest = intakes.find((item) => item.id === selectedIntake.id);
    if (latest) {
      setSelectedIntake(latest);
    }
  }, [intakes, selectedIntake?.id]);

  const handleCreateIntake = async (e) => {
    e.preventDefault();
    if (!formData.prospectiveClient.trim() || !formData.email.trim()) {
      addToast('Please complete all required intake fields.', 'error');
      return;
    }

    try {
      const pa = PRACTICE_AREAS.find((p) => p.id === canonicalPAId);

      let finalAdverse = formData.adverseParties.trim();
      if (isPI) {
        const adverseList = [];
        if (finalAdverse) adverseList.push(finalAdverse);
        if (piData.opposingParties && !finalAdverse.includes(piData.opposingParties)) {
          adverseList.push(piData.opposingParties);
        }
        if (piData.insuranceCompany && !finalAdverse.includes(piData.insuranceCompany)) {
          adverseList.push(piData.insuranceCompany);
        }
        finalAdverse = adverseList.join(', ');
      }

      let baseSummary = formData.matterSummary.trim();
      if (!isPI && formData.practiceSpecificDetail.trim()) {
        baseSummary = baseSummary
          ? `${baseSummary}\n\nPractice-Specific Details (${pa?.name || 'General'}): ${formData.practiceSpecificDetail.trim()}`
          : `${pa?.name || 'Practice'} Details: ${formData.practiceSpecificDetail.trim()}`;
      }

      const finalMatterSummary = isPI
        ? serializePIIntakeData(piData, baseSummary)
        : baseSummary;

      const payload = {
        prospectiveClient: formData.prospectiveClient.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        practiceAreaId: canonicalPAId,
        adverseParties: finalAdverse || 'None identified',
        matterSummary: finalMatterSummary || 'Prospective client intake record.',
        disputeAmount: formData.disputeAmount ? Number(formData.disputeAmount) : 0,
        jurisdictionVenue: formData.jurisdictionVenue.trim() || undefined,
      };
      const created = await addIntake(payload);

      addToast(
        created?.conflictStatus === 'Conflict Identified'
          ? `Intake created (${created.intakeNumber}): Potential conflict detected during automated scan. Review required.`
          : `Intake created (${created?.intakeNumber || formData.prospectiveClient}). Initial scan complete — run/complete conflict review before conversion.`,
        created?.conflictStatus === 'Conflict Identified' ? 'warning' : 'success'
      );
      setIsAddModalOpen(false);
      setFormData({ ...EMPTY_FORM_STATE });
      setPiData({ ...EMPTY_PI_DATA });
    } catch (err) {
      addToast(err?.message || 'Failed to create intake record. Please verify all fields.', 'error');
    }
  };

  const handleSetConflictStatus = async (intakeId, status, reviewerName, notes) => {
    try {
      const result = await updateConflictCheck(intakeId, status, reviewerName || currentUser?.name, notes);
      const updated = result?.intake;
      if (selectedIntake?.id === intakeId && updated) {
        setSelectedIntake(updated);
      }
      addToast(
        `Conflict review saved as "${updated?.conflictStatus || status}".`,
        isClearedForConversion(updated?.conflictStatus || status) ? 'success' : 'warning'
      );
      return result;
    } catch (err) {
      addToast(err?.message || 'Failed to save conflict review decision on server.', 'error');
      throw err;
    }
  };

  const handleConvertClient = async (intake) => {
    if (intake.convertedMatterId) {
      setSelectedIntake(null);
      navigate(`/matters/${intake.convertedMatterId}`);
      return;
    }
    if (intake.convertedToClient && intake.convertedClientId) {
      setSelectedIntake(null);
      navigate(`/clients/${intake.convertedClientId}?intakeId=${intake.id}&openMatter=true`);
      return;
    }

    setConvertingIntakeId(intake.id);
    try {
      const normalizedPA = normalizePracticeAreaId(intake.practiceAreaId);
      const isPIIntake =
        normalizedPA === 'pa-pi' ||
        intake.practiceAreaName?.toLowerCase().includes('personal injury');

      const result = await convertIntakeToClient(intake.id, {
        clientType: isPIIntake ? 'Individual' : 'Organization',
        ...(currentUser?.id ? { assignedAttorneyId: currentUser.id } : {}),
      });

      const createdClient = result?.client;
      if (!createdClient?.id) {
        throw new Error('Conversion did not return a valid client record.');
      }

      addToast(
        `Intake ${intake.intakeNumber || ''} converted to Client ${createdClient.clientNumber || createdClient.name}. Opening matter creation...`,
        'success'
      );
      setSelectedIntake(null);
      navigate(`/clients/${createdClient.id}?intakeId=${intake.id}&openMatter=true`);
    } catch (err) {
      addToast(err?.message || 'Failed to convert intake to client.', 'error');
    } finally {
      setConvertingIntakeId(null);
    }
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
          <span className="text-[11px] text-[#667085]">
            {row.contactPerson ? `${row.contactPerson} • ` : ''}
            {row.email}
          </span>
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
      key: 'convertedToClient',
      label: 'Conversion',
      render: (val, row) => {
        if (row.convertedMatterId) {
          return (
            <Link
              to={`/matters/${row.convertedMatterId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {row.convertedMatterNumber || 'Matter Opened'}
            </Link>
          );
        }
        if (row.convertedToClient && row.convertedClientId) {
          return (
            <Link
              to={`/clients/${row.convertedClientId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-[#06244B] hover:underline inline-flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              {row.convertedClientNumber || 'Client Created'}
            </Link>
          );
        }
        return <span className="text-[11px] text-[#667085]">Pre-Conversion</span>;
      },
    },
    {
      key: 'reviewedBy',
      label: 'Reviewer',
      render: (val, row) => {
        const reviewerText = row.reviewedByName || row.reviewedBy || 'Pending Review';
        return (
          <div className="text-xs">
            <span className="text-[#06244B] font-semibold">{reviewerText}</span>
            {row.reviewedAt && (
              <span className="text-[10px] text-[#667085] block">
                {formatDate(row.reviewedAt, { short: true })}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Review',
      align: 'right',
      render: (val, row) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedIntake(row)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intake & Conflict Checks"
        subtitle="End-to-end prospective client intake screening, adverse party conflict checks (Utah RPC 1.7), and conversion to client & matter."
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
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
              New Intake Form
            </Button>
          </div>
        }
      />

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
              1. Register Intake &rarr; 2. Run Multi-Entity Conflict Search &rarr; 3. Record Reviewer Determination &rarr; 4. Convert to Client &amp; Open Matter.
            </p>
          </div>
        </div>
      </div>

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
        subtitle={`Intake ID: ${selectedIntake?.intakeNumber || selectedIntake?.id} • Created on ${formatDate(selectedIntake?.createdAt)}`}
        maxWidth="max-w-2xl"
      >
        {selectedIntake && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF]">
              <div>
                <span className="text-[#667085] font-semibold block uppercase text-[10px]">Prospective Client:</span>
                <p className="font-bold text-sm text-[#06244B]">{selectedIntake.prospectiveClient}</p>
                {selectedIntake.contactPerson && <p className="text-[#667085]">{selectedIntake.contactPerson}</p>}
              </div>
              <div>
                <span className="text-[#667085] font-semibold block uppercase text-[10px]">Contact Info:</span>
                <p>{selectedIntake.email}</p>
                <p>{selectedIntake.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[#667085] font-semibold block uppercase text-[10px]">Practice Area:</span>
                <p className="font-bold text-[#06244B] text-sm">{selectedIntake.practiceAreaName}</p>
              </div>
              {selectedIntake.jurisdictionVenue && (
                <div>
                  <span className="text-[#667085] font-semibold block uppercase text-[10px]">Jurisdiction / Venue:</span>
                  <p className="font-semibold text-[#06244B]">{selectedIntake.jurisdictionVenue}</p>
                </div>
              )}
            </div>

            <div>
              <span className="text-[#B42318] font-bold block uppercase text-[10px]">Adverse Parties / Entities Screened:</span>
              <div className="p-3 bg-red-50 text-[#B42318] rounded border border-red-200 font-semibold mt-1">
                {selectedIntake.adverseParties || 'None specified'}
              </div>
            </div>

            <div>
              <span className="text-[#667085] font-semibold block uppercase text-[10px]">Matter Summary &amp; Scope:</span>
              <p className="p-3 bg-white border border-[#D9D6CF] rounded mt-1 leading-relaxed whitespace-pre-line">
                {getCleanMatterSummary(selectedIntake.matterSummary) || 'No details provided.'}
              </p>
            </div>

            {selectedIntake.matterSummary?.includes('[PI_INTAKE_DATA:') && (() => {
              const pi = parsePIIntakeData(selectedIntake.matterSummary);
              return (
                <div className="p-3 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF] space-y-2 text-xs">
                  <span className="text-[#06244B] font-bold block uppercase text-[11px] border-b border-[#D9D6CF] pb-1">
                    Structured Personal Injury Intake Questionnaire
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#667085] font-semibold block">Incident / Collision:</span>
                      <p className="text-[#06244B] font-medium">
                        {pi.accidentType || 'Not specified'} {pi.accidentDate ? `on ${pi.accidentDate}` : '(Date pending)'}
                      </p>
                      <p className="text-[#667085]">{pi.accidentLocation || 'Location pending'}</p>
                    </div>
                    <div>
                      <span className="text-[#667085] font-semibold block">Adverse Driver &amp; Insurer:</span>
                      <p className="text-[#06244B] font-medium">{pi.opposingParties || 'None identified'}</p>
                      <p className="text-[#667085]">
                        {pi.insuranceCompany
                          ? `${pi.insuranceCompany} (Claim #: ${pi.claimNumber || 'Pending'})`
                          : 'Insurer pending'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#667085] font-semibold block">Reported Injuries:</span>
                      <p className="text-[#06244B]">{pi.knownInjuries || 'Pending medical confirmation'}</p>
                    </div>
                    <div>
                      <span className="text-[#667085] font-semibold block">Treating Providers &amp; Facilities:</span>
                      <p className="text-[#06244B]">{pi.treatingProviders || pi.medicalFacilities || 'Pending provider list'}</p>
                    </div>
                    {pi.outstandingInformation && (
                      <div className="sm:col-span-2 p-2 bg-amber-50 rounded border border-amber-200 text-amber-900">
                        <span className="font-bold block text-[10px] uppercase">Missing / Outstanding Records:</span>
                        <p>{pi.outstandingInformation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="p-3 rounded border border-[#D9D6CF] bg-white flex items-center justify-between">
              <div>
                <span className="text-[#667085] font-semibold uppercase text-[10px] block">Current Conflict Status:</span>
                <div className="mt-1"><StatusBadge status={selectedIntake.conflictStatus} /></div>
                {selectedIntake.conflictNotes && (
                  <p className="text-[11px] text-[#667085] mt-1">{selectedIntake.conflictNotes}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-[#667085] text-[10px] block">Reviewed by:</span>
                <span className="font-bold text-[#06244B]">
                  {selectedIntake.reviewedByName || selectedIntake.reviewedBy || 'Pending Review'}
                </span>
              </div>
            </div>

            {(selectedIntake.convertedClientId || selectedIntake.convertedMatterId) && (
              <div className="p-3 rounded border border-emerald-200 bg-emerald-50 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-emerald-900 block">Conversion Status</span>
                  <span className="text-[11px] text-emerald-800">
                    {selectedIntake.convertedMatterId
                      ? `Converted to Client ${selectedIntake.convertedClientNumber || ''} and Matter ${selectedIntake.convertedMatterNumber || ''}.`
                      : `Converted to Client ${selectedIntake.convertedClientNumber || ''}. Matter not yet opened.`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedIntake.convertedClientId && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={ExternalLink}
                      onClick={() => {
                        setSelectedIntake(null);
                        navigate(`/clients/${selectedIntake.convertedClientId}`);
                      }}
                    >
                      View Client
                    </Button>
                  )}
                  {selectedIntake.convertedMatterId && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Briefcase}
                      onClick={() => {
                        setSelectedIntake(null);
                        navigate(`/matters/${selectedIntake.convertedMatterId}`);
                      }}
                    >
                      Open Matter
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#D9D6CF] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#06244B] hover:bg-[#0B356D] text-white"
                  onClick={() => {
                    setConflictSearchTarget(
                      [selectedIntake.prospectiveClient, selectedIntake.adverseParties].filter(Boolean).join(', ')
                    );
                    setIsConflictSearchOpen(true);
                  }}
                >
                  <Search className="w-3.5 h-3.5 mr-1" />
                  Run RPC 1.7 Conflict Check
                </Button>

                <Button size="sm" variant="outline" onClick={() => setIsEngagementModalOpen(true)}>
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Engagement Letter
                </Button>

                <Button size="sm" variant="outline" onClick={() => setIsSignatureModalOpen(true)}>
                  <FileCheck className="w-3.5 h-3.5 mr-1" />
                  E-Sign Status
                </Button>
              </div>

              {isClearedForConversion(selectedIntake.conflictStatus) && !selectedIntake.convertedMatterId && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={UserPlus}
                  disabled={convertingIntakeId === selectedIntake.id}
                  onClick={() => handleConvertClient(selectedIntake)}
                >
                  {selectedIntake.convertedClientId
                    ? 'Open Matter from Intake'
                    : convertingIntakeId === selectedIntake.id
                    ? 'Converting...'
                    : 'Convert to Client & Open Matter'}
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
        subtitle="Capture entity information, practice area details, and adverse parties for conflict screening."
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
                placeholder="e.g. Jordan Taylor"
              />
            </div>

            <div>
              <Input
                label="Primary Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Name & title (if entity)"
              />
            </div>

            <div>
              <Select
                label="Practice Area"
                required
                value={canonicalPAId}
                onChange={(e) => setFormData({ ...formData, practiceAreaId: e.target.value })}
                options={PRACTICE_AREAS.map((pa) => ({ value: pa.id, label: pa.name }))}
              />
            </div>

            <div>
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
              />
            </div>

            <div>
              <Input
                label="Phone Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(801) 555-0100"
              />
            </div>

            <div>
              <Input
                label="Estimated Dispute / Case Value ($)"
                type="number"
                value={formData.disputeAmount}
                onChange={(e) => setFormData({ ...formData, disputeAmount: e.target.value })}
                placeholder="Leave blank if unliquidated / unknown"
              />
            </div>

            <div>
              <Input
                label={isPI ? 'Jurisdiction / Venue (Optional — Leave Blank if Pre-Litigation)' : 'Jurisdiction / Court Venue'}
                value={formData.jurisdictionVenue}
                onChange={(e) => setFormData({ ...formData, jurisdictionVenue: e.target.value })}
                placeholder={isPI ? 'Optional (Pre-litigation)' : 'e.g. Utah Third Judicial District Court'}
              />
            </div>

            {isPI ? (
              <div className="sm:col-span-2">
                <PIIntakeQuestionnaire
                  piData={piData}
                  onChange={(newPiData) => {
                    setPiData(newPiData);
                    if (newPiData.opposingParties && !formData.adverseParties) {
                      setFormData((prev) => ({ ...prev, adverseParties: newPiData.opposingParties }));
                    }
                  }}
                />
              </div>
            ) : (
              <div className="sm:col-span-2 p-3 bg-[#F5F0E5]/80 rounded border border-[#D9D6CF] space-y-2">
                <span className="font-bold text-xs text-[#06244B] block">{promptConfig.heading}</span>
                <Input
                  label={promptConfig.label}
                  value={formData.practiceSpecificDetail}
                  onChange={(e) => setFormData({ ...formData, practiceSpecificDetail: e.target.value })}
                  placeholder="Enter practice-specific intake responses..."
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <Input
                label="Adverse Parties & Associated Entities (For Conflict Search)"
                required
                value={formData.adverseParties}
                onChange={(e) => setFormData({ ...formData, adverseParties: e.target.value })}
                placeholder="List opposing parties, adverse corporations, insurers, or witnesses..."
                helperText="Preserved and screened against clients, matters, intakes, related parties, and incident/party records."
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
                placeholder="Summarize the legal dispute, incident background, or representation scope..."
                className="w-full text-sm p-3 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Submit Intake &amp; Run Initial Scan
            </Button>
          </div>
        </form>
      </Modal>

      {isConflictSearchOpen && (
        <ConflictSearchModal
          isOpen={isConflictSearchOpen}
          onClose={() => {
            setIsConflictSearchOpen(false);
            refreshIntakes();
          }}
          initialQuery={conflictSearchTarget}
          intakeId={selectedIntake?.id}
          onConflictResolved={async (disposition, reviewer, notes) => {
            if (selectedIntake) {
              await handleSetConflictStatus(selectedIntake.id, disposition, reviewer, notes);
            }
          }}
        />
      )}

      {isEngagementModalOpen && selectedIntake && (
        <EngagementLetterModal
          isOpen={isEngagementModalOpen}
          onClose={() => setIsEngagementModalOpen(false)}
          clientName={selectedIntake.prospectiveClient}
          contactPerson={selectedIntake.contactPerson || selectedIntake.prospectiveClient}
          email={selectedIntake.email}
          matterTitle={getCleanMatterSummary(selectedIntake.matterSummary) || `${selectedIntake.practiceAreaName} Representation`}
          practiceAreaName={selectedIntake.practiceAreaName}
          attorneyName={currentUser?.name || ''}
          onDispatchSignature={() => {
            setIsSignatureModalOpen(true);
          }}
        />
      )}

      {isSignatureModalOpen && selectedIntake && (
        <SignatureTrackingModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          signerName={selectedIntake.contactPerson || selectedIntake.prospectiveClient}
          signerEmail={selectedIntake.email}
          initialStatus="Sent"
          onSignedSuccessfully={() => {
            addToast(`Engagement signature recorded for ${selectedIntake.prospectiveClient}.`, 'info');
          }}
        />
      )}

      {isDemoWizardOpen && (
        <EndToEndDemoWizard
          isOpen={isDemoWizardOpen}
          onClose={() => setIsDemoWizardOpen(false)}
        />
      )}
    </div>
  );
}
