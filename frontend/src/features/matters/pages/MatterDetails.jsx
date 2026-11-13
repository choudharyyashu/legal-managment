import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Briefcase,
  User,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Scale,
  Edit,
  Plus,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  FolderOpen,
  CheckSquare,
  Users,
  ShieldCheck,
  Send,
  Globe,
  Landmark,
  Lock,
  Activity,
  Gavel,
  ExternalLink,
  CheckCircle2,
  XCircle,
  GitBranch,
  FileWarning,
  ClipboardList,
  BellRing,
  Check,
  RotateCcw
} from 'lucide-react';
import { useMatters } from '../../../context/MatterContext';
import { useTasks } from '../../../context/TaskContext';
import { useTime } from '../../../context/TimeContext';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../components/ui/Toast';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Tabs } from '../../../components/ui/Tabs';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { MatterForm } from '../forms/MatterForm';
import { TimeEntryForm } from '../../time-tracking/forms/TimeEntryForm';
import { ActivityTimeline } from '../../../components/shared/ActivityTimeline';
import { formatCurrency, formatHours } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { MOCK_DOCUMENTS } from '../../../data/mockDocuments';
import { StageProgressBar } from '../components/StageProgressBar';
import { RelatedPartiesTab } from '../components/RelatedPartiesTab';
import { RelativeDeadlineCalculator } from '../../calendar/components/RelativeDeadlineCalculator';
import { DocumentRequestModal } from '../components/DocumentRequestModal';

const buildInitialNextActions = (matter) => {
  if (!matter) return [];
  const leadAttorney = matter.responsibleAttorneyName || 'Thomas Bludworth, Esq.';
  const staffMember = matter.assignedStaffNames?.[0] || 'Marcus Vance';
  const clientName = matter.clientName || 'Client';

  return [
    {
      id: `${matter.id}-na-1`,
      title: `Serve Supplemental Initial Disclosures (${matter.matterNumber})`,
      description: `Compile updated damages ledger, custodian list, and exhibits for ${clientName} under Utah R. Civ. P. 26.`,
      assignedUser: leadAttorney,
      priority: 'High',
      dueDate: '2026-11-18',
      status: 'In Progress',
    },
    {
      id: `${matter.id}-na-2`,
      title: 'Confirm Witness Availability for Deposition Schedule',
      description: 'Coordinate date windows with opposing counsel and court reporter before Rule 16 discovery cutoff.',
      assignedUser: staffMember,
      priority: 'Urgent',
      dueDate: '2026-11-15',
      status: 'Pending',
    },
    {
      id: `${matter.id}-na-3`,
      title: 'Verify Conflict Screening & Engagement Retainer Ledger',
      description: 'Audit trust balance coverage ahead of scheduled pre-trial conference and expert retention.',
      assignedUser: staffMember,
      priority: 'Medium',
      dueDate: '2026-11-10',
      status: 'Completed',
    },
  ];
};

const buildInitialMissingInfo = (matter) => {
  if (!matter) return [];
  const clientName = matter.clientName || 'Client';
  return [
    {
      id: `${matter.id}-mi-1`,
      fieldOrDocument: 'Executed Custodian Preservation Acknowledgment',
      reasonRequired: 'Required to establish litigation-hold chain of custody before ESI production.',
      requestedFrom: `${clientName} (General Counsel)`,
      requestDate: '2026-11-01',
      status: 'Missing',
      followUpDate: '2026-11-16',
    },
    {
      id: `${matter.id}-mi-2`,
      fieldOrDocument: '2024–2025 Audited Financial & Tax Schedules',
      reasonRequired: 'Needed by forensic damages expert to verify lost-profits baseline calculations.',
      requestedFrom: `${clientName} (CPA / Accounting)`,
      requestDate: '2026-10-26',
      status: 'Follow-up Sent',
      followUpDate: '2026-11-14',
    },
    {
      id: `${matter.id}-mi-3`,
      fieldOrDocument: 'Certified Policy Declarations & Endorsements',
      reasonRequired: 'Confirm applicable liability and excess umbrella coverage limits.',
      requestedFrom: 'Opposing Insurance Carrier / Broker',
      requestDate: '2026-10-18',
      status: 'Received',
      followUpDate: '2026-10-29',
    },
  ];
};

const buildInitialUnresolvedRequests = (matter) => {
  if (!matter) return [];
  return [
    {
      id: `${matter.id}-ur-1`,
      title: 'Third-Party Subpoena Compliance Return (Records Custodian)',
      category: 'Third-Party Evidence',
      requestedFrom: 'Intermountain Telemetry Corp.',
      requestDate: '2026-10-15',
      dueDate: '2026-11-05',
      status: 'Overdue',
      followUpNote: 'First deficiency reminder sent Nov 6; escalate to subpoena meet-and-confer.',
    },
    {
      id: `${matter.id}-ur-2`,
      title: 'Stipulated Protective Order Signature Page',
      category: 'Opposing Counsel Coordination',
      requestedFrom: 'Opposing Counsel (R. Sterling, Esq.)',
      requestDate: '2026-11-03',
      dueDate: '2026-11-19',
      status: 'Pending',
      followUpNote: 'Awaiting redline sign-off prior to e-filing.',
    },
    {
      id: `${matter.id}-ur-3`,
      title: 'Certified Court Hearing Audio & Minute Entry',
      category: 'Court Clerk Request',
      requestedFrom: matter.courtName || 'District Court Clerk',
      requestDate: '2026-10-20',
      dueDate: '2026-11-02',
      status: 'Received',
      followUpNote: 'Transcript audio received; awaiting final verification.',
    },
    {
      id: `${matter.id}-ur-4`,
      title: 'Signed Engagement Fee Addendum & Retainer Top-Up',
      category: 'Client Administration',
      requestedFrom: matter.clientName || 'Client',
      requestDate: '2026-10-10',
      dueDate: '2026-10-22',
      status: 'Resolved',
      followUpNote: 'Executed addendum archived and retainer posted.',
    },
  ];
};

const buildInitialApprovals = (matter) => {
  if (!matter) return [];
  const attorney = matter.responsibleAttorneyName || 'Thomas Bludworth, Esq.';
  const staff = matter.assignedStaffNames?.[0] || 'Marcus Vance';
  return [
    {
      id: `${matter.id}-ap-1`,
      itemName: `Draft First Amended Pleading & Exhibit Index (${matter.matterNumber})`,
      itemType: 'Court Pleading Draft',
      submittedBy: staff,
      submissionDate: '2026-11-10',
      assignedAttorney: attorney,
      status: 'Awaiting Review',
      summary: 'Updated factual allegations and attached Exhibits A–D for attorney review before filing.',
      reviewNotes: '',
    },
    {
      id: `${matter.id}-ap-2`,
      itemName: 'Written Discovery Objections & Privilege Log Draft',
      itemType: 'Discovery Response',
      submittedBy: 'Sarah Jenkins, Esq.',
      submissionDate: '2026-11-09',
      assignedAttorney: attorney,
      status: 'In Review',
      summary: 'Contains 14 privilege log entries under Utah RPC 1.6 and Rule 26(b)(5) requiring lead counsel clearance.',
      reviewNotes: 'Confirm Bates range BATES-0412 to BATES-0438 redaction scope.',
    },
    {
      id: `${matter.id}-ap-3`,
      itemName: 'Pre-Filing Settlement Demand & Damages Schedule',
      itemType: 'Demand / Settlement Letter',
      submittedBy: staff,
      submissionDate: '2026-11-06',
      assignedAttorney: attorney,
      status: 'Changes Requested',
      summary: 'Draft demand package including economic loss tables and statutory fee breakdown.',
      reviewNotes: 'Update pre-judgment interest calculation through November 15 before final approval.',
    },
  ];
};

