import React, { useState, useMemo } from 'react';
import { CheckSquare, Plus, Search, Filter, Calendar, Clock, AlertTriangle, CheckCircle, Trash2, Edit, Lock, ArrowRight, Repeat, RotateCcw } from 'lucide-react';
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
import { formatDate, formatRelativeDays } from '../../../utils/formatDate';
import { RecurringTaskModal } from '../../calendar/components/RecurringTaskModal';

export function MyTasks() {
  const { tasks, addTask, updateTaskStatus, deleteTask, updateTask } = useTasks();
  const { matters } = useMatters();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // New task form
  const [title, setTitle] = useState('');
  const [matterId, setMatterId] = useState(matters[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');

  // Helper to determine dependency status
  const getPredecessorInfo = (task) => {
    if (!task?.dependsOn) return null;
    const pred = tasks.find(t => t.id === task.dependsOn || t.title === task.dependsOn);
    const isCompleted = pred ? pred.status === 'Completed' : false;
    return {
      id: task.dependsOn,
      title: pred ? pred.title : task.dependsOn,
      isCompleted,
      exists: Boolean(pred),
    };
  };

  // Filter tasks assigned to current user
  const myTasks = useMemo(() => {
    return tasks.filter(t => {
      const isMine = t.assignedToId === currentUser.id;
      const matchesSearch =
        searchQuery === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.matterTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '' || t.status === statusFilter;
      const matchesPriority = priorityFilter === '' || t.priority === priorityFilter;

      return isMine && matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, currentUser.id, searchQuery, statusFilter, priorityFilter]);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!title.trim() || !matterId) {
      addToast('Please enter a task title and select a matter.', 'error');
      return;
    }

    const matter = matters.find(m => m.id === matterId);
    addTask({
      title,
      matterId,
      matterTitle: matter?.title || 'Matter',
      clientId: matter?.clientId || 'CLI-1001',
      clientName: matter?.clientName || 'Client',
      assignedToId: currentUser.id,
      assignedToName: currentUser.name,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      dueDate,
      priority,
      description,
      status: 'Not Started',
    });

    addToast(`Task "${title}" created and added to your schedule.`, 'success');
    setIsAddModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus);
    addToast(`Task status updated to ${newStatus}.`, 'info');
  };

  const handleDelete = (id, taskTitle) => {
    if (confirm(`Are you sure you want to delete task "${taskTitle}"?`)) {
      deleteTask(id);
      addToast('Task removed.', 'info');
      if (selectedTask?.id === id) setSelectedTask(null);
    }
  };

  const columns = [
    {
      key: 'status',
      label: 'Done',
      align: 'center',
      render: (val, row) => {
        const predInfo = getPredecessorInfo(row);
        const isBlocked = predInfo && !predInfo.isCompleted;

        return (
          <input
            type="checkbox"
            checked={val === 'Completed'}
            disabled={isBlocked}
            onChange={(e) => {
              e.stopPropagation();
              if (isBlocked) {
                addToast(`Cannot complete: Prerequisite task (${predInfo.id}) is locked and must be completed first.`, 'error');
                return;
              }
              handleStatusChange(row.id, val === 'Completed' ? 'In Progress' : 'Completed');
            }}
            title={isBlocked ? `Locked: Complete ${predInfo.id} first` : 'Toggle complete'}
            className={`w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] ${
              isBlocked ? 'opacity-40 cursor-not-allowed bg-slate-200' : 'cursor-pointer'
            }`}
          />
        );
      },
    },
    {
      key: 'title',
      label: 'Task Description & Case',
      sortable: true,
      render: (val, row) => {
        const predInfo = getPredecessorInfo(row);

        return (
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {predInfo && !predInfo.isCompleted && (
                <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-700" />
                  <span>Predecessor: {predInfo.id} (Locked)</span>
                </span>
              )}
              {predInfo && predInfo.isCompleted && (
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Predecessor: {predInfo.id} (Completed ✓)</span>
                </span>
              )}
              <span
                onClick={() => setSelectedTask(row)}
                className={`font-semibold text-sm hover:text-[#A4432B] block cursor-pointer ${
                  row.status === 'Completed' ? 'line-through text-[#667085]' : 'text-[#06244B]'
                }`}
              >
                {val}
              </span>
            </div>
            <span className="text-[11px] text-[#667085]">{row.matterTitle}</span>
          </div>
        );
      },
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
      render: (val, row) => {
        const isPast = new Date(val) < new Date() && row.status !== 'Completed';
        return (
          <div>
            <span className={`text-xs font-semibold ${isPast ? 'text-[#B42318]' : 'text-[#202A35]'}`}>
              {formatDate(val, { short: true })}
            </span>
            <span className="text-[10px] text-[#667085] block">{formatRelativeDays(val)}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <select
            value={row.status}
            onChange={(e) => {
              const predInfo = getPredecessorInfo(row);
              if (e.target.value === 'Completed' && predInfo && !predInfo.isCompleted) {
                addToast(`Cannot complete: Prerequisite task (${predInfo.id}) is locked and must be completed first.`, 'error');
                return;
              }
              handleStatusChange(row.id, e.target.value);
            }}
            className="text-xs py-1 px-1.5 rounded border border-[#D9D6CF] bg-white text-[#06244B] cursor-pointer"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting">Waiting</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => handleDelete(row.id, row.title)}
            className="p-1 rounded text-red-600 hover:bg-red-50"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks &amp; Schedule"
        subtitle={`Action items, court filing deadlines, and discovery tasks assigned to ${currentUser.name}.`}
        breadcrumbs={[{ label: 'Tasks & Activities', to: '/tasks' }, { label: 'My Tasks' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Repeat}
              onClick={() => setIsRecurringModalOpen(true)}
            >
              Recurring Rules
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Create Task
            </Button>
          </div>
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
            placeholder="Search my tasks or matters..."
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

          {(searchQuery || statusFilter || priorityFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
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

      {/* Tasks Table */}
      <DataTable
        columns={columns}
        data={myTasks}
        pageSize={10}
        onRowClick={(task) => setSelectedTask(task)}
        emptyMessage="No tasks found for your user matching this filter."
      />

      {/* Create Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Task"
        subtitle="Schedule a litigation task or court filing deadline."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <Input
              label="Task Title / Action Item"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Draft Motion in Limine regarding expert qualifications"
            />
          </div>

          <div>
            <Select
              label="Related Matter"
              required
              value={matterId}
              onChange={(e) => setMatterId(e.target.value)}
              options={matters.map(m => ({ value: m.id, label: `${m.matterNumber} - ${m.title}` }))}
            />
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
                label="Priority Level"
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
              Instructions &amp; Research Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, references, or Utah Rules of Civil Procedure citations..."
              className="w-full text-sm p-3 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Details Modal */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || 'Task Details'}
        subtitle={`Case: ${selectedTask?.matterTitle}`}
        maxWidth="max-w-lg"
      >
        {selectedTask && (
          <div className="space-y-4 text-xs text-[#202A35]">
            <div className="p-3 bg-[#F5F0E5] rounded border border-[#D9D6CF] flex justify-between items-center">
              <div>
                <span className="text-[#667085] block text-[10px] uppercase font-bold">Status &amp; Priority:</span>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedTask.status} />
                  <StatusBadge status={selectedTask.priority} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#667085] block text-[10px] uppercase font-bold">Due Date:</span>
                <span className="font-bold text-sm text-[#06244B]">{formatDate(selectedTask.dueDate)}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-[#06244B] uppercase text-[10px]">Client / Matter:</span>
              <p className="font-semibold text-sm text-[#06244B] mt-0.5">{selectedTask.matterTitle}</p>
              <p className="text-[#667085]">{selectedTask.clientName}</p>
            </div>

            {selectedTask.description && (
              <div>
                <span className="font-bold text-[#06244B] uppercase text-[10px]">Task Description:</span>
                <p className="mt-1 p-3 bg-white border border-[#D9D6CF] rounded leading-relaxed text-sm">
                  {selectedTask.description}
                </p>
              </div>
            )}

            {selectedTask.dependsOn && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                <span className="font-bold text-[#06244B] uppercase text-[10px] block mb-1">
                  Task Dependency / Predecessor:
                </span>
                {(() => {
                  const predInfo = getPredecessorInfo(selectedTask);
                  return predInfo?.isCompleted ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Predecessor <strong>{predInfo.id}</strong> is completed. This task is unlocked and active.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Predecessor <strong>{predInfo?.id}</strong> is pending completion. This task is currently locked.</span>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="pt-3 border-t border-[#D9D6CF] flex justify-between items-center">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleDelete(selectedTask.id, selectedTask.title)}
              >
                Delete
              </Button>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedTask(null)}>
                  Close
                </Button>
                {(() => {
                  const predInfo = getPredecessorInfo(selectedTask);
                  const isBlocked = predInfo && !predInfo.isCompleted && selectedTask.status !== 'Completed';
                  return (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isBlocked}
                      onClick={() => {
                        if (isBlocked) {
                          addToast(`Cannot complete: Prerequisite task (${predInfo.id}) is locked.`, 'error');
                          return;
                        }
                        handleStatusChange(selectedTask.id, selectedTask.status === 'Completed' ? 'In Progress' : 'Completed');
                        setSelectedTask(null);
                      }}
                    >
                      {selectedTask.status === 'Completed' ? 'Mark In Progress' : isBlocked ? 'Locked by Predecessor' : 'Mark Completed'}
                    </Button>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </Modal>
      {/* Recurring Task Modal */}
      <RecurringTaskModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onTaskCreated={(newTask) => {
          addTask({
            id: newTask.id,
            title: newTask.title,
            matterId: newTask.matterId,
            matterTitle: newTask.matterId,
            dueDate: newTask.startDate,
            priority: 'High',
            status: 'Not Started',
            assignedToId: currentUser.id,
            assignedToName: currentUser.name,
            description: `Recurrence pattern: ${newTask.frequency} (Every ${newTask.dayOfWeek || 'period'}). Reminder: ${newTask.reminderDays} days prior.`
          });
        }}
      />
    </div>
  );
}

