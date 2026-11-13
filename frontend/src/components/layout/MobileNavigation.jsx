import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  CreditCard,
  Settings,
  Users,
  FolderOpen,
  UserCheck,
  FileText,
  Mail,
  Eye,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  Sparkles,
  Layers,
  Receipt,
  Building,
  Landmark,
  Globe,
  ShieldAlert,
  Database,
  SlidersHorizontal,
  Bell,
  UserPlus,
  FolderPlus,
  Shield,
  Stethoscope,
  DollarSign,
  Calculator,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useTime } from '../../context/TimeContext';
import { useTasks } from '../../context/TaskContext';

export function MobileNavigation({
  isOpen,
  onClose,
  onOpenAddClient,
  onOpenNewMatter,
  onOpenLogTime
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const permissions = usePermissions();
  const { timeEntries } = useTime();
  const { tasks } = useTasks();

  const pendingApprovalsCount = timeEntries.filter(t => t.status === 'Submitted').length;
  const urgentTasksCount = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length;

  // Active accordion section management (defaults to the currently visited section)
  const [expandedSections, setExpandedSections] = useState({
    clients: location.pathname.startsWith('/clients') || location.pathname.startsWith('/matters') || location.pathname.startsWith('/intake') || location.pathname.startsWith('/documents') || location.pathname.startsWith('/communications') || location.pathname.startsWith('/client-portal') || location.pathname.startsWith('/immigration') || location.pathname.startsWith('/bankruptcy') || location.pathname.startsWith('/personal-injury'),
    tasks: location.pathname.startsWith('/tasks') || location.pathname.startsWith('/calendar') || location.pathname.startsWith('/deadlines') || location.pathname.startsWith('/time') || location.pathname.startsWith('/checklists'),
    billing: location.pathname.startsWith('/billing'),
    settings: location.pathname.startsWith('/reports') || location.pathname.startsWith('/settings'),
  });

  useEffect(() => {
    if (location.pathname.startsWith('/personal-injury') || location.pathname.startsWith('/clients') || location.pathname.startsWith('/matters') || location.pathname.startsWith('/immigration') || location.pathname.startsWith('/bankruptcy')) {
      setExpandedSections(prev => ({ ...prev, clients: true }));
    }
  }, [location.pathname]);

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  if (!isOpen) return null;

  const rawMobileMenus = [
    {
      id: 'dashboard',
      label: '1. Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'clients',
      label: '2. Clients & Matters',
      icon: Briefcase,
      sub: [
        { label: 'All Clients', to: '/clients', icon: Users },
        { label: 'All Matters', to: '/matters', icon: FolderOpen },
        { label: 'Intake & Conflicts', to: '/intake', icon: UserCheck },
        { label: 'Immigration Docket', to: '/immigration/cases', icon: Globe },
        { label: 'Bankruptcy Docket', to: '/bankruptcy/cases', icon: Landmark },
        { label: 'PI Dashboard', to: '/personal-injury/dashboard', icon: LayoutDashboard },
        { label: 'Incident & Liability', to: '/personal-injury/incident-liability', icon: ShieldAlert },
        { label: 'Client & Damages', to: '/personal-injury/client-damages', icon: UserCheck },
        { label: 'Insurance Management', to: '/personal-injury/insurance', icon: Shield },
        { label: 'Medical Treatment & Records', to: '/personal-injury/medical-treatment', icon: Stethoscope },
        { label: 'Vendor Assignments', to: '/personal-injury/vendor-assignments', icon: Briefcase },
        { label: 'Demand Packages', to: '/personal-injury/demand-packages', icon: FileText },
        { label: 'Lien Register', to: '/personal-injury/lien-register', icon: DollarSign },
        { label: 'Settlement Calculator', to: '/personal-injury/settlement-calculator', icon: Calculator },
        { label: 'Documents', to: '/documents', icon: FileText },
        { label: 'Communications', to: '/communications', icon: Mail },
        { label: 'Client Portal', to: '/client-portal', icon: Eye },
      ]
    },
    {
      id: 'tasks',
      label: '3. Tasks & Activities',
      icon: CalendarCheck,
      badge: urgentTasksCount > 0 ? urgentTasksCount : null,
      sub: [
        { label: 'My Tasks', to: '/tasks/mine', icon: CheckSquare },
        { label: 'Team Tasks', to: '/tasks/team', icon: Users },
        { label: 'Calendar', to: '/calendar', icon: Calendar },
        { label: 'Court Deadlines', to: '/deadlines', icon: AlertTriangle },
        { label: 'Time Tracking', to: '/time', icon: Clock },
        { label: 'Daily Review', to: '/time/review', icon: FileSpreadsheet },
        { label: 'Suggested Billing', to: '/time/suggested', icon: Sparkles },
        {
          label: 'Time Approvals',
          to: '/time/approvals',
          icon: UserCheck,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null
        },
        { label: 'Checklists', to: '/checklists', icon: Layers },
      ]
    },
    {
      id: 'billing',
      label: '4. Billing & Accounting',
      icon: CreditCard,
      sub: [
        { label: 'Billing Overview', to: '/billing', icon: CreditCard },
        { label: 'Billable Hours', to: '/billing/hours', icon: Clock },
        { label: 'Expenses', to: '/billing/expenses', icon: Receipt },
        { label: 'Invoices', to: '/billing/invoices', icon: FileText },
        { label: 'Payments', to: '/billing/payments', icon: Building },
        { label: 'Billing Reports', to: '/billing/reports', icon: FileSpreadsheet },
        { label: 'Operating Account', to: '/billing/operating', icon: Landmark },
        { label: 'IOLTA Trust Account', to: '/billing/trust', icon: ShieldAlert },
        { label: 'Chart of Accounts', to: '/billing/chart-of-accounts', icon: Landmark },
        { label: 'General Ledger', to: '/billing/general-ledger', icon: FileSpreadsheet },
        { label: 'CosmoLex Export', to: '/billing/cosmolex', icon: Database },
      ]
    },
    {
      id: 'settings',
      label: '5. Reports & Settings',
      icon: Settings,
      sub: [
        { label: 'Attorney Reports', to: '/reports/staff', icon: FileSpreadsheet },
        { label: 'Matter Reports', to: '/reports/matters', icon: FolderOpen },
        { label: 'Financial Reports', to: '/reports/financial', icon: CreditCard },
        { label: 'User Management', to: '/settings/users', icon: Users },
        { label: 'Roles & Permissions', to: '/settings/roles', icon: UserCheck },
        { label: 'Document Templates', to: '/settings/templates', icon: FileText },
        { label: 'Integrations', to: '/settings/integrations', icon: Database },
        { label: 'Firm Branding', to: '/settings/branding', icon: SlidersHorizontal },
        { label: 'Notifications', to: '/settings/notifications', icon: Bell },
        { label: 'Audit Logs', to: '/settings/audit-logs', icon: ShieldAlert },
        { label: 'Security & Access', to: '/settings/security', icon: Settings },
      ]
    }
  ];

  // Dynamically filter based on permissions.canAccessRoute
  const mobileMenus = rawMobileMenus.map(menu => {
    if (!menu.sub) return menu;
    const filteredSubs = menu.sub.filter(sub => {
      return permissions.canAccessRoute(sub.to);
    });
    return {
      ...menu,
      sub: filteredSubs,
    };
  }).filter(menu => {
    if (menu.to) {
      return permissions.canAccessRoute(menu.to);
    }
    if (menu.sub && menu.sub.length === 0) {
      return false;
    }
    return true;
  });

  const handleSignOut = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#06244B]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Responsive Drawer Container */}
      <div className="relative w-80 max-w-[85vw] bg-[#06244B] text-[#F5F0E5] flex flex-col h-full shadow-2xl z-10 overscroll-contain">
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#0B356D] bg-[#041833] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#A4432B] flex items-center justify-center font-serif font-bold text-white text-sm shadow-xs">
              HB
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-wide block leading-tight text-[#F5F0E5]">
                HEUGLY &amp; BLUDWORTH
              </span>
              <span className="text-[10px] tracking-widest text-[#B8C0C4] uppercase block">
                Legal Practice SaaS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded text-[#B8C0C4] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Quick Action Buttons Bar */}
        {(permissions.canCreateClient || permissions.canCreateMatter || permissions.canLogTime) && (
          <div className="p-2.5 bg-[#041833]/90 border-b border-[#0B356D] grid grid-cols-3 gap-2 flex-shrink-0">
            {permissions.canCreateClient && (
              <button
                type="button"
                onClick={() => {
                  onOpenAddClient?.();
                  onClose();
                }}
                className="flex flex-col items-center justify-center py-2 px-1 rounded bg-white/5 hover:bg-white/10 active:bg-white/15 text-white transition-colors text-[11px] font-medium text-center cursor-pointer min-h-[44px]"
              >
                <UserPlus className="w-4 h-4 text-[#A4432B] mb-1" />
                <span>+ Client</span>
              </button>
            )}

            {permissions.canCreateMatter && (
              <button
                type="button"
                onClick={() => {
                  onOpenNewMatter?.();
                  onClose();
                }}
                className="flex flex-col items-center justify-center py-2 px-1 rounded bg-white/5 hover:bg-white/10 active:bg-white/15 text-white transition-colors text-[11px] font-medium text-center cursor-pointer min-h-[44px]"
              >
                <FolderPlus className="w-4 h-4 text-[#A4432B] mb-1" />
                <span>+ Matter</span>
              </button>
            )}

            {permissions.canLogTime && (
              <button
                type="button"
                onClick={() => {
                  onOpenLogTime?.();
                  onClose();
                }}
                className="flex flex-col items-center justify-center py-2 px-1 rounded bg-[#A4432B] hover:bg-[#8D3823] active:bg-[#752E1D] text-white transition-colors text-[11px] font-medium text-center cursor-pointer shadow-xs min-h-[44px]"
              >
                <Clock className="w-4 h-4 mb-1" />
                <span>Log Time</span>
              </button>
            )}
          </div>
        )}

        {/* Scrollable Navigation links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-sm overscroll-contain">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#B8C0C4]/80">
            Primary Navigation (5 Menus)
          </div>

          {mobileMenus.map((menu) => {
            const Icon = menu.icon;
            const hasSub = Boolean(menu.sub && menu.sub.length > 0);
            const isExpanded = Boolean(expandedSections[menu.id]);
            const isSubActive = menu.sub?.some(sub => location.pathname === sub.to);

            if (!hasSub) {
              return (
                <NavLink
                  key={menu.id}
                  to={menu.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded font-medium text-sm transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-[#A4432B] text-white font-bold shadow-xs'
                        : 'text-[#F5F0E5] hover:bg-white/10 active:bg-white/15'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{menu.label}</span>
                </NavLink>
              );
            }

            return (
              <div key={menu.id} className="rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection(menu.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded font-medium text-sm transition-colors min-h-[44px] text-left cursor-pointer ${
                    isSubActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-[#F5F0E5] hover:bg-white/5 active:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSubActive ? 'text-[#A4432B]' : 'text-[#B8C0C4]'}`} />
                    <span className="truncate">{menu.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {menu.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#B42318] text-white font-bold">
                        {menu.badge}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#B8C0C4]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#B8C0C4]" />
                    )}
                  </div>
                </button>

                {/* Submenu Accordion Panel */}
                {isExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-[#0B356D] ml-5 my-1">
                    {menu.sub.map((sub, sIdx) => {
                      const SubIcon = sub.icon;
                      return (
                        <NavLink
                          key={sIdx}
                          to={sub.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-colors min-h-[38px] ${
                              isActive
                                ? 'bg-[#A4432B] text-white font-bold shadow-xs'
                                : 'text-[#B8C0C4] hover:text-white hover:bg-white/5 active:bg-white/10'
                            }`
                          }
                        >
                          <SubIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                          <span className="flex-1 truncate">{sub.label}</span>
                          {sub.badge && (
                            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-[#A4432B] text-white font-bold">
                              {sub.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User footer & Sign Out */}
        <div className="p-3 sm:p-4 border-t border-[#0B356D] bg-[#041833] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#F5F0E5] text-[#06244B] font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
              {currentUser.initials}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[#A4432B] font-medium tracking-wide truncate">{currentUser.title}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded text-[#B8C0C4] hover:text-[#B42318] hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