const buildRelatedCases = (matter, allMatters = []) => {
  if (!matter || !Array.isArray(allMatters)) return [];
  const candidates = allMatters.filter((m) => m.id !== matter.id);
  const relationshipConfigs = [
    { type: 'Related Case', note: 'Shared client & overlapping evidentiary witnesses; separate billing and deadlines.' },
    { type: 'Consolidated Case', note: 'Coordinated discovery schedule only; independent trust ledger and permissions.' },
    { type: 'Lead Case', note: 'Primary docket anchor for procedural stipulations; separate case number.' },
    { type: 'Associated Proceeding', note: 'Parallel administrative/ancillary proceeding linked for conflict tracking.' },
  ];

  // Prioritize same-client matters first, then same court/practice area
  const sortedCandidates = [...candidates].sort((a, b) => {
    const aSameClient = a.clientId === matter.clientId ? 1 : 0;
    const bSameClient = b.clientId === matter.clientId ? 1 : 0;
    if (aSameClient !== bSameClient) return bSameClient - aSameClient;
    const aSameCourt = a.courtName === matter.courtName ? 1 : 0;
    const bSameCourt = b.courtName === matter.courtName ? 1 : 0;
    return bSameCourt - aSameCourt;
  });

  return sortedCandidates.slice(0, 4).map((rel, idx) => ({
    id: `${matter.id}-rel-${rel.id}`,
    relatedMatterId: rel.id,
    matterName: rel.title,
    caseNumber: rel.matterNumber,
    relationshipType: relationshipConfigs[idx % relationshipConfigs.length].type,
    court: rel.courtName || 'N/A',
    currentStatus: rel.status,
    isolationNote: relationshipConfigs[idx % relationshipConfigs.length].note,
  }));
};

