import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit,
  Shield,
  Mail,
  DollarSign,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Key,
  Trash2,
  UserCheck,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
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
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { ROLE_LIST } from '../../../config/roles';
import { PERMISSION_GROUPS, PERMISSIONS } from '../../../config/permissions';
import { formatDate } from '../../../utils/formatDate';

export function UserManagement() {
  const {
    allUsers,
    currentUser,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    resetPassword,
    rolePermissions
  } = useAuth();
  const permissions = usePermissions();
  const { addToast } = useToast();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Drawer States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Add User Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'attorney',
    title: '',
    department: 'Litigation',
    rate: '450',
    status: 'Active',
  });

  // Edit User Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'attorney',
    title: '',
    department: 'Litigation',
    rate: '450',
    status: 'Active',
  });

  // Handlers for Add User
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'attorney',
      title: 'Staff Attorney',
      department: 'Civil Litigation & Commercial',
      rate: '400',
      status: 'Active',
    });
    setIsAddUserOpen(true);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!permissions.canManageUsers) {
      addToast('Super Admin authorization required to create users.', 'error');
      return;
    }
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast('Name and work email are required.', 'error');
      return;
    }

    // Check duplicate email
    if (allUsers.some(u => u.email.toLowerCase() === formData.email.trim().toLowerCase())) {
      addToast('A firm account with this email address already exists.', 'error');
      return;
    }

    const res = addUser(formData);
    if (res.success) {
      addToast(`User account for "${formData.name}" created successfully.`, 'success');
      setIsAddUserOpen(false);
    }
  };

  // Handlers for Edit User
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '(801) 555-0100',
      role: user.role,
      title: user.title,
      department: user.department,
      rate: user.rate.toString(),
      status: user.status,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!permissions.canManageUsers) {
      addToast('Super Admin authorization required to edit users.', 'error');
      return;
    }

    const res = updateUser(editingUser.id, {
      ...editFormData,
      rate: parseFloat(editFormData.rate) || editingUser.rate,
    });

    if (!res.success) {
      addToast(res.message, 'error');
      return;
    }

    addToast(`Personnel record for "${editFormData.name}" updated.`, 'success');
    setEditingUser(null);
  };

  // Action: Toggle Status (Activate / Deactivate)
  const handleToggleStatusPrompt = (user) => {
    if (user.id === currentUser.id) {
      addToast('Security Violation: You cannot deactivate your own active session account.', 'error');
      return;
    }

    const actionText = user.status === 'Active' ? 'deactivate' : 'activate';
    setConfirmDialog({
      isOpen: true,
      title: `${actionText === 'activate' ? 'Activate' : 'Deactivate'} User Account`,
      message: `Are you sure you want to ${actionText} ${user.name}? ${
        actionText === 'deactivate'
          ? 'Deactivated users will immediately lose workstation login access.'
          : 'Activated users will regain workstation access.'
      }`,
      onConfirm: () => {
        const res = toggleUserStatus(user.id);
        if (res.success) {
          addToast(`Account for ${user.name} is now ${res.status}.`, 'info');
        } else {
          addToast(res.message, 'error');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Action: Reset Password
  const handleResetPasswordPrompt = (user) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Account Password',
      message: `Send an official password reset authorization email and token to ${user.name} (${user.email})?`,
      onConfirm: () => {
        const res = resetPassword(user.id);
        addToast(res.message, 'success');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Action: Delete User
  const handleDeleteUserPrompt = (user) => {
    if (user.id === currentUser.id) {
      addToast('Security Violation: You cannot delete your own active account.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Delete Personnel Record: ${user.name}`,
      message: `Warning: This will permanently remove the personnel profile for ${user.name} from the firm directory. Historic billable hours and case filings remain preserved. Continue?`,
      onConfirm: () => {
        const res = deleteUser(user.id);
        if (res.success) {
          addToast(`User record for ${user.name} deleted.`, 'success');
        } else {
          addToast(res.message, 'error');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Filtered Users
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Table Columns
  const columns = [
    {
      key: 'name',
      label: 'Staff Member & Role',
      sortable: true,
      render: (val, row) => {
        const roleDef = ROLE_LIST.find(r => r.id === row.role) || ROLE_LIST[1];
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#06244B] text-[#F5F0E5] flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
              {row.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#06244B] block">{val}</span>
                {row.id === currentUser.id && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold uppercase">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${roleDef.badgeStyle}`}>
                  {roleDef.name}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-[11px] text-[#667085]">{row.title}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      label: 'Email & Phone',
      render: (val, row) => (
        <div className="text-xs">
          <span className="text-[#202A35] font-medium block">{val}</span>
          <span className="text-[11px] text-[#667085]">{row.phone || '(801) 555-0100'}</span>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (val) => <span className="text-xs text-[#202A35]">{val}</span>,
    },
    {
      key: 'rate',
      label: 'Hourly Rate',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#A4432B]">${val}/hr</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-semibold ${
          val === 'Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-700 border border-gray-300'
        }`}>
          {val === 'Active' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-gray-400" />}
          {val}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (val) => <span className="text-[11px] text-[#667085]">{val || 'Never'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {/* View Details */}
          <button
            onClick={() => setViewingUser(row)}
            className="p-1.5 rounded text-[#06244B] hover:bg-[#F5F0E5] transition-colors"
            title="View User Permissions & Profile"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit User (Super Admin only) */}
          {permissions.canManageUsers && (
            <button
              onClick={() => handleOpenEditModal(row)}
              className="p-1.5 rounded text-[#06244B] hover:bg-[#F5F0E5] transition-colors"
              title="Edit User Profile & Role"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {/* Reset Password */}
          {permissions.canManageUsers && (
            <button
              onClick={() => handleResetPasswordPrompt(row)}
              className="p-1.5 rounded text-[#667085] hover:text-[#06244B] hover:bg-[#F5F0E5] transition-colors"
              title="Dispatch Password Reset"
            >
              <Key className="w-4 h-4" />
            </button>
          )}

          {/* Activate / Deactivate Toggle (Cannot deactivate oneself) */}
          {permissions.canManageUsers && row.id !== currentUser.id && (
            <button
              onClick={() => handleToggleStatusPrompt(row)}
              className={`p-1.5 rounded transition-colors ${
                row.status === 'Active' ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
              title={row.status === 'Active' ? 'Deactivate User Account' : 'Activate User Account'}
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}

          {/* Delete User (Cannot delete oneself) */}
          {permissions.canManageUsers && row.id !== currentUser.id && (
            <button
              onClick={() => handleDeleteUserPrompt(row)}
              className="p-1.5 rounded text-gray-400 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Delete User Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personnel &amp; User Management"
        subtitle="Manage firm attorneys, litigation paralegals, accounting staff, and security accounts across all 5 predefined roles."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'User Management' }]}
        actions={
          permissions.canManageUsers && (
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={handleOpenAddModal}
            >
              Add New User
            </Button>
          )
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase text-[#667085]">Total Accounts</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#06244B] mt-1">{allUsers.length}</p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase text-[#667085]">Active Personnel</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#287A55] mt-1">
            {allUsers.filter(u => u.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase text-[#667085]">Practicing Attorneys</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#06244B] mt-1">
            {allUsers.filter(u => u.role === 'attorney' || u.role === 'super_admin' || u.role === 'supervisor').length}
          </p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded border border-[#D9D6CF] shadow-subtle">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase text-[#667085]">Configured Roles</span>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[#A4432B] mt-1">5 Predefined</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-3.5 sm:p-4 rounded border border-[#D9D6CF] shadow-subtle flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, department..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F0E5]/50 border border-[#D9D6CF] rounded text-[#202A35] placeholder-[#667085] focus:outline-none focus:bg-white focus:border-[#06244B]"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 text-[#667085] flex-shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto py-1.5 px-2.5 rounded border border-[#D9D6CF] bg-white text-xs text-[#06244B] font-medium focus:outline-none"
            >
              <option value="ALL">All Roles (5)</option>
              {ROLE_LIST.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-initial w-full sm:w-auto py-1.5 px-2.5 rounded border border-[#D9D6CF] bg-white text-xs text-[#06244B] font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        pageSize={8}
      />

      {/* ADD NEW USER MODAL */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add New Firm User"
        subtitle="Create an authorized user workstation account with an assigned role."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Legal Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rachel Sterling, Esq."
            />

            <Input
              label="Work Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="attorney@utahslawyers.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Direct Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(801) 555-0199"
            />

            <Input
              label="Official Title / Designation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Associate Attorney"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202A35] mb-1">
                Assigned Role (Exact 5 Roles)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full py-2 px-3 text-xs bg-white border border-[#D9D6CF] rounded text-[#06244B] font-semibold focus:outline-none focus:border-[#06244B]"
              >
                {ROLE_LIST.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-[#667085] mt-1">
                {ROLE_LIST.find(r => r.id === formData.role)?.description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202A35] mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full py-2 px-3 text-xs bg-white border border-[#D9D6CF] rounded text-[#202A35] focus:outline-none focus:border-[#06244B]"
              >
                <option value="Civil Litigation & Commercial">Civil Litigation &amp; Commercial</option>
                <option value="Family Law & Domestic Relations">Family Law &amp; Domestic</option>
                <option value="Estate Planning & Probate">Estate Planning &amp; Probate</option>
                <option value="Litigation Support">Litigation Support</option>
                <option value="Finance & Administration">Finance &amp; Administration</option>
                <option value="Executive / Litigation">Executive / Litigation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Standard Hourly Billing Rate ($/hr)"
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              placeholder="400"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202A35] mb-1">
                Initial Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full py-2 px-3 text-xs bg-white border border-[#D9D6CF] rounded text-[#202A35] focus:outline-none focus:border-[#06244B]"
              >
                <option value="Active">Active (Permit Login)</option>
                <option value="Inactive">Inactive (Deactivated)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save User Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Edit Personnel: ${editingUser?.name}`}
        subtitle="Update profile details, hourly billing rate, and assigned application role."
        maxWidth="max-w-xl"
      >
        {editingUser && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {/* Self modification warning notice */}
            {editingUser.id === currentUser.id && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Active User Notice:</span> You are currently editing your own logged-in account. For security integrity, self-role changes and self-deactivation are disabled.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />

              <Input
                label="Work Email Address"
                type="email"
                required
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Direct Phone Number"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />

              <Input
                label="Official Title / Designation"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#202A35] mb-1">
                  Assigned Role
                </label>
                <select
                  disabled={editingUser.id === currentUser.id}
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className={`w-full py-2 px-3 text-xs bg-white border border-[#D9D6CF] rounded text-[#06244B] font-semibold focus:outline-none ${
                    editingUser.id === currentUser.id ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
                  }`}
                >
                  {ROLE_LIST.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#202A35] mb-1">
                  Department
                </label>
                <select
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full py-2 px-3 text-xs bg-white border border-[#D9D6CF] rounded text-[#202A35] focus:outline-none"
                >
                  <option value="Civil Litigation & Commercial">Civil Litigation &amp; Commercial</option>
                  <option value="Family Law & Domestic Relations">Family Law &amp; Domestic</option>
                  <option value="Estate Planning & Probate">Estate Planning &amp; Probate</option>
                  <option value="Litigation Support">Litigation Support</option>
                  <option value="Finance & Administration">Finance &amp; Administration</option>
                  <option value="Executive / Litigation">Executive / Litigation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Standard Hourly Billing Rate ($/hr)"
                type="number"
                value={editFormData.rate}
                onChange={(e) => setEditFormData({ ...editFormData, rate: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#202A35] mb-1">
                  Account Status
                </label>
                <select
                  disabled={editingUser.id === currentUser.id}
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className={`w-full py-2 px-3 text-xs bg-white border border-[#D9D6CF] rounded text-[#202A35] focus:outline-none ${
                    editingUser.id === currentUser.id ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive (Deactivated)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#D9D6CF]">
              <Button size="sm" variant="outline" type="button" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* USER DETAILS & EFFECTIVE PERMISSIONS DRAWER / MODAL */}
      <Modal
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        title={`Personnel Profile & Effective Permissions`}
        subtitle={`${viewingUser?.name} • Account ID: ${viewingUser?.id}`}
        maxWidth="max-w-2xl"
      >
        {viewingUser && (() => {
          const roleDef = ROLE_LIST.find(r => r.id === viewingUser.role) || ROLE_LIST[1];
          const userPermissions = rolePermissions[viewingUser.role] || [];
          return (
            <div className="space-y-6 text-xs text-[#202A35]">
              {/* Profile Card */}
              <div className="p-4 bg-[#F5F0E5]/60 rounded-lg border border-[#D9D6CF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#06244B] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {viewingUser.initials}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#06244B]">{viewingUser.name}</h4>
                    <p className="text-[#667085]">{viewingUser.email} • {viewingUser.phone || '(801) 555-0100'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${roleDef.badgeStyle}`}>
                        {roleDef.name}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] text-[#A4432B] font-semibold">${viewingUser.rate}/hr</span>
                      <span className="text-gray-300">•</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        viewingUser.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {viewingUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#667085] sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#D9D6CF]">
                  <p>Department: <strong className="text-[#06244B]">{viewingUser.department}</strong></p>
                  <p className="mt-0.5">Created: {viewingUser.createdAt}</p>
                  <p className="mt-0.5">Last Login: {viewingUser.lastLogin || 'Never'}</p>
                </div>
              </div>

              {/* Role Scope Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Role Description: </span>
                  {roleDef.description}
                </div>
              </div>

              {/* Effective Permissions Breakdown across 5 Groups */}
              <div>
                <h4 className="font-serif font-bold text-sm text-[#06244B] mb-2.5 flex items-center justify-between border-b border-[#D9D6CF] pb-1.5">
                  <span>Effective Functional Permissions ({viewingUser.role === 'super_admin' ? 'All Granted' : `${userPermissions.length} Enabled`})</span>
                  <span className="text-[11px] text-[#A4432B] font-normal">Controlled via Roles &amp; Permissions</span>
                </h4>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {PERMISSION_GROUPS.map((group) => {
                    const groupPerms = group.permissions;
                    const grantedInGroup = groupPerms.filter(p =>
                      viewingUser.role === 'super_admin' ? true : userPermissions.includes(p.key)
                    );

                    return (
                      <div key={group.id} className="p-3 bg-white rounded border border-[#D9D6CF]">
                        <div className="flex items-center justify-between font-bold text-[#06244B] mb-1.5">
                          <span>{group.name}</span>
                          <span className="text-[10px] text-[#667085] font-normal">
                            {grantedInGroup.length} of {groupPerms.length} granted
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {groupPerms.map(p => {
                            const isGranted = viewingUser.role === 'super_admin' ? true : userPermissions.includes(p.key);
                            return (
                              <div
                                key={p.key}
                                className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded ${
                                  isGranted ? 'bg-emerald-50 text-emerald-950 font-medium' : 'bg-gray-50 text-gray-400 line-through'
                                }`}
                              >
                                {isGranted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                )}
                                <span className="truncate">{p.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
                <Button size="sm" variant="primary" onClick={() => setViewingUser(null)}>
                  Close Profile
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
