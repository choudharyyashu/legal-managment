/**
 * HEUGLY & BLUDWORTH – LEGAL MANAGEMENT SOFTWARE
 * Centralized Permission Hook & Capability Evaluator
 */

import { useAuth } from './useAuth';
import { PERMISSIONS, ROUTE_PERMISSIONS } from '../config/permissions';

export function usePermissions() {
  const { currentUser, rolePermissions } = useAuth();
  const role = currentUser?.role || 'attorney';
  const isSuperAdmin = role === 'super_admin';

  // Current active permissions for the logged-in user's role
  const activePermissions = rolePermissions?.[role] || [];

  /**
   * Check if current user has a specific granular permission
   */
  const hasPermission = (permissionKey) => {
    if (isSuperAdmin) return true;
    if (!permissionKey) return true;
    return activePermissions.includes(permissionKey);
  };

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissionKeys = []) => {
    if (isSuperAdmin) return true;
    if (!permissionKeys || permissionKeys.length === 0) return true;
    return permissionKeys.some(key => activePermissions.includes(key));
  };

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissionKeys = []) => {
    if (isSuperAdmin) return true;
    if (!permissionKeys || permissionKeys.length === 0) return true;
    return permissionKeys.every(key => activePermissions.includes(key));
  };

  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = (pathname) => {
    if (isSuperAdmin) return true;
    // Direct lookup
    const requiredPermission = ROUTE_PERMISSIONS[pathname];
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }
    // Pattern match for dynamic routes (e.g. /clients/:id -> /clients)
    const baseRoute = Object.keys(ROUTE_PERMISSIONS).find(route => {
      if (route.includes(':')) {
        const regex = new RegExp(`^${route.replace(/:[^\s/]+/g, '([^/]+)')}$`);
        return regex.test(pathname);
      }
      return false;
    });

    if (baseRoute) {
      return hasPermission(ROUTE_PERMISSIONS[baseRoute]);
    }

    return true; // Unrestricted or public route
  };

  /**
   * Matter-level ethical boundary check
   */
  const canAccessMatter = (matter) => {
    if (isSuperAdmin || role === 'supervisor') return true;
    if (!matter) return false;
    if (role === 'billing') return true; // Billing can review all billing dockets
    if (role === 'attorney' || role === 'paralegal') {
      return (
        matter.assignedAttorneyId === currentUser.id ||
        matter.assignedStaffIds?.includes(currentUser.id) ||
        matter.assignedAttorneyName?.includes(currentUser.name.split(',')[0])
      );
    }
    return true;
  };

  return {
    role,
    isSuperAdmin,
    isAttorney: role === 'attorney',
    isParalegal: role === 'paralegal',
    isBilling: role === 'billing',
    isSupervisor: role === 'supervisor',

    // Core permission evaluators
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    canAccessMatter,
    activePermissions,

    // Granular capability flags (backwards compatibility and quick checks)
    canViewFirmWideReports: hasPermission(PERMISSIONS.REPORTS_FINANCIAL_VIEW),
    canManageUsers: hasPermission(PERMISSIONS.USERS_MANAGE),
    canManageRoles: hasPermission(PERMISSIONS.ROLES_MANAGE),
    canEditSettings: hasPermission(PERMISSIONS.SECURITY_MANAGE),
    canViewAuditLogs: hasPermission(PERMISSIONS.AUDIT_LOGS_VIEW),

    // Clients & Matters
    canCreateClient: hasPermission(PERMISSIONS.CLIENTS_CREATE),
    canEditClient: hasPermission(PERMISSIONS.CLIENTS_EDIT),
    canDeleteClient: hasPermission(PERMISSIONS.CLIENTS_DELETE),

    canCreateMatter: hasPermission(PERMISSIONS.MATTERS_CREATE),
    canEditMatter: hasPermission(PERMISSIONS.MATTERS_EDIT),
    canDeleteMatter: hasPermission(PERMISSIONS.MATTERS_DELETE),

    canReviewConflict: hasPermission(PERMISSIONS.INTAKE_CONFLICT_REVIEW),
    canUploadDocuments: hasPermission(PERMISSIONS.DOCUMENTS_UPLOAD),

    // Time & Billing
    canLogTime: hasPermission(PERMISSIONS.TIME_LOG),
    canApproveTime: hasPermission(PERMISSIONS.TIME_APPROVE),
    canExportToCosmoLex: hasPermission(PERMISSIONS.COSMOLEX_EXPORT),
    canManageInvoices: hasPermission(PERMISSIONS.INVOICES_MANAGE),
    canRecordPayments: hasPermission(PERMISSIONS.PAYMENTS_RECORD),
    canViewFinancialOverview: hasPermission(PERMISSIONS.REPORTS_FINANCIAL_VIEW),

    // Team monitoring
    canViewTeamWorkload: hasPermission(PERMISSIONS.DASHBOARD_WORKLOAD_VIEW),
  };
}