export function MatterDetails() {
  const { matterId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { matters, updateMatter } = useMatters();
  const { tasks, addTask, updateTaskStatus } = useTasks();
  const { timeEntries } = useTime();
  const { currentUser } = useAuth();
  const permissions = usePermissions();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogTimeModalOpen, setIsLogTimeModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isRelativeDeadlineOpen, setIsRelativeDeadlineOpen] = useState(false);
  const [isDocumentRequestOpen, setIsDocumentRequestOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskPriority, setNewTaskPriority] = useState('High');

  const matter = matters.find(m => m.id === matterId) || matters[0];

  // Matter-scoped command panels state (reset cleanly when switching matters via Related Cases)
  const [nextActions, setNextActions] = useState(() => buildInitialNextActions(matter));
  const [missingInfoItems, setMissingInfoItems] = useState(() => buildInitialMissingInfo(matter));
  const [unresolvedRequests, setUnresolvedRequests] = useState(() => buildInitialUnresolvedRequests(matter));
  const [approvalItems, setApprovalItems] = useState(() => buildInitialApprovals(matter));

  // Panel filters & modal states
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [newActionForm, setNewActionForm] = useState({
    title: '',
    description: '',
    assignedUser: 'Marcus Vance',
    priority: 'High',
    dueDate: '2026-11-22',
  });
  const [missingFilter, setMissingFilter] = useState('All');
  const [requestFilter, setRequestFilter] = useState('All');

  // Attorney Approval Review / Request Changes modal state
  const [reviewingApproval, setReviewingApproval] = useState(null);
  const [approvalNoteInput, setApprovalNoteInput] = useState('');

  // Litigation / Contested confirmation & workspace drawer state
  const [isLitigationConfirmOpen, setIsLitigationConfirmOpen] = useState(false);
  const [isLitigationWorkspaceOpen, setIsLitigationWorkspaceOpen] = useState(false);

  useEffect(() => {
    if (matter) {
      setNextActions(buildInitialNextActions(matter));
      setMissingInfoItems(buildInitialMissingInfo(matter));
      setUnresolvedRequests(buildInitialUnresolvedRequests(matter));
      setApprovalItems(buildInitialApprovals(matter));
      setMissingFilter('All');
      setRequestFilter('All');
      setReviewingApproval(null);
      setActiveTab('overview');
    }
  }, [matter?.id]);

  const isLitigationActive = Boolean(
    matter?.isLitigationContested ??
      (matter?.practiceAreaName?.includes('Civil Litigation') || matter?.status === 'In Discovery' || matter?.status === 'Trial Prep')
  );

  useEffect(() => {
    if (searchParams.get('workspace') === 'litigation' && isLitigationActive) {
      setIsLitigationWorkspaceOpen(true);
    }
  }, [searchParams, isLitigationActive]);

  const relatedCases = useMemo(() => buildRelatedCases(matter, matters), [matter, matters]);

  if (!matter) {
    return (
      <div className="p-8 text-center bg-white rounded border border-[#D9D6CF]">
        <h2 className="text-xl font-serif text-[#06244B]">Matter File Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/matters')}>
          Back to Matters
        </Button>
      </div>
    );
  }

  // Permissions for Litigation switch & Attorney Approvals
  const canToggleLitigation =
    permissions.canEditMatter ||
    permissions.isAttorney ||
    permissions.isSupervisor ||
    permissions.isSuperAdmin;

  const canApproveItems =
    permissions.isAttorney ||
    permissions.isSupervisor ||
    permissions.isSuperAdmin;

  // Linked records
  const matterTasks = tasks.filter(t => t.matterId === matter.id);
  const matterTimeEntries = timeEntries.filter(t => t.matterId === matter.id);
  const matterDocuments = MOCK_DOCUMENTS.filter(d => d.matterId === matter.id);
  const totalLoggedHours = matterTimeEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
  const totalLoggedAmount = matterTimeEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Matter Overview', icon: Briefcase },
    { id: 'related-parties', label: 'Related Parties & Adversaries', icon: Users },
    { id: 'tasks', label: 'Tasks & Deadlines', count: matterTasks.length, icon: CheckSquare },
    { id: 'documents', label: 'Pleadings & Documents', count: matterDocuments.length, icon: FileText },
    { id: 'time', label: 'Time & Expenses', count: matterTimeEntries.length, icon: Clock },
    { id: 'comms', label: 'Communications', icon: MessageSquare },
    { id: 'notes', label: 'Work Product & Notes', icon: Scale },
  ];

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      matterId: matter.id,
      matterTitle: matter.title,
      clientId: matter.clientId,
      clientName: matter.clientName,
      assignedToId: 'usr-4',
      assignedToName: 'Marcus Vance',
      dueDate: newTaskDue,
      priority: newTaskPriority,
      status: 'Not Started',
    });

    setNewTaskTitle('');
    setIsNewTaskModalOpen(false);
  };

  // --- Handlers for Matter Command Panels & Litigation Switch ---
  const handleConfirmLitigationToggle = () => {
    if (!canToggleLitigation) {
      addToast('Insufficient role permission to modify Litigation / Contested status.', 'error');
      return;
    }
    const nextState = !isLitigationActive;
    updateMatter(matter.id, {
      isLitigationContested: nextState,
      litigationUpdatedBy: currentUser?.name || 'Authorized Counsel',
      litigationUpdatedAt: new Date().toISOString(),
    });
    if (!nextState) {
      setIsLitigationWorkspaceOpen(false);
      if (searchParams.get('workspace') === 'litigation') {
        setSearchParams({});
      }
    }
    addToast(
      nextState
        ? `Contested Litigation status activated for ${matter.matterNumber}. Practice area (${matter.practiceAreaName}) preserved.`
        : `Contested Litigation status deactivated for ${matter.matterNumber}. All existing matter records preserved.`,
      nextState ? 'success' : 'info'
    );
  };

  const handleNextActionStatusChange = (actionId, nextStatus) => {
    setNextActions((prev) =>
      prev.map((act) => (act.id === actionId ? { ...act, status: nextStatus } : act))
    );
    addToast(`Next action status updated to "${nextStatus}".`, nextStatus === 'Completed' ? 'success' : 'info');
  };

  const handleAddNextAction = (e) => {
    e.preventDefault();
    if (!newActionForm.title.trim()) return;
    const item = {
      id: `${matter.id}-na-${Date.now()}`,
      title: newActionForm.title.trim(),
      description: newActionForm.description.trim() || 'Follow-up matter action item.',
      assignedUser: newActionForm.assignedUser.trim() || matter.responsibleAttorneyName,
      priority: newActionForm.priority,
      dueDate: newActionForm.dueDate,
      status: 'Pending',
    };
    setNextActions((prev) => [item, ...prev]);
    setNewActionForm({
      title: '',
      description: '',
      assignedUser: 'Marcus Vance',
      priority: 'High',
      dueDate: '2026-11-22',
    });
    setIsAddActionOpen(false);
    addToast(`Added next action: "${item.title}".`, 'success');
  };

  const handleMissingInfoAction = (itemId, actionType) => {
    const today = new Date().toISOString().split('T')[0];
    setMissingInfoItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (actionType === 'received') {
          return { ...item, status: 'Received', followUpDate: today };
        }
        if (actionType === 'follow_up') {
          const nextWeek = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
          return { ...item, status: 'Follow-up Sent', followUpDate: nextWeek };
        }
        return { ...item, status: 'Missing' };
      })
    );
    addToast(
      actionType === 'received'
        ? 'Missing item marked as Received.'
        : actionType === 'follow_up'
        ? 'Follow-up reminder logged and follow-up date extended.'
        : 'Item re-flagged as Missing.',
      actionType === 'received' ? 'success' : 'info'
    );
  };

  const handleRequestStatusAction = (reqId, nextStatus, note) => {
    setUnresolvedRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? { ...r, status: nextStatus, followUpNote: note || r.followUpNote }
          : r
      )
    );
    addToast(`Request status updated to "${nextStatus}".`, nextStatus === 'Resolved' ? 'success' : 'info');
  };

  const handleApproveItem = (item) => {
    if (!canApproveItems) {
      addToast('Attorney or Supervisor authorization is required to approve items.', 'error');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setApprovalItems((prev) =>
      prev.map((ap) =>
        ap.id === item.id
          ? {
              ...ap,
              status: 'Approved',
              reviewNotes: approvalNoteInput.trim() || `Approved by ${currentUser?.name || item.assignedAttorney} on ${today}.`,
            }
          : ap
      )
    );
    addToast(`"${item.itemName}" formally approved.`, 'success');
    setReviewingApproval(null);
    setApprovalNoteInput('');
  };

  const handleRequestChanges = (item) => {
    if (!canApproveItems) {
      addToast('Attorney or Supervisor authorization is required to request changes.', 'error');
      return;
    }
    const note = approvalNoteInput.trim();
    if (!note) {
      addToast('Please enter revision instructions before requesting changes.', 'warning');
      return;
    }
    setApprovalItems((prev) =>
      prev.map((ap) =>
        ap.id === item.id
          ? { ...ap, status: 'Changes Requested', reviewNotes: note }
          : ap
      )
    );
    addToast(`Revision requested on "${item.itemName}".`, 'warning');
    setReviewingApproval(null);
    setApprovalNoteInput('');
  };

  // Filtered collections for Missing Information & Unresolved Requests
  const filteredMissingInfo =
    missingFilter === 'All'
      ? missingInfoItems
      : missingInfoItems.filter((i) =>
          missingFilter === 'Received' ? i.status === 'Received' : i.status !== 'Received'
        );

  const filteredRequests =
    requestFilter === 'All'
      ? unresolvedRequests
      : unresolvedRequests.filter((r) => r.status === requestFilter);

  const missingCount = missingInfoItems.filter((i) => i.status !== 'Received').length;
  const receivedInfoCount = missingInfoItems.filter((i) => i.status === 'Received').length;
  const pendingApprovalCount = approvalItems.filter((a) => a.status !== 'Approved').length;

  const getBadgeVariantForStatus = (status) => {
    switch (status) {
      case 'Completed':
      case 'Received':
      case 'Resolved':
      case 'Approved':
        return 'success';
      case 'Overdue':
      case 'Missing':
      case 'Changes Requested':
      case 'Urgent':
        return 'danger';
      case 'In Progress':
      case 'Pending':
      case 'Follow-up Sent':
      case 'Awaiting Review':
      case 'In Review':
      case 'High':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRelationshipBadgeVariant = (type) => {
    if (type === 'Consolidated Case') return 'terracotta';
    if (type === 'Lead Case') return 'navy';
    if (type === 'Associated Proceeding') return 'info';
    return 'default';
  };

  const relatedCasesColumns = [
    {
      key: 'caseNumber',
      label: 'Related Matter ID / Case #',
      sortable: true,
      render: (_, row) => (
        <div>
          <span className="text-xs font-bold text-[#06244B] block">{row.relatedMatterId}</span>
          <span className="text-[11px] font-mono text-[#667085]">Case #: {row.caseNumber}</span>
        </div>
      ),
    },
    {
      key: 'matterName',
      label: 'Matter Name',
      sortable: true,
      render: (val, row) => (
        <div className="max-w-xs">
          <span className="text-xs font-semibold text-[#06244B] block leading-snug">{val}</span>
          <span className="text-[10px] text-[#667085] block mt-0.5">{row.isolationNote}</span>
        </div>
      ),
    },
    {
      key: 'relationshipType',
      label: 'Relationship Type',
      sortable: true,
      render: (val) => (
        <Badge variant={getRelationshipBadgeVariant(val)} size="sm">
          {val}
        </Badge>
      ),
    },
    {
      key: 'court',
      label: 'Court / Forum',
      render: (val) => <span className="text-xs text-[#202A35]">{val || 'N/A'}</span>,
    },
    {
      key: 'currentStatus',
      label: 'Current Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_, row) => (
        <Link to={`/matters/${row.relatedMatterId}`}>
          <Button size="sm" variant="outline" icon={ExternalLink} className="text-xs py-1 text-[#06244B] whitespace-nowrap">
            Open Matter
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
        <Link to="/matters" className="hover:text-[#06244B] inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Matters
        </Link>
      </div>

      {/* Matter Summary Header */}
      <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#06244B] text-white whitespace-nowrap">
                {matter.matterNumber}
              </span>
              <StatusBadge status={matter.status} />
              <span className="text-xs font-semibold text-[#A4432B] px-2.5 py-0.5 rounded bg-[#A4432B]/10">
                {matter.practiceAreaName}
              </span>
              <Badge variant={isLitigationActive ? 'terracotta' : 'default'} size="sm" className="whitespace-nowrap">
                <Gavel className="w-3 h-3 mr-1 flex-shrink-0" />
                {isLitigationActive ? 'Litigation / Contested Active' : 'Non-Contested / Standard'}
              </Badge>
              {(matter.isEthicalWallEnabled || matter.id === 'MAT-001') && (
                <span className="text-xs font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded inline-flex items-center gap-1 whitespace-nowrap">
                  <Lock className="w-3 h-3 text-red-700 flex-shrink-0" />
                  Ethical Wall Active (Utah RPC 1.10)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#06244B] mt-3 leading-snug">
              {matter.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#667085] mt-1.5">
              Client Entity:{' '}
              <Link to={`/clients/${matter.clientId}`} className="font-semibold text-[#06244B] hover:underline">
                {matter.clientName}
              </Link>{' '}
              • Opened: {formatDate(matter.openDate, { short: true })}
            </p>
          </div>

          {/* Litigation / Contested Switch (Pinned cleanly top-right without crowding title) */}
          <div className="shrink-0 self-start">
            <button
              type="button"
              disabled={!canToggleLitigation}
              onClick={() => canToggleLitigation && setIsLitigationConfirmOpen(true)}
              title={
                canToggleLitigation
                  ? isLitigationActive
                    ? 'Deactivate Contested Litigation Status'
                    : 'Activate Contested Litigation Status'
                  : 'Requires Matter Edit or Attorney permission'
              }
              className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-xs font-semibold whitespace-nowrap transition-all ${
                !canToggleLitigation
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 border-[#D9D6CF] text-[#667085]'
                  : isLitigationActive
                  ? 'bg-[#A4432B]/10 border-[#A4432B] text-[#A4432B] hover:bg-[#A4432B]/20 cursor-pointer'
                  : 'bg-[#F5F0E5]/70 border-[#D9D6CF] text-[#06244B] hover:bg-[#F5F0E5] cursor-pointer'
              }`}
            >
              <Gavel className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Litigation / Contested:</span>
              <span
                className={`inline-flex items-center w-8 h-4 rounded-full p-0.5 transition-colors ${
                  isLitigationActive ? 'bg-[#A4432B] justify-end' : 'bg-[#B8C0C4] justify-start'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
              </span>
              <span className="font-bold">{isLitigationActive ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Matter Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-[#D9D6CF]/60">
          {permissions.canCreateMatter && (
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Matter
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setIsNewTaskModalOpen(true)}
          >
            Add Task
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Calendar}
            onClick={() => setIsRelativeDeadlineOpen(true)}
            className="text-[#06244B]"
          >
            Rule 6 Deadlines
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => setIsDocumentRequestOpen(true)}
            className="text-[#06244B]"
          >
            Doc Requests
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Clock}
            onClick={() => setIsLogTimeModalOpen(true)}
            className="sm:ml-auto"
          >
            Log Time
          </Button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#D9D6CF]/60 text-xs">
          <div>
            <span className="text-[#667085] block font-medium">Responsible Lead Attorney:</span>
            <span className="text-sm font-semibold text-[#06244B]">{matter.responsibleAttorneyName}</span>
          </div>
          <div>
            <span className="text-[#667085] block font-medium">Billing Model:</span>
            <span className="text-sm font-semibold text-[#06244B]">
              {matter.billingType} {matter.hourlyRate ? `($${matter.hourlyRate}/hr)` : ''}
            </span>
          </div>
          <div>
            <span className="text-[#667085] block font-medium">Total Logged Time:</span>
            <span className="text-sm font-semibold text-[#06244B]">
              {formatHours(totalLoggedHours)} ({formatCurrency(totalLoggedAmount)})
            </span>
          </div>
          <div>
            <span className="text-[#667085] block font-medium">Next Court Appearance:</span>
            <span className={`text-sm font-semibold ${matter.nextCourtDate ? 'text-[#B42318]' : 'text-[#667085]'}`}>
              {matter.nextCourtDate ? formatDate(matter.nextCourtDate, { short: true }) : 'None Scheduled'}
            </span>
          </div>
        </div>
      </div>

      {/* Stage Progress Bar (Filevine Reference) */}
      <StageProgressBar matter={matter} />

      {/* Contested Litigation Workspace Banner (Shown whenever Litigation / Contested is Active) */}
      {isLitigationActive && (
        <div className="bg-[#06244B] text-white border border-[#0B356D] rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#A4432B] text-white flex items-center justify-center shrink-0">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-bold text-sm text-[#F5F0E5]">
                  Contested Litigation Mode Active
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-[#F5F0E5]">
                  Practice Area Preserved: {matter.practiceAreaName}
                </span>
              </div>
              <p className="text-xs text-[#B8C0C4] mt-0.5">
                Litigation preservation holds, discovery cutoffs, motion practice, and contested trial checklists are enabled for this matter.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/matters/${matter.id}?workspace=litigation`}
              onClick={() => setIsLitigationWorkspaceOpen(true)}
            >
              <Button size="sm" variant="primary" icon={Scale} className="text-xs font-semibold whitespace-nowrap">
                Open Litigation Workspace
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Specialty Practice Docket Integration Banner */}
      {(matter.specializedDocketUrl || matter.practiceAreaName?.includes('Immigration') || matter.practiceAreaName?.includes('Bankruptcy') || matter.practiceAreaName?.includes('Personal Injury')) && (
        <div className="bg-slate-50 border border-[#D9D6CF] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            {matter.practiceAreaName?.includes('Personal Injury') ? (
              <div className="w-8 h-8 rounded bg-red-100 text-red-800 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-[#A4432B]" />
              </div>
            ) : matter.practiceAreaName?.includes('Immigration') ? (
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="font-bold text-xs text-[#06244B] block">
                Cross-Practice Specialty Docket Integration
              </span>
              <span className="text-[11px] text-[#667085]">
                {matter.practiceAreaName?.includes('Personal Injury')
                  ? 'Linked to Personal Injury Workspace (Incident investigation, Medical treatments/bills ledger, Demands builder, Liens & Settlement calculator).'
                  : matter.practiceAreaName?.includes('Immigration')
                  ? 'Linked to Immigration Workspace (Forms I-130/I-485, USCIS receipts, Alien registration numbers, and translation questionnaires).'
                  : 'Linked to Bankruptcy Practice Workspace (Schedules A/B-J, Form 122 Means-Test, Utah exemptions, and Creditor Matrix).'}
              </span>
            </div>
          </div>
          <Link to={matter.specializedDocketUrl || (matter.practiceAreaName?.includes('Personal Injury') ? '/personal-injury/dashboard' : matter.practiceAreaName?.includes('Immigration') ? '/immigration/cases' : '/bankruptcy/cases')}>
            <Button size="sm" variant="outline" className="font-semibold text-xs border-[#06244B] text-[#06244B] hover:bg-[#06244B] hover:text-white">
              Launch {matter.practiceAreaName?.includes('Personal Injury') ? 'Personal Injury Docket' : matter.practiceAreaName?.includes('Immigration') ? 'Immigration Docket' : 'Bankruptcy Docket'}
            </Button>
          </Link>
        </div>
      )}

      {/* Workspace Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Description Card */}
              <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle">
                <h3 className="font-serif text-base font-bold text-[#06244B] mb-2 border-b border-[#D9D6CF]/60 pb-2">
                  Factual Scope &amp; Litigation Synopsis
                </h3>
                <p className="text-sm text-[#202A35] leading-relaxed">
                  {matter.description || 'No description provided.'}
                </p>
              </div>

              {/* Court & Forum Details */}
              <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle">
                <h3 className="font-serif text-base font-bold text-[#06244B] mb-3 border-b border-[#D9D6CF]/60 pb-2">
                  Judicial Forum &amp; Docket Identification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#667085] block font-medium">Court / Administrative Forum:</span>
                    <span className="text-sm font-semibold text-[#06244B]">{matter.courtName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block font-medium">Presiding Judge / Hearing Officer:</span>
                    <span className="text-sm font-semibold text-[#06244B]">{matter.judge || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block font-medium">Statute of Limitations / Bar Date:</span>
                    <span className="text-sm font-semibold text-[#B42318]">{matter.statuteOfLimitations ? formatDate(matter.statuteOfLimitations) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block font-medium">Litigation Budget:</span>
                    <span className="text-sm font-semibold text-[#287A55]">{formatCurrency(matter.budget)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Legal Team Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle">
                <h3 className="font-serif text-base font-bold text-[#06244B] mb-3 border-b border-[#D9D6CF]/60 pb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#A4432B]" />
                  <span>Assigned Matter Team</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2.5 p-2 rounded bg-[#F5F0E5]/60">
                    <div className="w-8 h-8 rounded-full bg-[#06244B] text-white flex items-center justify-center font-bold text-xs">
                      {matter.responsibleAttorneyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#06244B]">{matter.responsibleAttorneyName}</p>
                      <p className="text-[10px] text-[#A4432B] font-semibold uppercase">Responsible Counsel</p>
                    </div>
                  </div>

                  {matter.assignedStaffNames?.map((staffName, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-2 rounded hover:bg-[#F5F0E5]/40">
                      <div className="w-8 h-8 rounded-full bg-[#B8C0C4] text-[#06244B] flex items-center justify-center font-bold text-xs">
                        MV
                      </div>
                      <div>
                        <p className="font-semibold text-[#202A35]">{staffName}</p>
                        <p className="text-[10px] text-[#667085]">Litigation Paralegal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action Box */}
              <div className="bg-[#06244B] text-white p-5 rounded shadow-card">
                <h4 className="font-serif font-bold text-sm text-[#F5F0E5]">Matter Quick Action</h4>
                <p className="text-xs text-[#B8C0C4] mt-1">Record deposition time, draft pleadings, or create reminders.</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setIsLogTimeModalOpen(true)}
                >
                  Log Time for this Matter
                </Button>
              </div>
            </div>
          </div>

          {/* Command & Operational Readiness Panels (2-Column Responsive Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Next Actions Panel */}
            <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D9D6CF]/60">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#A4432B]" />
                  <h3 className="font-serif text-base font-bold text-[#06244B]">
                    Next Actions
                  </h3>
                  <Badge variant="navy" size="sm">
                    {nextActions.filter((a) => a.status !== 'Completed').length} Open
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={() => setIsAddActionOpen(true)}
                  className="text-xs py-1"
                >
                  Add Action
                </Button>
              </div>

              <div className="space-y-3 flex-1">
                {nextActions.map((act) => (
                  <div
                    key={act.id}
                    className={`p-3.5 rounded border transition-colors ${
                      act.status === 'Completed'
                        ? 'bg-[#FAF7F0]/60 border-[#D9D6CF]/70 opacity-85'
                        : 'bg-white border-[#D9D6CF]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-[200px]">
                        <p className={`text-sm font-bold ${act.status === 'Completed' ? 'line-through text-[#667085]' : 'text-[#06244B]'}`}>
                          {act.title}
                        </p>
                        <p className="text-xs text-[#202A35] leading-relaxed">{act.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Badge variant={getBadgeVariantForStatus(act.priority)} size="sm">
                          {act.priority}
                        </Badge>
                        <Badge variant={getBadgeVariantForStatus(act.status)} size="sm">
                          {act.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#D9D6CF]/50 text-[11px] text-[#667085]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span>
                          Assigned: <strong className="text-[#06244B]">{act.assignedUser}</strong>
                        </span>
                        <span>
                          Due: <strong className="text-[#202A35]">{formatDate(act.dueDate, { short: true })}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {act.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[11px] py-0.5 px-2"
                            onClick={() => handleNextActionStatusChange(act.id, 'In Progress')}
                          >
                            Start
                          </Button>
                        )}
                        {act.status !== 'Completed' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            icon={Check}
                            className="text-[11px] py-1 px-2.5"
                            onClick={() => handleNextActionStatusChange(act.id, 'Completed')}
                          >
                            Complete
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={RotateCcw}
                            className="text-[11px] py-1 px-2.5"
                            onClick={() => handleNextActionStatusChange(act.id, 'In Progress')}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Missing Information Panel */}
            <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D9D6CF]/60">
                <div className="flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-[#B42318]" />
                  <h3 className="font-serif text-base font-bold text-[#06244B]">
                    Missing Information
                  </h3>
                  <Badge variant="danger" size="sm">{missingCount} Missing</Badge>
                  <Badge variant="success" size="sm">{receivedInfoCount} Received</Badge>
                </div>
                <div className="flex items-center gap-1">
                  {['All', 'Missing', 'Received'].map((tabOpt) => (
                    <button
                      key={tabOpt}
                      type="button"
                      onClick={() => setMissingFilter(tabOpt)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                        missingFilter === tabOpt
                          ? 'bg-[#06244B] text-white'
                          : 'bg-[#F5F0E5] text-[#202A35] hover:bg-[#D9D6CF]/60'
                      }`}
                    >
                      {tabOpt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {filteredMissingInfo.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#667085] border border-dashed border-[#D9D6CF] rounded">
                    No items match the selected filter.
                  </div>
                ) : (
                  filteredMissingInfo.map((info) => (
                    <div
                      key={info.id}
                      className={`p-3.5 rounded border ${
                        info.status === 'Received'
                          ? 'bg-[#287A55]/5 border-[#287A55]/30'
                          : 'bg-[#FFFDF9] border-[#D9D6CF]'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-sm font-bold text-[#06244B]">{info.fieldOrDocument}</p>
                          <p className="text-xs text-[#202A35] mt-1">{info.reasonRequired}</p>
                        </div>
                        <Badge variant={getBadgeVariantForStatus(info.status)} size="sm">
                          {info.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5 text-[11px] text-[#667085] bg-[#F5F0E5]/50 p-2 rounded">
                        <span>
                          Requested From: <strong className="text-[#06244B] block">{info.requestedFrom}</strong>
                        </span>
                        <span>
                          Request Date: <strong className="text-[#202A35] block">{formatDate(info.requestDate, { short: true })}</strong>
                        </span>
                        <span>
                          Follow-up Date: <strong className="text-[#A4432B] block">{formatDate(info.followUpDate, { short: true })}</strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap justify-end gap-1.5 mt-2.5">
                        {info.status !== 'Received' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Send}
                              className="text-[11px] py-1 px-2.5"
                              onClick={() => handleMissingInfoAction(info.id, 'follow_up')}
                            >
                              Send Follow-up
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              icon={CheckCircle2}
                              className="text-[11px] py-1 px-2.5"
                              onClick={() => handleMissingInfoAction(info.id, 'received')}
                            >
                              Mark Received
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={RotateCcw}
                            className="text-[11px] py-1 px-2.5"
                            onClick={() => handleMissingInfoAction(info.id, 'missing')}
                          >
                            Re-flag Missing
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Unresolved Requests Panel */}
            <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D9D6CF]/60">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-[#A66A16]" />
                  <h3 className="font-serif text-base font-bold text-[#06244B]">
                    Unresolved Requests
                  </h3>
                  <Badge variant="warning" size="sm">
                    {unresolvedRequests.filter((r) => r.status === 'Pending' || r.status === 'Overdue').length} Open
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {['All', 'Pending', 'Overdue', 'Received', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRequestFilter(st)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                        requestFilter === st
                          ? 'bg-[#06244B] text-white'
                          : 'bg-[#F5F0E5] text-[#202A35] hover:bg-[#D9D6CF]/60'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {filteredRequests.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#667085] border border-dashed border-[#D9D6CF] rounded">
                    No requests with status "{requestFilter}".
                  </div>
                ) : (
                  filteredRequests.map((req) => (
                    <div key={req.id} className="p-3.5 rounded border border-[#D9D6CF] bg-white">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F5F0E5] text-[#06244B]">
                              {req.category}
                            </span>
                            <p className="text-sm font-bold text-[#06244B]">{req.title}</p>
                          </div>
                          <p className="text-xs text-[#667085] mt-1">{req.followUpNote}</p>
                        </div>
                        <Badge variant={getBadgeVariantForStatus(req.status)} size="sm">
                          {req.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5 text-[11px] text-[#667085] bg-[#FAF7F0] p-2 rounded">
                        <span>
                          Requested From: <strong className="text-[#06244B] block">{req.requestedFrom}</strong>
                        </span>
                        <span>
                          Request Date: <strong className="text-[#202A35] block">{formatDate(req.requestDate, { short: true })}</strong>
                        </span>
                        <span>
                          Due Date: <strong className={`${req.status === 'Overdue' ? 'text-[#B42318]' : 'text-[#202A35]'} block`}>{formatDate(req.dueDate, { short: true })}</strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap justify-end gap-1.5 mt-2.5">
                        {(req.status === 'Pending' || req.status === 'Overdue') && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Send}
                              className="text-[11px] py-1 px-2.5"
                              onClick={() =>
                                handleRequestStatusAction(
                                  req.id,
                                  req.status,
                                  `Follow-up notice transmitted on ${new Date().toISOString().split('T')[0]}.`
                                )
                              }
                            >
                              Follow-up
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px] py-1 px-2.5 text-[#287A55] border-[#287A55]/40"
                              onClick={() =>
                                handleRequestStatusAction(
                                  req.id,
                                  'Received',
                                  'Response package received; pending attorney verification.'
                                )
                              }
                            >
                              Mark Received
                            </Button>
                          </>
                        )}
                        {req.status !== 'Resolved' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            icon={Check}
                            className="text-[11px] py-1 px-2.5"
                            onClick={() =>
                              handleRequestStatusAction(
                                req.id,
                                'Resolved',
                                'Request fulfilled and verified on matter record.'
                              )
                            }
                          >
                            Resolve
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={RotateCcw}
                            className="text-[11px] py-1 px-2.5"
                            onClick={() =>
                              handleRequestStatusAction(req.id, 'Pending', 'Reopened for supplemental follow-up.')
                            }
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. Awaiting Attorney Approval Panel */}
            <div className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D9D6CF]/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#06244B]" />
                  <h3 className="font-serif text-base font-bold text-[#06244B]">
                    Awaiting Attorney Approval
                  </h3>
                  <Badge variant={pendingApprovalCount > 0 ? 'warning' : 'success'} size="sm">
                    {pendingApprovalCount} Pending Sign-Off
                  </Badge>
                </div>
                {!canApproveItems && (
                  <span className="text-[10px] font-semibold text-[#667085] bg-[#F5F0E5] px-2 py-0.5 rounded">
                    Attorney / Supervisor Sign-Off Required
                  </span>
                )}
              </div>

              <div className="space-y-3 flex-1">
                {approvalItems.map((ap) => (
                  <div key={ap.id} className="p-3.5 rounded border border-[#D9D6CF] bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#06244B]/10 text-[#06244B]">
                            {ap.itemType}
                          </span>
                          <p className="text-sm font-bold text-[#06244B]">{ap.itemName}</p>
                        </div>
                        <p className="text-xs text-[#202A35] mt-1">{ap.summary}</p>
                        {ap.reviewNotes && (
                          <p className="text-[11px] text-[#A4432B] mt-1 italic">
                            Note: "{ap.reviewNotes}"
                          </p>
                        )}
                      </div>
                      <Badge variant={getBadgeVariantForStatus(ap.status)} size="sm">
                        {ap.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5 text-[11px] text-[#667085] bg-[#F5F0E5]/50 p-2 rounded">
                      <span>
                        Submitted By: <strong className="text-[#06244B] block">{ap.submittedBy}</strong>
                      </span>
                      <span>
                        Submission Date: <strong className="text-[#202A35] block">{formatDate(ap.submissionDate, { short: true })}</strong>
                      </span>
                      <span>
                        Assigned Attorney: <strong className="text-[#06244B] block">{ap.assignedAttorney}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-end gap-1.5 mt-2.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] py-0.5 px-2.5"
                        onClick={() => {
                          setReviewingApproval(ap);
                          setApprovalNoteInput(ap.reviewNotes || '');
                        }}
                      >
                        Review
                      </Button>
                      {ap.status !== 'Approved' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            icon={XCircle}
                            disabled={!canApproveItems}
                            className="text-[11px] py-1 px-2.5 text-[#A4432B] border-[#A4432B]/40"
                            onClick={() => {
                              setReviewingApproval(ap);
                              setApprovalNoteInput(ap.reviewNotes || '');
                            }}
                          >
                            Request Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={CheckCircle2}
                            disabled={!canApproveItems}
                            className="text-[11px] py-1 px-2.5"
                            onClick={() => handleApproveItem(ap)}
                          >
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Isolated Related / Consolidated Cases Section */}
          <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9D6CF]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-[#F5F0E5] text-[#06244B]">
                  <GitBranch className="w-4 h-4 text-[#A4432B]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#06244B]">
                    Related &amp; Consolidated Cases
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Linked dockets retain isolated billing ledgers, permissions, and filing deadlines without merging matter records.
                  </p>
                </div>
              </div>
              <Badge variant="navy" size="sm">
                <Lock className="w-3 h-3 mr-1" /> Isolated Records ({relatedCases.length})
              </Badge>
            </div>

            <DataTable
              columns={relatedCasesColumns}
              data={relatedCases}
              pageSize={5}
              emptyMessage="No related or consolidated proceedings linked to this matter."
            />
          </div>
        </div>
      )}

      {/* Related Parties & Adversaries Tab */}
      {activeTab === 'related-parties' && (
        <RelatedPartiesTab
          matterId={matter.id}
          matterTitle={matter.title}
        />
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#06244B]">
              Matter Tasks &amp; Deadlines ({matterTasks.length})
            </h3>
            <Button
              size="sm"
              variant="outline"
              icon={Plus}
              onClick={() => setIsNewTaskModalOpen(true)}
            >
              Add Task
            </Button>
          </div>

          <div className="bg-white rounded border border-[#D9D6CF] divide-y divide-[#D9D6CF]/50 shadow-subtle">
            {matterTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667085]">
                No pending tasks created for this matter yet.
              </div>
            ) : (
              matterTasks.map((t) => {
                const isDone = t.status === 'Completed';
                return (
                  <div key={t.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => updateTaskStatus(t.id, isDone ? 'In Progress' : 'Completed')}
                        className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
                      />
                      <div>
                        <p className={`text-sm font-semibold ${isDone ? 'line-through text-[#667085]' : 'text-[#06244B]'}`}>
                          {t.title}
                        </p>
                        <p className="text-xs text-[#667085] mt-0.5">
                          Assigned to: {t.assignedToName} • Due: {formatDate(t.dueDate, { short: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#06244B]">
              Pleadings, Discovery &amp; Orders ({matterDocuments.length})
            </h3>
            <Button size="sm" variant="outline" onClick={() => navigate('/documents')}>
              Upload Document
            </Button>
          </div>

          <div className="bg-white rounded border border-[#D9D6CF] divide-y divide-[#D9D6CF]/50 shadow-subtle">
            {matterDocuments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667085]">
                No documents uploaded for this matter yet.
              </div>
            ) : (
              matterDocuments.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[#F5F0E5] text-[#06244B]">
                      <FileText className="w-5 h-5 text-[#A4432B]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#06244B]">{doc.title}</p>
                      <p className="text-xs text-[#667085] mt-0.5">
                        {doc.fileName} • {doc.fileSize} • Uploaded by {doc.uploadedByName} on {formatDate(doc.uploadedAt, { short: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToast(`Opening secure document preview: ${doc.fileName}`, 'info')}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#06244B]">
                Matter Billable Ledger ({formatHours(totalLoggedHours)})
              </h3>
              <p className="text-xs text-[#667085]">Total billable fees: {formatCurrency(totalLoggedAmount)}</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={Clock}
              onClick={() => setIsLogTimeModalOpen(true)}
            >
              Log Time
            </Button>
          </div>

          <div className="bg-white rounded border border-[#D9D6CF] divide-y divide-[#D9D6CF]/50 shadow-subtle overflow-hidden">
            {matterTimeEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667085]">
                No time entries logged on this matter file yet.
              </div>
            ) : (
              matterTimeEntries.map((t) => (
                <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[#06244B]">{t.userName}</span>
                      <span className="text-gray-300">•</span>
                      <span className="font-semibold text-[#A4432B]">{t.hours} hrs (${t.amount})</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[#667085]">{formatDate(t.date, { short: true })}</span>
                    </div>
                    <p className="text-xs text-[#202A35] mt-1">{t.description}</p>
                    {t.reviewComment && (
                      <p className="text-[11px] text-[#A4432B] mt-1 italic">Review note: "{t.reviewComment}"</p>
                    )}
                  </div>
                  <div>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'comms' && (
        <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
          <h3 className="font-serif text-base font-bold text-[#06244B] border-b border-[#D9D6CF]/60 pb-2">
            Matter Correspondence &amp; Notices
          </h3>
          <div className="divide-y divide-[#D9D6CF]/40 text-xs">
            <div className="py-3">
              <div className="flex justify-between items-center font-semibold text-[#06244B]">
                <span>Notice of Appearance &amp; Certificate of Service</span>
                <span className="text-[#667085]">2025-01-24</span>
              </div>
              <p className="text-[#667085] mt-1">Transmitted via Utah Court XChange e-filing system to opposing counsel.</p>
            </div>
            <div className="py-3">
              <div className="flex justify-between items-center font-semibold text-[#06244B]">
                <span>Discovery Meet &amp; Confer Email Protocol</span>
                <span className="text-[#667085]">2025-02-10</span>
              </div>
              <p className="text-[#667085] mt-1">Email exchange regarding electronic format of telemetry database logs.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
          <h3 className="font-serif text-base font-bold text-[#06244B] border-b border-[#D9D6CF]/60 pb-2">
            Attorney Work Product &amp; Strategic Case Notes
          </h3>
          <div className="p-4 bg-[#F5F0E5]/60 rounded border border-[#D9D6CF] text-xs leading-relaxed text-[#202A35]">
            <p className="font-semibold text-[#06244B] mb-1">Defense Settlement Exposure Assessment:</p>
            Review of pretrial disclosures indicates opposing party may be seeking early mediation prior to expert discovery cutoff. Settlement authority threshold requested from client CEO at $120,000 baseline.
          </div>
          <p className="text-[11px] text-[#A4432B] font-semibold">
            Privileged &amp; Confidential Attorney Work Product • Do not disclose to non-firm personnel.
          </p>
        </div>
      )}

      {/* Edit Matter Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Matter: ${matter.matterNumber}`}
        maxWidth="max-w-3xl"
      >
        <MatterForm
          initialData={matter}
          onSuccess={() => setIsEditModalOpen(false)}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Log Time Modal */}
      <Modal
        isOpen={isLogTimeModalOpen}
        onClose={() => setIsLogTimeModalOpen(false)}
        title={`Log Billable Time: ${matter.matterNumber}`}
        maxWidth="max-w-2xl"
      >
        <TimeEntryForm
          defaultMatterId={matter.id}
          onSuccess={() => setIsLogTimeModalOpen(false)}
          onCancel={() => setIsLogTimeModalOpen(false)}
        />
      </Modal>

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title="Create Task for Matter"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Prepare deposition outline"
              className="w-full text-sm p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                className="w-full text-sm p-2 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Priority
              </label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="w-full text-sm p-2 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsNewTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Relative Deadlines Modal */}
      {isRelativeDeadlineOpen && (
        <RelativeDeadlineCalculator
          isOpen={isRelativeDeadlineOpen}
          onClose={() => setIsRelativeDeadlineOpen(false)}
          initialAnchorDate={matter.nextCourtDate || '2027-02-15'}
          matterNumber={matter.matterNumber}
          matterTitle={matter.title}
        />
      )}

      {/* Document Requests Modal */}
      {isDocumentRequestOpen && (
        <DocumentRequestModal
          isOpen={isDocumentRequestOpen}
          onClose={() => setIsDocumentRequestOpen(false)}
          matterTitle={matter.title}
          clientName={matter.clientName}
        />
      )}

      {/* Litigation / Contested Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLitigationConfirmOpen}
        onClose={() => setIsLitigationConfirmOpen(false)}
        onConfirm={handleConfirmLitigationToggle}
        variant={isLitigationActive ? 'danger' : 'primary'}
        title={
          isLitigationActive
            ? 'Deactivate Contested Litigation Status?'
            : 'Activate Contested Litigation Status?'
        }
        message={
          isLitigationActive
            ? `Deactivating Litigation / Contested status for matter ${matter.matterNumber} will hide the active Litigation Workspace shortcut while preserving all existing matter data, documents, and its Practice Area (${matter.practiceAreaName}).`
            : `Activating Litigation / Contested status for matter ${matter.matterNumber} will enable contested litigation tools and workspace access without changing the matter's Practice Area (${matter.practiceAreaName}) or overwriting existing records.`
        }
        confirmLabel={isLitigationActive ? 'Deactivate Litigation' : 'Activate Litigation'}
      />

      {/* Add Next Action Modal */}
      <Modal
        isOpen={isAddActionOpen}
        onClose={() => setIsAddActionOpen(false)}
        title={`Add Next Action: ${matter.matterNumber}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddNextAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Action Title
            </label>
            <input
              type="text"
              required
              value={newActionForm.title}
              onChange={(e) => setNewActionForm({ ...newActionForm, title: e.target.value })}
              placeholder="e.g. File Motion for Protective Order"
              className="w-full text-sm p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={newActionForm.description}
              onChange={(e) => setNewActionForm({ ...newActionForm, description: e.target.value })}
              placeholder="Action scope, rule reference, or filing deliverable..."
              className="w-full text-sm p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Assigned User
              </label>
              <input
                type="text"
                value={newActionForm.assignedUser}
                onChange={(e) => setNewActionForm({ ...newActionForm, assignedUser: e.target.value })}
                className="w-full text-sm p-2 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Priority
              </label>
              <select
                value={newActionForm.priority}
                onChange={(e) => setNewActionForm({ ...newActionForm, priority: e.target.value })}
                className="w-full text-sm p-2 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
              >
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={newActionForm.dueDate}
                onChange={(e) => setNewActionForm({ ...newActionForm, dueDate: e.target.value })}
                className="w-full text-sm p-2 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddActionOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Next Action
            </Button>
          </div>
        </form>
      </Modal>

      {/* Attorney Approval Review Modal */}
      <Modal
        isOpen={Boolean(reviewingApproval)}
        onClose={() => {
          setReviewingApproval(null);
          setApprovalNoteInput('');
        }}
        title="Attorney Approval Review"
        maxWidth="max-w-lg"
      >
        {reviewingApproval && (
          <div className="space-y-4">
            <div className="p-4 rounded bg-[#F5F0E5]/70 border border-[#D9D6CF] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="navy" size="sm">{reviewingApproval.itemType}</Badge>
                <Badge variant={getBadgeVariantForStatus(reviewingApproval.status)} size="sm">
                  {reviewingApproval.status}
                </Badge>
              </div>
              <h4 className="font-serif font-bold text-base text-[#06244B]">
                {reviewingApproval.itemName}
              </h4>
              <p className="text-xs text-[#202A35] leading-relaxed">
                {reviewingApproval.summary}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D9D6CF]/60 text-[11px] text-[#667085]">
                <span>Submitted By: <strong className="text-[#06244B]">{reviewingApproval.submittedBy}</strong></span>
                <span>Assigned Attorney: <strong className="text-[#06244B]">{reviewingApproval.assignedAttorney}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
                Attorney Review / Revision Instructions
              </label>
              <textarea
                rows={3}
                value={approvalNoteInput}
                onChange={(e) => setApprovalNoteInput(e.target.value)}
                placeholder="Enter review comments, approval verification, or required revisions..."
                className="w-full text-sm p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
              />
            </div>

            {!canApproveItems && (
              <p className="text-xs text-[#B42318] bg-red-50 border border-red-200 p-2.5 rounded">
                View-only inspection: Only an Attorney, Supervisor, or Super Admin may approve or request changes.
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReviewingApproval(null);
                  setApprovalNoteInput('');
                }}
              >
                Close
              </Button>
              {reviewingApproval.status !== 'Approved' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={XCircle}
                    disabled={!canApproveItems}
                    className="text-[#A4432B] border-[#A4432B]/50"
                    onClick={() => handleRequestChanges(reviewingApproval)}
                  >
                    Request Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={CheckCircle2}
                    disabled={!canApproveItems}
                    onClick={() => handleApproveItem(reviewingApproval)}
                  >
                    Approve Item
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Contested Litigation Workspace Modal / View */}
      <Modal
        isOpen={isLitigationWorkspaceOpen}
        onClose={() => {
          setIsLitigationWorkspaceOpen(false);
          if (searchParams.get('workspace') === 'litigation') {
            setSearchParams({});
          }
        }}
        title={`Contested Litigation Workspace: ${matter.matterNumber}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="p-4 rounded bg-[#06244B] text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#F5F0E5]/80 font-bold block">
                Contested Proceeding Overlay • Practice Area Preserved: {matter.practiceAreaName}
              </span>
              <h4 className="font-serif font-bold text-base text-[#F5F0E5] mt-0.5">
                {matter.title}
              </h4>
            </div>
            <Badge variant="terracotta" size="sm">Litigation Active</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded border border-[#D9D6CF] bg-[#FAF7F0]">
              <span className="font-bold text-[#06244B] block">Preservation &amp; Assessment</span>
              <span className="text-[#667085] mt-1 block">
                {missingInfoItems.filter((i) => i.status !== 'Received').length} pending collection item(s); court forum: {matter.courtName || 'District Court'}.
              </span>
            </div>
            <div className="p-3.5 rounded border border-[#D9D6CF] bg-[#FAF7F0]">
              <span className="font-bold text-[#06244B] block">Open Requests &amp; Subpoenas</span>
              <span className="text-[#667085] mt-1 block">
                {unresolvedRequests.filter((r) => r.status === 'Pending' || r.status === 'Overdue').length} unresolved discovery/service request(s).
              </span>
            </div>
            <div className="p-3.5 rounded border border-[#D9D6CF] bg-[#FAF7F0]">
              <span className="font-bold text-[#06244B] block">Attorney Sign-Off Queue</span>
              <span className="text-[#667085] mt-1 block">
                {pendingApprovalCount} contested pleading/discovery item(s) awaiting review.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#D9D6CF]">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={Calendar}
                onClick={() => {
                  setIsLitigationWorkspaceOpen(false);
                  setSearchParams({});
                  setIsRelativeDeadlineOpen(true);
                }}
              >
                Open Rule 6 Calculator
              </Button>
              <Link to="/deadlines">
                <Button size="sm" variant="outline" icon={ExternalLink}>
                  Court Deadlines Docket
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                icon={Users}
                onClick={() => {
                  setIsLitigationWorkspaceOpen(false);
                  setSearchParams({});
                  setActiveTab('related-parties');
                }}
              >
                Adverse Parties &amp; Service
              </Button>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setIsLitigationWorkspaceOpen(false);
                if (searchParams.get('workspace') === 'litigation') {
                  setSearchParams({});
                }
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

