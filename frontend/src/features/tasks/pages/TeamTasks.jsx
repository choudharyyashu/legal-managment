import React, { useState, useMemo } from 'react';
import { Users, Plus, Search, Filter, CheckSquare, Calendar, UserCheck, RotateCcw } from 'lucide-react';
import { useTasks } from '../../../context/TaskContext';
import { useMatters } from '../../../context/MatterContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { FilterBar } from '../../../components/shared/FilterBar';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { formatDate } from '../../../utils/formatDate';

export function TeamTasks() {
  const { tasks, addTask, updateTaskStatus, updateTask } = useTasks();
  const { matters } = useMatters();
  const { allUsers, currentUser } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [assignedToId, setAssignedToId] = useState(allUsers[0]?.id || '');
  const [matterId, setMatterId] = useState(matters[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch =
        searchQuery === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.matterTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAssignee = assigneeFilter === '' || t.assignedToId === assigneeFilter;
      const matchesPriority = priorityFilter === '' || t.priority === priorityFilter;
      const matchesStatus = statusFilter === '' || t.status === statusFilter;

      return matchesSearch && matchesAssignee && matchesPriority && matchesStatus;
    });
  }, [tasks, searchQuery, assigneeFilter, priorityFilter, statusFilter]);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!title.trim() || !matterId || !assignedToId) {
      addToast('Please complete all required fields.', 'error');
      return;
    }

    const matter = matters.find(m => m.id === matterId);
    const assignee = allUsers.find(u => u.id === assignedToId);

    addTask({
      title,
      matterId,
      matterTitle: matter?.title || 'Matter',
      clientId: matter?.clientId || 'CLI-1001',
      clientName: matter?.clientName || 'Client',
      assignedToId,
      assignedToName: assignee?.name || 'Staff',
      createdById: currentUser.id,
      createdByName: currentUser.name,
      dueDate,
      priority,
      description,
      status: 'Not Started',
    });

    addToast(`Delegated task "${title}" to ${assignee?.name}.`, 'success');
    setIsDelegateModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const columns = [
    {
      key: 'title',
      label: 'Task & Matter',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-sm text-[#06244B] block">{val}</span>
          <span className="text-[11px] text-[#667085]">{row.matterTitle}</span>
        </div>
      ),
    },
    {
      key: 'assignedToName',
      label: 'Assigned User',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-xs text-[#06244B]">{val}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (val) => <span className="text-xs text-[#202A35]">{formatDate(val, { short: true })}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Update Status',
      align: 'right',
      render: (val, row) => (
        <select
          value={row.status}
          onChange={(e) => {
            updateTaskStatus(row.id, e.target.value);
            addToast(`Updated status for ${row.title}`, 'info');
          }}
          className="text-xs py-1 px-1.5 rounded border border-[#D9D6CF] bg-white text-[#06244B] cursor-pointer"
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Waiting">Waiting</option>
          <option value="Completed">Completed</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Tasks &amp; Workload Monitor"
        subtitle="Cross-practice task assignments, paralegal support tracking, and supervisor oversight."
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'Team Tasks' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsDelegateModalOpen(true)}
          >
            Assign Team Task
          </Button>
        }
      />

      {/* Unified Executive Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAECF0] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#98A2B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team tasks or assignees..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-[#1D2939] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#06244B] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475467] mr-1">
            <Filter className="w-3.5 h-3.5 text-[#A4432B]" />
            <span className="uppercase text-[10px] tracking-wider font-mono">Filters:</span>
          </div>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Team Member: All</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Status: All</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting">Waiting</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#06244B] cursor-pointer"
          >
            <option value="">Priority: All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {(searchQuery || assigneeFilter || statusFilter || priorityFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setAssigneeFilter('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#667085] hover:text-[#A4432B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Clear all filters and search"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTasks}
        pageSize={10}
      />

      {/* Assign Task Modal */}
      <Modal
        isOpen={isDelegateModalOpen}
        onClose={() => setIsDelegateModalOpen(false)}
        title="Delegate / Assign Team Task"
        subtitle="Assign work product or court preparation to associates or paralegal staff."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <Input
              label="Task Title / Instruction"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Prepare subpoena duces tecum for bank records"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Select
                label="Assign To"
                required
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                options={allUsers.map(u => ({ value: u.id, label: `${u.name} (${u.title})` }))}
              />
            </div>
            <div>
              <Select
                label="Matter File"
                required
                value={matterId}
                onChange={(e) => setMatterId(e.target.value)}
                options={matters.map(m => ({ value: m.id, label: `${m.matterNumber} - ${m.title}` }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <DatePicker
                label="Due Date"
                required
                value={dueDate}
                onChange={setDueDate}
              />
            </div>
            <div>
              <Select
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={[
                  { value: 'Urgent', label: 'Urgent' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope of work, references, and deadline instructions..."
              className="w-full text-sm p-3 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsDelegateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Assign Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

