import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTE_PERMISSIONS } from '../../config/permissions';
import { Button } from '../ui/Button';

export function RoleRoute({ children, permission, allowedRoles }) {
  const { role, isSuperAdmin, hasPermission, canAccessRoute } = usePermissions();
  const location = useLocation();

  if (isSuperAdmin) {
    return children;
  }

  let isAuthorized = true;

  if (permission) {
    isAuthorized = hasPermission(permission);
  } else if (ROUTE_PERMISSIONS[location.pathname]) {
    // Prioritize dynamic capability matrix so Super Admin toggles take immediate effect on direct URLs
    isAuthorized = canAccessRoute(location.pathname);
  } else if (allowedRoles && allowedRoles.length > 0) {
    isAuthorized = allowedRoles.includes(role);
  } else {
    // Fallback to route-to-permission mapping
    isAuthorized = canAccessRoute(location.pathname);
  }

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-lg border border-[#D9D6CF] shadow-subtle text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-[#B42318] flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#06244B]">
            Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-1.5 leading-relaxed">
            Your current account role (<strong>{role}</strong>) does not have authorization to access <code>{location.pathname}</code>.
            This area is restricted under Heugly &amp; Bludworth confidentiality policies (Utah RPC 1.6).
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => window.location.href = '/dashboard'}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
