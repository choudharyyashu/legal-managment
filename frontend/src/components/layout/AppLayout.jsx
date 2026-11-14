import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useClients } from '../../context/ClientContext';
import { useMatters } from '../../context/MatterContext';
import { useTasks } from '../../context/TaskContext';
import { useTime } from '../../context/TimeContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PersistentMatterBar } from './PersistentMatterBar';
import { MobileNavigation } from './MobileNavigation';
import { Modal } from '../ui/Modal';
import { ClientForm } from '../../features/clients/forms/ClientForm';
import { MatterForm } from '../../features/matters/forms/MatterForm';
import { TimeEntryForm } from '../../features/time-tracking/forms/TimeEntryForm';

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { refreshClients, refreshIntakes } = useClients();
  const { refreshMatters } = useMatters();
  const { refreshTasks } = useTasks();
  const { refreshTimeEntries, refreshExpenses, refreshInvoices } = useTime();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On-demand route-aware fetcher: only fires APIs when the corresponding menu or page route is accessed
  const prevPathRef = useRef('');
  useEffect(() => {
    if (!isAuthenticated) return;
    const path = location.pathname;

    // Trigger API calls specific to the navigated menu
    if (path.startsWith('/clients')) {
      refreshClients();
    } else if (path.startsWith('/intake')) {
      refreshIntakes();
    } else if (
      path.startsWith('/matters') ||
      path.startsWith('/documents') ||
      path.startsWith('/personal-injury') ||
      path.startsWith('/immigration') ||
      path.startsWith('/bankruptcy') ||
      path.startsWith('/litigation') ||
      path.startsWith('/specialty-practices')
    ) {
      refreshMatters();
    } else if (
      path.startsWith('/tasks') ||
      path.startsWith('/calendar') ||
      path.startsWith('/deadlines') ||
      path.startsWith('/checklists')
    ) {
      refreshTasks();
    } else if (path.startsWith('/time')) {
      refreshTimeEntries();
    } else if (path.startsWith('/billing/invoices')) {
      refreshInvoices();
    } else if (path.startsWith('/billing/expenses')) {
      refreshExpenses();
    } else if (path.startsWith('/billing')) {
      refreshInvoices();
      refreshExpenses();
    }

    prevPathRef.current = path;
  }, [
    location.pathname,
    isAuthenticated,
    refreshClients,
    refreshIntakes,
    refreshMatters,
    refreshTasks,
    refreshTimeEntries,
    refreshExpenses,
    refreshInvoices,
  ]);

  // Global Quick Action Modal states (Must be before any early return to obey React Rules of Hooks)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isMatterModalOpen, setIsMatterModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F0E5] text-[#202A35] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Mobile Drawer */}
      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpenAddClient={() => setIsClientModalOpen(true)}
        onOpenNewMatter={() => setIsMatterModalOpen(true)}
        onOpenLogTime={() => setIsTimeModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64 lg:ml-72'
        }`}
      >
        <Topbar
          onMenuToggle={() => setMobileNavOpen(true)}
          onOpenAddClient={() => setIsClientModalOpen(true)}
          onOpenNewMatter={() => setIsMatterModalOpen(true)}
          onOpenLogTime={() => setIsTimeModalOpen(true)}
        />

        {/* Global Persistent Client & Matter Context Bar */}
        <PersistentMatterBar />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#D9D6CF] py-4 px-6 text-xs text-[#667085] flex flex-col sm:flex-row justify-between items-center gap-2 bg-[#F5F0E5]/50">
          <div>
            <span className="font-semibold text-[#06244B]">HEUGLY &amp; BLUDWORTH</span> — Legal Management Software v1.0
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#A4432B] font-medium">CosmoLex Accounting Bridge Ready</span>
            <span>•</span>
            <span>Confidential Attorney-Client Privileged</span>
          </div>
        </footer>
      </div>

      {/* Add Client Global Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Add New Client"
        subtitle="Create a new client entity or individual representation record."
        maxWidth="max-w-2xl"
      >
        <ClientForm
          onSuccess={() => setIsClientModalOpen(false)}
          onCancel={() => setIsClientModalOpen(false)}
        />
      </Modal>

      {/* New Matter Global Modal */}
      <Modal
        isOpen={isMatterModalOpen}
        onClose={() => setIsMatterModalOpen(false)}
        title="Create New Legal Matter"
        subtitle="Open an active case file, trial representation, or advisory matter."
        maxWidth="max-w-3xl"
      >
        <MatterForm
          onSuccess={() => setIsMatterModalOpen(false)}
          onCancel={() => setIsMatterModalOpen(false)}
        />
      </Modal>

      {/* Log Time Global Modal */}
      <Modal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        title="Log Billable Time"
        subtitle="Record legal activity against a matter for supervisory review and billing."
        maxWidth="max-w-2xl"
      >
        <TimeEntryForm
          onSuccess={() => setIsTimeModalOpen(false)}
          onCancel={() => setIsTimeModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

