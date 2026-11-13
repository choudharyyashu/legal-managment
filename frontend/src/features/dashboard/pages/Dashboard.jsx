import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  CheckSquare,
  AlertTriangle,
  Clock,
  Calendar,
  ChevronRight,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  UserPlus,
  FolderPlus,
  Scale,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useClients } from '../../../context/ClientContext';
import { useMatters } from '../../../context/MatterContext';
import { useTasks } from '../../../context/TaskContext';
import { useTime } from '../../../context/TimeContext';
import { useToast } from '../../../components/ui/Toast';
import { StatCard } from '../../../components/shared/StatCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ClientForm } from '../../clients/forms/ClientForm';
import { MatterForm } from '../../matters/forms/MatterForm';
import { TimeEntryForm } from '../../time-tracking/forms/TimeEntryForm';
import { MOCK_CALENDAR_EVENTS } from '../../../data/mockCalendar';
import { reportService } from '../../../services/reportService';
import { formatDate } from '../../../utils/formatDate';
import { EndToEndDemoWizard } from '../../intake/components/EndToEndDemoWizard';

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const permissions = usePermissions();
  const { clients } = useClients();
  const { matters } = useMatters();
  const { tasks, updateTaskStatus } = useTasks();
  const { timeEntries, approveTimeEntry, rejectTimeEntry } = useTime();
  const { addToast } = useToast();

  const [dashboardMetrics, setDashboardMetrics] = useState(null);

  // Local modal states for quick actions
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isMatterModalOpen, setIsMatterModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isDemoWizardOpen, setIsDemoWizardOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    reportService.getDashboard()
      .then((data) => {
        if (isMounted && data) setDashboardMetrics(data);
      })
      .catch((err) => {
        console.warn('Could not fetch aggregated report metrics:', err?.message);
      });
    return () => { isMounted = false; };
  }, []);

  // Derived metrics (live backend counts with fallback to context arrays)
  const totalClientsCount = dashboardMetrics?.clients?.total !== undefined ? dashboardMetrics.clients.total : clients.length;
  const activeMattersCount = dashboardMetrics?.matters?.active !== undefined ? dashboardMetrics.matters.active : matters.filter(m => m.status !== 'Concluded').length;
  const myTasks = tasks.filter(t => t.assignedToId === currentUser.id || t.assignedToUserId === currentUser.id);
  const myPendingTasksCount = myTasks.filter(t => t.status !== 'Completed').length;
  const teamTasks = tasks.filter(t => t.status !== 'Completed');
  const pendingApprovals = timeEntries.filter(t => t.status === 'Submitted');

  // Upcoming hearings & deadlines
  const upcomingEvents = MOCK_CALENDAR_EVENTS.slice(0, 4);

  const handleTaskToggle = (task) => {
    const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    updateTaskStatus(task.id, nextStatus);
    addToast(`Task "${task.title}" marked as ${nextStatus}.`, 'info');
  };

  const handleApproveEntry = (id) => {
    approveTimeEntry(id, `Approved from dashboard review by ${currentUser.name}`);
    addToast('Time entry approved and added to billable records.', 'success');
  };

  const handleRejectEntry = (id) => {
    const reason = prompt('Please enter a rejection explanation for counsel:');
    if (reason !== null) {
      rejectTimeEntry(id, reason || 'Rejection noted during partner review.');
      addToast('Time entry rejected.', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#EAECF0] shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#A4432B]/10 text-[#A4432B] border border-[#A4432B]/20 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-[#A4432B]" />
            <span>Utah Law Practice Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#06244B] tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#475467] pt-0.5">
            <span className="font-semibold text-[#101828]">{currentUser.title}</span>
            <span className="text-[#98A2B3]">•</span>
            <span className="text-[#667085]">{currentUser.department}</span>
            <span className="text-[#98A2B3]">•</span>
            <span className="inline-flex items-center gap-1 text-[#475467] bg-slate-50 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
              <Calendar className="w-3 h-3 text-[#667085]" />
              Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDemoWizardOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#A4432B] bg-orange-50/70 border border-orange-200 hover:bg-orange-100/80 hover:border-orange-300 transition-all shadow-2xs cursor-pointer whitespace-nowrap"
            title="Launch End-to-End Onboarding Demo"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A4432B]" />
            <span>E2E Onboarding Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClientModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#344054] bg-white border border-[#D0D5DD] hover:bg-slate-50 hover:text-[#06244B] transition-all shadow-2xs cursor-pointer whitespace-nowrap"
            title="Create New Client Profile"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#667085]" />
            <span>Add Client</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMatterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#344054] bg-white border border-[#D0D5DD] hover:bg-slate-50 hover:text-[#06244B] transition-all shadow-2xs cursor-pointer whitespace-nowrap"
            title="Open New Legal Matter"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#667085]" />
            <span>New Matter</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTimeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#A4432B] hover:bg-[#8D3823] transition-all shadow-sm cursor-pointer whitespace-nowrap"
            title="Log Billable Time"
          >
            <Clock className="w-3.5 h-3.5 text-white" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Clients"
          value={totalClientsCount}
          subtitle="Active roster"
          icon={Users}
          onClick={() => navigate('/clients')}
        />

        <StatCard
          title="Active Matters"
          value={activeMattersCount}
          subtitle="Pre-trial &amp; litigation"
          icon={Briefcase}
          onClick={() => navigate('/matters')}
        />

        <StatCard
          title="My Open Tasks"
          value={myPendingTasksCount}
          subtitle={`${myTasks.length} assigned total`}
          icon={CheckSquare}
          onClick={() => navigate('/tasks/mine')}
        />

        <StatCard
          title="Upcoming Deadlines"
          value={upcomingEvents.length}
          subtitle="Court hearings &amp; orders"
          icon={AlertTriangle}
          onClick={() => navigate('/deadlines')}
        />

        {/* Only show pending approvals card to authorized roles */}
        {permissions.canApproveTime ? (
          <StatCard
            title="Pending Approvals"
            value={pendingApprovals.length}
            subtitle="Needs partner signoff"
            icon={Clock}
            onClick={() => navigate('/time/approvals')}
          />
        ) : (
          <StatCard
            title="Recent Filings"
            value="6"
            subtitle="Uploaded this week"
            icon={FileText}
            onClick={() => navigate('/documents')}
          />
        )}
      </div>

      {/* Two Column Layout: Tasks & Calendar / Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Tasks Card */}
          <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#D9D6CF] flex items-center justify-between bg-[#F5F0E5]/40">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#A4432B]" />
                <h2 className="font-serif text-lg font-bold text-[#06244B]">
                  My Assigned Tasks
                </h2>
              </div>
              <button
                onClick={() => navigate('/tasks/mine')}
                className="text-xs font-semibold text-[#A4432B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all my tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#D9D6CF]/50">
              {myTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#667085]">
                  You have no pending tasks assigned.
                </div>
              ) : (
                myTasks.slice(0, 4).map((task) => {
                  const isDone = task.status === 'Completed';
                  return (
                    <div
                      key={task.id}
                      className="p-4 flex items-start justify-between gap-3 hover:bg-[#F5F0E5]/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleTaskToggle(task)}
                          className="mt-1 h-4 w-4 rounded text-[#A4432B] focus:ring-[#A4432B] border-[#D9D6CF] cursor-pointer"
                        />
                        <div>
                          <p className={`text-sm font-semibold ${isDone ? 'line-through text-[#667085]' : 'text-[#06244B]'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-[#667085] mt-0.5">
                            {task.matterTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] text-[#A4432B] font-semibold">
                              Due: {formatDate(task.dueDate, { short: true })}
                            </span>
                            <span className="text-gray-300">•</span>
                            <StatusBadge status={task.priority} />
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/tasks/mine')}
                        className="text-xs text-[#667085] hover:text-[#06244B] p-1.5 rounded hover:bg-[#F5F0E5]"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Team Workload (for Supervisors & Super Admins) */}
          {permissions.canViewTeamWorkload && (
            <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#D9D6CF] flex items-center justify-between bg-[#F5F0E5]/40">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#06244B]" />
                  <h2 className="font-serif text-lg font-bold text-[#06244B]">
                    Team Workload &amp; Active Assignments
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/tasks/team')}
                  className="text-xs font-semibold text-[#A4432B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Team task monitor</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-xs divide-y divide-[#D9D6CF]">
                  <thead>
                    <tr className="text-[#667085] font-semibold uppercase tracking-wider text-left">
                      <th className="pb-2">Team Member</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">Open Tasks</th>
                      <th className="pb-2">High Priority</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9D6CF]/40">
                    {permissions.isSuperAdmin || permissions.isSupervisor ? (
                      [
                        { name: 'Sarah Jenkins, Esq.', role: 'Senior Associate', open: 3, high: 2, id: 'usr-3' },
                        { name: 'Marcus Vance', role: 'Litigation Paralegal', open: 5, high: 2, id: 'usr-4' },
                        { name: 'Rachel Adams', role: 'Billing Director', open: 2, high: 1, id: 'usr-5' },
                        { name: 'Thomas Bludworth, Esq.', role: 'Senior Partner', open: 4, high: 1, id: 'usr-2' },
                      ].map((member, idx) => (
                        <tr key={idx} className="hover:bg-[#F5F0E5]/30">
                          <td className="py-2.5 font-semibold text-[#06244B]">{member.name}</td>
                          <td className="py-2.5 text-[#667085]">{member.role}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold">
                              {member.open} tasks
                            </span>
                          </td>
                          <td className="py-2.5 text-[#B42318] font-semibold">{member.high} urgent</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => navigate('/tasks/team')}
                              className="text-[#A4432B] hover:underline font-medium"
                            >
                              Review &rarr;
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pending Time & Billing Approvals (Permission Based) */}
          {permissions.canApproveTime && (
            <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#D9D6CF] flex items-center justify-between bg-[#F5F0E5]/40">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#A4432B]" />
                  <h2 className="font-serif text-lg font-bold text-[#06244B]">
                    Pending Time &amp; Billing Approvals
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/time/approvals')}
                  className="text-xs font-semibold text-[#A4432B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open approval queue ({pendingApprovals.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-[#D9D6CF]/50">
                {pendingApprovals.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#667085]">
                    All submitted time entries have been approved.
                  </div>
                ) : (
                  pendingApprovals.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#06244B]">{entry.userName}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs font-semibold text-[#A4432B]">{entry.hours} hrs (${entry.amount})</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-[11px] text-[#667085]">{formatDate(entry.date, { short: true })}</span>
                        </div>
                        <p className="text-xs text-[#202A35] font-medium mt-1">{entry.matterTitle}</p>
                        <p className="text-xs text-[#667085] mt-0.5 line-clamp-1">{entry.description}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#B42318] hover:bg-red-50"
                          onClick={() => handleRejectEntry(entry.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveEntry(entry.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Hearings, Appointments & Activities */}
        <div className="space-y-6">
          {/* Upcoming Court Hearings & Deadlines */}
          <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#D9D6CF] flex items-center justify-between bg-[#F5F0E5]/40">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#06244B]" />
                <h2 className="font-serif text-lg font-bold text-[#06244B]">
                  Hearings &amp; Dates
                </h2>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-semibold text-[#A4432B] hover:underline cursor-pointer"
              >
                Calendar &rarr;
              </button>
            </div>

            <div className="divide-y divide-[#D9D6CF]/50 p-2">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3 rounded hover:bg-[#F5F0E5]/50 transition-colors cursor-pointer ${evt.badgeColor || 'border-l-4 border-l-[#06244B] bg-[#F5F0E5]/20'}`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{evt.type}</span>
                    <span>{formatDate(evt.date, { short: true })}</span>
                  </div>
                  <p className="font-serif font-bold text-sm text-[#06244B] mt-1 line-clamp-1">
                    {evt.title}
                  </p>
                  <p className="text-xs text-[#667085] mt-0.5 line-clamp-1">
                    {evt.location}
                  </p>
                  {evt.startTime && (
                    <p className="text-[11px] text-[#A4432B] font-medium mt-1">
                      {evt.startTime} - {evt.endTime}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Client Messages */}
          <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle p-5">
            <div className="flex items-center justify-between border-b border-[#D9D6CF]/60 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#A4432B]" />
                <h2 className="font-serif text-base font-bold text-[#06244B]">
                  Recent Client Messages
                </h2>
              </div>
              <button
                onClick={() => navigate('/communications')}
                className="text-xs font-semibold text-[#A4432B] hover:underline cursor-pointer"
              >
                All Messages &rarr;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div
                onClick={() => navigate('/communications')}
                className="p-2.5 rounded hover:bg-[#F5F0E5]/60 transition-colors cursor-pointer border-l-2 border-[#A4432B] bg-[#FAF7F0]"
              >
                <div className="flex items-center justify-between font-semibold text-[#06244B]">
                  <span>Vance Sterling (Wasatch Logistics)</span>
                  <span className="text-[10px] text-[#667085]">10:30 AM</span>
                </div>
                <p className="text-[#667085] mt-1 line-clamp-1">
                  Transmitted supplemental electronic bills of lading and refrigerated sensor telemetry logs...
                </p>
                <span className="text-[10px] text-[#A4432B] font-medium mt-1 inline-block">Re: Wasatch Logistics v. Interstate</span>
              </div>

              <div
                onClick={() => navigate('/communications')}
                className="p-2.5 rounded hover:bg-[#F5F0E5]/60 transition-colors cursor-pointer border-l-2 border-[#06244B] bg-[#F5F0E5]/20"
              >
                <div className="flex items-center justify-between font-semibold text-[#06244B]">
                  <span>Dr. Evelyn Martinez</span>
                  <span className="text-[10px] text-[#667085]">Yesterday</span>
                </div>
                <p className="text-[#667085] mt-1 line-clamp-1">
                  Confirmed mediation availability with Dr. Sterling for upcoming Friday hearing session...
                </p>
                <span className="text-[10px] text-[#06244B] font-medium mt-1 inline-block">Re: Marriage of Martinez &amp; Sterling</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white rounded border border-[#D9D6CF] shadow-subtle p-5">
            <h2 className="font-serif text-base font-bold text-[#06244B] mb-3 border-b border-[#D9D6CF]/60 pb-2">
              Firm Recent Activity
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#287A55] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#06244B]">Conflict Check Cleared</p>
                  <p className="text-[#667085]">Clearwater Basin Agricultural Water Co. approved by Eleanor Heugly.</p>
                  <span className="text-[10px] text-gray-400">Yesterday at 4:15 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#A4432B] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#06244B]">CosmoLex Export Synchronized</p>
                  <p className="text-[#667085]">Batch COSMO-2026-1101 (32.4 hrs / $14,850.00) transferred to ledger.</p>
                  <span className="text-[10px] text-gray-400">2 days ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#06244B] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#06244B]">Pleading Filed</p>
                  <p className="text-[#667085]">First Amended Complaint uploaded for Wasatch Logistics v. Interstate Freightlines.</p>
                  <span className="text-[10px] text-gray-400">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Event Details'}
        subtitle={`${selectedEvent?.type} • ${formatDate(selectedEvent?.date)}`}
        maxWidth="max-w-lg"
      >
        {selectedEvent && (
          <div className="space-y-3 text-xs text-[#202A35]">
            <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF]">
              <p className="font-bold text-[#06244B]">{selectedEvent.matterTitle}</p>
              <p className="text-[#667085]">{selectedEvent.clientName}</p>
            </div>
            <div>
              <span className="font-bold text-[#06244B] uppercase tracking-wider text-[10px]">Location / Court:</span>
              <p className="mt-0.5">{selectedEvent.location}</p>
            </div>
            {selectedEvent.presidingJudge && (
              <div>
                <span className="font-bold text-[#06244B] uppercase tracking-wider text-[10px]">Presiding Judge:</span>
                <p className="mt-0.5">{selectedEvent.presidingJudge}</p>
              </div>
            )}
            <div>
              <span className="font-bold text-[#06244B] uppercase tracking-wider text-[10px]">Time &amp; Schedule:</span>
              <p className="mt-0.5">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
            </div>
            {selectedEvent.notes && (
              <div>
                <span className="font-bold text-[#06244B] uppercase tracking-wider text-[10px]">Preparation Notes:</span>
                <p className="mt-0.5 leading-relaxed bg-white p-2 rounded border border-[#D9D6CF]">{selectedEvent.notes}</p>
              </div>
            )}
            <div className="pt-3 border-t border-[#D9D6CF] flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Add Client Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Add Client"
        subtitle="Quick intake of a new prospective or active client."
      >
        <ClientForm
          onSuccess={() => setIsClientModalOpen(false)}
          onCancel={() => setIsClientModalOpen(false)}
        />
      </Modal>

      {/* Quick New Matter Modal */}
      <Modal
        isOpen={isMatterModalOpen}
        onClose={() => setIsMatterModalOpen(false)}
        title="Open New Legal Matter"
        subtitle="Initialize matter record and assign lead counsel."
      >
        <MatterForm
          onSuccess={() => setIsMatterModalOpen(false)}
          onCancel={() => setIsMatterModalOpen(false)}
        />
      </Modal>

      {/* Quick Log Time Modal */}
      <Modal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        title="Record Billable Time"
        subtitle="Direct time entry to matter billing ledger."
      >
        <TimeEntryForm
          onSuccess={() => setIsTimeModalOpen(false)}
          onCancel={() => setIsTimeModalOpen(false)}
        />
      </Modal>

      {/* End-to-End Onboarding Walkthrough Wizard */}
      {isDemoWizardOpen && (
        <EndToEndDemoWizard
          isOpen={isDemoWizardOpen}
          onClose={() => setIsDemoWizardOpen(false)}
        />
      )}
    </div>
  );
}

