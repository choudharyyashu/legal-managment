import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * PermissionGuard
 * Declarative component to conditionally render UI children based on permissions.
 * 
 * Usage:
 * <PermissionGuard permission="clients:create">
 *   <Button>Add Client</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  permissions = [],
  any = false,
  fallback = null,
  children,
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (permissions.length > 0) {
    const passed = any ? hasAnyPermission(permissions) : hasAllPermissions(permissions);
    if (!passed) {
      return fallback;
    }
  }

  return children;
}

