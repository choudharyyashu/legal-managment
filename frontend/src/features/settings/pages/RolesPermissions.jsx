import React, { useState } from 'react';
import {
  Shield,
  Check,
  X,
  Lock,
  Sliders,
  Info,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Filter
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { ROLE_LIST } from '../../../config/roles';
import { PERMISSION_GROUPS, PERMISSION_ACTIONS } from '../../../config/permissions';

export function RolesPermissions() {
  const { rolePermissions, updateRolePermission, resetRolePermissionsToDefault } = useAuth();
  const permissions = usePermissions();
  const { addToast } = useToast();

  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Toggle group expansion
  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Toggle permission handler
  const handleToggle = (roleKey, permissionKey) => {
    if (!permissions.canManageRoles) {
      addToast('Super Admin authorization required to modify role permissions.', 'error');
      return;
    }

    if (roleKey === 'super_admin') {
      addToast('Super Admin permissions are immutable and cannot be revoked.', 'warning');
      return;
    }

    const currentRolePerms = rolePermissions[roleKey] || [];
    const isCurrentlyGranted = currentRolePerms.includes(permissionKey);

    const res = updateRolePermission(roleKey, permissionKey, !isCurrentlyGranted);
    if (res.success) {
      addToast(
        `${!isCurrentlyGranted ? 'Granted' : 'Revoked'} permission for ${
          ROLE_LIST.find(r => r.id === roleKey)?.name
        }. Changes applied to navigation immediately.`,
        !isCurrentlyGranted ? 'success' : 'info'
      );
    }
  };

  // Reset to default baseline
  const handleResetConfirm = () => {
    resetRolePermissionsToDefault();
    addToast('All 5 roles reset to the recommended MVP baseline configuration.', 'success');
    setIsResetConfirmOpen(false);
  };

  // Action badge color helper
  const getActionBadge = (action) => {
    switch (action) {
      case PERMISSION_ACTIONS.VIEW:
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case PERMISSION_ACTIONS.CREATE:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case PERMISSION_ACTIONS.EDIT:
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case PERMISSION_ACTIONS.DELETE:
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case PERMISSION_ACTIONS.APPROVE:
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case PERMISSION_ACTIONS.EXPORT:
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case PERMISSION_ACTIONS.MANAGE:
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter groups
  const displayedGroups = selectedGroupFilter === 'ALL'
    ? PERMISSION_GROUPS
    : PERMISSION_GROUPS.filter(g => g.id === selectedGroupFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Permissions &amp; Access Control Matrix"
        subtitle="Configure and inspect granular functional capabilities across all 5 predefined roles. Updates immediately govern menu visibility and action permissions."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'Roles & Permissions' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => addToast('Exporting RBAC Matrix (CSV with Utah Bar compliance mapping)...', 'success')}
            >
              Export Matrix
            </Button>

            {permissions.canManageRoles && (
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                className="text-[#A4432B] hover:bg-amber-50"
                onClick={() => setIsResetConfirmOpen(true)}
              >
                Reset to Baseline
              </Button>
            )}
          </div>
        }
      />

      {/* Role Comparison Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {ROLE_LIST.map((role) => {
          const grantedCount = role.id === 'super_admin'
            ? 'All'
            : (rolePermissions[role.id]?.length || 0);

          return (
            <div key={role.id} className="bg-white p-3.5 rounded border border-[#D9D6CF] shadow-subtle space-y-2">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${role.badgeStyle}`}>
                  {role.shortName}
                </span>
                {role.isImmutable && (
                  <span title="Immutable Administrative Authority">
                    <Lock className="w-3.5 h-3.5 text-[#06244B]" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-xl font-serif font-bold text-[#06244B]">
                  {grantedCount} <span className="text-xs font-normal text-[#667085]">permissions</span>
                </p>
                <p className="text-[10px] text-[#667085] line-clamp-2 mt-0.5 leading-tight">
                  {role.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded border border-[#D9D6CF] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#06244B]">
          <Info className="w-4 h-4 text-[#A4432B] flex-shrink-0" />
          <span>
            Click any cell toggle to grant or revoke that capability for a role. Super Admin permissions are permanent.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[#667085] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Group:
          </span>
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="py-1 px-2.5 rounded border border-[#D9D6CF] bg-white text-xs font-semibold text-[#06244B] focus:outline-none"
          >
            <option value="ALL">All 5 Permission Groups</option>
            {PERMISSION_GROUPS.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Permission Comparison Table Grouped by 5 Groups */}
      <div className="space-y-4">
        {displayedGroups.map((group) => {
          const isCollapsed = collapsedGroups[group.id];

          return (
            <div key={group.id} className="bg-white rounded-lg border border-[#D9D6CF] shadow-subtle overflow-hidden">
              {/* Group Header */}
              <div
                onClick={() => toggleGroupCollapse(group.id)}
                className="p-3.5 bg-[#F5F0E5]/70 border-b border-[#D9D6CF] flex items-center justify-between cursor-pointer hover:bg-[#F5F0E5] transition-colors"
              >
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#06244B] flex items-center gap-2">
                    <span>{group.name}</span>
                    <span className="text-xs font-normal text-[#667085]">
                      ({group.permissions.length} capabilities)
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#667085] mt-0.5">{group.description}</p>
                </div>
                <button className="text-[#06244B] p-1">
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {/* Group Table */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#D9D6CF] text-xs">
                    <thead className="bg-white text-[#667085] uppercase tracking-wider font-semibold border-b border-[#D9D6CF]">
                      <tr>
                        <th className="py-2.5 px-4 text-left min-w-[220px]">Permission Capability</th>
                        <th className="py-2.5 px-3 text-center min-w-[80px]">Action</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px] font-bold text-[#06244B]">Super Admin</th>
                        <th className="py-2.5 px-3 text-center min-w-[80px]">Attorney</th>
                        <th className="py-2.5 px-3 text-center min-w-[80px]">Paralegal</th>
                        <th className="py-2.5 px-3 text-center min-w-[95px]">Billing Staff</th>
                        <th className="py-2.5 px-3 text-center min-w-[85px]">Supervisor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9D6CF]/40">
                      {group.permissions.map((perm) => {
                        return (
                          <tr key={perm.key} className="hover:bg-[#F5F0E5]/25 transition-colors">
                            {/* Permission Label & Key */}
                            <td className="py-3 px-4">
                              <span className="font-semibold text-[#06244B] block">{perm.label}</span>
                              <code className="text-[10px] text-[#667085] font-mono">{perm.key}</code>
                            </td>

                            {/* Action Type Badge */}
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getActionBadge(perm.action)}`}>
                                {perm.action}
                              </span>
                            </td>

                            {/* Super Admin (Always Checked) */}
                            <td className="py-3 px-3 text-center bg-gray-50/50">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </span>
                            </td>

                            {/* Other 4 Roles (Interactive Toggles) */}
                            {['attorney', 'paralegal', 'billing', 'supervisor'].map((roleKey) => {
                              const isGranted = rolePermissions[roleKey]?.includes(perm.key);
                              const roleDef = ROLE_LIST.find(r => r.id === roleKey);

                              return (
                                <td key={roleKey} className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(roleKey, perm.key)}
                                    title={`Click to ${isGranted ? 'revoke' : 'grant'} for ${roleDef?.name}`}
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full cursor-pointer transition-all shadow-2xs ${
                                      isGranted
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                        : 'bg-rose-50 text-rose-300 hover:bg-rose-100 hover:text-rose-600'
                                    }`}
                                  >
                                    {isGranted ? (
                                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    ) : (
                                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog for Baseline Reset */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Permissions to Default Baseline?"
        message="This will revert all 5 roles back to the client-specified MVP baseline permission configuration. Any custom permission toggles will be overwritten. Continue?"
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
