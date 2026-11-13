import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  FolderOpen,
  UserCheck,
  FileText,
  Mail,
  Clock,
  Calendar,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Building,
  ShieldAlert,
  SlidersHorizontal,
  ChevronLeft,
  Eye,
  CheckSquare,
  Landmark,
  Globe,
  Layers,
  Database,
  Sparkles,
  Bell,
  Scale,
  Calculator,
  Award,
  Activity,
  Shield,
  Stethoscope,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useTime } from '../../context/TimeContext';
import { useTasks } from '../../context/TaskContext';

export function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { currentUser } = useAuth();
  const permissions = usePermissions();
  const { timeEntries } = useTime();
  const { tasks } = useTasks();

  const pendingApprovalsCount = timeEntries.filter(t => t.status === 'Submitted').length;
  const urgentTasksCount = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length;

  // Track expanded menu state in sidebar
  const [expandedMenus, setExpandedMenus] = useState({
    clients: location.pathname.startsWith('/clients') || location.pathname.startsWith('/matters') || location.pathname.startsWith('/intake') || location.pathname.startsWith('/documents') || location.pathname.startsWith('/communications') || location.pathname.startsWith('/client-portal') || location.pathname.startsWith('/immigration') || location.pathname.startsWith('/bankruptcy') || location.pathname.startsWith('/personal-injury'),
    tasks: location.pathname.startsWith('/tasks') || location.pathname.startsWith('/calendar') || location.pathname.startsWith('/deadlines') || location.pathname.startsWith('/time') || location.pathname.startsWith('/checklists'),
    billing: location.pathname.startsWith('/billing'),
    settings: location.pathname.startsWith('/reports') || location.pathname.startsWith('/settings'),
  });

  const [expandedSubgroups, setExpandedSubgroups] = useState({
    practiceAreas: false,
    personalInjury: false,
  });

  // Automatically keep parent menus expanded based on current route
  useEffect(() => {
    if (
      location.pathname.startsWith('/clients') ||
      location.pathname.startsWith('/matters') ||
      location.pathname.startsWith('/intake') ||
      location.pathname.startsWith('/documents') ||
      location.pathname.startsWith('/communications') ||
      location.pathname.startsWith('/client-portal') ||
      location.pathname.startsWith('/personal-injury') ||
      location.pathname.startsWith('/immigration') ||
      location.pathname.startsWith('/bankruptcy')
    ) {
      setExpandedMenus(prev => ({ ...prev, clients: true }));
    }
  }, [location.pathname]);

  const toggleSubmenu = (menuKey) => {
    if (collapsed) {
      setCollapsed(false);
    }
    setExpandedMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  const toggleSubgroup = (groupKey, e) => {
    if (e) e.stopPropagation();
    setExpandedSubgroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Helper to determine if a menu or any of its nested descendants is currently active
  const isItemActive = (navItem) => {
    if (navItem.to && (location.pathname === navItem.to || location.pathname.startsWith(navItem.to + '/'))) return true;
    if (navItem.subItems) {
      return navItem.subItems.some(sub => {
        if (sub.to && (location.pathname === sub.to || location.pathname.startsWith(sub.to + '/'))) return true;
        if (sub.nestedItems) {
          return sub.nestedItems.some(nested => {
            if (nested.to && (location.pathname === nested.to || location.pathname.startsWith(nested.to + '/'))) return true;
            if (nested.nestedItems) {
              return nested.nestedItems.some(deep => deep.to && (location.pathname === deep.to || location.pathname.startsWith(deep.to + '/')));
            }
            return false;
          });
        }
        return false;
      });
    }
    return false;
  };

  const rawNavItems = [
    {
      id: 'dashboard',
      label: '1. Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
      subItems: null,
    },
    {
      id: 'clients',
      label: '2. Clients & Matters',
      icon: Briefcase,
      subItems: [
        { label: 'All Clients', to: '/clients', icon: Users },
        { label: 'All Matters', to: '/matters', icon: FolderOpen },
        {
          id: 'practiceAreas',
          label: 'Practice Areas',
          icon: Scale,
          isGroup: true,
          nestedItems: [
            { label: 'Personal Injury Docket', to: '/personal-injury/dashboard', icon: Activity },
            { label: 'Immigration Docket', to: '/immigration/cases', icon: Globe },
            { label: 'Bankruptcy Docket', to: '/bankruptcy/cases', icon: Landmark },
          ],
        },
        { label: 'Intake & Conflicts', to: '/intake', icon: UserCheck },
        { label: 'Documents', to: '/documents', icon: FileText },
        { label: 'Communications', to: '/communications', icon: Mail },
        { label: 'Client Portal Preview', to: '/client-portal', icon: Eye },
      ],
    },
    {
      id: 'tasks',
      label: '3. Tasks & Activities',
      icon: CalendarCheck,
      badge: urgentTasksCount > 0 ? urgentTasksCount : null,
      badgeColor: 'bg-[#B42318]',
      subItems: [
        { label: 'My Tasks', to: '/tasks/mine', icon: CheckSquare },
        { label: 'Team Tasks', to: '/tasks/team', icon: Users },
        { label: 'Firm Calendar', to: '/calendar', icon: Calendar },
        { label: 'Court Deadlines', to: '/deadlines', icon: AlertTriangle },
        { label: 'Time Tracking', to: '/time', icon: Clock },
        { label: 'Daily Time Review', to: '/time/review', icon: FileSpreadsheet },
        { label: 'Suggested Billing', to: '/time/suggested', icon: Sparkles },
        {
          label: 'Time Approvals',
          to: '/time/approvals',
          icon: UserCheck,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
        },
        { label: 'Workflow Checklists', to: '/checklists', icon: Layers },
      ],
    },
    {
      id: 'billing',
      label: '4. Billing & Accounting',
      icon: CreditCard,
      subItems: [
        { label: 'Billing Overview', to: '/billing', icon: CreditCard },
        { label: 'Billable Hours', to: '/billing/hours', icon: Clock },
        { label: 'Expenses', to: '/billing/expenses', icon: Receipt },
        { label: 'Invoices', to: '/billing/invoices', icon: FileText },
        { label: 'Payment Records', to: '/billing/payments', icon: Building },
        { label: 'Billing Reports', to: '/billing/reports', icon: FileSpreadsheet },
        { label: 'Operating Account', to: '/billing/operating', icon: Landmark },
        { label: 'IOLTA Trust Account', to: '/billing/trust', icon: ShieldAlert },
        { label: 'Chart of Accounts', to: '/billing/chart-of-accounts', icon: Landmark },
        { label: 'General Ledger', to: '/billing/general-ledger', icon: FileSpreadsheet },
        { label: '3-Way Reconciliation', to: '/billing/reconciliation', icon: Scale },
        { label: 'Settlement Calculator', to: '/billing/settlements', icon: Calculator },
      ],
    },
    {
      id: 'settings',
      label: '5. Reports & Settings',
      icon: Settings,
      subItems: [
        { label: 'RFP Compliance Matrix (Req 9)', to: '/reports/compliance', icon: Award },
        { label: 'Attorney & Staff Reports', to: '/reports/staff', icon: FileSpreadsheet },
        { label: 'Matter & Practice Reports', to: '/reports/matters', icon: FolderOpen },
        { label: 'Financial & Billing Reports', to: '/reports/financial', icon: CreditCard },
        { label: 'User Management', to: '/settings/users', icon: Users },
        { label: 'Roles & Permissions', to: '/settings/roles', icon: UserCheck },
        { label: 'Templates & Workflows', to: '/settings/templates', icon: FileText },
        { label: 'Workflow Configurator', to: '/settings/workflows', icon: Layers },
        { label: 'Integrations & Cloud', to: '/settings/integrations', icon: Database },
        { label: 'Firm Branding', to: '/settings/branding', icon: SlidersHorizontal },
        { label: 'Notifications', to: '/settings/notifications', icon: Bell },
        { label: 'Audit Logs', to: '/settings/audit-logs', icon: ShieldAlert },
        { label: 'Security & Access', to: '/settings/security', icon: Settings },
      ],
    },
  ];

  // Dynamically filter subItems based on active permission rules
  const navItems = rawNavItems.map(item => {
    if (!item.subItems) return item;
    const filteredSubs = item.subItems.map(sub => {
      if (sub.isGroup && sub.nestedItems) {
        const filteredNested = sub.nestedItems.map(nested => {
          if (nested.isGroup && nested.nestedItems) {
            const filteredDeep = nested.nestedItems.filter(deep => !deep.to || permissions.canAccessRoute(deep.to));
            return filteredDeep.length > 0 ? { ...nested, nestedItems: filteredDeep } : null;
          }
          return !nested.to || permissions.canAccessRoute(nested.to) ? nested : null;
        }).filter(Boolean);
        return filteredNested.length > 0 ? { ...sub, nestedItems: filteredNested } : null;
      }
      return !sub.to || permissions.canAccessRoute(sub.to) ? sub : null;
    }).filter(Boolean);

    return {
      ...item,
      subItems: filteredSubs,
    };
  }).filter(item => {
    if (item.subItems && item.subItems.length === 0) {
      return false;
    }
    if (item.to) {
      return permissions.canAccessRoute(item.to);
    }
    return true;
  });

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-[#06244B] border-r border-[#0B356D] flex flex-col overscroll-contain ${collapsed ? 'w-20' : 'w-64 lg:w-72'
        }`}
      style={{ overscrollBehavior: 'contain' }}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#0B356D] bg-[#041833] flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded bg-[#A4432B] flex items-center justify-center font-serif font-bold text-white shadow-sm flex-shrink-0 text-base">
              HB
            </div>
            <div className="flex flex-col truncate">
              <span className="font-serif text-sm font-bold tracking-wider text-[#F5F0E5] truncate">
                HEUGLY &amp; BLUDWORTH
              </span>
              <span className="text-[10px] tracking-widest text-[#B8C0C4] uppercase">
                Legal Practice SaaS
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded bg-[#A4432B] flex items-center justify-center font-serif font-bold text-white shadow-sm text-sm">
              HB
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded text-[#B8C0C4] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menus */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain py-4 px-3 space-y-1 text-sm font-medium"
        style={{ overscrollBehavior: 'contain' }}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className={`px-2 py-1 text-[10px] font-semibold tracking-wider text-[#B8C0C4] uppercase ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '—' : 'Primary Menus (5 Only)'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const hasSubmenu = Boolean(item.subItems);
          const isExpanded = expandedMenus[item.id];
          const isSubActive = isItemActive(item);

          if (!hasSubmenu) {
            return (
              <div key={item.id} className="relative group/direct">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 group cursor-pointer ${isActive
                      ? 'bg-[#A4432B] text-white shadow-sm font-semibold'
                      : 'text-[#B8C0C4] hover:bg-white/10 hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                </NavLink>

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-[#06244B] border border-[#0B356D] text-white text-xs font-semibold rounded shadow-elevated whitespace-nowrap z-50 pointer-events-none hidden group-hover/direct:block">
                    {item.label}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.id} className="relative group/menu space-y-1">
              <button
                type="button"
                onClick={() => toggleSubmenu(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 text-left group cursor-pointer ${isSubActive
                    ? 'text-white bg-white/10 font-semibold'
                    : 'text-[#B8C0C4] hover:bg-white/5 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isSubActive ? 'text-[#A4432B]' : ''}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#B42318] text-white font-bold mr-1">
                        {item.badge}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#B8C0C4] group-hover:text-white" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#B8C0C4] group-hover:text-white" />
                    )}
                  </>
                )}
              </button>

              {/* Expanded Submenu list */}
              {!collapsed && isExpanded && (
                <div className="pl-5 pr-1 py-1 space-y-0.5 border-l border-[#0B356D] ml-5">
                  {item.subItems.map((sub, sIdx) => {
                    if (sub.isGroup) {
                      const isGroupExpanded = expandedSubgroups[sub.id];
                      const GroupIcon = sub.icon;
                      const hasActiveChild = sub.nestedItems?.some(n =>
                        n.to
                          ? (location.pathname === n.to || location.pathname.startsWith(n.to + '/'))
                          : n.nestedItems?.some(d => location.pathname === d.to || location.pathname.startsWith(d.to + '/'))
                      );

                      return (
                        <div key={sub.id || sIdx} className="space-y-0.5 pt-1">
                          <button
                            type="button"
                            onClick={(e) => toggleSubgroup(sub.id, e)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded transition-all duration-150 text-left cursor-pointer ${hasActiveChild
                                ? 'text-white bg-white/10 font-semibold'
                                : 'text-[#B8C0C4] hover:text-white hover:bg-white/5'
                              }`}
                          >
                            <GroupIcon className={`w-3.5 h-3.5 flex-shrink-0 ${hasActiveChild ? 'text-[#A4432B]' : 'opacity-80'}`} />
                            <span className="flex-1 truncate">{sub.label}</span>
                            {isGroupExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-[#B8C0C4]" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-[#B8C0C4]" />
                            )}
                          </button>

                          {isGroupExpanded && (
                            <div className="pl-3 py-0.5 space-y-0.5 border-l border-[#0B356D]/80 ml-3">
                              {sub.nestedItems?.map((nested, nIdx) => {
                                if (nested.isGroup) {
                                  const isDeepExpanded = expandedSubgroups[nested.id];
                                  const DeepIcon = nested.icon;
                                  const hasDeepActiveChild = nested.nestedItems?.some(d =>
                                    location.pathname === d.to || location.pathname.startsWith(d.to + '/')
                                  );

                                  return (
                                    <div key={nested.id || nIdx} className="space-y-0.5 pt-0.5">
                                      <button
                                        type="button"
                                        onClick={(e) => toggleSubgroup(nested.id, e)}
                                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] rounded transition-all duration-150 text-left cursor-pointer ${hasDeepActiveChild
                                            ? 'text-white bg-[#A4432B]/30 font-semibold'
                                            : 'text-[#B8C0C4] hover:text-white hover:bg-white/5'
                                          }`}
                                      >
                                        <DeepIcon className={`w-3.5 h-3.5 flex-shrink-0 ${hasDeepActiveChild ? 'text-[#A4432B]' : 'opacity-80'}`} />
                                        <span className="flex-1 truncate">{nested.label}</span>
                                        {nested.badge && (
                                          <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-[#A4432B] text-white font-bold mr-1">
                                            {nested.badge}
                                          </span>
                                        )}
                                        {isDeepExpanded ? (
                                          <ChevronDown className="w-3 h-3 text-[#B8C0C4]" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3 text-[#B8C0C4]" />
                                        )}
                                      </button>

                                      {isDeepExpanded && (
                                        <div className="pl-2.5 py-0.5 space-y-0.5 border-l border-[#A4432B]/40 ml-2">
                                          {nested.nestedItems?.map((deep, dIdx) => {
                                            const DeepItemIcon = deep.icon;
                                            return (
                                              <NavLink
                                                key={dIdx}
                                                to={deep.to}
                                                className={({ isActive }) =>
                                                  `flex items-center gap-2 px-2 py-1.5 text-[11px] rounded transition-all duration-150 ${isActive
                                                    ? 'bg-[#A4432B] text-white font-semibold shadow-xs'
                                                    : 'text-[#B8C0C4] hover:text-white hover:bg-white/5'
                                                  }`
                                                }
                                              >
                                                <DeepItemIcon className="w-3 h-3 flex-shrink-0 opacity-80" />
                                                <span className="flex-1 truncate">{deep.label}</span>
                                              </NavLink>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                const NestedIcon = nested.icon;
                                return (
                                  <NavLink
                                    key={nIdx}
                                    to={nested.to}
                                    className={({ isActive }) =>
                                      `flex items-center gap-2 px-2.5 py-1.5 text-[11px] rounded transition-all duration-150 ${isActive
                                        ? 'bg-[#A4432B] text-white font-semibold shadow-xs'
                                        : 'text-[#B8C0C4] hover:text-white hover:bg-white/5'
                                      }`
                                    }
                                  >
                                    <NestedIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                                    <span className="flex-1 truncate">{nested.label}</span>
                                  </NavLink>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const SubIcon = sub.icon;
                    return (
                      <NavLink
                        key={sIdx}
                        to={sub.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 text-xs rounded transition-all duration-150 ${isActive
                            ? 'bg-[#A4432B] text-white font-semibold shadow-xs'
                            : 'text-[#B8C0C4] hover:text-white hover:bg-white/5'
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

              {/* Collapsed Hover/Click Flyout Menu (for Tablets and compact desktop) */}
              {collapsed && (
                <div className="absolute left-full top-0 ml-2 w-64 bg-[#06244B] border border-[#0B356D] rounded-lg shadow-2xl py-2 z-50 hidden group-hover/menu:block pointer-events-auto">
                  <div className="px-3 py-1.5 border-b border-[#0B356D] bg-[#041833]">
                    <div className="text-xs font-serif font-bold text-[#F5F0E5] flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-[#B42318] text-white font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="py-1 max-h-80 overflow-y-auto">
                    {item.subItems.map((sub, sIdx) => {
                      if (sub.isGroup) {
                        return (
                          <div key={sub.id || sIdx} className="pt-2 pb-1 px-2 border-b border-[#0B356D]/50 last:border-b-0">
                            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block px-1 mb-1">
                              {sub.label}
                            </span>
                            <div className="space-y-0.5">
                              {sub.nestedItems?.map((nested, nIdx) => {
                                if (nested.isGroup) {
                                  return (
                                    <div key={nested.id || nIdx} className="pt-1 px-1">
                                      <span className="text-[10px] font-bold text-[#A4432B] uppercase tracking-wider block mb-0.5">
                                        {nested.label}
                                      </span>
                                      <div className="space-y-0.5 pl-1.5">
                                        {nested.nestedItems?.map((deep, dIdx) => {
                                          const DeepIcon = deep.icon;
                                          const isDeepActive = location.pathname === deep.to;
                                          return (
                                            <NavLink
                                              key={dIdx}
                                              to={deep.to}
                                              className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${isDeepActive
                                                  ? 'bg-[#A4432B] text-white font-semibold'
                                                  : 'text-[#B8C0C4] hover:text-white hover:bg-white/10'
                                                }`}
                                            >
                                              <DeepIcon className="w-3 h-3 flex-shrink-0 opacity-80" />
                                              <span className="truncate">{deep.label}</span>
                                            </NavLink>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                                const NestedIcon = nested.icon;
                                const isNestedActive = location.pathname === nested.to;
                                return (
                                  <NavLink
                                    key={nIdx}
                                    to={nested.to}
                                    className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors ${isNestedActive
                                        ? 'bg-[#A4432B] text-white font-semibold'
                                        : 'text-[#B8C0C4] hover:text-white hover:bg-white/10'
                                      }`}
                                  >
                                    <NestedIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                                    <span className="truncate">{nested.label}</span>
                                  </NavLink>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      const SubIcon = sub.icon;
                      const isSubCurrent = location.pathname === sub.to;
                      return (
                        <NavLink
                          key={sIdx}
                          to={sub.to}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${isSubCurrent
                              ? 'bg-[#A4432B] text-white font-semibold'
                              : 'text-[#B8C0C4] hover:text-white hover:bg-white/10'
                            }`}
                        >
                          <SubIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                          <span className="flex-1 truncate">{sub.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-[#0B356D] bg-[#041833] flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F5F0E5] text-[#06244B] flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {currentUser.initials}
            </div>
            <div className="flex flex-col truncate flex-1">
              <span className="text-xs font-semibold text-[#F5F0E5] truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#A4432B] font-medium tracking-wide">
                {currentUser.title}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-[#F5F0E5] text-[#06244B] flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser.initials}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
