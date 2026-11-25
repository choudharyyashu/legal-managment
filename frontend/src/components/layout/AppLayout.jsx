import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
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
  const navigate = useNavigate();
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
      if (location.search.includes('intakeId')) {
        refreshIntakes();
      }
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
      refreshMatters();
    } else if (path.startsWith('/time')) {
      refreshTimeEntries();
      refreshMatters();
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
    <div className="min-h-screen bg-[#F5F0E5] text-[#202A35] flex overflow-x-hidden">
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
        className={`flex-1 flex flex-col min-h-screen min-w-0 max-w-full transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-60 xl:ml-64'
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

        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#D9D6CF] py-4 px-4 sm:px-6 text-xs text-[#667085] flex flex-col sm:flex-row justify-between items-center gap-2 bg-[#F5F0E5]/50 text-center sm:text-left">
          <div>
            <span className="font-semibold text-[#06244B]">HEUGLY &amp; BLUDWORTH</span> — Legal Management Software v1.0
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1">
            <span className="text-[#A4432B] font-medium">Practice Management &amp; Trust Sub-Ledger</span>
            <span className="hidden sm:inline">•</span>
            <span>Internal Firm Workspace (Attorney Review Required)</span>
          </div>
        </footer>
      </div>

      {/* Add Client Global Modal - Utah RPC 1.7 Conflict Gate */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Client Onboarding: Conflict Check Required"
        subtitle="Utah RPC 1.7 Mandatory Compliance Notice"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 py-1">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block text-sm pb-1 text-amber-950">Conflict Screening Required Before Creation</span>
              Under Utah Rule of Professional Conduct 1.7, no new Client or Matter can be established without first screening prospective client entities and adverse parties for direct conflicts of interest. Direct creation without clearance is restricted.
            </div>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            Please initiate a <strong>Prospective Client Intake</strong> to record the prospective client entity, primary contact, and adverse parties. Once the RPC 1.7 conflict search is completed and cleared, the client record and matter will be generated automatically.
          </p>
          <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button variant="outline" size="sm" onClick={() => setIsClientModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => {
                setIsClientModalOpen(false);
                navigate('/intake?openIntake=true');
              }}
            >
              Start Intake &amp; Conflict Check
            </Button>
          </div>
        </div>
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

