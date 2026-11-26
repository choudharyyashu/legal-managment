import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useClients } from '../../context/ClientContext';
import { useMatters } from '../../context/MatterContext';
import { useTasks } from '../../context/TaskContext';
import { useTime } from '../../context/TimeContext';
import { useNotificationPreferences } from '../../context/NotificationContext';
import { Button } from '../ui/Button';

export function Topbar({ onMenuToggle, onOpenLogTime, onOpenAddClient, onOpenNewMatter }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const permissions = usePermissions();
  const { clients } = useClients();
  const { matters, setActiveMatter } = useMatters();
  const { tasks } = useTasks();
  const { timeEntries } = useTime();
  const { preferences } = useNotificationPreferences();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const topbarRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (topbarRef.current && !topbarRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
        setIsQuickActionsOpen(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, []);

  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem('read_notification_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Dynamically derive firm notifications respecting user notification preferences
  const notifications = React.useMemo(() => {
    const list = [];

    // 1. Time Approval Queue Notifications (controlled by preferences.timeApprovalAlerts)
    const canApproveTime =
      currentUser?.role === 'super_admin' ||
      currentUser?.role === 'supervisor' ||
      currentUser?.role === 'billing';

    if (preferences?.timeApprovalAlerts && canApproveTime && Array.isArray(timeEntries)) {
      const pendingApprovals = timeEntries.filter((e) => e.status === 'Submitted');
      if (pendingApprovals.length > 0) {
        const notifId = 'notif-time-approvals';
        list.push({
          id: notifId,
          title: 'Time Approval Queue',
          description: `${pendingApprovals.length} submitted time ${pendingApprovals.length === 1 ? 'entry' : 'entries'} awaiting partner approval`,
          time: 'Needs Review',
          read: readNotifIds.has(notifId),
          type: 'warning',
          link: '/tasks',
        });
      }
    }

    // 2. Active Tasks and Court Appearance Deadlines
    if (Array.isArray(tasks) && tasks.length > 0) {
      const activeTasks = tasks.filter((t) => t.status !== 'Completed');
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      activeTasks.sort((a, b) => {
        const prioDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
        if (prioDiff !== 0) return prioDiff;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      // Filter by lead time and court deadline preferences
      const courtAlertsEnabled = preferences?.courtDeadlineEmail || preferences?.courtDeadlineSms;

      const taskNotifs = activeTasks
        .filter((t) => {
          // If court deadline alerts are disabled, suppress court appearance tasks from urgent alerts
          const isCourtRelated = /court|hearing|trial|motion|deposition/i.test(`${t.title} ${t.description || ''}`);
          if (isCourtRelated && !courtAlertsEnabled) return false;
          return true;
        })
        .slice(0, 5)
        .map((t) => {
          const notifId = `notif-task-${t.id}`;
          const isUrgent = t.priority === 'Critical' || t.priority === 'High';
          return {
            id: notifId,
            title: isUrgent ? `Urgent Task: ${t.title}` : t.title,
            description: `${t.matterName || 'Matter Task'} • Assigned to ${t.assignedToName || 'Staff'}`,
            time: t.dueDate ? `Due ${t.dueDate}` : 'Pending',
            read: readNotifIds.has(notifId),
            type: isUrgent ? 'warning' : 'info',
            link: '/tasks',
          };
        });

      list.push(...taskNotifs);
    }

    return list;
  }, [tasks, timeEntries, preferences, currentUser, readNotifIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadNotifIds(allIds);
    try {
      localStorage.setItem('read_notification_ids', JSON.stringify(Array.from(allIds)));
    } catch {
      // ignore
    }
  };

  // Global search filtering
  const filteredClients = searchQuery.trim()
    ? clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const filteredMatters = searchQuery.trim()
    ? matters.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.matterNumber.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const filteredTasks = searchQuery.trim()
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const hasSearchResults = filteredClients.length > 0 || filteredMatters.length > 0 || filteredTasks.length > 0;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header ref={topbarRef} className="sticky top-0 z-30 h-16 bg-white border-b border-[#D9D6CF] shadow-subtle flex items-center justify-between gap-2 px-3 sm:px-6">
      {/* Left: Mobile menu button & Global Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded text-[#06244B] hover:bg-[#F5F0E5] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="relative w-full max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search clients, matters, court filings, tasks..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-[#F5F0E5]/60 border border-[#D9D6CF] rounded text-[#202A35] placeholder-[#667085]/70 focus:outline-none focus:bg-white focus:border-[#06244B] focus:ring-1 focus:ring-[#06244B] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#06244B] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute left-0 mt-2 w-full min-w-[280px] sm:min-w-full max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-elevated border border-[#D9D6CF] py-2 z-50 max-h-96 overflow-y-auto">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#667085] uppercase tracking-wider border-b border-[#D9D6CF]/50 flex justify-between items-center">
                <span>Quick Results</span>
                <span className="text-[10px] text-[#A4432B]">Press Esc to close</span>
              </div>

              {!hasSearchResults ? (
                <div className="px-4 py-4 text-xs text-center text-[#667085]">
                  No matching records for "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y divide-[#D9D6CF]/40">
                  {filteredClients.length > 0 && (
                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-[#06244B] uppercase tracking-wider bg-[#F5F0E5]/40">
                        Clients
                      </div>
                      {filteredClients.map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            navigate(`/clients/${c.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="px-3 py-2 hover:bg-[#F5F0E5] cursor-pointer text-xs flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-[#06244B]">{c.name}</p>
                            <p className="text-[11px] text-[#667085]">{c.id} • {c.assignedAttorneyName}</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#B8C0C4]" />
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredMatters.length > 0 && (
                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-[#06244B] uppercase tracking-wider bg-[#F5F0E5]/40">
                        Matters
                      </div>
                      {filteredMatters.map(m => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setActiveMatter(m);
                            navigate(`/matters/${m.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="px-3 py-2 hover:bg-[#F5F0E5] cursor-pointer text-xs flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-[#06244B]">{m.title}</p>
                            <p className="text-[11px] text-[#667085]">{m.matterNumber} • {m.practiceAreaName}</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#B8C0C4]" />
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredTasks.length > 0 && (
                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-[#06244B] uppercase tracking-wider bg-[#F5F0E5]/40">
                        Tasks
                      </div>
                      {filteredTasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => {
                            navigate('/tasks/mine');
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="px-3 py-2 hover:bg-[#F5F0E5] cursor-pointer text-xs flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-[#06244B]">{t.title}</p>
                            <p className="text-[11px] text-[#667085]">Due: {t.dueDate} • {t.priority}</p>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded text-[#06244B] hover:bg-[#F5F0E5] relative transition-colors cursor-pointer"
            title="Firm Notifications"
          >
            <Bell className="w-5 h-5 text-[#06244B]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B42318] ring-2 ring-white" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-lg shadow-elevated border border-[#D9D6CF] py-2 z-50">
              <div className="px-4 py-2 border-b border-[#D9D6CF] flex items-center justify-between bg-[#F5F0E5]/60">
                <span className="font-serif font-bold text-sm text-[#06244B]">
                  Firm Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#A4432B] font-semibold hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#D9D6CF]/50 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#667085]">
                    <Bell className="w-8 h-8 mx-auto text-[#D9D6CF] mb-2 opacity-60" />
                    <p className="text-xs font-semibold text-[#06244B]">No New Notifications</p>
                    <p className="text-[11px] text-[#667085] mt-0.5">All firm tasks and court deadlines are up to date.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setReadNotifIds((prev) => {
                          const updated = new Set(prev).add(item.id);
                          try {
                            localStorage.setItem('read_notification_ids', JSON.stringify(Array.from(updated)));
                          } catch {
                            // ignore
                          }
                          return updated;
                        });
                        navigate(item.link);
                        setIsNotificationsOpen(false);
                      }}
                      className={`p-3.5 hover:bg-[#F5F0E5] transition-colors cursor-pointer flex gap-3 ${
                        !item.read ? 'bg-[#FAF7F0]' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {item.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#06244B]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-xs ${!item.read ? 'font-bold text-[#06244B]' : 'font-medium text-[#202A35]'}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-[#667085]">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-[#667085] mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-[#D9D6CF] text-center bg-[#F5F0E5]/30">
                <button
                  onClick={() => {
                    navigate('/deadlines');
                    setIsNotificationsOpen(false);
                  }}
                  className="text-xs font-semibold text-[#06244B] hover:text-[#A4432B]"
                >
                  View All Court Deadlines &amp; Alerts &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center p-0.5 rounded-full hover:bg-[#F5F0E5] transition-colors cursor-pointer"
            title={`${currentUser?.name || 'User'} (${currentUser?.title || 'Staff'})`}
            aria-label="User Profile Menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#06244B] text-[#F5F0E5] flex items-center justify-center font-bold text-xs shadow-xs hover:ring-2 hover:ring-[#A4432B] transition-all">
              {currentUser?.initials || 'HB'}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-xs bg-white rounded-lg shadow-elevated border border-[#D9D6CF] py-2 z-50">
              <div className="px-4 py-3 border-b border-[#D9D6CF]">
                <p className="text-xs font-bold text-[#06244B]">{currentUser?.name || 'Staff Member'}</p>
                <p className="text-[11px] text-[#667085] truncate">{currentUser?.email || 'staff@heuglybludworth.com'}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-[#A4432B] uppercase tracking-wider">
                  {currentUser?.title || 'Legal Professional'}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/settings/users');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#202A35] hover:bg-[#F5F0E5] flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-[#667085]" />
                  <span>My Profile &amp; Preferences</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/settings/security');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#202A35] hover:bg-[#F5F0E5] flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-[#667085]" />
                  <span>Security &amp; Audit Status</span>
                </button>
              </div>
              <div className="border-t border-[#D9D6CF] pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#B42318] hover:bg-red-50 font-medium flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#B42318]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
